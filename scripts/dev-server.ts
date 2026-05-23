import { spawn, type ChildProcess } from "child_process";
import { execSync } from "child_process";

const PORT = parseInt(process.env.PORT || "3000", 10);
const BASE_URL = `http://localhost:${PORT}`;
const HEARTBEAT_URL = `${BASE_URL}/api/dev-heartbeat`;
const HEARTBEAT_TIMEOUT_MS = 12000;
const POLL_INTERVAL_MS = 3000;

let serverProcess: ChildProcess | null = null;
let lastHeartbeat: number | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let isShuttingDown = false;

function log(message: string) { console.log(`[dev:auto] ${message}`); }

function checkPort(): boolean {
  try { execSync(`lsof -i :${PORT} -t`, { encoding: "utf-8" }).trim(); log(`Port ${PORT} is already in use. Try 'npm run kill-port'.`); return false; }
  catch { return true; }
}

function startServer() {
  if (!checkPort()) { process.exit(1); }
  log(`Starting Next.js dev server on port ${PORT}...`);
  serverProcess = spawn("npx", ["next", "dev", "-p", String(PORT)], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PORT: String(PORT) }, shell: true });
  serverProcess.stdout?.on("data", (data: Buffer) => {
    const output = data.toString(); process.stdout.write(`[next] ${output}`);
    if (output.includes("Local:") || output.includes("ready")) { log("Dev server is ready."); openBrowser(); startHeartbeatMonitoring(); }
  });
  serverProcess.stderr?.on("data", (data: Buffer) => { process.stderr.write(`[next:err] ${data.toString()}`); });
  serverProcess.on("close", (code) => { log(`Dev server exited with code ${code}.`); serverProcess = null; stopHeartbeatMonitoring(); if (!isShuttingDown) process.exit(code || 0); });
  serverProcess.on("error", (err) => { log(`Failed to start dev server: ${err.message}`); process.exit(1); });
}

function openBrowser() {
  try {
    if (process.platform === "darwin") spawn("open", [BASE_URL], { stdio: "ignore", detached: true }).unref();
    else if (process.platform === "win32") spawn("start", [BASE_URL], { stdio: "ignore", detached: true, shell: true }).unref();
    else spawn("xdg-open", [BASE_URL], { stdio: "ignore", detached: true }).unref();
    log(`Opening browser at ${BASE_URL}`);
  } catch { log(`Please visit ${BASE_URL}`); }
}

function startHeartbeatMonitoring() {
  lastHeartbeat = Date.now();
  heartbeatTimer = setInterval(async () => {
    if (isShuttingDown) return;
    try { const res = await fetch(HEARTBEAT_URL, { method: "POST", signal: AbortSignal.timeout(3000) }); if (res.ok) lastHeartbeat = Date.now(); } catch {}
    const elapsed = Date.now() - (lastHeartbeat || Date.now());
    if (elapsed > HEARTBEAT_TIMEOUT_MS) { log(`No heartbeat for ${(elapsed / 1000).toFixed(0)}s. Shutting down...`); shutdown(); }
  }, POLL_INTERVAL_MS);
}

function stopHeartbeatMonitoring() { if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; } }

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  log("Shutting down...");
  stopHeartbeatMonitoring();
  if (serverProcess) { serverProcess.kill("SIGTERM"); setTimeout(() => { if (serverProcess) { serverProcess.kill("SIGKILL"); } process.exit(0); }, 3000); }
  else process.exit(0);
}

process.on("SIGINT", () => { log("Received SIGINT."); shutdown(); });
process.on("SIGTERM", () => { log("Received SIGTERM."); shutdown(); });
process.on("uncaughtException", (err) => { log(`Uncaught exception: ${err.message}`); shutdown(); });
startServer();

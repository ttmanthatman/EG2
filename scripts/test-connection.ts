import https from "node:https";
import dns from "node:dns";
import net from "node:net";

async function main() {
  console.log("=== DeepSeek API Connection Diagnostic ===\n");

  console.log("[1/4] Testing DNS resolution for api.deepseek.com...");
  try { const addresses = await dns.promises.resolve4("api.deepseek.com"); console.log(`  OK — resolved to: ${addresses.join(", ")}`); }
  catch (err) { console.log(`  FAIL — ${err instanceof Error ? err.message : String(err)}`); }

  console.log("\n[2/4] Testing TCP connection to api.deepseek.com:443...");
  try {
    await new Promise<void>((resolve, reject) => {
      const socket = net.connect(443, "api.deepseek.com", () => { socket.destroy(); resolve(); });
      socket.setTimeout(5000, () => { socket.destroy(); reject(new Error("Timeout")); });
      socket.on("error", reject);
    });
    console.log("  OK — TCP connection established.");
  } catch (err) { console.log(`  FAIL — ${err instanceof Error ? err.message : String(err)}`); }

  console.log("\n[3/4] Testing HTTPS request with node:https...");
  try {
    const result = await new Promise<string>((resolve, reject) => {
      const req = https.request({ hostname: "api.deepseek.com", path: "/chat/completions", method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer test-key", "Content-Length": "73" }, timeout: 10000 }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(`HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString().substring(0, 300)}`));
      });
      req.on("error", reject);
      req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
      req.write(JSON.stringify({ model: "deepseek-v4-pro", messages: [{ role: "user", content: "hi" }], max_tokens: 1 }));
      req.end();
    });
    console.log(`  OK — ${result}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  FAIL — ${msg}`);
    if (msg.includes("CERT") || msg.includes("TLS") || msg.includes("SSL")) console.log("  → TLS certificate error. Try: export NODE_TLS_REJECT_UNAUTHORIZED=0");
  }

  console.log("\n[4/4] Environment info...");
  console.log(`  NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED || "(not set)"}`);
  console.log(`  USE_MOCK_LLM: ${process.env.USE_MOCK_LLM || "(not set)"}`);
  console.log("\n=== Diagnostic complete ===");
}

main().catch(console.error);

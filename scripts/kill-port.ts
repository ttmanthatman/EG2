import { execSync } from "child_process";

const port = parseInt(process.argv[2] || "3000", 10);
console.log(`Looking for processes on port ${port}...`);

try {
  const pid = execSync(`lsof -i :${port} -t`, { encoding: "utf-8" }).trim();
  if (!pid) { console.log(`No process found on port ${port}.`); process.exit(0); }
  for (const p of pid.split("\n").filter(Boolean)) {
    console.log(`Killing process ${p} on port ${port}...`);
    try { execSync(`kill -9 ${p}`); console.log(`Process ${p} killed.`); }
    catch { console.log(`Failed to kill process ${p}.`); }
  }
  console.log(`Port ${port} is now free.`);
} catch { console.log(`No process found on port ${port}.`); }

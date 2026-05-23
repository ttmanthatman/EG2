import fs from "fs";
import path from "path";

export interface ApiConfig { apiKey: string; modelName: string; }

export function readApiConfig(): ApiConfig {
  const rootDir = path.resolve(process.cwd());
  const configPath = path.join(rootDir, "api.txt");

  if (!fs.existsSync(configPath)) {
    throw new Error("Missing api.txt. Please create api.txt in project root. Line 1 should be DeepSeek API key, line 2 should be model name.");
  }

  const content = fs.readFileSync(configPath, "utf-8").trim();
  const lines = content.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

  if (lines.length < 1) throw new Error("api.txt is empty. Line 1 should be DeepSeek API key, line 2 should be model name.");
  if (lines.length === 1) throw new Error("api.txt has only one line. Line 2 must contain the model name (e.g., deepseek-v4-pro).");

  const apiKey = lines[0];
  const modelName = lines[1];

  if (!apiKey || apiKey.length < 10) throw new Error("Invalid API key in api.txt. Please check that line 1 contains a valid DeepSeek API key.");
  if (!modelName || modelName.length < 2) throw new Error("Missing model name in api.txt. Line 2 must contain the model name (e.g., deepseek-v4-pro).");

  return { apiKey, modelName };
}

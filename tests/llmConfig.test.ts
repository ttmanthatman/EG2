import { describe, it, expect } from "vitest";
import { readApiConfig } from "@/lib/llm/readApiConfig";
import { safeRedact, safeRedactObject } from "@/lib/utils/safeRedact";
import fs from "fs";
import path from "path";

describe("readApiConfig", () => {
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, "api.txt");

  function removeConfigFile() { if (fs.existsSync(configPath)) fs.unlinkSync(configPath); }
  function writeConfigFile(content: string) { fs.writeFileSync(configPath, content, "utf-8"); }

  it("should throw when api.txt does not exist", () => { removeConfigFile(); expect(() => readApiConfig()).toThrow(/Missing api\.txt/); });
  it("should throw when api.txt is empty", () => { writeConfigFile(""); expect(() => readApiConfig()).toThrow(/empty/); removeConfigFile(); });
  it("should throw when api.txt has only one line", () => { writeConfigFile("sk-test123456789"); expect(() => readApiConfig()).toThrow(/only one line/); removeConfigFile(); });
  it("should read apiKey and modelName correctly", () => { writeConfigFile("sk-test123456789\ndeepseek-v4-pro"); const config = readApiConfig(); expect(config.apiKey).toBe("sk-test123456789"); expect(config.modelName).toBe("deepseek-v4-pro"); removeConfigFile(); });
  it("should handle whitespace and blank lines", () => { writeConfigFile("  sk-test123456789  \n\n  deepseek-v4-pro  \n"); const config = readApiConfig(); expect(config.apiKey).toBe("sk-test123456789"); expect(config.modelName).toBe("deepseek-v4-pro"); removeConfigFile(); });
});

describe("safeRedact", () => {
  it("should redact API keys", () => { const result = safeRedact("Using key sk-abcdefghijklmnopqrstuvwxyz123456"); expect(result).not.toContain("sk-abcdef"); expect(result).toContain("[REDACTED]"); });
  it("should redact Bearer tokens", () => { const result = safeRedact("Authorization: Bearer sk-abcdefghijklmnopqrstuvwxyz123456"); expect(result).toContain("Bearer [REDACTED]"); });
  it("should redact keys in objects", () => { const result = safeRedactObject({ apiKey: "sk-secret12345678901234567890", message: "hello" }) as Record<string, unknown>; expect(result.apiKey).toBe("[REDACTED]"); expect(result.message).toBe("hello"); });
  it("should not modify normal strings", () => { const input = "A normal message."; expect(safeRedact(input)).toBe(input); });
});

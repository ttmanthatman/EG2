const KEY_PATTERN = /sk-[a-zA-Z0-9]{20,}/g;
const BEARER_PATTERN = /Bearer\s+sk-[a-zA-Z0-9]{20,}/g;

export function safeRedact(text: string): string {
  return text.replace(BEARER_PATTERN, "Bearer [REDACTED]").replace(KEY_PATTERN, "[REDACTED]");
}

export function safeRedactObject(obj: unknown): unknown {
  if (typeof obj === "string") return safeRedact(obj);
  if (Array.isArray(obj)) return obj.map(safeRedactObject);
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key.toLowerCase().includes("key") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token") || key.toLowerCase().includes("password")) {
        result[key] = "[REDACTED]";
      } else { result[key] = safeRedactObject(value); }
    }
    return result;
  }
  return obj;
}

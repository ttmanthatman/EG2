export interface JsonRepairResult<T = unknown> { success: boolean; data?: T; error?: string; }

export function repairJson<T = unknown>(raw: string): JsonRepairResult<T> {
  if (!raw || raw.trim().length === 0) return { success: false, error: "Empty response from LLM." };

  try { const data = JSON.parse(raw) as T; return { success: true, data }; } catch {}

  const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlockMatch) { try { return { success: true, data: JSON.parse(jsonBlockMatch[1].trim()) as T }; } catch {} }

  const objectMatch = extractFirstJsonObject(raw);
  if (objectMatch) { try { return { success: true, data: JSON.parse(objectMatch) as T }; } catch {} }

  return { success: false, error: `Unable to parse JSON. Raw (first 300 chars): ${raw.substring(0, 300)}` };
}

function extractFirstJsonObject(text: string): string | null {
  let depth = 0; let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") { if (depth === 0) start = i; depth++; }
    else if (text[i] === "}") { depth--; if (depth === 0 && start !== -1) return text.substring(start, i + 1); }
  }
  return null;
}

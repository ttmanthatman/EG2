export async function runUserInputNode(ctx: Record<string, unknown>): Promise<Record<string, unknown>> {
  const userMessage = String(ctx.userMessage || "");
  if (!userMessage || userMessage.trim().length === 0) {
    return { output: { user_message: "", normalized: false }, input_summary: "Empty user message", output_summary: "Empty input", warnings: ["User message is empty."], ctx_updates: {} };
  }
  const normalized = userMessage.trim();
  return { output: { user_message: normalized, normalized: true, character_id: ctx.characterId, session_id: ctx.sessionId }, input_summary: `User message: "${normalized.substring(0, 80)}${normalized.length > 80 ? "…" : ""}"`, output_summary: `Normalized message (${normalized.length} chars)`, warnings: [], ctx_updates: {} };
}

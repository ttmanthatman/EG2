import { generateJson } from "@/lib/llm/llmClient";
import { buildCharacterPerformerUserPrompt, CHARACTER_PERFORMER_SYSTEM_PROMPT } from "@/lib/prompts/characterPerformance";
import { buildCharacterProfileSummary } from "@/lib/storage/jsonStore";

export async function runCharacterPerformer(ctx: Record<string, unknown>): Promise<Record<string, unknown>> {
  const dangerousKeys = ["currentState", "stateUpdate", "memoryStore", "activatedMemories", "commitResult"];
  const leakedKeys = dangerousKeys.filter((k) => k in ctx);
  if (leakedKeys.length > 0) console.warn(`[ISOLATION WARNING] Character Performer received potentially forbidden keys: ${leakedKeys.join(", ")}`);

  const characterProfile = ctx.characterProfile || {};
  const narrativeContext = sanitizeNarrative(String(ctx.narrativeContext || ""));
  const userMessage = String(ctx.userMessage || "");
  const recentDialogue = String(ctx.recentDialogue || "");
  const profileSummary = buildCharacterProfileSummary(characterProfile);

  const userPrompt = buildCharacterPerformerUserPrompt({ characterProfileSummary: profileSummary, narrativeContext, recentDialogue, userMessage });

  let result;
  try {
    result = await generateJson<{ action: string; dialogue: string }>({ systemPrompt: CHARACTER_PERFORMER_SYSTEM_PROMPT, userPrompt, temperature: 0.8, maxTokens: 1024, schemaHint: '{"action": "string", "dialogue": "string"}' });
  } catch (err) {
    return { output: { action: "", dialogue: "", error: err instanceof Error ? err.message : String(err) }, input_summary: `Narrative context, user message`, output_summary: "Performance generation failed", prompt: CHARACTER_PERFORMER_SYSTEM_PROMPT, warnings: [], ctx_updates: { characterOutput: { action: "", dialogue: "" } } };
  }

  const output = result.data;
  if (!output || typeof output !== "object") {
    return { output: { action: "", dialogue: "" }, input_summary: "Narrative context", output_summary: "Invalid output format", prompt: CHARACTER_PERFORMER_SYSTEM_PROMPT, warnings: [], ctx_updates: { characterOutput: { action: "", dialogue: "" } } };
  }

  return { output, input_summary: `Profile summary, narrative context`, output_summary: `Action: ${(output as Record<string, unknown>).action || "—"}`, prompt: CHARACTER_PERFORMER_SYSTEM_PROMPT, warnings: [], ctx_updates: { characterOutput: output } };
}

function sanitizeNarrative(text: string): string {
  return text.replace(/\{[^}]*"emotion_state"[^}]*\}/gi, "[removed]").replace(/\{[^}]*"primary_emotion"[^}]*\}/gi, "[removed]").replace(/trust\s*[=:]\s*[\d.]+/gi, "[removed]").replace(/emotion_score\s*[=:]\s*[\d.]+/gi, "[removed]").trim();
}

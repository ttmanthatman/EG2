import { generateJson } from "@/lib/llm/llmClient";
import { buildStateUpdateUserPrompt, STATE_UPDATE_SYSTEM_PROMPT } from "@/lib/prompts/stateUpdate";
import { buildCharacterProfileSummary } from "@/lib/storage/jsonStore";

export async function runStateUpdater(ctx: Record<string, unknown>): Promise<Record<string, unknown>> {
  const userMessage = String(ctx.userMessage || "");
  const activatedMemories = (ctx.activatedMemories as unknown[]) || [];
  const currentState = ctx.currentState || {};
  const characterProfile = ctx.characterProfile || {};

  const profileSummary = buildCharacterProfileSummary(characterProfile);
  const userPrompt = buildStateUpdateUserPrompt({ characterProfileSummary: profileSummary, currentStateJson: JSON.stringify(currentState, null, 2), activatedMemoriesJson: JSON.stringify(activatedMemories, null, 2), userMessage, recentDialogue: String(ctx.recentDialogue || "") });

  let result;
  try {
    result = await generateJson({ systemPrompt: STATE_UPDATE_SYSTEM_PROMPT, userPrompt, temperature: 0.3, maxTokens: 4096, schemaHint: "emotion_state, relationship_updates, inner_state, goal_updates, body_state_updates" });
  } catch (err) {
    return { output: { error: err instanceof Error ? err.message : String(err) }, input_summary: `User message, ${activatedMemories.length} memories`, output_summary: "State update failed", prompt: STATE_UPDATE_SYSTEM_PROMPT, warnings: [], ctx_updates: { stateUpdate: currentState } };
  }

  const updatedState = deepMerge(currentState as Record<string, unknown>, result.data as Record<string, unknown>);
  return { output: result.data, input_summary: `${activatedMemories.length} memories, current state`, output_summary: `State updated`, prompt: STATE_UPDATE_SYSTEM_PROMPT, warnings: [], ctx_updates: { stateUpdate: updatedState } };
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else { result[key] = source[key]; }
  }
  return result;
}

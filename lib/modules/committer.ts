import { generateJson } from "@/lib/llm/llmClient";
import { buildCommitUserPrompt, COMMIT_SYSTEM_PROMPT } from "@/lib/prompts/commit";
import type { ActivatedMemory } from "@/lib/workflow/workflowTypes";
import { saveMemoryStore, saveCurrentState } from "@/lib/storage/jsonStore";

export async function runCommitter(ctx: Record<string, unknown>): Promise<Record<string, unknown>> {
  const userMessage = String(ctx.userMessage || "");
  const characterOutput = (ctx.characterOutput as Record<string, unknown>) || {};
  const characterAction = String(characterOutput.action || "");
  const characterDialogue = String(characterOutput.dialogue || "");
  const currentState = ctx.currentState || {};
  const stateUpdate = ctx.stateUpdate || {};
  const activatedMemories = (ctx.activatedMemories as ActivatedMemory[]) || [];
  const narrativeContext = String(ctx.narrativeContext || "");
  const characterProfile = (ctx.characterProfile as Record<string, unknown>) || {};
  const characterName = String((characterProfile as Record<string, unknown>).name || "沈砚");
  const characterId = String(ctx.characterId || "character_001");

  const userPrompt = buildCommitUserPrompt({ characterName, userMessage, characterAction, characterDialogue, stateBeforeJson: JSON.stringify(currentState), stateAfterJson: JSON.stringify(stateUpdate), activatedMemoriesJson: JSON.stringify(activatedMemories), narrativeContext });

  let result;
  try {
    result = await generateJson({ systemPrompt: COMMIT_SYSTEM_PROMPT, userPrompt, temperature: 0.3, maxTokens: 4096, schemaHint: "new_memories, relationship_changes, emotional_residue, self_narrative_changes, faith_tension_changes" });
  } catch (err) {
    return { output: { error: err instanceof Error ? err.message : String(err), committed: false }, input_summary: "Character output, state", output_summary: "Commit failed", prompt: COMMIT_SYSTEM_PROMPT, warnings: [], ctx_updates: { commitResult: { committed: false } } };
  }

  const commitData = result.data as Record<string, unknown>;
  const isMock = process.env.USE_MOCK_LLM === "true";

  const newMemories = (commitData.new_memories as unknown[]) || [];
  if (newMemories.length > 0 && !isMock) {
    try {
      const existingMemories = (ctx.memoryStore as unknown[]) || [];
      const updatedMemories = [...existingMemories, ...newMemories.map((m, i) => ({ ...(m as Record<string, unknown>), id: `mem_${Date.now()}_${i}`, last_activated: new Date().toISOString(), activation_count: 1 }))];
      await saveMemoryStore(characterId, updatedMemories);
    } catch (saveErr) { console.error("Failed to persist memories:", saveErr); }
  }

  if (stateUpdate && Object.keys(stateUpdate as Record<string, unknown>).length > 0 && !isMock) {
    try {
      const updatedState = deepMergeState(ctx.currentState as Record<string, unknown> || {}, stateUpdate as Record<string, unknown>);
      await saveCurrentState(characterId, { ...updatedState, updated_at: new Date().toISOString() });
    } catch (saveErr) { console.error("Failed to persist state:", saveErr); }
  }

  return { output: { ...commitData, committed: true, new_memory_count: newMemories.length }, input_summary: `Character response, state`, output_summary: `Committed: ${newMemories.length} new memories`, prompt: COMMIT_SYSTEM_PROMPT, warnings: [], ctx_updates: { commitResult: commitData } };
}

function deepMergeState(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
      result[key] = deepMergeState(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else { result[key] = source[key]; }
  }
  return result;
}

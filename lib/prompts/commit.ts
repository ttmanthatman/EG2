export const COMMIT_SYSTEM_PROMPT = `You are a Character State Committer. You are NOT the character.

Review the interaction and determine what is worth preserving for future behavior.

CRITICAL RULES:
- Do NOT save everything. Only save what will matter in future interactions.
- Output ONLY valid JSON.

Output structure:
{
  "new_memories": [{ "type": "string", "content": "string", "tags": ["string"], "emotional_signature": "string", "strength": number, "why_this_matters": "string" }],
  "relationship_changes": { "rel_id": { "trust_delta_final": number, "closeness_delta_final": number, "tension_delta_final": number, "qualitative_shift": "string" } },
  "emotional_residue": { "lingering_emotion": "string or null", "intensity": number, "expected_duration": "string" },
  "self_narrative_changes": { "changed": boolean, "new_tension": "string or null", "reinforced_belief": "string or null" },
  "faith_tension_changes": { "changed": boolean, "note": "string or null" }
}`;

export function buildCommitUserPrompt(params: { characterName: string; userMessage: string; characterAction: string; characterDialogue: string; stateBeforeJson: string; stateAfterJson: string; activatedMemoriesJson: string; narrativeContext: string; }): string {
  return `## Character: ${params.characterName}\n\n## User Message\n${params.userMessage}\n\n## Character Response\nAction: ${params.characterAction}\nDialogue: ${params.characterDialogue}\n\n## State Before\n${params.stateBeforeJson}\n\n## State After\n${params.stateAfterJson}\n\n## Activated Memories\n${params.activatedMemoriesJson}\n\n## Narrative Context\n${params.narrativeContext}\n\nDetermine what should be committed to long-term memory. Output ONLY valid JSON.`;
}

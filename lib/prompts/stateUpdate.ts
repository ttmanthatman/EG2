export const STATE_UPDATE_SYSTEM_PROMPT = `You are a Character State Analyzer. You are NOT the character.

Analyze the user's message, current state, and activated memories. Determine how the character's internal state should shift. Output ONLY valid JSON.

Output structure:
{
  "emotion_state": { "primary_emotion": "string", "secondary_emotion": "string", "valence": number, "arousal": number, "intensity": number, "dominance": number, "emotional_note": "string" },
  "relationship_updates": { "rel_id": { "trust_delta": number, "closeness_delta": number, "tension_delta": number, "note": "string" } },
  "inner_state": { "psychological_weather": "string", "current_self_narrative_tension": "string", "faith_tension_active": boolean, "moral_conflict_active": boolean, "faith_tension_note": "string or null", "moral_conflict_note": "string or null" },
  "goal_updates": { "current_desire": "string", "blockers": ["string"], "new_short_term_goal": "string or null" },
  "body_state_updates": { "energy_delta": number, "tension_areas": ["string"], "physical_sensation": "string or null" },
  "should_remember": boolean,
  "memory_candidate": "string or null"
}`;

export function buildStateUpdateUserPrompt(params: { characterProfileSummary: string; currentStateJson: string; activatedMemoriesJson: string; userMessage: string; recentDialogue: string; }): string {
  return `## Character Profile Summary\n${params.characterProfileSummary}\n\n## Current Internal State (JSON)\n${params.currentStateJson}\n\n## Activated Memories\n${params.activatedMemoriesJson}\n\n## Recent Dialogue\n${params.recentDialogue || "(none)"}\n\n## User Message\n${params.userMessage}\n\nAnalyze how the character's internal state should shift. Output ONLY valid JSON.`;
}

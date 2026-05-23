export const CHARACTER_PERFORMER_ALLOWED_INPUTS = ["character_profile_summary", "narrative_context", "recent_dialogue", "user_message"];

export const CHARACTER_PERFORMER_FORBIDDEN_INPUTS = ["current_state", "memory_store", "state_update_json", "activated_memories", "activated_memories_raw", "emotion_score", "emotion_state", "primary_emotion", "secondary_emotion", "valence", "arousal", "intensity", "dominance", "memory_id", "trust", "closeness", "tension", "module_names", "commit_result", "raw_json", "full_json"];

export function isAllowedForPerformer(fieldName: string): boolean {
  const lower = fieldName.toLowerCase();
  for (const forbidden of CHARACTER_PERFORMER_FORBIDDEN_INPUTS) {
    if (lower.includes(forbidden)) return false;
  }
  return true;
}

export function getDefaultConnectionRules(): Map<string, string[]> {
  const rules = new Map<string, string[]>();
  rules.set("user_input", ["memory_retriever"]);
  rules.set("memory_retriever", ["state_updater"]);
  rules.set("state_updater", ["narrative_builder"]);
  rules.set("narrative_builder", ["character_performer"]);
  rules.set("character_performer", ["committer"]);
  rules.set("committer", ["character_output"]);
  rules.set("character_output", []);
  return rules;
}

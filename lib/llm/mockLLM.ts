import type { DeepSeekResponse } from "./deepseekClient";

export function createMockResponse(content: string): DeepSeekResponse {
  return { id: "mock-" + Date.now(), choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }], usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
}

export function createMockJsonResponse(obj: unknown): DeepSeekResponse {
  return createMockResponse(JSON.stringify(obj));
}

export function getMockJsonForSchema(schemaHint?: string): unknown {
  if (!schemaHint) return { _mock: true, note: "Mock response." };
  const hint = schemaHint.toLowerCase();

  if (hint.includes("action") && hint.includes("dialogue")) {
    return { action: "他微微侧过头，目光落在窗外的雨丝上。", dialogue: "今天……说不上好，也说不上不好。雨天的书店就是这样，安静得让人有时间想一些平时不会想的事。" };
  }

  if (hint.includes("emotion_state") || hint.includes("relationship_updates") || hint.includes("inner_state")) {
    return { emotion_state: { primary_emotion: "melancholic", secondary_emotion: "quiet_contentment", valence: 0.1, arousal: -0.3, intensity: 0.4, dominance: 0.0, emotional_note: "雨天的沉静里混着一点刚被人温暖过的不安。" }, relationship_updates: { rel_001: { trust_delta: 0.02, closeness_delta: 0.01, tension_delta: -0.01, note: "对话让关系微微靠近了一点。" } }, inner_state: { psychological_weather: "多云，但云层比之前薄了一些。", current_self_narrative_tension: "有人看穿了自己，让他不安但也期待。", faith_tension_active: false, moral_conflict_active: false, faith_tension_note: null, moral_conflict_note: null }, goal_updates: { current_desire: "想继续想一些事。", blockers: ["对自己的情绪解读太慢"], new_short_term_goal: null }, body_state_updates: { energy_delta: -0.02, tension_areas: ["肩膀"], physical_sensation: "手腕旧伤因雨天微微发酸。" }, should_remember: true, memory_candidate: "今天的对话让他开始思考一个问题。" };
  }

  if (hint.includes("new_memories") || hint.includes("relationship_changes") || hint.includes("emotional_residue")) {
    return { new_memories: [], relationship_changes: {}, emotional_residue: { lingering_emotion: "mild_melancholy", intensity: 0.3, expected_duration: "rest_of_scene" }, self_narrative_changes: { changed: false, new_tension: null, reinforced_belief: null }, faith_tension_changes: { changed: false, note: null } };
  }

  return { _mock: true, note: "Mock response." };
}

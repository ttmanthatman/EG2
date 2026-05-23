import { describe, it, expect } from "vitest";
import { buildCharacterPerformerUserPrompt } from "@/lib/prompts/characterPerformance";
import { buildCharacterProfileSummary } from "@/lib/storage/jsonStore";
import { validatePerformerInputFields } from "@/lib/workflow/workflowValidator";
import { isAllowedForPerformer } from "@/lib/workflow/connectionRules";

const FORBIDDEN_TERMS = ["full_json", "memory_id", "emotion_score", "primary_emotion", "trust=0.72", "valence", "arousal", "current_state", "memory_store", "state_updater", "narrative_builder", "module"];

describe("promptIsolation", () => {
  it("should not contain forbidden terms in user prompt", () => {
    const prompt = buildCharacterPerformerUserPrompt({
      characterProfileSummary: "沈砚是一个内敛的旧书店店主。",
      narrativeContext: "此刻他坐在傍晚的书店里。",
      recentDialogue: '林暖说："你是不是不习惯别人对你好。"',
      userMessage: "你觉得今天怎么样？",
    });
    const lower = prompt.toLowerCase();
    for (const term of FORBIDDEN_TERMS) expect(lower).not.toContain(term);
  });

  it("should not include structured state in profile summary", () => {
    const profile = { id: "character_001", name: "沈砚", identity: { age: "37", occupation: "旧书店店主" }, personality: { stable_traits: ["内敛"] }, speech_style: { tone: "温和" } };
    const summary = buildCharacterProfileSummary(profile);
    expect(() => JSON.parse(summary)).toThrow();
    for (const term of FORBIDDEN_TERMS) expect(summary.toLowerCase()).not.toContain(term);
  });

  it("should reject all forbidden input patterns", () => {
    for (const field of ["current_state", "memory_store", "state_update_json", "activated_memories", "emotion_score", "primary_emotion", "memory_id"]) {
      expect(isAllowedForPerformer(field)).toBe(false);
    }
  });

  it("should accept allowed input patterns", () => {
    for (const field of ["character_profile_summary", "narrative_context", "recent_dialogue", "user_message"]) {
      expect(isAllowedForPerformer(field)).toBe(true);
    }
  });

  it("should validate performer input fields", () => {
    expect(validatePerformerInputFields(["character_profile_summary", "narrative_context", "user_message"]).valid).toBe(true);
    const dirty = validatePerformerInputFields(["character_profile_summary", "current_state", "memory_store"]);
    expect(dirty.valid).toBe(false);
    expect(dirty.errors.length).toBe(2);
  });

  it("should detect forbidden patterns in names", () => {
    for (const input of ["my_current_state_data", "the_memory_store_items", "primary_emotion_value"]) {
      expect(isAllowedForPerformer(input)).toBe(false);
    }
  });
});

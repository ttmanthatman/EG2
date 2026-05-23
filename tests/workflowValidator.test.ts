import { describe, it, expect } from "vitest";
import { validateWorkflow, validatePerformerInputFields } from "@/lib/workflow/workflowValidator";
import { DEFAULT_WORKFLOW } from "@/lib/workflow/defaultWorkflow";
import type { WorkflowDefinition } from "@/lib/workflow/workflowTypes";

describe("validateWorkflow", () => {
  it("should accept the default workflow", () => { const r = validateWorkflow(DEFAULT_WORKFLOW); expect(r.valid).toBe(true); expect(r.errors).toHaveLength(0); });

  it("should reject state_updater → character_performer", () => {
    const bad: WorkflowDefinition = { nodes: [...DEFAULT_WORKFLOW.nodes], connections: [
      { from: "user_input", to: "memory_retriever" }, { from: "memory_retriever", to: "state_updater" },
      { from: "state_updater", to: "narrative_builder" }, { from: "state_updater", to: "character_performer" },
      { from: "narrative_builder", to: "character_performer" }, { from: "character_performer", to: "committer" }, { from: "committer", to: "character_output" },
    ]};
    const r = validateWorkflow(bad);
    expect(r.valid).toBe(false);
    expect(r.errors.filter((e) => e.message.includes("ISOLATION")).length).toBeGreaterThan(0);
  });

  it("should accept narrative_builder → character_performer", () => { const r = validateWorkflow(DEFAULT_WORKFLOW); expect(r.valid).toBe(true); });
});

describe("validatePerformerInputFields", () => {
  it("should accept narrative_context", () => expect(validatePerformerInputFields(["narrative_context"]).valid).toBe(true));
  it("should accept character_profile_summary", () => expect(validatePerformerInputFields(["character_profile_summary"]).valid).toBe(true));
  it("should reject current_state", () => expect(validatePerformerInputFields(["current_state"]).valid).toBe(false));
  it("should reject memory_store", () => expect(validatePerformerInputFields(["memory_store"]).valid).toBe(false));
  it("should reject emotion_score", () => expect(validatePerformerInputFields(["emotion_score"]).valid).toBe(false));
  it("should reject memory_id", () => expect(validatePerformerInputFields(["memory_id"]).valid).toBe(false));
  it("should reject primary_emotion", () => expect(validatePerformerInputFields(["primary_emotion"]).valid).toBe(false));
});

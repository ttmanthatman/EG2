import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => { process.env.USE_MOCK_LLM = "true"; });

describe("workflowRunner", () => {
  it("should return character_output, debug, and node_traces", async () => {
    const { runWorkflowTurn } = await import("@/lib/workflow/workflowRunner");
    const output = await runWorkflowTurn({ character_id: "character_001", session_id: "default", user_message: "你好，最近怎么样？" });
    expect(output.character_output).toBeDefined();
    expect(output.character_output).toHaveProperty("action");
    expect(output.character_output).toHaveProperty("dialogue");
    expect(output.debug).toBeDefined();
    expect(output.debug.node_traces).toBeDefined();
    expect(Array.isArray(output.debug.node_traces)).toBe(true);
    expect(output.debug.node_traces.length).toBeGreaterThan(0);
    for (const trace of output.debug.node_traces) {
      expect(trace.node_id).toBeDefined();
      expect(trace.node_type).toBeDefined();
      expect(trace.status).toBeDefined();
      expect(trace.duration_ms).toBeGreaterThanOrEqual(0);
    }
  });

  it("should have nodes in correct order", async () => {
    const { runWorkflowTurn } = await import("@/lib/workflow/workflowRunner");
    const output = await runWorkflowTurn({ character_id: "character_001", session_id: "default", user_message: "你好" });
    const expectedOrder = ["user_input", "memory_retriever", "state_updater", "narrative_builder", "character_performer", "committer", "character_output"];
    expect(output.debug.node_traces.map((t) => t.node_id)).toEqual(expectedOrder);
  });

  it("should handle empty user message", async () => {
    const { runWorkflowTurn } = await import("@/lib/workflow/workflowRunner");
    const output = await runWorkflowTurn({ character_id: "character_001", session_id: "default", user_message: "" });
    expect(output.character_output).toBeDefined();
  });
});

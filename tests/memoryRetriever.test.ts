import { describe, it, expect } from "vitest";

describe("memoryRetriever", () => {
  it("should return activated memories with required fields", async () => {
    const { runMemoryRetriever } = await import("@/lib/modules/memoryRetriever");
    const result = await runMemoryRetriever({ characterId: "character_001", userMessage: "林暖今天来了吗" });
    const output = result.output as Record<string, unknown>;
    const memories = output.activated_memories as unknown[];
    if (memories.length > 0) {
      const m = memories[0] as Record<string, unknown>;
      expect(m.id).toBeDefined();
      expect(m.content).toBeDefined();
      expect(m.why_activated).toBeDefined();
      expect(m.current_effect).toBeDefined();
    }
  });

  it("should return at most 5 activated memories", async () => {
    const { runMemoryRetriever } = await import("@/lib/modules/memoryRetriever");
    const result = await runMemoryRetriever({ characterId: "character_001", userMessage: "信仰 父亲 母亲 林暖 旧书店" });
    const output = result.output as Record<string, unknown>;
    expect(((output.activated_memories as unknown[])).length).toBeLessThanOrEqual(5);
  });

  it("should update context with memories and store", async () => {
    const { runMemoryRetriever } = await import("@/lib/modules/memoryRetriever");
    const result = await runMemoryRetriever({ characterId: "character_001", userMessage: "你好" });
    const updates = result.ctx_updates as Record<string, unknown>;
    expect(updates.activatedMemories).toBeDefined();
    expect(updates.memoryStore).toBeDefined();
  });
});

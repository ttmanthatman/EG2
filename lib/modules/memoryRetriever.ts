import type { ActivatedMemory } from "@/lib/workflow/workflowTypes";
import { loadMemoryStore } from "@/lib/storage/jsonStore";

interface MemoryItem { id: string; type: string; content: string; tags: string[]; emotional_signature: string; strength: number; last_activated: string; activation_count: number; }

export async function runMemoryRetriever(ctx: Record<string, unknown>): Promise<Record<string, unknown>> {
  const userMessage = String(ctx.userMessage || "").toLowerCase();
  const characterId = String(ctx.characterId || "character_001");

  let memoryStore: MemoryItem[];
  try { memoryStore = (await loadMemoryStore(characterId)) as MemoryItem[]; }
  catch { memoryStore = []; }

  if (memoryStore.length === 0) {
    return { output: { activated_memories: [] }, input_summary: "No memories in store", output_summary: "No memories activated", warnings: ["Memory store is empty."], ctx_updates: { activatedMemories: [], memoryStore: [] } };
  }

  const scored = memoryStore.map((mem) => {
    let score = 0;
    score += mem.strength * 3;
    if (mem.last_activated) {
      const daysSince = (Date.now() - new Date(mem.last_activated).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 1) score += 1.5; else if (daysSince < 3) score += 0.8; else if (daysSince < 7) score += 0.3;
    }
    score += Math.min(mem.activation_count, 5) * 0.4;
    for (const tag of mem.tags) { if (userMessage.includes(tag.toLowerCase())) score += 2; }
    const contentLower = mem.content.toLowerCase();
    const words = userMessage.split(/\s+/);
    for (const word of words) { if (word.length >= 2 && contentLower.includes(word)) score += 0.5; }
    return { memory: mem, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMemories = scored.slice(0, 5).filter((m) => m.score > 1);

  const activated: ActivatedMemory[] = topMemories.map(({ memory, score }) => ({
    id: memory.id, content: memory.content,
    why_activated: buildWhyActivated(memory, userMessage, score),
    current_effect: buildCurrentEffect(memory),
  }));

  return { output: { activated_memories: activated, memory_count: memoryStore.length, activated_count: activated.length }, input_summary: `Memory store: ${memoryStore.length} items`, output_summary: `Activated ${activated.length} memories`, warnings: activated.length === 0 ? ["No relevant memories found."] : [], ctx_updates: { activatedMemories: activated, memoryStore } };
}

function buildWhyActivated(memory: MemoryItem, userMessage: string, score: number): string {
  const matchingTags = memory.tags.filter((t) => userMessage.includes(t.toLowerCase()));
  if (matchingTags.length > 0) return `Keyword match on tags: ${matchingTags.join(", ")}`;
  if (score > 3) return `High-strength memory with recent activation`;
  return `General relevance based on content similarity`;
}

function buildCurrentEffect(memory: MemoryItem): string {
  const typeEffects: Record<string, string> = {
    emotional_memory: "Brings up old feelings that color present perception",
    encounter_memory: "Shapes how past social experiences inform current behavior",
    spiritual_memory: "Activates unresolved questions about belief and meaning",
    self_knowledge: "Surfaces a known pattern the character may fall into",
    relationship_memory: "Affects how the character relates to the person they're with",
    theological_reflection: "Stirs tension between belief and lived experience",
  };
  return typeEffects[memory.type] || "Influences current thoughts and reactions";
}

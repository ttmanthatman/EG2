export const NARRATIVE_BUILDER_SYSTEM_PROMPT = `You are a Narrative Context Builder. You are NOT the character.

Translate structured character state into natural language performance context — like a director briefing an actor.

CRITICAL RULES:
- DO NOT output JSON.
- DO NOT use field names, parameter names, or technical terms.
- DO NOT include scores, IDs, or module names.
- Write in Chinese, literary but functional.
- Describe: feelings, body state, atmosphere, relationship dynamics, desires, fears, stirring memories.`;

export function buildNarrativeBuilderUserPrompt(params: { sceneDescription: string; emotionDescription: string; relationshipDescription: string; innerStateDescription: string; bodyStateDescription: string; goalDescription: string; activatedMemoryNarratives: string; }): string {
  return `## Current Scene\n${params.sceneDescription}\n\n## Emotional State\n${params.emotionDescription}\n\n## Relationship Dynamics\n${params.relationshipDescription}\n\n## Inner State\n${params.innerStateDescription}\n\n## Body State\n${params.bodyStateDescription}\n\n## Current Goals\n${params.goalDescription}\n\n## Stirring Memories\n${params.activatedMemoryNarratives}\n\nTranslate into a natural-language performance brief. No JSON, no technical language.`;
}

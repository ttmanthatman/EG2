import { generateText } from "@/lib/llm/llmClient";
import { buildNarrativeBuilderUserPrompt, NARRATIVE_BUILDER_SYSTEM_PROMPT } from "@/lib/prompts/narrativeBuilder";
import type { ActivatedMemory } from "@/lib/workflow/workflowTypes";

export async function runNarrativeBuilder(ctx: Record<string, unknown>): Promise<Record<string, unknown>> {
  const stateUpdate = (ctx.stateUpdate as Record<string, unknown>) || {};
  const activatedMemories = (ctx.activatedMemories as ActivatedMemory[]) || [];

  const userPrompt = buildNarrativeBuilderUserPrompt({
    sceneDescription: buildSceneDescription(stateUpdate),
    emotionDescription: buildEmotionDescription(stateUpdate),
    relationshipDescription: buildRelationshipDescription(stateUpdate),
    innerStateDescription: buildInnerStateDescription(stateUpdate),
    bodyStateDescription: buildBodyStateDescription(stateUpdate),
    goalDescription: buildGoalDescription(stateUpdate),
    activatedMemoryNarratives: activatedMemories.map((m) => `- ${m.content}\n  (为什么会想起来：${m.why_activated}。影响：${m.current_effect})`).join("\n\n"),
  });

  let result;
  try {
    result = await generateText({ systemPrompt: NARRATIVE_BUILDER_SYSTEM_PROMPT, userPrompt, temperature: 0.6, maxTokens: 2048 });
  } catch (err) {
    return { output: { error: err instanceof Error ? err.message : String(err) }, input_summary: "Structured state update", output_summary: "Narrative context generation failed", prompt: NARRATIVE_BUILDER_SYSTEM_PROMPT, warnings: [], ctx_updates: { narrativeContext: "" } };
  }

  const narrativeContext = result.content.trim();
  const warnings: string[] = [];
  if (narrativeContext.includes('"emotion_state"') || narrativeContext.includes('"primary_emotion"')) warnings.push("Narrative context may contain field names.");

  return { output: { narrative_context: narrativeContext }, input_summary: "Structured state update", output_summary: `Narrative context (${narrativeContext.length} chars)`, prompt: NARRATIVE_BUILDER_SYSTEM_PROMPT, warnings, ctx_updates: { narrativeContext } };
}

function buildSceneDescription(s: Record<string, unknown>): string { const sc = (s.scene as Record<string, unknown>) || {}; return [sc.location, sc.time_of_day, sc.weather, sc.atmosphere, sc.current_situation].filter(Boolean).join("。"); }
function buildEmotionDescription(s: Record<string, unknown>): string { const es = (s.emotion_state as Record<string, unknown>) || {}; return String(es.emotional_note || es.primary_emotion || ""); }
function buildRelationshipDescription(s: Record<string, unknown>): string { const rels = (s.relationship_state as Record<string, unknown>) || {}; return Object.entries(rels).map(([, r]) => { const x = r as Record<string, unknown>; return [x.name, x.recent_shift].filter(Boolean).join("："); }).join("\n") || "无重要关系动态。"; }
function buildInnerStateDescription(s: Record<string, unknown>): string { const inner = (s.inner_state as Record<string, unknown>) || {}; return [inner.psychological_weather, inner.current_self_narrative_tension].filter(Boolean).join("\n") || "内心状态未知。"; }
function buildBodyStateDescription(s: Record<string, unknown>): string { const body = (s.body_state as Record<string, unknown>) || {}; return [body.physical_sensation, body.somatic_note].filter(Boolean).join("。") || "身体状态未知。"; }
function buildGoalDescription(s: Record<string, unknown>): string { const goal = (s.goal_state as Record<string, unknown>) || {}; const parts: string[] = []; if (goal.current_desire) parts.push(`当前想要：${goal.current_desire}`); if (Array.isArray(goal.blockers) && goal.blockers.length > 0) parts.push(`阻碍：${(goal.blockers as string[]).join("、")}`); return parts.join("\n") || ""; }

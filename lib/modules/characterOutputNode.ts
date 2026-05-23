export async function runCharacterOutputNode(ctx: Record<string, unknown>): Promise<Record<string, unknown>> {
  const characterOutput = (ctx.characterOutput as Record<string, unknown>) || {};
  const action = String(characterOutput.action || "");
  const dialogue = String(characterOutput.dialogue || "");

  if (!action && !dialogue) {
    return { output: { action: "", dialogue: "", formatted: "", error: "No character output available." }, input_summary: "No character output", output_summary: "Empty output", warnings: ["Character Performer did not produce valid output."], ctx_updates: {} };
  }

  const combined = `${action} ${dialogue}`;
  const leakPatterns = ["emotion_score", "primary_emotion", "valence", "arousal", "memory_id", "current_state", "memory_store", "state_update", "module"];
  const leaks = leakPatterns.filter((p) => combined.toLowerCase().includes(p));

  return { output: { action, dialogue, formatted: formatForUI(action, dialogue), clean: leaks.length === 0 }, input_summary: "Character performer output", output_summary: `Action: ${action.substring(0, 60)}…`, warnings: leaks.length > 0 ? [`Technical leakage detected: ${leaks.join(", ")}`] : [], ctx_updates: {} };
}

function formatForUI(action: string, dialogue: string): string {
  let formatted = "";
  if (action) formatted += action;
  if (dialogue) { if (formatted) formatted += "\n\n"; formatted += `"${dialogue}"`; }
  return formatted;
}

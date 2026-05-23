import type { WorkflowInput, WorkflowOutput, WorkflowContext, NodeTrace, NodeStatus } from "./workflowTypes";
import { DEFAULT_WORKFLOW } from "./defaultWorkflow";
import { getNodeRunner } from "./nodeRegistry";
import { validateWorkflow } from "./workflowValidator";

export async function runWorkflowTurn(input: WorkflowInput): Promise<WorkflowOutput> {
  const validation = validateWorkflow(DEFAULT_WORKFLOW);
  if (!validation.valid) throw new Error(`Workflow validation failed: ${validation.errors.map((e) => e.message).join("; ")}`);

  const ctx: WorkflowContext = {
    characterId: input.character_id, sessionId: input.session_id, userMessage: input.user_message,
    characterProfile: null, memoryStore: [], currentState: null,
    activatedMemories: [], stateUpdate: null, narrativeContext: "",
    characterOutput: null, commitResult: null, nodeTraces: [],
  };

  for (const node of DEFAULT_WORKFLOW.nodes) {
    const runner = getNodeRunner(node);
    const trace = await executeNode(node.id, node.type, runner, ctx);
    ctx.nodeTraces.push(trace);
    if (trace.status === "error") break;
  }

  return {
    character_output: ctx.characterOutput || { action: "", dialogue: "An error occurred. Please check the node traces." },
    debug: { activated_memories: ctx.activatedMemories, state_before: ctx.currentState, state_after: ctx.stateUpdate, narrative_context: ctx.narrativeContext, commit_result: ctx.commitResult, raw_trace: {}, node_traces: ctx.nodeTraces },
  };
}

async function executeNode(nodeId: string, nodeType: string, runner: (ctx: Record<string, unknown>) => Promise<Record<string, unknown>>, ctx: WorkflowContext): Promise<NodeTrace> {
  const startedAt = new Date().toISOString(); const startMs = Date.now();
  let status: NodeStatus = "running"; let error: string | null = null;
  let warnings: string[] = []; let inputSummary = ""; let outputSummary = "";
  let output: unknown = null; let prompt: string | null = null;

  try {
    const result = await runner(ctx as unknown as Record<string, unknown>);
    status = "success";
    output = result.output || result;
    inputSummary = (result.input_summary as string) || summarizeInput(ctx, nodeId);
    outputSummary = (result.output_summary as string) || summarizeOutput(output);
    prompt = (result.prompt as string) || null;
    warnings = (result.warnings as string[]) || [];
    if (result.ctx_updates) Object.assign(ctx, result.ctx_updates);
  } catch (err) {
    status = "error";
    error = err instanceof Error ? err.message : String(err);
    output = { error };
    inputSummary = summarizeInput(ctx, nodeId);
    outputSummary = `Error: ${error}`;
  }

  return { node_id: nodeId, node_type: nodeType as NodeTrace["node_type"], status, input_summary: inputSummary, output_summary: outputSummary, input: buildNodeInput(ctx, nodeId), output, prompt, params: {}, duration_ms: Date.now() - startMs, started_at: startedAt, ended_at: new Date().toISOString(), error, warnings };
}

function summarizeInput(ctx: WorkflowContext, nodeId: string): string {
  switch (nodeId) {
    case "user_input": return `User message: "${ctx.userMessage}"`;
    case "memory_retriever": return `Context: user message, character profile, memory store`;
    case "state_updater": return `Memories activated: ${ctx.activatedMemories.length}`;
    case "narrative_builder": return `State update complete, translating to narrative`;
    case "character_performer": return `Narrative context ready`;
    case "committer": return `Character response complete`;
    case "character_output": return `Formatting final output`;
    default: return "—";
  }
}

function summarizeOutput(output: unknown): string {
  if (!output) return "—";
  if (typeof output === "string") return output.length > 120 ? output.substring(0, 120) + "…" : output;
  if (typeof output === "object") {
    const o = output as Record<string, unknown>;
    if (o.action && o.dialogue) return `Action: ${String(o.action).substring(0, 60)}…`;
    if (o.error) return `Error: ${o.error}`;
    const keys = Object.keys(o);
    return `{ ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? ", …" : ""} }`;
  }
  return String(output).substring(0, 120);
}

function buildNodeInput(ctx: WorkflowContext, nodeId: string): unknown {
  switch (nodeId) {
    case "user_input": return { user_message: ctx.userMessage };
    case "memory_retriever": return { user_message: ctx.userMessage };
    case "state_updater": return { activated_memories_count: ctx.activatedMemories.length };
    case "narrative_builder": return { state_update_present: !!ctx.stateUpdate };
    case "character_performer": return { narrative_context_length: ctx.narrativeContext.length };
    case "committer": return { character_output_present: !!ctx.characterOutput };
    case "character_output": return { character_output: ctx.characterOutput };
    default: return {};
  }
}

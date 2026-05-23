export type NodeStatus = "idle" | "running" | "success" | "error" | "warning";

export type NodeType = "UserInput" | "MemoryRetriever" | "StateUpdater" | "NarrativeBuilder" | "CharacterPerformer" | "Committer" | "CharacterOutput";

export interface WorkflowNode { id: string; type: NodeType; name: string; description: string; usesLLM: boolean; }

export interface WorkflowConnection { from: string; to: string; }

export interface WorkflowDefinition { nodes: WorkflowNode[]; connections: WorkflowConnection[]; }

export interface NodeTrace {
  node_id: string; node_type: NodeType; status: NodeStatus;
  input_summary: string; output_summary: string; input: unknown; output: unknown;
  prompt: string | null; params: Record<string, unknown>;
  duration_ms: number; started_at: string; ended_at: string;
  error: string | null; warnings: string[];
}

export interface CharacterOutput { action: string; dialogue: string; }

export interface ActivatedMemory { id: string; content: string; why_activated: string; current_effect: string; }

export interface WorkflowInput { character_id: string; session_id: string; user_message: string; }

export interface WorkflowOutput {
  character_output: CharacterOutput;
  debug: { activated_memories: ActivatedMemory[]; state_before: unknown; state_after: unknown; narrative_context: string; commit_result: unknown; raw_trace: Record<string, unknown>; node_traces: NodeTrace[]; };
}

export interface WorkflowContext {
  characterId: string; sessionId: string; userMessage: string;
  characterProfile: unknown; memoryStore: unknown[]; currentState: unknown;
  activatedMemories: ActivatedMemory[]; stateUpdate: unknown;
  narrativeContext: string; characterOutput: CharacterOutput | null;
  commitResult: unknown; nodeTraces: NodeTrace[];
}

export interface ValidationError { connection: WorkflowConnection; message: string; }
export interface ValidationResult { valid: boolean; errors: ValidationError[]; }

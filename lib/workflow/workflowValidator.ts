import type { WorkflowDefinition, WorkflowConnection, ValidationResult, ValidationError } from "./workflowTypes";
import { getDefaultConnectionRules } from "./connectionRules";

const VALID_NODE_TYPES = ["UserInput", "MemoryRetriever", "StateUpdater", "NarrativeBuilder", "CharacterPerformer", "Committer", "CharacterOutput"];

export function validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(workflow.nodes.map((n) => n.id));

  for (const node of workflow.nodes) {
    if (!VALID_NODE_TYPES.includes(node.type)) errors.push({ connection: { from: "", to: node.id }, message: `Invalid node type "${node.type}" for node "${node.id}".` });
  }

  for (const conn of workflow.connections) {
    if (!nodeIds.has(conn.from)) errors.push({ connection: conn, message: `Source node "${conn.from}" does not exist.` });
    if (!nodeIds.has(conn.to)) errors.push({ connection: conn, message: `Target node "${conn.to}" does not exist.` });
  }

  const rules = getDefaultConnectionRules();
  for (const conn of workflow.connections) {
    const allowedTargets = rules.get(conn.from);
    if (allowedTargets && !allowedTargets.includes(conn.to)) {
      errors.push({ connection: conn, message: `Connection from "${conn.from}" to "${conn.to}" is not allowed.` });
    }
  }

  validatePerformerIsolation(workflow, errors);
  return { valid: errors.length === 0, errors };
}

function validatePerformerIsolation(workflow: WorkflowDefinition, errors: ValidationError[]): void {
  const performerNode = workflow.nodes.find((n) => n.type === "CharacterPerformer");
  if (!performerNode) return;
  const forbiddenSources = ["state_updater", "memory_retriever", "committer"];
  for (const conn of workflow.connections) {
    if (conn.to === performerNode.id && forbiddenSources.includes(conn.from)) {
      errors.push({ connection: conn, message: `CHARACTER PERFORMER ISOLATION VIOLATION: "${conn.from}" may not connect directly to "${performerNode.id}".` });
    }
  }
}

export function validatePerformerInputFields(inputFields: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const forbiddenPatterns = ["current_state", "memory_store", "state_update", "activated_memories", "emotion_score", "emotion_state", "primary_emotion", "secondary_emotion", "valence", "arousal", "intensity", "dominance", "memory_id", "trust=", "module", "full_json"];
  for (const field of inputFields) {
    const lower = field.toLowerCase();
    for (const pattern of forbiddenPatterns) {
      if (lower.includes(pattern)) errors.push({ connection: { from: "input", to: "character_performer" }, message: `Character Performer input field "${field}" matches forbidden pattern "${pattern}".` });
    }
  }
  return { valid: errors.length === 0, errors };
}

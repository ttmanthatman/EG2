import type { WorkflowDefinition } from "./workflowTypes";

export const DEFAULT_WORKFLOW: WorkflowDefinition = {
  nodes: [
    { id: "user_input", type: "UserInput", name: "User Input", description: "Receives and normalizes the user message", usesLLM: false },
    { id: "memory_retriever", type: "MemoryRetriever", name: "Memory Retriever", description: "Selects 3-5 relevant memories based on the current situation", usesLLM: false },
    { id: "state_updater", type: "StateUpdater", name: "State Updater", description: "Analyzes and updates internal character state using LLM", usesLLM: true },
    { id: "narrative_builder", type: "NarrativeBuilder", name: "Narrative Builder", description: "Translates structured state into natural language performance context", usesLLM: true },
    { id: "character_performer", type: "CharacterPerformer", name: "Character Performer", description: "Generates final character action and dialogue", usesLLM: true },
    { id: "committer", type: "Committer", name: "Committer", description: "Decides what to save to long-term memory and relationship state", usesLLM: true },
    { id: "character_output", type: "CharacterOutput", name: "Character Output", description: "Formats the final output for UI display", usesLLM: false },
  ],
  connections: [
    { from: "user_input", to: "memory_retriever" },
    { from: "memory_retriever", to: "state_updater" },
    { from: "state_updater", to: "narrative_builder" },
    { from: "narrative_builder", to: "character_performer" },
    { from: "character_performer", to: "committer" },
    { from: "committer", to: "character_output" },
  ],
};

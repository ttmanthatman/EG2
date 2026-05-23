import { create } from "zustand";
import type { NodeTrace, CharacterOutput } from "@/lib/workflow/workflowTypes";

export interface ChatMessage {
  id: string; role: "user" | "character"; content: string;
  action?: string; dialogue?: string; timestamp: string;
}

export interface LLMConfig {
  configured: boolean; model: string | null; mock: boolean; error: string | null;
}

export interface NodePromptOverrides {
  [nodeId: string]: { systemPrompt?: string; temperature?: number; maxTokens?: number; };
}

interface AppState {
  llmConfig: LLMConfig; setLLMConfig: (config: LLMConfig) => void;
  isRunning: boolean; setIsRunning: (v: boolean) => void;
  nodeTraces: NodeTrace[]; setNodeTraces: (traces: NodeTrace[]) => void;
  selectedNodeId: string | null; setSelectedNodeId: (id: string | null) => void;
  messages: ChatMessage[]; addMessage: (msg: ChatMessage) => void;
  activeNodeId: string | null; setActiveNodeId: (id: string | null) => void;
  lastCharacterOutput: CharacterOutput | null; setLastCharacterOutput: (output: CharacterOutput | null) => void;
  promptOverrides: NodePromptOverrides;
  setPromptOverride: (nodeId: string, key: "systemPrompt" | "temperature" | "maxTokens", value: string | number) => void;
  inspectorTab: string; setInspectorTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  llmConfig: { configured: false, model: null, mock: false, error: null },
  setLLMConfig: (config) => set({ llmConfig: config }),
  isRunning: false, setIsRunning: (v) => set({ isRunning: v }),
  nodeTraces: [], setNodeTraces: (traces) => set({ nodeTraces: traces }),
  selectedNodeId: null, setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  activeNodeId: null, setActiveNodeId: (id) => set({ activeNodeId: id }),
  lastCharacterOutput: null, setLastCharacterOutput: (output) => set({ lastCharacterOutput: output }),
  promptOverrides: {},
  setPromptOverride: (nodeId, key, value) => set((state) => ({
    promptOverrides: { ...state.promptOverrides, [nodeId]: { ...state.promptOverrides[nodeId], [key]: value } },
  })),
  inspectorTab: "overview", setInspectorTab: (tab) => set({ inspectorTab: tab }),
}));

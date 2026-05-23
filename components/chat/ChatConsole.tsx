"use client";

import { useCallback } from "react";
import Composer from "./Composer";
import CharacterOutputCard from "./CharacterOutputCard";
import { useAppStore } from "@/lib/store";
import type { ChatMessage } from "@/lib/store";
import type { NodeTrace, CharacterOutput } from "@/lib/workflow/workflowTypes";

export default function ChatConsole() {
  const messages = useAppStore((s) => s.messages);
  const isRunning = useAppStore((s) => s.isRunning);
  const setIsRunning = useAppStore((s) => s.setIsRunning);
  const setNodeTraces = useAppStore((s) => s.setNodeTraces);
  const setActiveNodeId = useAppStore((s) => s.setActiveNodeId);
  const addMessage = useAppStore((s) => s.addMessage);
  const setLastCharacterOutput = useAppStore((s) => s.setLastCharacterOutput);
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId);

  const handleSend = useCallback(async (text: string) => {
    if (isRunning) return;
    setIsRunning(true); setActiveNodeId(null); setSelectedNodeId(null);

    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: "user", content: text, timestamp: new Date().toISOString() };
    addMessage(userMsg);

    try {
      const NODE_ORDER = ["user_input", "memory_retriever", "state_updater", "narrative_builder", "character_performer", "committer", "character_output"];
      let currentIndex = 0;
      const highlightInterval = setInterval(() => {
        if (currentIndex < NODE_ORDER.length) { setActiveNodeId(NODE_ORDER[currentIndex]); currentIndex++; }
        else clearInterval(highlightInterval);
      }, 600);

      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ character_id: "character_001", session_id: "default", user_message: text }) });
      clearInterval(highlightInterval); setActiveNodeId(null);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);

      const traces: NodeTrace[] = data.debug?.node_traces || [];
      setNodeTraces(traces);

      const output: CharacterOutput = data.character_output || { action: "", dialogue: "" };
      setLastCharacterOutput(output);

      const charMsg: ChatMessage = { id: `msg-${Date.now()}`, role: "character", content: output.action ? `${output.action}\n\n"${output.dialogue}"` : output.dialogue, action: output.action, dialogue: output.dialogue, timestamp: new Date().toISOString() };
      addMessage(charMsg);
      setSelectedNodeId("character_output");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setLastCharacterOutput({ action: "", dialogue: `Error: ${errorMsg}` });
      addMessage({ id: `msg-${Date.now()}`, role: "character", content: `Error: ${errorMsg}`, dialogue: `Error: ${errorMsg}`, timestamp: new Date().toISOString() });
    } finally { setIsRunning(false); }
  }, [isRunning, setIsRunning, setNodeTraces, setActiveNodeId, addMessage, setLastCharacterOutput, setSelectedNodeId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-vcs-text-muted text-center max-w-xs">Send a message to begin a conversation with the character.<br /><span className="text-xs mt-1 block">Nodes will execute in sequence — watch the workflow canvas.</span></p>
          </div>
        )}
        {messages.map((msg) => msg.role === "user" ? (
          <div key={msg.id} className="flex justify-end"><div className="max-w-[70%] px-4 py-2.5 rounded-xl bg-vcs-accent/15 border border-vcs-accent/30"><p className="text-sm text-vcs-text">{msg.content}</p></div></div>
        ) : (
          <div key={msg.id} className="flex justify-start"><div className="max-w-[85%]"><CharacterOutputCard action={msg.action || ""} dialogue={msg.dialogue || ""} /></div></div>
        ))}
      </div>
      <Composer onSend={handleSend} disabled={isRunning} />
    </div>
  );
}

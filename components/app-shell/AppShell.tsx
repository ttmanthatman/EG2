"use client";

import TopBar from "./TopBar";
import CharacterPanel from "@/components/sidebar/CharacterPanel";
import NodeLibrary from "@/components/sidebar/NodeLibrary";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import InspectorPanel from "@/components/workflow/InspectorPanel";
import ChatConsole from "@/components/chat/ChatConsole";
import RunTracePanel from "@/components/workflow/RunTracePanel";

export default function AppShell() {
  return (
    <div className="h-screen w-screen flex flex-col bg-vcs-bg text-vcs-text overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-vcs-card border-r border-vcs-border overflow-y-auto flex flex-col">
          <div className="border-b border-vcs-border">
            <CharacterPanel />
          </div>
          <div className="flex-1 overflow-y-auto">
            <NodeLibrary />
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative">
            <WorkflowCanvas />
          </div>
          <div className="h-72 flex-shrink-0 border-t border-vcs-border flex">
            <div className="flex-1 border-r border-vcs-border">
              <ChatConsole />
            </div>
            <div className="w-56 flex-shrink-0 bg-vcs-card">
              <RunTracePanel />
            </div>
          </div>
        </main>
        <aside className="w-72 flex-shrink-0 bg-vcs-card border-l border-vcs-border overflow-y-auto">
          <InspectorPanel />
        </aside>
      </div>
    </div>
  );
}

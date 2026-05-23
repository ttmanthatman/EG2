"use client";

const NODE_LIBRARY_ITEMS = [
  { type: "UserInput", label: "Input", icon: "↓", description: "User message entry" },
  { type: "MemoryRetriever", label: "Memory", icon: "◈", description: "Relevant memory retrieval" },
  { type: "StateUpdater", label: "State", icon: "⚙", description: "Internal state update (LLM)" },
  { type: "NarrativeBuilder", label: "Narrative", icon: "◫", description: "State → performance context (LLM)" },
  { type: "CharacterPerformer", label: "Performance", icon: "◆", description: "Action & dialogue generation (LLM)" },
  { type: "Committer", label: "Commit", icon: "◎", description: "Long-term memory commit (LLM)" },
  { type: "CharacterOutput", label: "Output", icon: "→", description: "Final output formatting" },
];

export default function NodeLibrary() {
  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-vcs-text-secondary uppercase tracking-wider mb-3">Node Library</h3>
      <p className="text-xs text-vcs-text-muted mb-3">Available nodes (read-only in MVP)</p>
      <div className="space-y-1.5">
        {NODE_LIBRARY_ITEMS.map((item) => (
          <div key={item.type}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded bg-vcs-bg border border-vcs-border cursor-default opacity-60 hover:opacity-100 transition-opacity"
            title={`${item.description} — Drag & drop coming in Edit Mode`}
          >
            <span className="text-vcs-gold text-xs w-4 text-center">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-vcs-text">{item.label}</div>
              <div className="text-[10px] text-vcs-text-muted truncate">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-2.5 rounded bg-vcs-bg border border-vcs-border">
        <p className="text-[10px] text-vcs-text-muted leading-relaxed">
          Edit Mode (coming soon) will allow drag-and-drop insertion, reordering, and custom connections between nodes.
        </p>
      </div>
    </div>
  );
}

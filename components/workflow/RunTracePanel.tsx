"use client";

import { useAppStore } from "@/lib/store";
import type { NodeTrace } from "@/lib/workflow/workflowTypes";

export default function RunTracePanel() {
  const traces = useAppStore((s) => s.nodeTraces);
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId);
  const setInspectorTab = useAppStore((s) => s.setInspectorTab);

  if (traces.length === 0) {
    return (<div className="h-full flex items-center justify-center"><p className="text-xs text-vcs-text-muted">Run trace appears here after each turn</p></div>);
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-1">
      <h4 className="text-[10px] font-semibold text-vcs-text-muted uppercase tracking-wider mb-2 px-1">Run Trace</h4>
      {traces.map((trace, index) => (<TraceRow key={trace.node_id} trace={trace} index={index} onClick={() => { setSelectedNodeId(trace.node_id); setInspectorTab("overview"); }} />))}
      <div className="mt-3 pt-3 border-t border-vcs-border px-1">
        <p className="text-[10px] text-vcs-text-muted">Total nodes: {traces.length} · Total time: {(traces.reduce((sum, t) => sum + t.duration_ms, 0) / 1000).toFixed(2)}s</p>
      </div>
    </div>
  );
}

function TraceRow({ trace, index, onClick }: { trace: NodeTrace; index: number; onClick: () => void }) {
  const statusColors: Record<string, string> = { idle: "#6B7280", running: "#7C8CFF", success: "#34D399", error: "#F87171", warning: "#FBBF24" };
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-vcs-bg transition-colors text-left">
      <span className="text-[10px] text-vcs-text-muted w-4 flex-shrink-0">{index + 1}</span>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[trace.status] || "#6B7280" }} />
      <span className="text-[11px] text-vcs-text truncate flex-1">{trace.node_id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
      <span className="text-[10px] text-vcs-text-muted flex-shrink-0 font-mono">{(trace.duration_ms / 1000).toFixed(2)}s</span>
    </button>
  );
}

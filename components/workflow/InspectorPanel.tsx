"use client";

import { useAppStore } from "@/lib/store";
import type { NodeTrace } from "@/lib/workflow/workflowTypes";

const TABS = ["overview", "input", "output", "prompt", "params", "logs"];

export default function InspectorPanel() {
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const traces = useAppStore((s) => s.nodeTraces);
  const inspectorTab = useAppStore((s) => s.inspectorTab);
  const setInspectorTab = useAppStore((s) => s.setInspectorTab);
  const promptOverrides = useAppStore((s) => s.promptOverrides);
  const setPromptOverride = useAppStore((s) => s.setPromptOverride);

  const trace: NodeTrace | undefined = traces.find((t) => t.node_id === selectedNodeId);

  if (!selectedNodeId) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-xs text-vcs-text-muted text-center">Click a node to inspect its details</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-vcs-border">
        <h3 className="text-sm font-semibold text-vcs-text">
          {selectedNodeId?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </h3>
        {trace && (
          <div className="flex items-center gap-2 mt-1.5">
            <StatusDot status={trace.status} />
            <span className="text-xs text-vcs-text-secondary capitalize">{trace.status}</span>
            {trace.duration_ms > 0 && <span className="text-xs text-vcs-text-muted">· {(trace.duration_ms / 1000).toFixed(2)}s</span>}
          </div>
        )}
      </div>
      <div className="flex border-b border-vcs-border px-2">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setInspectorTab(tab)}
            className={`px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
              inspectorTab === tab ? "text-vcs-gold border-b border-vcs-gold" : "text-vcs-text-muted hover:text-vcs-text-secondary"
            }`}
          >{tab}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-xs">
        {!trace && <p className="text-vcs-text-muted">No trace data yet. Run a turn to see results.</p>}
        {trace && inspectorTab === "overview" && <OverviewTab trace={trace} />}
        {trace && inspectorTab === "input" && <DataTab label="Input" data={trace.input} />}
        {trace && inspectorTab === "output" && <DataTab label="Output" data={trace.output} />}
        {trace && inspectorTab === "prompt" && <PromptTab nodeId={selectedNodeId} trace={trace} override={promptOverrides[selectedNodeId]} onOverride={(key, value) => setPromptOverride(selectedNodeId, key as "systemPrompt" | "temperature" | "maxTokens", value)} />}
        {trace && inspectorTab === "params" && <ParamsTab nodeId={selectedNodeId} trace={trace} override={promptOverrides[selectedNodeId]} onOverride={(key, value) => setPromptOverride(selectedNodeId, key as "systemPrompt" | "temperature" | "maxTokens", value)} />}
        {trace && inspectorTab === "logs" && <LogsTab trace={trace} />}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { idle: "#6B7280", running: "#7C8CFF", success: "#34D399", error: "#F87171", warning: "#FBBF24" };
  return <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: colors[status] || "#6B7280" }} />;
}

function OverviewTab({ trace }: { trace: NodeTrace }) {
  return (
    <div className="space-y-3">
      <Field label="Node" value={trace.node_id} />
      <Field label="Type" value={trace.node_type} />
      <Field label="Status" value={trace.status} />
      <Field label="Duration" value={`${(trace.duration_ms / 1000).toFixed(2)}s`} />
      <Field label="Started" value={new Date(trace.started_at).toLocaleTimeString()} />
      <Field label="Ended" value={new Date(trace.ended_at).toLocaleTimeString()} />
      {trace.warnings.length > 0 && (
        <div>
          <span className="text-vcs-warning font-medium">Warnings</span>
          {trace.warnings.map((w, i) => (<p key={i} className="text-vcs-warning mt-1 font-mono text-[10px]">{w}</p>))}
        </div>
      )}
      {trace.error && (
        <div>
          <span className="text-vcs-error font-medium">Error</span>
          <p className="text-vcs-error mt-1 font-mono text-[10px]">{trace.error}</p>
        </div>
      )}
    </div>
  );
}

function DataTab({ label, data }: { label: string; data: unknown }) {
  const formatted = JSON.stringify(data, null, 2);
  return (
    <div className="space-y-3">
      <p className="text-vcs-text-secondary">{summarizeJson(data)}</p>
      <details>
        <summary className="text-vcs-accent cursor-pointer hover:underline">View raw JSON</summary>
        <pre className="mt-2 p-3 rounded bg-vcs-bg border border-vcs-border text-[10px] font-mono text-vcs-text overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">{formatted}</pre>
      </details>
    </div>
  );
}

function PromptTab({ nodeId, trace, override, onOverride }: { nodeId: string; trace: NodeTrace; override?: { systemPrompt?: string; temperature?: number; maxTokens?: number }; onOverride: (key: string, value: string | number) => void }) {
  const systemPrompt = override?.systemPrompt || (typeof trace.prompt === "string" ? trace.prompt : "") || "";
  return (
    <div className="space-y-3">
      <div>
        <label className="text-vcs-text-secondary font-medium block mb-1">System Prompt</label>
        <textarea className="w-full h-48 p-2.5 rounded bg-vcs-bg border border-vcs-border text-[11px] font-mono text-vcs-text resize-y focus:outline-none focus:border-vcs-gold" value={systemPrompt} onChange={(e) => onOverride("systemPrompt", e.target.value)} placeholder="System prompt not available for this node" />
        <p className="text-[10px] text-vcs-text-muted mt-1">Edits are saved in browser state (not persisted to disk).</p>
      </div>
    </div>
  );
}

function ParamsTab({ nodeId, trace, override, onOverride }: { nodeId: string; trace: NodeTrace; override?: { systemPrompt?: string; temperature?: number; maxTokens?: number }; onOverride: (key: string, value: string | number) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-vcs-text-secondary font-medium block mb-1">Temperature</label>
        <input type="number" step="0.1" min="0" max="2" className="w-full p-2 rounded bg-vcs-bg border border-vcs-border text-xs font-mono text-vcs-text focus:outline-none focus:border-vcs-gold" value={override?.temperature ?? 0.7} onChange={(e) => onOverride("temperature", parseFloat(e.target.value) || 0.7)} />
      </div>
      <div>
        <label className="text-vcs-text-secondary font-medium block mb-1">Max Tokens</label>
        <input type="number" step="256" min="64" max="8192" className="w-full p-2 rounded bg-vcs-bg border border-vcs-border text-xs font-mono text-vcs-text focus:outline-none focus:border-vcs-gold" value={override?.maxTokens ?? 2048} onChange={(e) => onOverride("maxTokens", parseInt(e.target.value) || 2048)} />
      </div>
    </div>
  );
}

function LogsTab({ trace }: { trace: NodeTrace }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-mono"><span className="text-vcs-text-muted">Started</span><span className="text-vcs-text">{new Date(trace.started_at).toLocaleTimeString()}</span></div>
      <div className="flex justify-between text-[10px] font-mono"><span className="text-vcs-text-muted">Ended</span><span className="text-vcs-text">{new Date(trace.ended_at).toLocaleTimeString()}</span></div>
      <div className="flex justify-between text-[10px] font-mono"><span className="text-vcs-text-muted">Duration</span><span className="text-vcs-text">{(trace.duration_ms / 1000).toFixed(3)}s</span></div>
      {trace.warnings.length > 0 && (<div className="mt-3 p-2.5 rounded bg-vcs-bg border border-vcs-warning/30"><p className="text-vcs-warning text-[10px] font-medium mb-1">Warnings</p>{trace.warnings.map((w, i) => (<p key={i} className="text-vcs-warning text-[10px] font-mono">{w}</p>))}</div>)}
      {trace.error && (<div className="mt-3 p-2.5 rounded bg-vcs-bg border border-vcs-error/30"><p className="text-vcs-error text-[10px] font-medium mb-1">Error</p><p className="text-vcs-error text-[10px] font-mono">{trace.error}</p></div>)}
      {trace.warnings.length === 0 && !trace.error && <p className="text-vcs-text-muted text-[10px] mt-2">No warnings or errors.</p>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (<div><span className="text-vcs-text-muted font-medium">{label}</span><p className="text-vcs-text mt-0.5 font-mono text-[10px]">{value}</p></div>);
}

function summarizeJson(data: unknown): string {
  if (!data) return "No data";
  if (typeof data === "string") return data.length > 150 ? data.substring(0, 150) + "…" : data;
  if (Array.isArray(data)) return `Array with ${data.length} items`;
  if (typeof data === "object") { const keys = Object.keys(data as Record<string, unknown>); return `Object with keys: ${keys.slice(0, 8).join(", ")}${keys.length > 8 ? ", …" : ""}`; }
  return String(data);
}

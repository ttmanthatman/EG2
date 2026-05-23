"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeStatus } from "@/lib/workflow/workflowTypes";

interface BaseWorkflowNodeProps {
  id: string;
  data: {
    label: string; description: string; status: NodeStatus; icon: string;
    durationMs?: number; outputSummary?: string; usesLLM?: boolean;
    model?: string; isSelected?: boolean; isActive?: boolean;
  };
}

const STATUS_COLORS: Record<NodeStatus, string> = { idle: "#6B7280", running: "#7C8CFF", success: "#34D399", error: "#F87171", warning: "#FBBF24" };
const STATUS_GLOW: Record<NodeStatus, string> = { idle: "", running: "shadow-[0_0_12px_rgba(124,140,255,0.5)]", success: "shadow-[0_0_8px_rgba(52,211,153,0.3)]", error: "shadow-[0_0_8px_rgba(248,113,113,0.4)]", warning: "shadow-[0_0_8px_rgba(251,191,36,0.3)]" };

function BaseWorkflowNode({ id, data }: BaseWorkflowNodeProps) {
  const statusColor = STATUS_COLORS[data.status];
  const glow = STATUS_GLOW[data.status];
  const borderColor = data.isSelected ? "#C8A45D" : data.isActive ? statusColor : "#243044";

  return (
    <div className={`relative rounded-lg px-3.5 py-2.5 min-w-[200px] max-w-[260px] transition-all duration-300 ${glow}`}
      style={{ background: "#121827", border: `1.5px solid ${borderColor}` }}>
      <Handle type="target" position={Position.Top} style={{ background: statusColor, border: "none", width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: statusColor, border: "none", width: 8, height: 8 }} />
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
        <span className="text-vcs-gold text-xs">{data.icon}</span>
        <span className="text-xs font-medium text-vcs-text truncate">{data.label}</span>
        {data.usesLLM && <span className="text-[9px] text-vcs-accent ml-auto flex-shrink-0">LLM</span>}
      </div>
      <p className="text-[10px] text-vcs-text-muted leading-snug mb-1.5">{data.description}</p>
      {data.outputSummary && <p className="text-[10px] text-vcs-text-secondary leading-snug truncate border-t border-vcs-border pt-1.5 mt-1">{data.outputSummary}</p>}
      {data.durationMs !== undefined && data.durationMs > 0 && (
        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-vcs-text-muted">
          <span>{(data.durationMs / 1000).toFixed(2)}s</span>
          {data.model && <span>· {data.model}</span>}
        </div>
      )}
      {data.status === "error" && <div className="mt-1.5 text-[10px] text-vcs-error font-medium">ERROR</div>}
    </div>
  );
}

export default memo(BaseWorkflowNode);

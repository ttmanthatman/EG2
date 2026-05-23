"use client";

import { useCallback, useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import BaseWorkflowNode from "./nodes/BaseWorkflowNode";
import { useAppStore } from "@/lib/store";
import { DEFAULT_WORKFLOW } from "@/lib/workflow/defaultWorkflow";
import type { NodeStatus, NodeTrace } from "@/lib/workflow/workflowTypes";

const NODE_ICONS: Record<string, string> = {
  UserInput: "↓", MemoryRetriever: "◈", StateUpdater: "⚙",
  NarrativeBuilder: "◫", CharacterPerformer: "◆", Committer: "◎", CharacterOutput: "→",
};

const nodeTypes = { workflowNode: BaseWorkflowNode };

function buildNodes(traces: NodeTrace[], activeNodeId: string | null, selectedNodeId: string | null): Node[] {
  return DEFAULT_WORKFLOW.nodes.map((wn, index) => {
    const trace = traces.find((t) => t.node_id === wn.id);
    const status: NodeStatus = trace?.status || "idle";
    const isActive = wn.id === activeNodeId;
    return {
      id: wn.id, type: "workflowNode",
      position: { x: 300, y: 20 + index * 170 },
      data: {
        label: wn.name, description: wn.description,
        status: isActive && status === "idle" ? "running" : status,
        icon: NODE_ICONS[wn.type] || "●",
        durationMs: trace?.duration_ms, outputSummary: trace?.output_summary,
        usesLLM: wn.usesLLM, model: trace?.params?.model as string | undefined,
        isSelected: wn.id === selectedNodeId, isActive,
      },
    };
  });
}

function buildEdges(): Edge[] {
  return DEFAULT_WORKFLOW.connections.map((conn) => ({
    id: `e-${conn.from}-${conn.to}`, source: conn.from, target: conn.to,
    animated: false, style: { stroke: "#243044", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#243044", width: 12, height: 12 },
  }));
}

export default function WorkflowCanvas() {
  const nodeTraces = useAppStore((s) => s.nodeTraces);
  const activeNodeId = useAppStore((s) => s.activeNodeId);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId);

  const initialNodes = useMemo(() => buildNodes(nodeTraces, activeNodeId, selectedNodeId), [nodeTraces, activeNodeId, selectedNodeId]);
  const initialEdges = useMemo(() => buildEdges(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  useMemo(() => { setNodes(buildNodes(nodeTraces, activeNodeId, selectedNodeId)); }, [nodeTraces, activeNodeId, selectedNodeId, setNodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => { setSelectedNodeId(node.id); }, [setSelectedNodeId]);
  const onPaneClick = useCallback(() => { setSelectedNodeId(null); }, [setSelectedNodeId]);

  return (
    <div className="w-full h-full" style={{ background: "#080C14" }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.3 }} minZoom={0.3} maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }} proOptions={{ hideAttribution: true }}
      >
        <Background color="#1A2436" gap={24} size={1} />
        <Controls className="[&>button]:!bg-vcs-card [&>button]:!border-vcs-border [&>button]:!text-vcs-text-secondary" style={{ background: "#121827", borderRadius: 8, border: "1px solid #243044" }} />
        <MiniMap style={{ background: "#121827", border: "1px solid #243044" }} maskColor="rgba(8, 12, 20, 0.7)"
          nodeColor={(node) => {
            const status = (node.data as { status?: NodeStatus })?.status;
            switch (status) {
              case "running": return "#7C8CFF";
              case "success": return "#34D399";
              case "error": return "#F87171";
              case "warning": return "#FBBF24";
              default: return "#6B7280";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

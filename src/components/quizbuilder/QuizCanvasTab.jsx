import React, { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { base44 } from "@/api/base44Client";
import { Info } from "lucide-react";

const STEP_TYPE_COLORS = {
  start: "#22c55e", single_select: "#1e90ff", multi_choice: "#3b82f6",
  dropdown: "#6366f1", yes_no: "#8b5cf6", text_field: "#f59e0b",
  email_input: "#f97316", phone_input: "#ef4444", number_input: "#06b6d4",
  date_picker: "#14b8a6", slider: "#84cc16", address: "#a78bfa",
  decision: "#fbbf24", webhook: "#f43f5e", form: "#64748b",
  notification: "#0ea5e9", script: "#475569", redirect: "#94a3b8",
  results: "#22c55e",
};

function buildFlowFromSteps(steps, onNodeClick) {
  // Simple top-down layout without dagre
  const NODE_W = 200, NODE_H = 70, SPACING_Y = 120;
  const nodes = steps.map((s, i) => ({
    id: s.step_id,
    type: "default",
    position: { x: 300, y: i * SPACING_Y },
    data: {
      label: (
        <div style={{ textAlign: "left", cursor: "pointer" }} onClick={() => onNodeClick(s.step_id)}>
          <div style={{ fontSize: 10, fontWeight: 700, color: STEP_TYPE_COLORS[s.step_type] || "#64748b", textTransform: "uppercase", marginBottom: 2 }}>
            {s.step_type}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{s.title_display || s.step_id}</div>
        </div>
      )
    },
    style: {
      background: "#0f1e35",
      border: `2px solid ${STEP_TYPE_COLORS[s.step_type] || "#334155"}`,
      borderRadius: 10,
      padding: "8px 12px",
      width: NODE_W,
      fontSize: 12,
    },
  }));

  const edges = [];
  steps.forEach(s => {
    if (s.default_next_step_id) {
      edges.push({ id: `e_default_${s.step_id}`, source: s.step_id, target: s.default_next_step_id, label: "", style: { stroke: "#475569" }, labelStyle: { fill: "#94a3b8", fontSize: 10 } });
    }
    (s.answer_options || []).forEach(opt => {
      if (opt.target_step_id) {
        edges.push({ id: `e_ans_${s.step_id}_${opt.id}`, source: s.step_id, target: opt.target_step_id, label: opt.label || "", style: { stroke: "#1e90ff" }, labelStyle: { fill: "#93c5fd", fontSize: 10 }, animated: false });
      }
    });
  });

  return { nodes, edges };
}

export default function QuizCanvasTab({ quiz, steps, onNodeClick }) {
  const { nodes: initNodes, edges: initEdges } = buildFlowFromSteps(steps, onNodeClick);
  const [nodes] = useNodesState(initNodes);
  const [edges] = useEdgesState(initEdges);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex-shrink-0">
        <Info className="w-4 h-4 text-amber-400" />
        <span className="text-xs text-amber-300 font-medium">Read-only view. Edit steps in the Steps tab. Click a node to jump to its step.</span>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: "#0a1628" }}
        >
          <Background color="#1e293b" gap={20} />
          <Controls style={{ background: "#0f1e35", border: "1px solid rgba(255,255,255,0.1)" }} />
          <MiniMap style={{ background: "#0f1e35", border: "1px solid rgba(255,255,255,0.1)" }} nodeColor={n => STEP_TYPE_COLORS[n.data?.type] || "#334155"} maskColor="rgba(0,0,0,0.4)" />
        </ReactFlow>
      </div>
    </div>
  );
}
import React from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Info } from "lucide-react";
import { stepCategory } from "@/lib/themeTokens";

function getCategoryColor(stepType, category) {
  const varMap = {
    input:  "var(--theme-node-input-color, #06b6d4)",
    logic:  "var(--theme-node-logic-color, #8b5cf6)",
    action: "var(--theme-node-action-color, #10b981)",
    result: "var(--theme-node-result-color, #22c55e)",
    dq:     "var(--theme-node-dq-color, #f43f5e)",
  };
  return varMap[category] || "var(--theme-text-muted, #64748b)";
}

function buildFlowFromSteps(steps, onNodeClick) {
  const NODE_W = 210, SPACING_Y = 120;
  const nodes = steps.map((s, i) => {
    const cat = stepCategory(s.step_type);
    // Use inline style with fallbacks since ReactFlow nodes don't inherit CSS vars easily
    const catColors = {
      input:  { color: "#06b6d4", glow: "rgba(6,182,212,0.25)" },
      logic:  { color: "#8b5cf6", glow: "rgba(139,92,246,0.25)" },
      action: { color: "#10b981", glow: "rgba(16,185,129,0.25)" },
      result: { color: "#22c55e", glow: "rgba(34,197,94,0.25)" },
      dq:     { color: "#f43f5e", glow: "rgba(244,63,94,0.25)" },
    };
    const accent = catColors[cat] || { color: "#64748b", glow: "transparent" };

    return {
      id: s.step_id,
      type: "default",
      position: { x: 300, y: i * SPACING_Y },
      data: {
        label: (
          <div style={{ textAlign: "left", cursor: "pointer" }} onClick={() => onNodeClick(s.step_id)}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: `${accent.color}26`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent.color }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: accent.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.step_type}
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>{s.title_display || s.step_id}</div>
            {s.label && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label.slice(0, 40)}{s.label.length > 40 ? "…" : ""}</div>}
          </div>
        )
      },
      style: {
        background: "rgba(20,18,40,0.8)",
        border: `1.5px solid ${accent.color}66`,
        borderLeft: `3px solid ${accent.color}`,
        borderRadius: 10,
        padding: "8px 12px",
        width: NODE_W,
        fontSize: 12,
        boxShadow: `0 2px 12px ${accent.glow}`,
      },
    };
  });

  const edges = [];
  steps.forEach(s => {
    if (s.default_next_step_id) {
      edges.push({
        id: `e_default_${s.step_id}`,
        source: s.step_id,
        target: s.default_next_step_id,
        style: { stroke: "rgba(148,163,184,0.5)", strokeWidth: 1.5 },
        labelStyle: { fill: "#94a3b8", fontSize: 10 },
      });
    }
    (s.answer_options || []).forEach(opt => {
      if (opt.target_step_id) {
        edges.push({
          id: `e_ans_${s.step_id}_${opt.id}`,
          source: s.step_id,
          target: opt.target_step_id,
          label: opt.label || "",
          style: { stroke: "var(--theme-primary, #8b5cf6)", strokeWidth: 1.5 },
          labelStyle: { fill: "#c4b5fd", fontSize: 10 },
        });
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
    <div className="h-full flex flex-col" style={{ background: "var(--theme-background, #0a0a1f)" }}>
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ background: "rgba(139,92,246,0.08)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <Info className="w-4 h-4" style={{ color: "var(--theme-primary, #8b5cf6)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--theme-text-muted, #94a3b8)" }}>
          Read-only view. Click a node to jump to its step editor.
        </span>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent" }}
        >
          <Background color="rgba(255,255,255,0.03)" gap={24} />
          <Controls style={{ background: "rgba(20,18,40,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
          <MiniMap style={{ background: "rgba(20,18,40,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
            nodeColor={() => "#8b5cf6"} maskColor="rgba(0,0,0,0.5)" />
        </ReactFlow>
      </div>
    </div>
  );
}
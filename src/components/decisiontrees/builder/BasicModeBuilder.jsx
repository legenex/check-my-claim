import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ChevronDown, ChevronUp, Trash2, Save, GripVertical } from "lucide-react";
import NodeInspector from "./NodeInspector";
import NodePalette from "./NodePalette";
import { getNodeColor, getNodeLabel } from "./nodeConfig";

export default function BasicModeBuilder({ quiz, nodes, edges, setNodes, setEdges, selectedNodeId, setSelectedNodeId, onSave, onQuizUpdate }) {
  const [showPalette, setShowPalette] = useState(false);

  const selectedNode = nodes.find(n => n.node_id === selectedNodeId);

  const addNode = async (type) => {
    const newNode = {
      quiz_id: quiz.id,
      node_id: `node_${type}_${Date.now()}`,
      node_type: type,
      label: getNodeLabel(type),
      position_x: 100,
      position_y: nodes.length * 120 + 100,
      config: {},
      _new: true,
    };
    setNodes(prev => [...prev, newNode]);
    setShowPalette(false);
    await onSave(null, [newNode], null);
    // refresh to get real id
    const fresh = await base44.entities.Question.filter({ quiz_id: quiz.id });
    setNodes(fresh);
  };

  const deleteNode = async (nodeId) => {
    const node = nodes.find(n => n.node_id === nodeId);
    if (node?.id) await base44.entities.Question.delete(node.id);
    const relatedEdges = edges.filter(e => e.source_node_id === nodeId || e.target_node_id === nodeId);
    for (const e of relatedEdges) {
      if (e.id) await base44.entities.Edge.delete(e.id);
    }
    setNodes(prev => prev.filter(n => n.node_id !== nodeId));
    setEdges(prev => prev.filter(e => e.source_node_id !== nodeId && e.target_node_id !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const updateNode = async (updated) => {
    if (updated.id) await base44.entities.Question.update(updated.id, updated);
    setNodes(prev => prev.map(n => n.node_id === updated.node_id ? updated : n));
  };

  const moveNode = (index, dir) => {
    const newNodes = [...nodes];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= newNodes.length) return;
    [newNodes[index], newNodes[swapIdx]] = [newNodes[swapIdx], newNodes[index]];
    setNodes(newNodes);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {nodes.map((node, i) => {
            const color = getNodeColor(node.node_type);
            const isSelected = node.node_id === selectedNodeId;
            return (
              <div key={node.node_id}
                className={`bg-[#0f1e35] rounded-xl border-2 p-4 cursor-pointer transition-all ${isSelected ? "border-[#1e90ff]" : "border-white/10 hover:border-white/30"}`}
                onClick={() => setSelectedNodeId(isSelected ? null : node.node_id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={e => { e.stopPropagation(); moveNode(i, -1); }} className="text-slate-500 hover:text-white"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={e => { e.stopPropagation(); moveNode(i, 1); }} className="text-slate-500 hover:text-white"><ChevronDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color }}>{getNodeLabel(node.node_type)}</div>
                    <div className="text-sm font-semibold text-white truncate">{node.label || "Untitled"}</div>
                  </div>
                  <span className="text-xs text-slate-500">#{i + 1}</span>
                  <button onClick={e => { e.stopPropagation(); deleteNode(node.node_id); }}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add node */}
          <div className="relative">
            <button onClick={() => setShowPalette(v => !v)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/20 hover:border-[#1e90ff] text-slate-400 hover:text-[#1e90ff] py-4 rounded-xl text-sm font-semibold transition-all">
              <Plus className="w-4 h-4" /> Add Node
            </button>
            {showPalette && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#0a1628] border border-white/10 rounded-xl z-10 max-h-80 overflow-y-auto shadow-2xl">
                <NodePalette onAddNode={addNode} onClose={() => setShowPalette(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inspector */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          edges={edges}
          allNodes={nodes}
          onUpdate={updateNode}
          onClose={() => setSelectedNodeId(null)}
          onDeleteNode={deleteNode}
        />
      )}
    </div>
  );
}
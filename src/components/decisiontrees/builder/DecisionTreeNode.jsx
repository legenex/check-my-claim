import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeColor, getNodeLabel } from "./nodeConfig";
import { Trash2 } from "lucide-react";

export default function DecisionTreeNode({ data, selected }) {
  const { node, onSelect, onDelete } = data;
  const color = getNodeColor(node.node_type);
  const label = getNodeLabel(node.node_type);

  return (
    <div
      onClick={() => onSelect(node.node_id)}
      className={`relative bg-[#0f1e35] rounded-xl border-2 transition-all cursor-pointer min-w-[160px] max-w-[220px] shadow-lg ${selected ? "border-[#1e90ff] shadow-blue-500/20" : "border-white/10 hover:border-white/30"}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2.5 !h-2.5 !border-2 !border-[#0f1e35]" />

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>{label}</span>
        </div>
        <div className="text-sm font-semibold text-white leading-tight truncate">{node.label || "Untitled"}</div>
        {node.config?.description && (
          <div className="text-xs text-slate-400 mt-1 truncate">{node.config.description}</div>
        )}
      </div>

      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(node.node_id); }}
          className="absolute top-1.5 right-1.5 p-1 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          style={{ opacity: selected ? 1 : undefined }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2.5 !h-2.5 !border-2 !border-[#0f1e35]" />
    </div>
  );
}
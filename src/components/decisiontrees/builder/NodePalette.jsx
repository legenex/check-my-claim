import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { NODE_TYPES, NODE_SECTIONS } from "./nodeConfig";

export default function NodePalette({ onAddNode, onClose }) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? NODE_TYPES.filter(n => n.label.toLowerCase().includes(search.toLowerCase()) || n.type.includes(search.toLowerCase()))
    : NODE_TYPES;

  const grouped = NODE_SECTIONS.reduce((acc, section) => {
    const items = filtered.filter(n => n.section === section);
    if (items.length) acc[section] = items;
    return acc;
  }, {});

  return (
    <div className="w-56 bg-[#0a1628] border-r border-white/10 flex flex-col h-full flex-shrink-0">
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search nodes..."
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {Object.entries(grouped).map(([section, nodes]) => (
          <div key={section}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-1">{section}</div>
            <div className="space-y-0.5">
              {nodes.map(node => (
                <button
                  key={node.type}
                  onClick={() => onAddNode(node.type)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all text-left"
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: node.color }} />
                  {node.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
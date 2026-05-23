import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InlineFieldModal from "../InlineFieldModal";

export default function SettingsFields({ fields, steps, onCreated, onUpdated, onDeleted }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingField, setEditingField] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Count usage per field key
  const usageCount = {};
  fields.forEach(f => { usageCount[f.key] = 0; });
  steps.forEach(s => {
    if (s.save_to_field && usageCount[s.save_to_field] !== undefined) usageCount[s.save_to_field]++;
    Object.values(s.variants || {}).forEach(v => {
      if (v?.save_to_field && usageCount[v.save_to_field] !== undefined) usageCount[v.save_to_field]++;
    });
    Object.keys(s.option_field_writes || {}).forEach(k => {
      if (usageCount[k] !== undefined) usageCount[k]++;
    });
  });

  const filtered = fields.filter(f => {
    const matchSearch = !search || f.key.toLowerCase().includes(search.toLowerCase()) || f.label.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || f.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = async (field) => {
    const count = usageCount[field.key] || 0;
    if (count > 0) {
      setDeleteConfirm({ field, count });
    } else {
      await doDelete(field);
    }
  };

  const doDelete = async (field) => {
    await base44.entities.SurveyField.delete(field.id);
    onDeleted(field.id);
    setDeleteConfirm(null);
  };

  const FIELD_TYPES = ["text","number","enum","boolean","date","email","phone","url","json"];

  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: "#2282fc" }}>Field Library</div>
        <button
          onClick={() => { setEditingField(null); setShowModal(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold"
          style={{ background: "rgba(34,130,252,0.15)", color: "#2282fc", border: "1px solid rgba(34,130,252,0.3)" }}
        >
          <Plus className="w-3 h-3" /> Add Field
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded flex-1" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fields..." className="bg-transparent text-sm outline-none flex-1 text-white" style={{ fontSize: 12, fontFamily: "'Manrope', sans-serif" }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-2 py-1.5 rounded text-xs outline-none cursor-pointer text-white" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Manrope', sans-serif" }}>
          <option value="all">All types</option>
          {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden" }}>
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#050b14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Key","Label","Type","Category","Computed","Used In","Actions"].map(h => (
                <th key={h} className="text-left px-3 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((field, i) => {
              const count = usageCount[field.key] || 0;
              return (
                <tr
                  key={field.id}
                  onClick={() => { setEditingField(field); setShowModal(true); }}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-3 py-2.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2282fc", fontSize: 11 }}>{field.key}</td>
                  <td className="px-3 py-2.5 text-slate-200">{field.label}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontSize: 10 }}>{field.type}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">{field.category}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: field.computed ? "#3ab54b" : "#475569" }}>{field.computed ? "yes" : "no"}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: count > 0 ? "#f59e0b" : "#475569" }}>{count}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); setEditingField(field); setShowModal(true); }} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(field); }} className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-600 text-xs">No fields found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-lg p-6 max-w-sm w-full mx-4" style={{ background: "#0a1320", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-white">Delete field?</span>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              This field is used in <strong className="text-red-400">{deleteConfirm.count} step{deleteConfirm.count !== 1 ? "s" : ""}</strong>. Deleting it will break those steps. Continue?
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded text-sm text-slate-400 hover:bg-white/5">Cancel</button>
              <button onClick={() => doDelete(deleteConfirm.field)} className="px-3 py-1.5 rounded text-sm font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30">Delete Anyway</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <InlineFieldModal
          field={editingField}
          onClose={() => { setShowModal(false); setEditingField(null); }}
          onCreated={(f) => { onCreated(f); setShowModal(false); }}
          onUpdated={(f) => { onUpdated(f); setShowModal(false); setEditingField(null); }}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Copy, ExternalLink, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

const STATUS_COLORS = {
  live: "bg-green-500/20 text-green-400",
  draft: "bg-slate-500/20 text-slate-400",
  paused: "bg-amber-500/20 text-amber-400",
};

export default function ToolsTab() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchTools(); }, []);

  const fetchTools = async () => {
    setLoading(true);
    const results = await base44.entities.Tool.list("-updated_date", 100);
    setTools(results);
    setLoading(false);
  };

  const toggleStatus = async (tool) => {
    const next = tool.status === "live" ? "paused" : "live";
    await base44.entities.Tool.update(tool.id, { status: next });
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, status: next } : t));
  };

  const duplicate = async (tool) => {
    const copy = { ...tool, name: `${tool.name} (Copy)`, slug: `${tool.slug}-copy-${Date.now().toString(36)}`, status: "draft" };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    await base44.entities.Tool.create(copy);
    fetchTools();
  };

  const deleteTool = async (id) => {
    await base44.entities.Tool.delete(id);
    setTools(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Tools</h3>
          <p className="text-slate-400 text-sm mt-0.5">{tools.filter(t => t.status === "live").length} live · {tools.length} total</p>
        </div>
        <Link
          to="/admin/tools/new"
          className="flex items-center gap-2 bg-[#b8860b] hover:bg-[#8b6914] text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Tool
        </Link>
      </div>

      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading tools...</div>
        ) : tools.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No tools yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-white">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Public URL</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Last Edited</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.map(tool => (
                  <tr key={tool.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-semibold">{tool.name}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">{tool.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[tool.status] || STATUS_COLORS.draft}`}>{tool.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/tools/${tool.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b8860b] hover:underline font-mono">/tools/{tool.slug}</a>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {tool.updated_date ? new Date(tool.updated_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <a href={`/tools/${tool.slug}?preview=1`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Preview">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link to={`/admin/tools/${tool.id}/edit`} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => duplicate(tool)} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Duplicate">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleStatus(tool)} className="p-1.5 text-slate-400 hover:text-white transition-colors" title={tool.status === "live" ? "Pause" : "Resume"}>
                          {tool.status === "live" ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteConfirm(tool.id)} className="p-1.5 text-red-400 hover:text-red-300 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold mb-2">Delete Tool?</h3>
            <p className="text-slate-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteTool(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
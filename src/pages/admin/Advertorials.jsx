import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Edit, Trash2, Copy, ExternalLink, ChevronDown, Search, ToggleLeft, ToggleRight } from "lucide-react";

const STATUS_COLORS = {
  published: "bg-green-500/20 text-green-400",
  draft: "bg-slate-500/20 text-slate-400",
  archived: "bg-red-500/20 text-red-400",
};

const CATEGORY_OPTIONS = ["All", "Rideshare", "Pedestrian/Cyclist", "Listicle", "Personal Narrative", "Urgency", "Anti-Lawyer", "Pride and Pain", "Other"];

export default function Advertorials() {
  const [advertorials, setAdvertorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchAdvertorials(); }, []);

  const fetchAdvertorials = async () => {
    setLoading(true);
    const results = await base44.entities.Advertorial.list("-created_date", 200);
    setAdvertorials(results);
    setLoading(false);
  };

  const filtered = advertorials.filter(a => {
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.headline?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || a.status === statusFilter.toLowerCase();
    const matchCat = categoryFilter === "All" || a.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const toggleStatus = async (adv) => {
    const next = adv.status === "published" ? "draft" : "published";
    await base44.entities.Advertorial.update(adv.id, { status: next });
    setAdvertorials(prev => prev.map(a => a.id === adv.id ? { ...a, status: next } : a));
  };

  const duplicate = async (adv) => {
    const copy = { ...adv, title: `${adv.title} (Copy)`, slug: `${adv.slug}-copy-${Date.now()}`, status: "draft", view_count: 0, conversion_count: 0 };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    await base44.entities.Advertorial.create(copy);
    fetchAdvertorials();
  };

  const deleteAdv = async (id) => {
    await base44.entities.Advertorial.delete(id);
    setAdvertorials(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const copyUrl = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/advertorial/${slug}`);
  };

  const bulkAction = async (action) => {
    for (const id of selected) {
      if (action === "publish") await base44.entities.Advertorial.update(id, { status: "published" });
      else if (action === "archive") await base44.entities.Advertorial.update(id, { status: "archived" });
      else if (action === "delete") await base44.entities.Advertorial.delete(id);
    }
    setSelected([]);
    fetchAdvertorials();
  };

  const convRate = (adv) => {
    if (!adv.view_count || adv.view_count === 0) return "0%";
    return ((adv.conversion_count || 0) / adv.view_count * 100).toFixed(1) + "%";
  };

  return (
    <AdminLayout title="Advertorials" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Advertorials" }]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Advertorials</h2>
          <p className="text-slate-400 text-sm mt-1">{advertorials.filter(a => a.status === "published").length} published · {advertorials.length} total</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/advertorials/new"
            className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Advertorial
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1e35] rounded-xl p-4 mb-6 border border-white/10 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or headline..."
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          {["All", "Published", "Draft", "Archived"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        {selected.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <button onClick={() => bulkAction("publish")} className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">Publish {selected.length}</button>
            <button onClick={() => bulkAction("archive")} className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">Archive {selected.length}</button>
            <button onClick={() => bulkAction("delete")} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">Delete {selected.length}</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading advertorials...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No advertorials found. <Link to="/admin/advertorials/new" className="text-[#1e90ff] underline">Create your first one.</Link></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(a => a.id) : [])} className="rounded" /></th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Title / Headline</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Payout</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Views</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Conv.</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Rate</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Published</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(adv => (
                  <tr key={adv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(adv.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, adv.id] : prev.filter(id => id !== adv.id))} className="rounded" /></td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-white font-semibold text-xs truncate">{adv.title}</div>
                      <div className="text-slate-400 text-xs truncate mt-0.5">{adv.headline?.substring(0, 70)}{adv.headline?.length > 70 ? "…" : ""}</div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded">{adv.category}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[adv.status] || STATUS_COLORS.draft}`}>{adv.status}</span></td>
                    <td className="px-4 py-3 text-green-400 font-semibold">{adv.payout ? `$${adv.payout}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{(adv.view_count || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-300">{(adv.conversion_count || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#2BB6F6] font-semibold">{convRate(adv)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{adv.published_date ? new Date(adv.published_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <a href={`/advertorial/${adv.slug}`} target="_blank" rel="noopener noreferrer" title="View public" className="p-1.5 text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                        <Link to={`/admin/advertorials/${adv.id}/edit`} title="Edit" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => duplicate(adv)} title="Duplicate" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleStatus(adv)} title="Toggle status" className="p-1.5 text-slate-400 hover:text-white transition-colors">
                          {adv.status === "published" ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => copyUrl(adv.slug)} title="Copy URL" className="p-1.5 text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(adv.id)} title="Delete" className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold mb-2">Delete Advertorial?</h3>
            <p className="text-slate-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteAdv(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
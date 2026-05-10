import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Edit, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight,
  Archive, BarChart2, GitBranch, Layers
} from "lucide-react";
import NewDecisionTreeModal from "@/components/decisiontrees/NewDecisionTreeModal";

const STATUS_COLORS = {
  Published: "bg-green-500/20 text-green-400 border border-green-500/30",
  Draft: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  Archived: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const CAMPAIGN_COLORS = {
  MVA: "bg-blue-500/20 text-blue-400",
  "Mass Tort": "bg-purple-500/20 text-purple-400",
  "Workers Comp": "bg-orange-500/20 text-orange-400",
  "Slip and Fall": "bg-yellow-500/20 text-yellow-400",
  "Medical Malpractice": "bg-red-500/20 text-red-400",
  Custom: "bg-slate-500/20 text-slate-400",
};

export default function DecisionTrees() {
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [cloning, setCloning] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [quizzes, brandList] = await Promise.all([
      base44.entities.Quiz.list("-updated_date", 200),
      base44.entities.DecisionTreeBrand.list(),
    ]);
    setTrees(quizzes);
    setBrands(brandList);
    setLoading(false);
  };

  const brandMap = Object.fromEntries(brands.map(b => [b.id, b]));

  const filtered = trees.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchCampaign = campaignFilter === "All" || t.campaign_type === campaignFilter;
    return matchSearch && matchStatus && matchCampaign;
  });

  const toggleStatus = async (tree) => {
    const next = tree.status === "Published" ? "Draft" : "Published";
    await base44.entities.Quiz.update(tree.id, { status: next });
    setTrees(prev => prev.map(t => t.id === tree.id ? { ...t, status: next } : t));
  };

  const archiveTree = async (id) => {
    await base44.entities.Quiz.update(id, { status: "Archived" });
    setTrees(prev => prev.map(t => t.id === id ? { ...t, status: "Archived" } : t));
  };

  const deleteTree = async (id) => {
    await base44.entities.Quiz.delete(id);
    setTrees(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  const cloneTree = async (tree) => {
    setCloning(tree.id);
    try {
      const [questions, edges] = await Promise.all([
        base44.entities.Question.filter({ quiz_id: tree.id }),
        base44.entities.Edge.filter({ quiz_id: tree.id }),
      ]);
      const newSlug = `${tree.slug}-copy-${Date.now().toString(36)}`;
      const newQuiz = await base44.entities.Quiz.create({
        ...tree,
        id: undefined, created_date: undefined, updated_date: undefined,
        title: `${tree.title} (Copy)`, slug: newSlug, status: "Draft",
        version: 1, total_submissions: 0, total_starts: 0, total_completes: 0,
        total_qualified: 0, total_disqualified: 0, published_at: undefined, published_by: undefined,
      });
      if (questions.length > 0) {
        await base44.entities.Question.bulkCreate(
          questions.map(q => ({ ...q, id: undefined, created_date: undefined, updated_date: undefined, quiz_id: newQuiz.id }))
        );
      }
      if (edges.length > 0) {
        await base44.entities.Edge.bulkCreate(
          edges.map(e => ({ ...e, id: undefined, created_date: undefined, updated_date: undefined, quiz_id: newQuiz.id }))
        );
      }
      await fetchData();
    } finally { setCloning(null); }
  };

  const cr = (t) => !t.total_starts ? "—" : ((t.total_completes || 0) / t.total_starts * 100).toFixed(1) + "%";
  const qualRate = (t) => !t.total_completes ? "—" : ((t.total_qualified || 0) / t.total_completes * 100).toFixed(1) + "%";
  const dqRate = (t) => !t.total_completes ? "—" : ((t.total_disqualified || 0) / t.total_completes * 100).toFixed(1) + "%";

  return (
    <AdminLayout title="Decision Trees" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Decision Trees" }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Decision Trees</h2>
          <p className="text-slate-400 text-sm mt-1">{trees.filter(t => t.status === "Published").length} published · {trees.length} total</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/ContactForms" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all">
            <Layers className="w-4 h-4" /> Contact Forms
          </Link>
          <Link to="/admin/CustomFields" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all">
            <GitBranch className="w-4 h-4" /> Custom Fields
          </Link>
          <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all">
            <Plus className="w-4 h-4" /> New Decision Tree
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1e35] rounded-xl p-4 mb-6 border border-white/10 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or slug..."
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          {["All", "Published", "Draft", "Archived"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          {["All", "MVA", "Mass Tort", "Workers Comp", "Slip and Fall", "Medical Malpractice", "Custom"].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading decision trees...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">No decision trees yet.</p>
            <button onClick={() => setShowNewModal(true)} className="text-[#1e90ff] hover:underline text-sm">Create your first one →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-white">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Campaign</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Brand</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">v</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Nodes</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Starts</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">CR%</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Qual%</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">DQ%</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tree => (
                  <tr key={tree.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <Link to={`/admin/DecisionTrees/${tree.id}/builder`} className="text-white font-semibold hover:text-[#1e90ff] transition-colors block truncate">{tree.title}</Link>
                      <div className="text-slate-500 text-xs mt-0.5">/q/{tree.slug}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${CAMPAIGN_COLORS[tree.campaign_type] || CAMPAIGN_COLORS.Custom}`}>{tree.campaign_type || "Custom"}</span></td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{tree.brand_id ? (brandMap[tree.brand_id]?.brand_name || "—") : "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[tree.status] || STATUS_COLORS.Draft}`}>{tree.status || "Draft"}</span></td>
                    <td className="px-4 py-3 text-slate-400">{tree.version || 1}</td>
                    <td className="px-4 py-3 text-slate-300">{tree.total_nodes || 0}</td>
                    <td className="px-4 py-3 text-slate-300">{(tree.total_starts || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#2BB6F6] font-semibold">{cr(tree)}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">{qualRate(tree)}</td>
                    <td className="px-4 py-3 text-red-400 font-semibold">{dqRate(tree)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/admin/DecisionTrees/${tree.id}/builder`} title="Open Builder" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                        <Link to={`/admin/DecisionTrees/${tree.id}/analytics`} title="Analytics" className="p-1.5 text-slate-400 hover:text-white transition-colors"><BarChart2 className="w-3.5 h-3.5" /></Link>
                        <a href={`/q/${tree.slug}`} target="_blank" rel="noopener noreferrer" title="View Public" className="p-1.5 text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                        <button onClick={() => cloneTree(tree)} disabled={cloning === tree.id} title="Clone" className="p-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-40"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleStatus(tree)} title="Toggle Status" className="p-1.5 text-slate-400 hover:text-white transition-colors">
                          {tree.status === "Published" ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => archiveTree(tree.id)} title="Archive" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Archive className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(tree.id)} title="Delete" className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <h3 className="text-white font-bold mb-2">Delete Decision Tree?</h3>
            <p className="text-slate-400 text-sm mb-4">Permanently deletes the tree and all nodes/edges. Cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteTree(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && <NewDecisionTreeModal onClose={() => setShowNewModal(false)} onCreated={(id) => navigate(`/admin/DecisionTrees/${id}/builder`)} />}
    </AdminLayout>
  );
}
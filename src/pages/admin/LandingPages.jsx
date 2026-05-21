import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Edit, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight,
  Archive, BarChart2, Layout, Sparkles, ChevronDown, Star
} from "lucide-react";
import ChooseTemplateModal from "@/components/landingpages/ChooseTemplateModal";

const STATUS_COLORS = {
  published: "bg-green-500/20 text-green-400 border border-green-500/30",
  draft: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  archived: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const CAMPAIGN_COLORS = {
  MVA: "bg-blue-500/20 text-blue-400",
  "Mass Tort": "bg-purple-500/20 text-purple-400",
  "Workers Comp": "bg-orange-500/20 text-orange-400",
  "Slip and Fall": "bg-yellow-500/20 text-yellow-400",
  "Med Mal": "bg-red-500/20 text-red-400",
  Custom: "bg-slate-500/20 text-slate-400",
};

export default function LandingPages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [lps, brandList, quizList, tplList] = await Promise.all([
      base44.entities.LandingPage.list("-updated_date", 200),
      base44.entities.DecisionTreeBrand.list(),
      base44.entities.Quiz.list("-updated_date", 200),
      base44.entities.LandingPageTemplate.list(),
    ]);
    setPages(lps);
    setBrands(brandList);
    setQuizzes(quizList);
    setTemplates(tplList);
    setLoading(false);
  };

  const brandMap = Object.fromEntries(brands.map(b => [b.id, b]));
  const quizMap = Object.fromEntries(quizzes.map(q => [q.id, q]));
  const templateMap = Object.fromEntries(templates.map(t => [t.template_key, t]));

  const filtered = pages.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter.toLowerCase();
    const matchCampaign = campaignFilter === "All" || p.campaign_type === campaignFilter;
    return matchSearch && matchStatus && matchCampaign;
  });

  const validateQuiz = (page) => {
    if (!page.quiz_id) return false;
    const quiz = quizzes.find(q => q.id === page.quiz_id);
    return quiz && quiz.status === "published";
  };

  const toggleStatus = async (page) => {
    const next = page.status === "published" ? "draft" : "published";
    if (next === "published" && !validateQuiz(page)) {
      alert("Cannot publish: select a published Quiz in the Hero & Quiz tab.");
      return;
    }
    const patch = { status: next };
    if (next === "published") { patch.published_at = new Date().toISOString(); patch.version = (page.version || 1) + 1; }
    await base44.entities.LandingPage.update(page.id, patch);
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, ...patch } : p));
  };

  const archivePage = async (id) => {
    await base44.entities.LandingPage.update(id, { status: "archived" });
    setPages(prev => prev.map(p => p.id === id ? { ...p, status: "archived" } : p));
  };

  const deletePage = async (id) => {
    await base44.entities.LandingPage.delete(id);
    setPages(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const duplicatePage = async (page) => {
    const copy = {
      ...page,
      id: undefined, created_date: undefined, updated_date: undefined,
      title: `${page.title} (Copy)`,
      slug: `${page.slug}-copy-${Date.now().toString(36)}`,
      status: "draft",
      view_count: 0, unique_visitors: 0, total_quiz_starts: 0,
      published_at: undefined, version: 1,
    };
    const created = await base44.entities.LandingPage.create(copy);
    setPages(prev => [created, ...prev]);
  };

  const setAsDefault = async (page) => {
    // Unset any current default for this campaign
    const currDefaults = pages.filter(p => p.campaign_type === page.campaign_type && p.is_default_for_campaign && p.id !== page.id);
    await Promise.all(currDefaults.map(p => base44.entities.LandingPage.update(p.id, { is_default_for_campaign: false })));
    await base44.entities.LandingPage.update(page.id, { is_default_for_campaign: true });
    await fetchData();
  };

  const bulkAction = async (action) => {
    for (const id of selected) {
      if (action === "publish") await base44.entities.LandingPage.update(id, { status: "published", published_at: new Date().toISOString() });
      else if (action === "archive") await base44.entities.LandingPage.update(id, { status: "archived" });
      else if (action === "delete") await base44.entities.LandingPage.delete(id);
    }
    setSelected([]);
    fetchData();
  };

  const cr = (p) => {
    if (!p.view_count || p.view_count === 0) return "—";
    return ((p.total_quiz_starts || 0) / p.view_count * 100).toFixed(1) + "%";
  };

  return (
    <AdminLayout
      title="Landing Pages"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Landing Pages" }]}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Landing Pages</h2>
          <p className="text-slate-400 text-sm mt-1">
            {pages.filter(p => p.status === "published").length} published · {pages.length} total
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Landing Page
        </button>
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
          {["All", "MVA", "Mass Tort", "Workers Comp", "Slip and Fall", "Med Mal", "Custom"].map(c => <option key={c}>{c}</option>)}
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
          <div className="p-8 text-center text-slate-400">Loading landing pages...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Layout className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">No landing pages yet.</p>
            <button onClick={() => setShowNewModal(true)} className="text-[#1e90ff] hover:underline text-sm">Create your first one →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? filtered.map(p => p.id) : [])} className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Title / Slug</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Template</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Campaign</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Brand</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Embedded Quiz</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">v</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Views</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Starts</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">CR%</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(page => {
                  const brand = page.brand_id ? brandMap[page.brand_id] : null;
                  const quiz = page.quiz_id ? quizMap[page.quiz_id] : null;
                  return (
                    <tr key={page.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(page.id)}
                          onChange={e => setSelected(prev => e.target.checked ? [...prev, page.id] : prev.filter(id => id !== page.id))}
                          className="rounded" />
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/admin/LandingPages/${page.id}/edit`} className="text-white font-semibold hover:text-[#1e90ff] transition-colors truncate">
                            {page.title}
                          </Link>
                          {page.is_default_for_campaign && (
                            <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" title="Default for campaign" />
                          )}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">/lp/{page.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        {page.template_key ? (
                          <div className="text-xs">
                            <div className="font-semibold text-slate-200">{templateMap[page.template_key]?.template_name || page.template_key}</div>
                            <div className="text-slate-500 text-[10px]">{templateMap[page.template_key]?.embedded_quiz_theme_id ? "Custom quiz theme" : "Default theme"}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${CAMPAIGN_COLORS[page.campaign_type] || CAMPAIGN_COLORS.Custom}`}>
                          {page.campaign_type || "Custom"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">
                        {brand ? (
                          <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.primary_color || "#1e90ff" }} />
                            {brand.brand_name}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {quiz ? (
                          <div className="text-xs">
                            <Link to={`/admin/QuizBuilder/${quiz.id}`} className="text-[#1e90ff] hover:underline truncate block max-w-[150px]">
                              {quiz.title}
                            </Link>
                            {page.embedded_quiz_theme_id && (
                              <div className="text-slate-500 text-[10px] mt-0.5">Theme: Custom</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-red-400">⚠ Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[page.status] || STATUS_COLORS.draft}`}>
                          {page.status || "draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{page.version || 1}</td>
                      <td className="px-4 py-3 text-slate-300">{(page.view_count || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-300">{(page.total_quiz_starts || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#2BB6F6] font-semibold">{cr(page)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link to={`/admin/LandingPages/${page.id}/edit`} title="Edit" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                          <a href={`/lp/${page.slug}`} target="_blank" rel="noopener noreferrer" title="View Public" className="p-1.5 text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                          <button onClick={() => duplicatePage(page)} title="Duplicate" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                          <button onClick={() => toggleStatus(page)} title="Toggle Status" className="p-1.5 text-slate-400 hover:text-white transition-colors">
                            {page.status === "published" ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setAsDefault(page)} title="Set as Default for Campaign" className="p-1.5 text-slate-400 hover:text-yellow-400 transition-colors"><Star className="w-3.5 h-3.5" /></button>
                          <button onClick={() => archivePage(page.id)} title="Archive" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Archive className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteConfirm(page.id)} title="Delete" className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold mb-2">Delete Landing Page?</h3>
            <p className="text-slate-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deletePage(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <ChooseTemplateModal
          onClose={() => setShowNewModal(false)}
          onTemplateChoose={(id) => navigate(`/admin/LandingPages/${id}/edit`)}
          existingPages={pages}
        />
      )}
    </AdminLayout>
  );
}
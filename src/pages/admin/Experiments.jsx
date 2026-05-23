import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import {
  Plus, Eye, Edit, Trash2, Copy, ExternalLink, Search,
  ToggleLeft, ToggleRight, Sparkles, ChevronDown
} from "lucide-react";

const STATUS_COLORS = {
  published: "bg-green-500/20 text-green-400",
  draft: "bg-slate-500/20 text-slate-400",
  archived: "bg-red-500/20 text-red-400",
};
const BUILD_COLORS = {
  planned: "bg-slate-500/20 text-slate-400",
  in_progress: "bg-yellow-500/20 text-yellow-400",
  beta: "bg-purple-500/20 text-purple-400",
  live: "bg-green-500/20 text-green-400",
};

const EXPERIMENT_TEMPLATES = [
  { type: "claim_estimator", label: "AI Claim Estimator", path: "/tools/claim-estimator" },
  { type: "adjuster_simulator", label: "AI Adjuster Roleplay Simulator", path: "/tools/adjuster-simulator" },
  { type: "letter_analyzer", label: "Settlement Offer Letter Analyzer", path: "/tools/letter-analyzer" },
  { type: "lifestyle_calculator", label: "Lifestyle Cost Calculator", path: "/tools/lifestyle-cost" },
  { type: "crash_clock", label: "The Crash Clock", path: "/tools/crash-clock" },
  { type: "injury_predictor", label: "Crash Anatomy Injury Predictor", path: "/tools/injury-predictor" },
  { type: "letter_generator", label: "Dear Adjuster Letter Generator", path: "/tools/letter-generator" },
  { type: "state_map", label: "State-Interactive Claim Map", path: "/tools/state-map" },
  { type: "case_index", label: "Anonymous Case Index", path: "/community/case-index" },
  { type: "settlement_ticker", label: "Live Settlement Ticker", path: "/tools/recent-wins" },
  { type: "other", label: "Custom Experiment", path: "/tools/custom" },
];

const CATEGORIES = ["All", "Estimator", "Simulator", "Analyzer", "Calculator", "Countdown", "Predictor", "Generator", "Map", "Community", "Ticker", "Other"];

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [buildFilter, setBuildFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [templatePick, setTemplatePick] = useState(null);

  useEffect(() => { fetchExperiments(); }, []);

  const fetchExperiments = async () => {
    setLoading(true);
    const results = await base44.entities.Experiment.list("-created_date", 200);
    setExperiments(results);
    setLoading(false);
  };

  const filtered = experiments.filter(e => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || e.status === statusFilter.toLowerCase();
    const matchBuild = buildFilter === "All" || e.build_status === buildFilter.toLowerCase();
    const matchCat = categoryFilter === "All" || e.category === categoryFilter;
    return matchSearch && matchStatus && matchBuild && matchCat;
  });

  const toggleStatus = async (exp) => {
    const next = exp.status === "published" ? "draft" : "published";
    await base44.entities.Experiment.update(exp.id, { status: next });
    setExperiments(prev => prev.map(e => e.id === exp.id ? { ...e, status: next } : e));
  };

  const duplicate = async (exp) => {
    const copy = { ...exp, title: `${exp.title} (Copy)`, slug: `${exp.slug}-copy-${Date.now()}`, path: `${exp.path}-copy`, status: "draft", view_count: 0, clicks: 0, submissions: 0 };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    await base44.entities.Experiment.create(copy);
    fetchExperiments();
  };

  const deleteExp = async (id) => {
    await base44.entities.Experiment.delete(id);
    setExperiments(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
  };

  const bulkAction = async (action) => {
    for (const id of selected) {
      if (action === "publish") await base44.entities.Experiment.update(id, { status: "published" });
      else if (action === "unpublish") await base44.entities.Experiment.update(id, { status: "draft" });
      else if (action === "archive") await base44.entities.Experiment.update(id, { status: "archived" });
      else if (action === "delete") await base44.entities.Experiment.delete(id);
    }
    setSelected([]);
    fetchExperiments();
  };

  const createFromTemplate = async () => {
    if (!templatePick) return;
    const tpl = EXPERIMENT_TEMPLATES.find(t => t.type === templatePick);
    const draft = {
      title: tpl.label,
      slug: tpl.path.split("/").pop(),
      path: tpl.path,
      experiment_type: tpl.type,
      status: "draft",
      build_status: "planned",
      primary_cta_url: "https://qualify.checkmyclaim.co/s/mva",
      primary_cta_text: "Start My Free Claim Check",
      disclaimer_short: "This is an educational tool only — not legal advice and not a guarantee of any specific outcome.",
      view_count: 0, clicks: 0, submissions: 0,
    };
    const created = await base44.entities.Experiment.create(draft);
    setNewModal(false);
    window.location.href = `/admin/experiments/${created.id}/edit`;
  };

  const generateWithAI = async () => {
    setAiGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate an Experiment record for the Check My Claim legal marketing platform. The experiment is: "${aiPrompt}"\n\nReturn JSON with: title, slug (kebab-case), path (starts with /tools/ or /community/), experiment_type (one of: claim_estimator|adjuster_simulator|letter_analyzer|lifestyle_calculator|crash_clock|injury_predictor|letter_generator|state_map|case_index|settlement_ticker|other), category, hero_headline, hero_subheadline (1-2 sentences), short_description (1 sentence), utm_medium_label (short lowercase identifier), disclaimer_short (1 sentence).`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" }, slug: { type: "string" }, path: { type: "string" },
          experiment_type: { type: "string" }, category: { type: "string" },
          hero_headline: { type: "string" }, hero_subheadline: { type: "string" },
          short_description: { type: "string" }, utm_medium_label: { type: "string" },
          disclaimer_short: { type: "string" },
        }
      },
      model: "claude_sonnet_4_6"
    });
    const draft = {
      ...res,
      status: "draft", build_status: "planned",
      primary_cta_url: "https://qualify.checkmyclaim.co/s/mva",
      primary_cta_text: "Start My Free Claim Check",
      view_count: 0, clicks: 0, submissions: 0,
    };
    const created = await base44.entities.Experiment.create(draft);
    setAiGenerating(false);
    setAiModal(false);
    window.location.href = `/admin/experiments/${created.id}/edit`;
  };

  const ctr = (exp) => {
    if (!exp.view_count || exp.view_count === 0) return "—";
    return ((exp.clicks || 0) / exp.view_count * 100).toFixed(2) + "%";
  };

  return (
    <AdminLayout title="Experiments" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Experiments" }]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Experiments</h2>
          <p className="text-slate-400 text-sm mt-1">{experiments.filter(e => e.status === "published").length} live · {experiments.length} total</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setAiModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all">
            <Sparkles className="w-4 h-4" /> Generate with AI
          </button>
          <button onClick={() => setNewModal(true)} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all">
            <Plus className="w-4 h-4" /> New Experiment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1e35] rounded-xl p-4 mb-6 border border-white/10 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or slug..."
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          {["All", "Published", "Draft", "Archived"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={buildFilter} onChange={e => setBuildFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          {["All", "planned", "in_progress", "beta", "live"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {selected.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <button onClick={() => bulkAction("publish")} className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">Publish {selected.length}</button>
            <button onClick={() => bulkAction("unpublish")} className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">Unpublish {selected.length}</button>
            <button onClick={() => bulkAction("archive")} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">Archive {selected.length}</button>
            <button onClick={() => bulkAction("delete")} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">Delete {selected.length}</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading experiments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No experiments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(a => a.id) : [])} className="rounded" /></th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Title / Headline</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Path</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Build</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Views</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Clicks</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">CTR</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Leads</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(exp.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, exp.id] : prev.filter(id => id !== exp.id))} className="rounded" /></td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-white font-semibold text-xs truncate">{exp.title}</div>
                      <div className="text-slate-400 text-xs truncate mt-0.5">{exp.hero_headline?.substring(0, 60)}{exp.hero_headline?.length > 60 ? "…" : ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a href={exp.path} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2BB6F6] hover:underline font-mono">{exp.path}</a>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[exp.status] || STATUS_COLORS.draft}`}>{exp.status}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BUILD_COLORS[exp.build_status] || BUILD_COLORS.planned}`}>{exp.build_status}</span></td>
                    <td className="px-4 py-3 text-slate-300">{(exp.view_count || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-300">{(exp.clicks || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#2BB6F6] font-semibold">{ctr(exp)}</td>
                    <td className="px-4 py-3 text-slate-300">{(exp.submissions || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <a href={exp.path} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                        <Link to={`/admin/experiments/${exp.id}/edit`} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => duplicate(exp)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleStatus(exp)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                          {exp.status === "published" ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteConfirm(exp.id)} className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {newModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Start from Template</h3>
              <button onClick={() => setNewModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
              {EXPERIMENT_TEMPLATES.map(tpl => (
                <label key={tpl.type} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${templatePick === tpl.type ? "border-[#1e90ff] bg-[#1e90ff]/10" : "border-white/10 hover:bg-white/5"}`}>
                  <input type="radio" name="template" value={tpl.type} checked={templatePick === tpl.type} onChange={() => setTemplatePick(tpl.type)} />
                  <div>
                    <div className="text-white text-sm font-semibold">{tpl.label}</div>
                    <div className="text-slate-500 text-xs font-mono">{tpl.path}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={createFromTemplate} disabled={!templatePick} className="flex-1 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm">Create Draft</button>
              <button onClick={() => setNewModal(false)} className="px-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Generate Experiment with AI</h3>
              <button onClick={() => setAiModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Describe the experiment</label>
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4}
                  placeholder="e.g. A tool that estimates how long accident victims wait for settlement based on injury type and state..." className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
              </div>
              <button onClick={generateWithAI} disabled={aiGenerating || !aiPrompt}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {aiGenerating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold mb-2">Delete Experiment?</h3>
            <p className="text-slate-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteExp(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
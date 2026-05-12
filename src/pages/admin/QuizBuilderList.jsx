import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Edit, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight, Archive, ClipboardList } from "lucide-react";

const STATUS_CONFIG = {
  published: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.25)" },
  draft:     { bg: "rgba(100,116,139,0.15)", text: "#94a3b8", border: "rgba(100,116,139,0.2)" },
  archived:  { bg: "rgba(251,71,133,0.12)", text: "#fb7185", border: "rgba(251,71,133,0.2)" },
};

export default function QuizBuilderList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [themes, setThemes] = useState([]);
  const [stepCounts, setStepCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [qs, bs, steps, th] = await Promise.all([
      base44.entities.Quiz.list("-updated_date", 200),
      base44.entities.Brand.list(),
      base44.entities.QuizStep.list("-created_date", 500),
      base44.entities.Theme.list("-updated_date", 100),
    ]);
    setQuizzes(qs);
    setBrands(bs);
    setThemes(th);
    const counts = {};
    steps.forEach(s => { counts[s.quiz_id] = (counts[s.quiz_id] || 0) + 1; });
    setStepCounts(counts);
    setLoading(false);
  };

  const brandMap = Object.fromEntries(brands.map(b => [b.id, b]));
  const themeMap = Object.fromEntries(themes.map(t => [t.id, t]));

  const filtered = quizzes.filter(q => {
    const matchSearch = !search || q.title?.toLowerCase().includes(search.toLowerCase()) || q.slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || q.status === statusFilter.toLowerCase();
    const matchBrand = brandFilter === "All" || q.brand_id === brandFilter;
    return matchSearch && matchStatus && matchBrand;
  });

  const createNew = async () => {
    setCreating(true);
    const slug = `quiz-${Date.now().toString(36)}`;
    const quiz = await base44.entities.Quiz.create({
      title: "New Quiz", slug, status: "draft", version: 1, start_step_id: null,
      settings: { auto_advance_ms: 120, progress_bar: true, show_back_button: true, save_partial_leads: true, score_enabled: false },
    });
    const startId = `s_start_${Math.random().toString(36).slice(2, 8)}`;
    const resultsId = `s_results_${Math.random().toString(36).slice(2, 8)}`;
    await base44.entities.QuizStep.bulkCreate([
      { quiz_id: quiz.id, step_id: startId, step_order: 0, step_type: "start", label: "Welcome!", title_display: "1. Start", default_next_step_id: resultsId },
      { quiz_id: quiz.id, step_id: resultsId, step_order: 1, step_type: "results", label: "Thanks!", title_display: "2. Results", default_next_step_id: null, config: { result_template: "<p>Thank you for completing this quiz.</p>", dynamic_fields: [], qualification_tier: null } },
    ]);
    await base44.entities.Quiz.update(quiz.id, { start_step_id: startId });
    setCreating(false);
    navigate(`/admin/QuizBuilder/${quiz.id}`);
  };

  const duplicateQuiz = async (quiz) => {
    const newSlug = `${quiz.slug}-copy-${Date.now().toString(36)}`;
    const newQuiz = await base44.entities.Quiz.create({
      ...quiz, id: undefined, created_date: undefined, updated_date: undefined,
      title: `${quiz.title} (Copy)`, slug: newSlug, status: "draft", version: 1,
      published_at: undefined, published_by: undefined,
    });
    const steps = await base44.entities.QuizStep.filter({ quiz_id: quiz.id });
    const idMap = {};
    steps.forEach(s => { idMap[s.step_id] = `s_${Math.random().toString(36).slice(2, 8)}`; });
    const remapId = (id) => id ? (idMap[id] || id) : null;
    const newSteps = steps.map(s => ({
      ...s, id: undefined, created_date: undefined, updated_date: undefined,
      quiz_id: newQuiz.id, step_id: idMap[s.step_id],
      default_next_step_id: remapId(s.default_next_step_id),
      answer_options: (s.answer_options || []).map(o => ({ ...o, target_step_id: remapId(o.target_step_id) })),
    }));
    if (newSteps.length) await base44.entities.QuizStep.bulkCreate(newSteps);
    const newStartId = remapId(quiz.start_step_id);
    if (newStartId) await base44.entities.Quiz.update(newQuiz.id, { start_step_id: newStartId });
    fetchData();
  };

  const toggleStatus = async (quiz) => {
    const next = quiz.status === "published" ? "draft" : "published";
    const patch = { status: next };
    if (next === "published") { patch.published_at = new Date().toISOString(); patch.version = (quiz.version || 1) + 1; }
    await base44.entities.Quiz.update(quiz.id, patch);
    setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, ...patch } : q));
  };

  const archiveQuiz = async (id) => {
    await base44.entities.Quiz.update(id, { status: "archived" });
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, status: "archived" } : q));
  };

  const deleteQuiz = async (id) => {
    const steps = await base44.entities.QuizStep.filter({ quiz_id: id });
    await Promise.all(steps.map(s => base44.entities.QuizStep.delete(s.id)));
    const transitions = await base44.entities.QuizTransition.filter({ quiz_id: id });
    await Promise.all(transitions.map(t => base44.entities.QuizTransition.delete(t.id)));
    await base44.entities.Quiz.delete(id);
    setQuizzes(prev => prev.filter(q => q.id !== id));
    setDeleteConfirm(null);
  };

  const bulkAction = async (action) => {
    for (const id of selected) {
      if (action === "publish") await base44.entities.Quiz.update(id, { status: "published", published_at: new Date().toISOString() });
      else if (action === "unpublish") await base44.entities.Quiz.update(id, { status: "draft" });
      else if (action === "archive") await base44.entities.Quiz.update(id, { status: "archived" });
      else if (action === "delete") await deleteQuiz(id);
    }
    setSelected([]);
    fetchData();
  };

  return (
    <AdminLayout title="Quiz Builder" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Quiz Builder" }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Quiz Builder</h2>
          <p className="text-slate-400 text-sm mt-1">
            {quizzes.filter(q => q.status === "published").length} published · {quizzes.length} total
          </p>
        </div>
        <button onClick={createNew} disabled={creating}
          className="flex items-center gap-2 font-bold px-5 py-2.5 rounded-lg text-sm transition-all text-white disabled:opacity-50"
          style={{ background: "#8b5cf6", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}>
          <Plus className="w-4 h-4" /> {creating ? "Creating..." : "New Quiz"}
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 mb-6 border flex flex-wrap gap-3 items-center" style={{ background: "rgba(20,18,40,0.6)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-[200px]" style={{ background: "rgba(10,10,31,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or slug..."
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          style={{ background: "rgba(10,10,31,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {["All", "Published", "Draft", "Archived"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          style={{ background: "rgba(10,10,31,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <option value="All">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
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

      {/* Quiz cards */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading quizzes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">No quizzes yet.</p>
            <button onClick={createNew} className="text-[#8b5cf6] hover:underline text-sm">Create your first quiz →</button>
          </div>
        ) : filtered.map(quiz => {
          const brand = quiz.brand_id ? brandMap[quiz.brand_id] : null;
          const theme = quiz.theme_id ? themeMap[quiz.theme_id] : null;
          const st = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.draft;
          return (
            <div key={quiz.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border transition-all group"
              style={{
                background: "rgba(20,18,40,0.55)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(30,28,55,0.7)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(20,18,40,0.55)"}>
              {/* Checkbox */}
              <input type="checkbox" checked={selected.includes(quiz.id)}
                onChange={e => setSelected(prev => e.target.checked ? [...prev, quiz.id] : prev.filter(id => id !== quiz.id))}
                className="rounded flex-shrink-0" />

              {/* Theme swatch */}
              {theme?.tokens?.primary ? (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: theme.tokens.primary }} />
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: theme.tokens.accent || "#888" }} />
                </div>
              ) : (
                <div style={{ width: 18, height: 8, borderRadius: 2, background: brand?.primary_color || "rgba(255,255,255,0.1)" }} />
              )}

              {/* Title / slug */}
              <div className="flex-1 min-w-0">
                <Link to={`/admin/QuizBuilder/${quiz.id}`}
                  className="font-semibold text-sm hover:underline truncate block transition-colors"
                  style={{ color: "#f1f5f9" }}>
                  {quiz.title}
                </Link>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>/q/{quiz.slug}</div>
              </div>

              {/* Brand */}
              <div className="text-xs text-slate-400 w-28 truncate hidden sm:block">
                {brand ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: brand.primary_color || "#888" }} />
                    {brand.brand_name}
                  </span>
                ) : "—"}
              </div>

              {/* Theme */}
              <div className="text-xs text-slate-500 w-28 truncate hidden md:block">{theme?.name || "—"}</div>

              {/* Steps */}
              <div className="text-xs text-slate-300 w-12 text-center hidden lg:block">{stepCounts[quiz.id] || 0} steps</div>

              {/* Status */}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                {quiz.status || "draft"}
              </span>

              {/* Version */}
              <div className="text-xs text-slate-500 w-6 text-center hidden xl:block">v{quiz.version || 1}</div>

              {/* Date */}
              <div className="text-xs text-slate-600 w-20 hidden xl:block">
                {quiz.updated_date ? new Date(quiz.updated_date).toLocaleDateString() : "—"}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link to={`/admin/QuizBuilder/${quiz.id}`} title="Edit" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                {quiz.status === "published" && (
                  <a href={`/q/${quiz.slug}`} target="_blank" rel="noopener noreferrer" title="View Public" className="p-1.5 text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                )}
                <button onClick={() => duplicateQuiz(quiz)} title="Duplicate" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleStatus(quiz)} title="Toggle Status" className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  {quiz.status === "published" ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => archiveQuiz(quiz.id)} title="Archive" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Archive className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteConfirm(quiz.id)} title="Delete" className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-sm w-full mx-4" style={{ background: "rgba(20,18,40,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-white font-bold mb-2">Delete Quiz?</h3>
            <p className="text-slate-400 text-sm mb-4">Permanently deletes the quiz and all its steps.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteQuiz(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 text-white font-semibold py-2 rounded-lg text-sm" style={{ background: "rgba(255,255,255,0.1)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
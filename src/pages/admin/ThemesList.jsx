import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Edit, Trash2, Copy, Palette, Lock, Cpu } from "lucide-react";

function ColorSwatch({ color, size = 14 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 3, background: color, border: "1px solid rgba(255,255,255,0.12)", flexShrink: 0 }} />
  );
}

export default function ThemesList() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [variantFilter, setVariantFilter] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [applyModal, setApplyModal] = useState(null);
  const [applySelected, setApplySelected] = useState([]);
  const [applying, setApplying] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState("");
  const [newMode, setNewMode] = useState("blank");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [th, qz] = await Promise.all([
      base44.entities.Theme.list("-updated_date", 200),
      base44.entities.Quiz.list("-updated_date", 200),
    ]);
    setThemes(th);
    setQuizzes(qz);
    setLoading(false);
  };

  const quizCountForTheme = (themeId) => quizzes.filter(q => q.theme_id === themeId).length;

  const filtered = themes.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.name?.toLowerCase().includes(q) || t.brand?.toLowerCase().includes(q) || t.mood?.toLowerCase().includes(q);
    const matchVariant = variantFilter === "All" || t.variant === variantFilter;
    return matchSearch && matchVariant;
  });

  const createBlank = async () => {
    const base = themes.find(t => t.name === "Midnight Glass") || themes[0];
    const newTheme = await base44.entities.Theme.create({
      name: "New Theme", variant: "custom", is_system: false, ai_generated: false,
      tokens: base?.tokens || {}, node_accents: base?.node_accents || {}, tags: [],
    });
    navigate(`/admin/Themes/${newTheme.id}`);
  };

  const duplicateTheme = async (source) => {
    const newTheme = await base44.entities.Theme.create({
      ...source, id: undefined, created_date: undefined, updated_date: undefined,
      name: `${source.name} (copy)`, is_system: false,
    });
    navigate(`/admin/Themes/${newTheme.id}`);
  };

  const deleteTheme = async (theme) => {
    if (theme.is_system) return;
    await base44.entities.Theme.delete(theme.id);
    setThemes(prev => prev.filter(t => t.id !== theme.id));
    setDeleteConfirm(null);
  };

  const applyThemeToQuizzes = async () => {
    if (!applyModal || !applySelected.length) return;
    setApplying(true);
    await Promise.all(applySelected.map(qid => base44.entities.Quiz.update(qid, { theme_id: applyModal.id })));
    setApplyModal(null);
    setApplySelected([]);
    setApplying(false);
  };

  return (
    <AdminLayout title="Themes" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Themes" }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Themes</h2>
          <p className="text-slate-400 text-sm mt-1">{themes.length} themes · {themes.filter(t => t.is_system).length} system</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all">
          <Plus className="w-4 h-4" /> New Theme
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1e35] rounded-xl p-4 mb-6 border border-white/10 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, brand, mood..."
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={variantFilter} onChange={e => setVariantFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          {["All", "polished", "bold", "minimal", "custom"].map(v => <option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Theme rows */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading themes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No themes found.</div>
        ) : filtered.map(theme => {
          const t = theme.tokens || {};
          const usedBy = quizCountForTheme(theme.id);
          return (
            <div key={theme.id} className="bg-[#0f1e35] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-1 flex-shrink-0">
                <ColorSwatch color={t.primary || "#8b5cf6"} size={16} />
                <ColorSwatch color={t.accent || "#06b6d4"} size={16} />
                <ColorSwatch color={t.background || "#0a0a1f"} size={16} />
                <ColorSwatch color={t.text_primary || "#f1f5f9"} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{theme.name}</span>
                  {theme.is_system && (
                    <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" /> System
                    </span>
                  )}
                  {theme.ai_generated && (
                    <span className="flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-full">
                      <Cpu className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </div>
                {theme.mood && <div className="text-xs text-slate-500 truncate mt-0.5">{theme.mood}</div>}
              </div>
              <div className="text-xs text-slate-500 w-28 truncate hidden sm:block">{theme.brand || "—"}</div>
              <div className="text-xs text-slate-500 w-16 hidden md:block">{theme.variant || "—"}</div>
              <div className="text-xs text-slate-400 w-20 text-center hidden lg:block">
                {usedBy > 0 ? `${usedBy} quiz${usedBy !== 1 ? "zes" : ""}` : "—"}
              </div>
              <div className="text-xs text-slate-600 w-24 hidden xl:block">
                {theme.updated_date ? new Date(theme.updated_date).toLocaleDateString() : "—"}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link to={`/admin/Themes/${theme.id}`} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Edit">
                  <Edit className="w-3.5 h-3.5" />
                </Link>
                <button onClick={() => duplicateTheme(theme)} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Duplicate">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setApplyModal(theme); setApplySelected([]); }}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                  Apply
                </button>
                <button onClick={() => !theme.is_system && setDeleteConfirm(theme)}
                  disabled={theme.is_system}
                  className={`p-1.5 transition-colors ${theme.is_system ? "text-slate-700 cursor-not-allowed" : "text-red-400 hover:text-red-300"}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Theme Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white font-bold text-lg mb-4">New Theme</h3>
            <div className="flex gap-3 mb-5">
              {["blank", "duplicate"].map(mode => (
                <button key={mode} onClick={() => setNewMode(mode)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${newMode === mode ? "bg-[#8b5cf6] border-[#8b5cf6] text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>
                  {mode === "blank" ? "Start Blank" : "Duplicate Existing"}
                </button>
              ))}
            </div>
            {newMode === "duplicate" && (
              <select value={duplicateSource} onChange={e => setDuplicateSource(e.target.value)}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none">
                <option value="">— Select a theme —</option>
                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
            <div className="flex gap-3">
              <button onClick={async () => {
                if (newMode === "blank") { setShowNewModal(false); await createBlank(); }
                else { const src = themes.find(t => t.id === duplicateSource); if (src) { setShowNewModal(false); await duplicateTheme(src); } }
              }} className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold py-2 rounded-lg text-sm">
                Create
              </button>
              <button onClick={() => setShowNewModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Apply to Quiz Modal */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white font-bold text-lg mb-1">Apply "{applyModal.name}"</h3>
            <p className="text-slate-400 text-sm mb-4">Select quizzes to apply this theme to:</p>
            <div className="max-h-60 overflow-y-auto space-y-1 mb-4">
              {quizzes.map(q => (
                <label key={q.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input type="checkbox" checked={applySelected.includes(q.id)}
                    onChange={e => setApplySelected(prev => e.target.checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} />
                  <span className="text-sm text-white">{q.title}</span>
                  <span className="text-xs text-slate-500">{q.status}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={applyThemeToQuizzes} disabled={applying || !applySelected.length}
                className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm">
                {applying ? "Applying..." : `Apply to ${applySelected.length}`}
              </button>
              <button onClick={() => { setApplyModal(null); setApplySelected([]); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold mb-2">Delete "{deleteConfirm.name}"?</h3>
            {quizCountForTheme(deleteConfirm.id) > 0 && (
              <p className="text-amber-300 text-sm mb-2">⚠ Used by {quizCountForTheme(deleteConfirm.id)} quiz(zes).</p>
            )}
            <p className="text-slate-400 text-sm mb-4">Cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteTheme(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
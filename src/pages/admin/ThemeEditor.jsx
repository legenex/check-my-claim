import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { Lock, Save, Trash2, Copy } from "lucide-react";
import ThemeEditorPreview from "@/components/themes/ThemeEditorPreview";
import ThemeColorTab from "@/components/themes/ThemeColorTab";
import ThemeTypographyTab from "@/components/themes/ThemeTypographyTab";
import ThemeLayoutTab from "@/components/themes/ThemeLayoutTab";
import ThemeNodeAccentsTab from "@/components/themes/ThemeNodeAccentsTab";

const TABS = ["Identity", "Colors", "Typography", "Layout", "Node Accents"];

export default function ThemeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Colors");
  const autoSaveTimer = useRef(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const list = await base44.entities.Theme.filter({ id });
    setTheme(list[0] || null);
    setLoading(false);
  };

  const updateTheme = useCallback((patch) => {
    setTheme(prev => {
      const updated = { ...prev, ...patch };
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        setSaving(true);
        await base44.entities.Theme.update(id, patch);
        setSaving(false);
      }, 800);
      return updated;
    });
  }, [id]);

  const updateTokens = useCallback((tokenPatch) => {
    setTheme(prev => {
      const newTokens = { ...prev.tokens, ...tokenPatch };
      const patch = { tokens: newTokens };
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        setSaving(true);
        await base44.entities.Theme.update(id, patch);
        setSaving(false);
      }, 800);
      return { ...prev, tokens: newTokens };
    });
  }, [id]);

  const updateNodeAccents = useCallback((accentPatch) => {
    setTheme(prev => {
      const newAccents = { ...prev.node_accents, ...accentPatch };
      const patch = { node_accents: newAccents };
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        setSaving(true);
        await base44.entities.Theme.update(id, patch);
        setSaving(false);
      }, 800);
      return { ...prev, node_accents: newAccents };
    });
  }, [id]);

  const duplicateTheme = async () => {
    const newTheme = await base44.entities.Theme.create({
      ...theme, id: undefined, created_date: undefined, updated_date: undefined,
      name: `${theme.name} (copy)`, is_system: false,
    });
    navigate(`/admin/Themes/${newTheme.id}`);
  };

  if (loading) return (
    <AdminRouteGuard>
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-[#8b5cf6] rounded-full animate-spin" />
      </div>
    </AdminRouteGuard>
  );

  if (!theme) return (
    <AdminRouteGuard>
      <AdminLayout title="Theme Not Found" breadcrumbs={[{ label: "Themes", href: "/admin/Themes" }]}>
        <p className="text-slate-400">Theme not found. <button onClick={() => navigate("/admin/Themes")} className="text-[#8b5cf6] hover:underline">← Back</button></p>
      </AdminLayout>
    </AdminRouteGuard>
  );

  const readOnly = theme.is_system;

  return (
    <AdminRouteGuard>
      <AdminLayout title={theme.name} breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Themes", href: "/admin/Themes" }, { label: theme.name }]}>
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {readOnly ? (
            <input value={theme.name} disabled className="text-lg font-bold bg-transparent text-white border-none focus:outline-none cursor-not-allowed opacity-70 flex-1 min-w-0" />
          ) : (
            <input value={theme.name} onChange={e => updateTheme({ name: e.target.value })}
              className="text-lg font-bold bg-transparent text-white border-b border-white/20 focus:border-[#8b5cf6] focus:outline-none flex-1 min-w-0 pb-1" />
          )}
          {readOnly && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" /> System — read-only
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30`}>{theme.variant || "custom"}</span>
          {saving && <span className="text-xs text-slate-500">Saving...</span>}
          <button onClick={duplicateTheme} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          {!readOnly && (
            <button onClick={() => navigate("/admin/Themes")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-all">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>

        {readOnly && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-5 text-amber-300 text-sm">
            System theme — all fields are read-only. Duplicate to customize.
          </div>
        )}

        <div className="flex gap-6 flex-col xl:flex-row">
          {/* Left: tabs */}
          <div className="flex-1 min-w-0">
            {/* Tab strip */}
            <div className="flex gap-0 border-b border-white/10 mb-5">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "text-white border-[#8b5cf6]" : "text-slate-400 border-transparent hover:text-white"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Identity" && (
              <div className="space-y-4 max-w-lg">
                {[
                  { label: "Description", key: "description", type: "textarea" },
                  { label: "Brand", key: "brand", type: "text" },
                  { label: "Mood", key: "mood", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wide">{label}</label>
                    {type === "textarea" ? (
                      <textarea value={theme[key] || ""} onChange={e => updateTheme({ [key]: e.target.value })}
                        disabled={readOnly} rows={3}
                        className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6] resize-none disabled:opacity-50" />
                    ) : (
                      <input type="text" value={theme[key] || ""} onChange={e => updateTheme({ [key]: e.target.value })}
                        disabled={readOnly}
                        className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50" />
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wide">Variant</label>
                  <select value={theme.variant || "custom"} onChange={e => updateTheme({ variant: e.target.value })}
                    disabled={readOnly}
                    className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50">
                    {["polished", "bold", "minimal", "custom"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeTab === "Colors" && (
              <ThemeColorTab tokens={theme.tokens || {}} onUpdate={updateTokens} readOnly={readOnly} />
            )}

            {activeTab === "Typography" && (
              <ThemeTypographyTab tokens={theme.tokens || {}} onUpdate={updateTokens} readOnly={readOnly} />
            )}

            {activeTab === "Layout" && (
              <ThemeLayoutTab tokens={theme.tokens || {}} onUpdate={updateTokens} readOnly={readOnly} />
            )}

            {activeTab === "Node Accents" && (
              <ThemeNodeAccentsTab accents={theme.node_accents || {}} onUpdate={updateNodeAccents} readOnly={readOnly} />
            )}
          </div>

          {/* Right: live preview */}
          <div className="xl:w-80 flex-shrink-0">
            <ThemeEditorPreview theme={theme} />
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
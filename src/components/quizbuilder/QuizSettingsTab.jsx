import React, { useState } from "react";

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
const textareaCls = `${inputCls} resize-none`;

const SUB_TABS = ["General", "Behavior", "Pixels", "Global Scripts", "Compliance", "Advanced"];

export default function QuizSettingsTab({ quiz, brands, onUpdate }) {
  const [sub, setSub] = useState("General");
  const settings = quiz.settings || {};
  const pixels = quiz.global_pixels || {};
  const scripts = quiz.global_scripts || [];

  const setSetting = (k, v) => onUpdate({ settings: { ...settings, [k]: v } });
  const setPixel = (k, v) => onUpdate({ global_pixels: { ...pixels, [k]: v } });

  const addScript = () => onUpdate({ global_scripts: [...scripts, { id: `gs_${Math.random().toString(36).slice(2, 8)}`, name: "", trigger: "on_load", code: "", is_enabled: true }] });
  const updateScript = (i, patch) => onUpdate({ global_scripts: scripts.map((s, idx) => idx === i ? { ...s, ...patch } : s) });
  const removeScript = (i) => onUpdate({ global_scripts: scripts.filter((_, idx) => idx !== i) });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sub-tab nav */}
      <div className="w-40 bg-[#0f1e35] border-r border-white/10 flex-shrink-0 p-2 space-y-1">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${sub === t ? "bg-[#1e90ff] text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sub === "General" && (
          <>
            <F label="Title"><input value={quiz.title || ""} onChange={e => onUpdate({ title: e.target.value })} className={inputCls} /></F>
            <F label="Slug"><input value={quiz.slug || ""} onChange={e => onUpdate({ slug: e.target.value })} className={inputCls} /></F>
            <F label="Description"><textarea value={quiz.description || ""} onChange={e => onUpdate({ description: e.target.value })} rows={3} className={textareaCls} /></F>
            <F label="Brand">
              <select value={quiz.brand_id || ""} onChange={e => onUpdate({ brand_id: e.target.value || null })} className={inputCls}>
                <option value="">— No Brand —</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
              </select>
            </F>
            <F label="Status">
              <select value={quiz.status || "draft"} onChange={e => onUpdate({ status: e.target.value })} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </F>
          </>
        )}

        {sub === "Behavior" && (
          <>
            <F label="Auto-advance delay (ms)"><input type="number" value={settings.auto_advance_ms ?? 120} onChange={e => setSetting("auto_advance_ms", parseInt(e.target.value))} className={inputCls} /></F>
            <F label="Session timeout (minutes)"><input type="number" value={settings.session_timeout_minutes ?? 60} onChange={e => setSetting("session_timeout_minutes", parseInt(e.target.value))} className={inputCls} /></F>
            <F label="Thank You Message"><textarea value={settings.thank_you_message || ""} onChange={e => setSetting("thank_you_message", e.target.value)} rows={3} className={textareaCls} /></F>
            {[
              ["progress_bar", "Show Progress Bar"],
              ["show_back_button", "Show Back Button"],
              ["save_partial_leads", "Save Partial Leads"],
              ["url_param_brand_match", "URL Param Brand Match"],
              ["tcpa_enabled", "TCPA Enabled"],
              ["trustedform_enabled", "TrustedForm Enabled"],
              ["score_enabled", "Score Enabled"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings[key] || false} onChange={e => setSetting(key, e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
          </>
        )}

        {sub === "Pixels" && (
          <>
            <F label="Meta Pixel ID"><input value={pixels.meta_pixel_id || ""} onChange={e => setPixel("meta_pixel_id", e.target.value)} className={inputCls} /></F>
            <F label="Google Analytics ID"><input value={pixels.google_analytics_id || ""} onChange={e => setPixel("google_analytics_id", e.target.value)} className={inputCls} /></F>
            <F label="Google Ads ID"><input value={pixels.google_ads_id || ""} onChange={e => setPixel("google_ads_id", e.target.value)} className={inputCls} /></F>
            <F label="TikTok Pixel ID"><input value={pixels.tiktok_pixel_id || ""} onChange={e => setPixel("tiktok_pixel_id", e.target.value)} className={inputCls} /></F>
            <F label="Taboola Pixel ID"><input value={pixels.taboola_pixel_id || ""} onChange={e => setPixel("taboola_pixel_id", e.target.value)} className={inputCls} /></F>
            <F label="TrustedForm Field ID"><input value={pixels.trustedform_field_id || ""} onChange={e => setPixel("trustedform_field_id", e.target.value)} className={inputCls} /></F>
          </>
        )}

        {sub === "Global Scripts" && (
          <>
            {scripts.map((s, i) => (
              <div key={s.id || i} className="bg-[#0a1628] rounded-xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <F label="Name"><input value={s.name || ""} onChange={e => updateScript(i, { name: e.target.value })} className={inputCls} /></F>
                  <button onClick={() => removeScript(i)} className="text-red-400 hover:text-red-300 ml-2 mt-4">×</button>
                </div>
                <div className="flex gap-2">
                  <F label="Trigger">
                    <select value={s.trigger || "on_load"} onChange={e => updateScript(i, { trigger: e.target.value })} className={inputCls}>
                      {["on_load", "on_start", "on_complete", "on_disqualify", "on_partial_save"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </F>
                  <label className="flex items-center gap-2 cursor-pointer mt-5">
                    <input type="checkbox" checked={s.is_enabled !== false} onChange={e => updateScript(i, { is_enabled: e.target.checked })} className="w-4 h-4" />
                    <span className="text-xs text-slate-300">Enabled</span>
                  </label>
                </div>
                <F label="Code">
                  <textarea value={s.code || ""} onChange={e => updateScript(i, { code: e.target.value })} rows={4} className={`${textareaCls} font-mono text-xs`} />
                </F>
              </div>
            ))}
            <button onClick={addScript} className="w-full border border-dashed border-white/20 hover:border-[#1e90ff] text-slate-400 hover:text-[#1e90ff] py-3 rounded-xl text-xs font-semibold transition-all">
              + Add Script
            </button>
          </>
        )}

        {sub === "Compliance" && (
          <>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.tcpa_enabled || false} onChange={e => setSetting("tcpa_enabled", e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-slate-300">TCPA Enabled</span>
            </label>
            {settings.tcpa_enabled && (
              <F label="TCPA Text"><textarea value={settings.tcpa_text || ""} onChange={e => setSetting("tcpa_text", e.target.value)} rows={4} className={textareaCls} /></F>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.trustedform_enabled || false} onChange={e => setSetting("trustedform_enabled", e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-slate-300">TrustedForm Enabled</span>
            </label>
          </>
        )}

        {sub === "Advanced" && (
          <>
            <F label="Tags (comma separated)">
              <input value={(quiz.tags || []).join(", ")} onChange={e => onUpdate({ tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} className={inputCls} />
            </F>
            <F label="Notes"><textarea value={quiz.notes || ""} onChange={e => onUpdate({ notes: e.target.value })} rows={3} className={textareaCls} /></F>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={quiz.is_template || false} onChange={e => onUpdate({ is_template: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-slate-300">Mark as Template</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}

function F({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      {children}
    </div>
  );
}
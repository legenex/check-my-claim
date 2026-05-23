import React from "react";

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none focus:border-[#2282fc] transition-colors";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };
const labelCls = "text-xs font-mono text-slate-400 mb-1 block";

export default function SettingsGeneral({ survey, steps, onChange }) {
  const d = survey || {};

  return (
    <div className="p-5 space-y-5 max-w-2xl">
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-4" style={{ color: "#2282fc" }}>General Settings</div>

      <div>
        <label className={labelCls}>Survey Name</label>
        <input value={d.name || ""} onChange={e => onChange({ name: e.target.value })} className={inp} style={inpStyle} />
      </div>

      <div>
        <label className={labelCls}>Slug</label>
        <input value={d.slug || ""} onChange={e => onChange({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className={inp} style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace" }} />
        <p className="text-xs text-slate-500 mt-1">URL path: /s/{d.slug || "your-slug"}</p>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={d.description || ""} onChange={e => onChange({ description: e.target.value })} rows={3} className={inp} style={{ ...inpStyle, resize: "none" }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Vertical</label>
          <select value={d.vertical || "mva"} onChange={e => onChange({ vertical: e.target.value })} className={inp + " cursor-pointer"} style={inpStyle}>
            <option value="mva">MVA (Auto Accident)</option>
            <option value="mass_tort">Mass Tort</option>
            <option value="workers_comp">Workers Comp</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={d.status || "draft"} onChange={e => onChange({ status: e.target.value })} className={inp + " cursor-pointer"} style={inpStyle}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Start Step</label>
        <div style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "8px 12px", fontSize: 13, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
          {(() => {
            const firstId = (d.step_order || [])[0] || d.start_step_id;
            const firstStep = steps.find(s => s.id === firstId);
            return firstStep ? `${firstStep.title || firstStep.id} (${firstStep.id})` : firstId || "— not set —";
          })()}
        </div>
        <p className="text-xs text-slate-500 mt-1">Drag steps in the Editor rail to change order.</p>
      </div>

      <div>
        <label className={labelCls}>Session Timeout (minutes)</label>
        <input type="number" value={d.session_timeout_min || 60} onChange={e => onChange({ session_timeout_min: Number(e.target.value) })} className={inp} style={inpStyle} min={5} max={480} />
      </div>

      {/* Tier descriptions */}
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: "#2282fc" }}>Tier Reference</div>
        <div className="space-y-2">
          {[
            { key: "t1", color: "#ef4d4d", label: "T1 — Highest Priority", desc: "Highest quality control. Older or risky leads. Most qualification." },
            { key: "t2", color: "#f59e0b", label: "T2 — Balanced",         desc: "Balanced quality and volume. Default paid social traffic." },
            { key: "t3", color: "#2282fc", label: "T3 — Volume",           desc: "Low friction volume. Cheaper sources where CPL stays low." },
            { key: "t4", color: "#3ab54b", label: "T4 — Fresh Light",      desc: "Fresh Light Qualified. Accident under 30 days, minimal friction." },
            { key: "dq", color: "#94a3b8", label: "DQ — Disqualified",     desc: "Disqualified. Routed to Tell Me More for capture." },
          ].map(t => (
            <div key={t.key} style={{ background: "#050b14", border: `1px solid ${t.color}30`, borderRadius: 6, padding: "8px 12px", display: "flex", gap: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "2px 6px", borderRadius: 3, background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40`, flexShrink: 0, alignSelf: "flex-start", marginTop: 1 }}>{t.key.toUpperCase()}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Slug Redirects</label>
        <p className="text-xs text-slate-500 mb-2">One per line: old-slug</p>
        <textarea
          value={(d.slug_redirects || []).join("\n")}
          onChange={e => onChange({ slug_redirects: e.target.value.split("\n").filter(Boolean) })}
          rows={4}
          className={inp}
          style={{ ...inpStyle, resize: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
          placeholder="old-slug-1&#10;old-slug-2"
        />
      </div>
    </div>
  );
}
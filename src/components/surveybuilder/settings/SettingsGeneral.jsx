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
        <select value={d.start_step_id || ""} onChange={e => onChange({ start_step_id: e.target.value })} className={inp + " cursor-pointer"} style={inpStyle}>
          <option value="">-- Select start step --</option>
          {steps.map(s => <option key={s.id} value={s.id}>{s.title || s.id}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Session Timeout (minutes)</label>
        <input type="number" value={d.session_timeout_min || 60} onChange={e => onChange({ session_timeout_min: Number(e.target.value) })} className={inp} style={inpStyle} min={5} max={480} />
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
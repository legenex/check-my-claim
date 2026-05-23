import React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none focus:border-[#2282fc] transition-colors";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };
const labelCls = "text-xs font-mono text-slate-400 mb-1 block";

const FIELD_TYPES = ["text","email","phone","select","textarea","checkbox"];

export default function SettingsDQ({ survey, onChange }) {
  const config = survey?.dq_config || {};
  const update = (patch) => onChange({ dq_config: { ...config, ...patch } });

  const fields = config.form_fields || [];
  const addField = () => update({ form_fields: [...fields, { field_key: "", label: "", type: "text", required: false }] });
  const updateField = (i, patch) => { const f = [...fields]; f[i] = { ...f[i], ...patch }; update({ form_fields: f }); };
  const removeField = (i) => { const f = [...fields]; f.splice(i, 1); update({ form_fields: f }); };

  return (
    <div className="p-4 max-w-2xl space-y-5">
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2" style={{ color: "#2282fc" }}>DQ Form Configuration</div>

      {/* Form fields */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls} style={{ marginBottom: 0 }}>Form Fields</label>
          <button onClick={addField} className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ color: "#2282fc", border: "1px dashed rgba(34,130,252,0.35)" }}>
            <Plus className="w-3 h-3" /> Add Field
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.06)" }}>
              <GripVertical className="w-3.5 h-3.5 text-slate-600 cursor-grab flex-shrink-0" />
              <input value={f.field_key || ""} onChange={e => updateField(i, { field_key: e.target.value })} placeholder="field_key" className="px-2 py-1 rounded text-xs text-white outline-none w-28" style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace" }} />
              <input value={f.label || ""} onChange={e => updateField(i, { label: e.target.value })} placeholder="Label" className="flex-1 px-2 py-1 rounded text-xs text-white outline-none" style={inpStyle} />
              <select value={f.type || "text"} onChange={e => updateField(i, { type: e.target.value })} className="px-2 py-1 rounded text-xs text-white outline-none cursor-pointer" style={inpStyle}>
                {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                <input type="checkbox" checked={!!f.required} onChange={e => updateField(i, { required: e.target.checked })} style={{ accentColor: "#2282fc" }} />
                Req
              </label>
              <button onClick={() => removeField(i)} className="p-1 text-red-400 hover:bg-red-500/10 rounded flex-shrink-0"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          {fields.length === 0 && <p className="text-xs text-slate-600 py-4 text-center">No DQ form fields configured.</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>Submit URL (POST target)</label>
        <input value={config.submit_url || ""} onChange={e => update({ submit_url: e.target.value })} className={inp} style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} placeholder="https://..." />
      </div>

      <div>
        <label className={labelCls}>After-Submit Redirect URL</label>
        <input value={config.redirect_url || ""} onChange={e => update({ redirect_url: e.target.value })} className={inp} style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
      </div>

      <div>
        <label className={labelCls}>Success Message</label>
        <textarea value={config.success_message || ""} onChange={e => update({ success_message: e.target.value })} rows={3} className={inp} style={{ ...inpStyle, resize: "none" }} />
      </div>
    </div>
  );
}
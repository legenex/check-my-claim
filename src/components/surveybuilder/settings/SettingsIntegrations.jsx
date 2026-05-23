import React from "react";
import { Plus, Trash2 } from "lucide-react";

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none focus:border-[#2282fc] transition-colors";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };
const labelCls = "text-xs font-mono text-slate-400 mb-1 block";

export default function SettingsIntegrations({ survey, onChange }) {
  const config = survey?.integrations_config || {};
  const update = (patch) => onChange({ integrations_config: { ...config, ...patch } });

  const webhooks = config.webhooks || [];
  const addWebhook = () => update({ webhooks: [...webhooks, { url: "", method: "POST", headers: {}, payload_template: "", fire_on_event: "survey_complete" }] });
  const updateWebhook = (i, patch) => { const w = [...webhooks]; w[i] = { ...w[i], ...patch }; update({ webhooks: w }); };
  const removeWebhook = (i) => { const w = [...webhooks]; w.splice(i, 1); update({ webhooks: w }); };

  const lb = config.leadbyte || {};
  const rb = config.ringba || {};

  return (
    <div className="p-4 max-w-3xl space-y-6">
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2" style={{ color: "#2282fc" }}>Integrations</div>

      {/* LeadByte */}
      <section style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
        <div className="px-4 py-2 border-b border-white/10 text-xs font-mono font-bold" style={{ background: "#050b14", color: "#94a3b8" }}>LEADBYTE</div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Endpoint URL</label>
              <input value={lb.endpoint || ""} onChange={e => update({ leadbyte: { ...lb, endpoint: e.target.value } })} className={inp} style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
            </div>
            <div>
              <label className={labelCls}>API Key</label>
              <input type="password" value={lb.api_key || ""} onChange={e => update({ leadbyte: { ...lb, api_key: e.target.value } })} className={inp} style={inpStyle} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Field Mapping (SurveyField key → LeadByte field name)</label>
            <textarea value={lb.field_map_json || ""} onChange={e => update({ leadbyte: { ...lb, field_map_json: e.target.value } })} rows={5} placeholder='{"first_name": "firstName", "phone": "mobile"}' style={{ width: "100%", ...inpStyle, resize: "none", borderRadius: 4, padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e2e8f0", outline: "none" }} />
          </div>
        </div>
      </section>

      {/* Ringba */}
      <section style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
        <div className="px-4 py-2 border-b border-white/10 text-xs font-mono font-bold" style={{ background: "#050b14", color: "#94a3b8" }}>RINGBA</div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Campaign ID</label>
            <input value={rb.campaign_id || ""} onChange={e => update({ ringba: { ...rb, campaign_id: e.target.value } })} className={inp} style={inpStyle} />
          </div>
          <div>
            <label className={labelCls}>Target ID</label>
            <input value={rb.target_id || ""} onChange={e => update({ ringba: { ...rb, target_id: e.target.value } })} className={inp} style={inpStyle} />
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-mono font-bold" style={{ background: "#050b14", color: "#94a3b8" }}>
          <span>WEBHOOKS</span>
          <button onClick={addWebhook} className="flex items-center gap-1 px-2 py-1 rounded" style={{ color: "#2282fc", border: "1px dashed rgba(34,130,252,0.35)" }}>
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="p-4 space-y-3">
          {webhooks.map((wh, i) => (
            <div key={i} className="p-3 rounded space-y-2" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <select value={wh.method || "POST"} onChange={e => updateWebhook(i, { method: e.target.value })} className="px-2 py-1.5 rounded text-xs text-white outline-none cursor-pointer w-20" style={inpStyle}>
                  <option>POST</option><option>GET</option><option>PUT</option>
                </select>
                <input value={wh.url || ""} onChange={e => updateWebhook(i, { url: e.target.value })} placeholder="https://..." className="flex-1 px-2 py-1.5 rounded text-xs text-white outline-none" style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace" }} />
                <button onClick={() => removeWebhook(i)} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><Trash2 className="w-3 h-3" /></button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 flex-shrink-0">Fire on:</label>
                <select value={wh.fire_on_event || "survey_complete"} onChange={e => updateWebhook(i, { fire_on_event: e.target.value })} className="px-2 py-1.5 rounded text-xs text-white outline-none cursor-pointer" style={inpStyle}>
                  {["survey_start","tier_assigned","survey_complete","survey_dq"].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <textarea value={wh.payload_template || ""} onChange={e => updateWebhook(i, { payload_template: e.target.value })} rows={3} placeholder='{"first_name": "{{first_name}}", "phone": "{{phone}}"}' style={{ width: "100%", ...inpStyle, resize: "none", borderRadius: 4, padding: "8px 10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#e2e8f0", outline: "none" }} />
            </div>
          ))}
          {webhooks.length === 0 && <p className="text-xs text-slate-600 py-3 text-center">No webhooks configured.</p>}
        </div>
      </section>
    </div>
  );
}
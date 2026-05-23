import React, { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none focus:border-[#2282fc] transition-colors";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };
const labelCls = "text-xs font-mono text-slate-400 mb-1 block";

const US_STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

export default function SettingsLookup({ survey, onChange }) {
  const config = survey?.lookup_config || {};
  const [testState, setTestState] = useState("Arizona");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState(null);

  const update = (patch) => onChange({ lookup_config: { ...config, ...patch } });

  const runTest = async () => {
    setTesting(true);
    setTestError(null);
    setTestResult(null);
    try {
      const url = (config.url || "").replace("{fields.accident_state}", encodeURIComponent(testState));
      const res = await fetch(url);
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestError(e.message);
    } finally {
      setTesting(false);
    }
  };

  const mappings = config.field_mappings || [];
  const addMapping = () => update({ field_mappings: [...mappings, { property: "", field: "" }] });
  const updateMapping = (i, patch) => {
    const m = [...mappings];
    m[i] = { ...m[i], ...patch };
    update({ field_mappings: m });
  };
  const removeMapping = (i) => {
    const m = [...mappings];
    m.splice(i, 1);
    update({ field_mappings: m });
  };

  return (
    <div className="p-4 max-w-3xl space-y-5">
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2" style={{ color: "#2282fc" }}>Lookup Configuration</div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>Method</label>
          <select value={config.method || "GET"} onChange={e => update({ method: e.target.value })} className={inp + " cursor-pointer"} style={inpStyle}>
            <option>GET</option><option>POST</option>
          </select>
        </div>
        <div className="col-span-3">
          <label className={labelCls}>Default Lookup URL</label>
          <input value={config.url || ""} onChange={e => update({ url: e.target.value })} className={inp} style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
        </div>
      </div>

      {/* Field mappings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls} style={{ marginBottom: 0 }}>Field Mappings (response property → SurveyField key)</label>
          <button onClick={addMapping} className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ color: "#2282fc", border: "1px dashed rgba(34,130,252,0.35)" }}>
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-1.5">
          {mappings.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={m.property || ""} onChange={e => updateMapping(i, { property: e.target.value })} placeholder="response.property" className="flex-1 px-2 py-1.5 rounded text-xs text-white outline-none" style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace" }} />
              <span className="text-slate-500 text-xs">→</span>
              <input value={m.field || ""} onChange={e => updateMapping(i, { field: e.target.value })} placeholder="field_key" className="flex-1 px-2 py-1.5 rounded text-xs text-white outline-none" style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace", color: "#2282fc" }} />
              <button onClick={() => removeMapping(i)} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Test request */}
      <div style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 16 }}>
        <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Test Request</div>
        <div className="flex items-center gap-3 mb-3">
          <select value={testState} onChange={e => setTestState(e.target.value)} className="px-2 py-1.5 rounded text-xs text-white outline-none cursor-pointer" style={{ background: "#0a1320", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" }}>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={runTest}
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold"
            style={{ background: "rgba(34,130,252,0.15)", color: "#2282fc", border: "1px solid rgba(34,130,252,0.3)", opacity: testing ? 0.6 : 1 }}
          >
            {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {testing ? "Fetching..." : "Test Request"}
          </button>
        </div>

        {testError && <div className="text-xs text-red-400 mb-2 font-mono">{testError}</div>}

        {testResult && (
          <div className="space-y-3">
            {/* Raw response */}
            <pre className="text-xs font-mono text-slate-300 rounded p-3 overflow-auto max-h-48" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.08)" }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
            {/* Mapped fields */}
            <div>
              <div className="text-xs text-slate-500 mb-1 font-mono">Field mapping results:</div>
              <div className="space-y-1">
                {mappings.map((m, i) => {
                  const val = testResult[m.property];
                  const found = val !== undefined;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono">
                      <span style={{ color: "#64748b" }}>{m.property}</span>
                      <span style={{ color: "#475569" }}>→</span>
                      <span style={{ color: "#2282fc" }}>{m.field}</span>
                      <span style={{ color: "#475569" }}>:</span>
                      <span style={{ color: found ? "#3ab54b" : "#ef4444" }}>
                        {found ? JSON.stringify(val) : "not found"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
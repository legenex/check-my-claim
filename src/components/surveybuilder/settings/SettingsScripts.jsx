import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CTX_API_DOCS } from "../constants";

const SCRIPT_TABS = ["onStart","onStepChange","onComplete","onAbandon","Listeners"];
const monoArea = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e2e8f0", lineHeight: 1.6, width: "100%", outline: "none", resize: "none" };

export default function SettingsScripts({ survey, onChange }) {
  const [activeTab, setActiveTab] = useState("onStart");
  const scripts = survey?.scripts || {};
  const listeners = scripts.listeners || [];

  const updateScript = (key, val) => onChange({ scripts: { ...scripts, [key]: val } });
  const updateListeners = (lst) => onChange({ scripts: { ...scripts, listeners: lst } });

  return (
    <div className="p-4 max-w-4xl">
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-4" style={{ color: "#2282fc" }}>Survey-Wide Scripts</div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4">
        {SCRIPT_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors"
            style={{ background: activeTab === t ? "rgba(34,130,252,0.15)" : "transparent", color: activeTab === t ? "#2282fc" : "#64748b", border: `1px solid ${activeTab === t ? "rgba(34,130,252,0.3)" : "transparent"}` }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Editor */}
        <div className="flex-1">
          {activeTab !== "Listeners" ? (
            <textarea
              value={scripts[activeTab] || ""}
              onChange={e => updateScript(activeTab, e.target.value)}
              rows={18}
              style={monoArea}
              placeholder={`// ${activeTab}\n// ctx.fields.get('key'), ctx.goto('s_id'), etc.`}
              spellCheck={false}
            />
          ) : (
            <div className="space-y-2">
              {listeners.map((lst, i) => (
                <div key={i} className="rounded p-3 space-y-2" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2">
                    <input
                      value={lst.event || ""}
                      onChange={e => { const l = [...listeners]; l[i] = { ...l[i], event: e.target.value }; updateListeners(l); }}
                      placeholder="event_name (e.g. tier_assigned, field_change:phone)"
                      className="flex-1 px-2 py-1 rounded text-xs outline-none text-white"
                      style={{ background: "#0a1320", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <button onClick={() => { const l = [...listeners]; l.splice(i, 1); updateListeners(l); }} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={lst.script || ""}
                    onChange={e => { const l = [...listeners]; l[i] = { ...l[i], script: e.target.value }; updateListeners(l); }}
                    rows={4}
                    style={{ ...monoArea, fontSize: 11 }}
                    placeholder="// ctx.fields.get(...)"
                    spellCheck={false}
                  />
                </div>
              ))}
              <button onClick={() => updateListeners([...listeners, { event: "", script: "" }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold mt-2"
                style={{ color: "#2282fc", border: "1px dashed rgba(34,130,252,0.35)" }}>
                <Plus className="w-3 h-3" /> Add Listener
              </button>
            </div>
          )}
        </div>

        {/* ctx API help */}
        <div style={{ width: 220, flexShrink: 0, background: "#050b14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: 12 }}>
          <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>ctx API</div>
          <div className="space-y-2">
            {[...CTX_API_DOCS,
              { sig: "ctx.lookup(url)", desc: "Async HTTP GET, returns response JSON." },
            ].map((d, i) => (
              <div key={i}>
                <code className="text-xs font-mono block" style={{ color: "#2282fc" }}>{d.sig}</code>
                <span className="text-xs text-slate-500">{d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
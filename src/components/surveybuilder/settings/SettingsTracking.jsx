import React, { useState } from "react";

const TIER_TABS = ["Default","T1","T2","T3","T4"];
const TIER_KEYS = ["default","t1","t2","t3","t4"];
const TRACKING_EVENTS = ["survey_start","step_view","step_submit","field_value_set","tier_assigned","survey_complete","survey_dq"];
const CHANNELS = ["Meta browser","Meta CAPI","GTM","TikTok","Custom"];

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none focus:border-[#2282fc] transition-colors";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };
const labelCls = "text-xs font-mono text-slate-400 mb-1 block";

export default function SettingsTracking({ survey, onChange }) {
  const [activeTier, setActiveTier] = useState("Default");
  const tierKey = TIER_KEYS[TIER_TABS.indexOf(activeTier)];
  const tracking = survey?.tracking_config || {};
  const tierData = tracking[tierKey] || {};

  const updateTier = (patch) => {
    onChange({ tracking_config: { ...tracking, [tierKey]: { ...tierData, ...patch } } });
  };

  const eventMatrix = tierData.event_matrix || {};
  const toggleCell = (event, channel) => {
    const key = `${event}__${channel}`;
    updateTier({ event_matrix: { ...eventMatrix, [key]: !eventMatrix[key] } });
  };

  return (
    <div className="p-4 max-w-4xl space-y-5">
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2" style={{ color: "#2282fc" }}>Tracking Pixels</div>

      {/* Tier sub-nav */}
      <div className="flex gap-1">
        {TIER_TABS.map(t => (
          <button key={t} onClick={() => setActiveTier(t)}
            className="px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors"
            style={{ background: activeTier === t ? "rgba(34,130,252,0.15)" : "transparent", color: activeTier === t ? "#2282fc" : "#64748b", border: `1px solid ${activeTier === t ? "rgba(34,130,252,0.3)" : "transparent"}` }}>
            {t}
          </button>
        ))}
      </div>

      {/* Pixel config */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Meta Pixel ID</label>
          <input value={tierData.meta_pixel_id || ""} onChange={e => updateTier({ meta_pixel_id: e.target.value })} className={inp} style={inpStyle} placeholder="892894053744200" />
        </div>
        <div>
          <label className={labelCls}>Meta CAPI Token</label>
          <input value={tierData.meta_capi_token || ""} onChange={e => updateTier({ meta_capi_token: e.target.value })} type="password" className={inp} style={inpStyle} />
        </div>
        <div>
          <label className={labelCls}>GTM Container ID</label>
          <input value={tierData.gtm_id || ""} onChange={e => updateTier({ gtm_id: e.target.value })} className={inp} style={inpStyle} placeholder="GTM-XXXXXXX" />
        </div>
        <div>
          <label className={labelCls}>TikTok Pixel ID</label>
          <input value={tierData.tiktok_pixel || ""} onChange={e => updateTier({ tiktok_pixel: e.target.value })} className={inp} style={inpStyle} />
        </div>
        <div>
          <label className={labelCls}>Display Phone (for preview)</label>
          <input value={tierData.display_phone || ""} onChange={e => updateTier({ display_phone: e.target.value })} className={inp} style={inpStyle} placeholder="(844) 840-6905" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Custom Snippet</label>
        <textarea
          value={tierData.custom_snippet || ""}
          onChange={e => updateTier({ custom_snippet: e.target.value })}
          rows={5}
          style={{ ...inpStyle, width: "100%", resize: "none", borderRadius: 4, padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e2e8f0", outline: "none" }}
          placeholder="<!-- Custom HTML/JS snippet -->"
          spellCheck={false}
        />
      </div>

      {/* Event matrix */}
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Auto-Fired Events</div>
        <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, overflow: "auto" }}>
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#050b14", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="text-left px-3 py-2 text-slate-500 font-mono font-normal" style={{ fontSize: 10 }}>EVENT</th>
                {CHANNELS.map(c => <th key={c} className="px-3 py-2 text-center text-slate-500 font-mono font-normal" style={{ fontSize: 10 }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {TRACKING_EVENTS.map((ev, i) => (
                <tr key={ev} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                  <td className="px-3 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", fontSize: 11 }}>{ev}</td>
                  {CHANNELS.map(c => {
                    const key = `${ev}__${c}`;
                    return (
                      <td key={c} className="px-3 py-2 text-center">
                        <input type="checkbox" checked={!!eventMatrix[key]} onChange={() => toggleCell(ev, c)}
                          style={{ accentColor: "#2282fc", width: 14, height: 14, cursor: "pointer" }} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
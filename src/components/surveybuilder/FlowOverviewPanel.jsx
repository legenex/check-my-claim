import React from "react";
import { TIER_META, ALL_TIERS } from "./constants";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function FlowOverviewPanel({ survey, steps, fields, errors }) {
  const stepOrder = survey?.step_order || [];

  // Stats
  const totalSteps = steps.length;
  const variantSteps = steps.filter(s => Object.keys(s.variants || {}).length > 0).length;

  // Count edges
  let edges = 0;
  steps.forEach(s => {
    if (s.else_target_step_id) edges++;
    edges += (s.branching_rules || []).filter(r => r.target_step_id).length;
    edges += (s.answer_options || []).filter(o => o.target_step_id).length;
  });

  // Terminal nodes (no outgoing edges)
  const terminalNodes = steps.filter(s => !s.else_target_step_id && !(s.branching_rules || []).some(r => r.target_step_id)).length;

  // Count by tier
  const countByTier = {};
  ALL_TIERS.forEach(t => { countByTier[t] = steps.filter(s => s.tier === t).length; });
  const maxCount = Math.max(...Object.values(countByTier), 1);

  return (
    <div className="flex flex-col overflow-y-auto h-full" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Flow overview */}
      <div className="px-3 py-3 border-b border-white/10">
        <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: "#2282fc" }}>Flow Overview</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Total Steps", totalSteps],
            ["Edges", edges],
            ["Tiers Active", (survey?.tiers_active || []).length],
            ["Variant Steps", variantSteps],
            ["Terminal Nodes", terminalNodes],
            ["Fields Used", fields.length],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "#050b14", borderRadius: 4, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-xs text-slate-500 mb-0.5">{label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier breakdown */}
      <div className="px-3 py-3 border-b border-white/10">
        <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: "#2282fc" }}>Tier Breakdown</div>
        <div className="space-y-2">
          {ALL_TIERS.map(tier => {
            const meta = TIER_META[tier];
            const count = countByTier[tier] || 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={tier} className="flex items-center gap-2">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: meta.color, width: 24 }}>{meta.short}</span>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: meta.color, opacity: 0.75, borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#64748b", width: 18, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation */}
      <div className="px-3 py-3">
        <div className="text-xs font-mono font-bold uppercase tracking-wider mb-3" style={{ color: "#2282fc" }}>Validation</div>
        {errors.length === 0 ? (
          <div className="flex items-center gap-2 text-xs" style={{ color: "#3ab54b" }}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>No validation errors</span>
          </div>
        ) : (
          <div className="space-y-2">
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "#ef4444" }}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{err.message || String(err)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
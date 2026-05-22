import React, { useState } from "react";
import { Plus } from "lucide-react";
import { TIER_META } from "./constants";
import RichTextEditor from "./RichTextEditor";

const VARIANT_TIERS = ["t1","t2","t3","t4","dq"];

function hasOverrides(v) {
  if (!v) return false;
  return !!(v.title_override || v.helper_override || v.content_override || v.skip_for_tier || (v.hidden_options && v.hidden_options.length > 0) || v.branching_override);
}

export default function VariantsSection({ step, fields, onChange }) {
  const [activeVariant, setActiveVariant] = useState("t1");
  const variants = step.variants || {};
  const allOptions = step.inherit_options_from_field
    ? (fields.find(f => f.key === step.save_to_field)?.allowed_values || [])
    : (step.custom_options || []);

  const updateVariant = (tier, patch) => {
    const prev = variants[tier] || {};
    onChange({ variants: { ...variants, [tier]: { ...prev, ...patch } } });
  };

  const addVariant = (tier) => {
    onChange({ variants: { ...variants, [tier]: { title_override: step.title || "", helper_override: "", hidden_options: [], skip_for_tier: false } } });
  };

  return (
    <div>
      {/* Tab strip */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        <span className="text-xs text-slate-500 font-mono mr-1">Default</span>
        {VARIANT_TIERS.map(tier => {
          const meta = TIER_META[tier];
          const has = hasOverrides(variants[tier]);
          const active = activeVariant === tier;
          return (
            <button
              key={tier}
              onClick={() => setActiveVariant(tier)}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all"
              style={{
                background: active ? meta.bg : "rgba(255,255,255,0.04)",
                color: active ? meta.color : "#64748b",
                border: `1px solid ${active ? meta.border : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: has ? meta.color : "transparent", border: `1.5px solid ${has ? meta.color : "#475569"}`, display: "inline-block" }} />
              {tier.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Variant editor */}
      {VARIANT_TIERS.filter(t => t === activeVariant).map(tier => {
        const meta = TIER_META[tier];
        const v = variants[tier];
        if (!v) {
          return (
            <div key={tier} className="text-center py-8 border border-dashed border-white/10 rounded">
              <p className="text-xs text-slate-500 mb-3">No overrides. Inherits from Default.</p>
              <button
                onClick={() => addVariant(tier)}
                className="flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded text-xs font-semibold transition-all"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                <Plus className="w-3 h-3" /> Add variant for {tier.toUpperCase()}
              </button>
            </div>
          );
        }

        return (
          <div key={tier} className="space-y-3 p-3 rounded" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${meta.border}` }}>
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Title Override</label>
              <input
                value={v.title_override || ""}
                onChange={e => updateVariant(tier, { title_override: e.target.value })}
                placeholder={step.title || "(inherit from default)"}
                className="w-full px-3 py-2 rounded text-sm text-white outline-none"
                style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" }}
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Helper Override</label>
              <input
                value={v.helper_override || ""}
                onChange={e => updateVariant(tier, { helper_override: e.target.value })}
                placeholder={step.helper_text || "(inherit)"}
                className="w-full px-3 py-2 rounded text-sm text-white outline-none"
                style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" }}
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Content HTML Override</label>
              <RichTextEditor value={v.content_override || ""} onChange={val => updateVariant(tier, { content_override: val })} />
            </div>

            {allOptions.length > 0 && (
              <div>
                <label className="text-xs font-mono text-slate-400 mb-2 block">Visible Options for {tier.toUpperCase()}</label>
                <div className="space-y-1">
                  {allOptions.map(opt => {
                    const hidden = (v.hidden_options || []).includes(opt.value || opt.id);
                    return (
                      <label key={opt.value || opt.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!hidden}
                          onChange={e => {
                            const curr = v.hidden_options || [];
                            const val = opt.value || opt.id;
                            const next = e.target.checked ? curr.filter(h => h !== val) : [...curr, val];
                            updateVariant(tier, { hidden_options: next });
                          }}
                        />
                        <span className="text-xs text-slate-300" style={{ fontFamily: "'Manrope', sans-serif" }}>{opt.label}</span>
                        <span className="text-xs font-mono text-slate-600">{opt.value || opt.id}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!v.skip_for_tier} onChange={e => updateVariant(tier, { skip_for_tier: e.target.checked })} />
              <span className="text-xs text-slate-300 font-mono">Skip this step entirely for {tier.toUpperCase()} users</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
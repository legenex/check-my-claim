import React, { useState } from "react";
import { X } from "lucide-react";
import { STEP_TYPES, STEP_CATEGORY_ORDER, TIER_META } from "./constants";

const DEFAULT_STEP_DATA = (type) => ({
  type,
  tier: "shared",
  title: STEP_TYPES.find(s => s.type === type)?.label || type,
  helper_text: "",
  content_html: "",
  hide_title: false,
  save_to_field: "",
  required: false,
  auto_advance: false,
  display_mode: "buttons",
  inherit_options_from_field: true,
  custom_options: [],
  hidden_options: [],
  option_field_writes: {},
  branching_mode: "none",
  branching_rules: [],
  else_target_step_id: "",
  variants: {},
  scripts: {},
  tracking_overrides: {},
  validation: {},
});

export default function AddStepModal({ onAdd, onClose }) {
  const [hovered, setHovered] = useState(null);

  const grouped = STEP_CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = STEP_TYPES.filter(s => s.category === cat);
    return acc;
  }, {});

  const handleAdd = (type) => {
    const id = `s_${type}_${Date.now().toString(36)}`;
    onAdd({ id, ...DEFAULT_STEP_DATA(type) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,11,20,0.85)" }} onClick={onClose}>
      <div
        className="rounded-lg overflow-hidden flex flex-col"
        style={{ background: "#0a1320", border: "1px solid rgba(255,255,255,0.1)", width: 780, maxHeight: "80vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>
            Add Step
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-6">
          {STEP_CATEGORY_ORDER.map(cat => (
            <div key={cat}>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">{cat}</div>
              <div className="grid grid-cols-3 gap-2">
                {grouped[cat].map(st => (
                  <button
                    key={st.type}
                    onClick={() => handleAdd(st.type)}
                    onMouseEnter={() => setHovered(st.type)}
                    onMouseLeave={() => setHovered(null)}
                    className="text-left rounded p-3 transition-all"
                    style={{
                      background: hovered === st.type ? "rgba(34,130,252,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${hovered === st.type ? "rgba(34,130,252,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div className="font-semibold text-sm text-white mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{st.label}</div>
                    <div className="text-xs text-slate-500" style={{ fontFamily: "'Manrope', sans-serif" }}>{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
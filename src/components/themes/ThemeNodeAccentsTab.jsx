import React from "react";

const CATEGORIES = [
  { key: "input", label: "Input", desc: "Question steps (single select, text field, etc.)" },
  { key: "logic", label: "Logic", desc: "Decision, webhook, script steps" },
  { key: "action", label: "Action", desc: "Start / welcome steps" },
  { key: "result", label: "Result", desc: "Results pages" },
  { key: "dq", label: "DQ", desc: "Disqualification / end steps" },
];

export default function ThemeNodeAccentsTab({ accents, onUpdate, readOnly }) {
  const update = (cat, field, val) => {
    onUpdate({ [cat]: { ...(accents[cat] || {}), [field]: val } });
  };

  return (
    <div className="max-w-lg space-y-4">
      {CATEGORIES.map(({ key, label, desc }) => {
        const accent = accents[key] || {};
        return (
          <div key={key} className="bg-[#0a1628] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent.color || "#888", boxShadow: `0 0 6px ${accent.glow || "transparent"}` }} />
              <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Color (hex)</label>
                <div className="flex items-center gap-2">
                  {!readOnly && (
                    <input type="color" value={accent.color || "#888888"} onChange={e => update(key, "color", e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0" />
                  )}
                  <input type="text" value={accent.color || ""} onChange={e => update(key, "color", e.target.value)}
                    disabled={readOnly}
                    className="flex-1 bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Glow (rgba)</label>
                <input type="text" value={accent.glow || ""} onChange={e => update(key, "glow", e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
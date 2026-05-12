import React from "react";

export default function ThemeLayoutTab({ tokens, onUpdate, readOnly }) {
  const radiusFields = [
    { key: "radius_card", label: "Card Radius (px)" },
    { key: "radius_button", label: "Button Radius (px)" },
    { key: "radius_input", label: "Input Radius (px)" },
  ];

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Border Radius</div>
        <div className="grid grid-cols-3 gap-4">
          {radiusFields.map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-slate-400 mb-1 block">{label}</label>
              <input type="number" value={tokens[key] ?? 12} onChange={e => onUpdate({ [key]: Number(e.target.value) })}
                min={0} max={32} disabled={readOnly}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Shadows</div>
        {[
          { key: "shadow_card", label: "Card Shadow" },
          { key: "shadow_button", label: "Button Shadow" },
        ].map(({ key, label }) => (
          <div key={key} className="mb-4">
            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
            <input type="text" value={tokens[key] || ""} onChange={e => onUpdate({ [key]: e.target.value })}
              disabled={readOnly}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50" />
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Density</div>
        <div className="flex gap-3">
          {["compact", "comfortable"].map(d => (
            <button key={d} onClick={() => !readOnly && onUpdate({ density: d })}
              disabled={readOnly}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all disabled:opacity-50 ${tokens.density === d ? "bg-[#8b5cf6] border-[#8b5cf6] text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
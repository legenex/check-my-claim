import React from "react";

export default function ThemeTypographyTab({ tokens, onUpdate, readOnly }) {
  const fontFields = [
    { key: "font_heading", label: "Heading Font", placeholder: "Inter, system-ui, sans-serif" },
    { key: "font_body", label: "Body Font", placeholder: "Inter, system-ui, sans-serif" },
    { key: "font_mono", label: "Mono Font", placeholder: "JetBrains Mono, ui-monospace, monospace" },
    { key: "font_display", label: "Display Font", placeholder: "Inter, system-ui, sans-serif" },
  ];

  return (
    <div className="max-w-lg space-y-5">
      {fontFields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wide">{label}</label>
          <input type="text" value={tokens[key] || ""} onChange={e => onUpdate({ [key]: e.target.value })}
            placeholder={placeholder} disabled={readOnly}
            className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6] font-mono disabled:opacity-50" />
          {tokens[key] && (
            <div className="mt-1 text-sm text-slate-300" style={{ fontFamily: tokens[key] }}>
              The quick brown fox jumps over the lazy dog
            </div>
          )}
        </div>
      ))}
      <div>
        <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wide">Heading Weight</label>
        <input type="number" value={tokens.font_heading_weight || 600} onChange={e => onUpdate({ font_heading_weight: Number(e.target.value) })}
          min={300} max={900} step={100} disabled={readOnly}
          className="w-32 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wide">Letter Spacing Tight</label>
        <input type="text" value={tokens.letter_spacing_tight || ""} onChange={e => onUpdate({ letter_spacing_tight: e.target.value })}
          placeholder="-0.01em" disabled={readOnly}
          className="w-32 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#8b5cf6] disabled:opacity-50" />
      </div>
    </div>
  );
}
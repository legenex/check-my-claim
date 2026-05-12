import React from "react";

const COLOR_FIELDS = [
  { key: "primary", label: "Primary" },
  { key: "primary_hover", label: "Primary Hover" },
  { key: "primary_glow", label: "Primary Glow" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "text_primary", label: "Text Primary" },
  { key: "text_muted", label: "Text Muted" },
  { key: "text_faint", label: "Text Faint" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
];

const RGBA_FIELDS = [
  { key: "surface_glass", label: "Surface Glass" },
  { key: "surface_elevated", label: "Surface Elevated" },
  { key: "border_subtle", label: "Border Subtle" },
  { key: "border_emphasis", label: "Border Emphasis" },
];

function ColorRow({ label, value, onChange, readOnly }) {
  const isHex = value && value.startsWith("#") && (value.length === 4 || value.length === 7);
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5">
      <div className="w-5 h-5 rounded flex-shrink-0 border border-white/10" style={{ background: value || "#888" }} />
      <span className="text-xs text-slate-300 flex-1">{label}</span>
      {isHex && !readOnly && (
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0" />
      )}
      <input type="text" value={value || ""} onChange={e => onChange(e.target.value)}
        disabled={readOnly}
        className="w-32 bg-[#0a1628] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#8b5cf6] font-mono disabled:opacity-50" />
    </div>
  );
}

export default function ThemeColorTab({ tokens, onUpdate, readOnly }) {
  return (
    <div className="max-w-lg space-y-4">
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Solid Colors</div>
        {COLOR_FIELDS.map(({ key, label }) => (
          <ColorRow key={key} label={label} value={tokens[key] || ""} onChange={v => onUpdate({ [key]: v })} readOnly={readOnly} />
        ))}
      </div>
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">RGBA / Transparent</div>
        {RGBA_FIELDS.map(({ key, label }) => (
          <ColorRow key={key} label={label} value={tokens[key] || ""} onChange={v => onUpdate({ [key]: v })} readOnly={readOnly} />
        ))}
      </div>
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Background Gradient</div>
        <label className="text-xs text-slate-400 mb-1 block">CSS gradient value</label>
        <textarea value={tokens.background_gradient || ""} onChange={e => onUpdate({ background_gradient: e.target.value })}
          disabled={readOnly} rows={3}
          className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#8b5cf6] resize-none disabled:opacity-50" />
      </div>
    </div>
  );
}
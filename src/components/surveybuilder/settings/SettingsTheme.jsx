import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none focus:border-[#2282fc] transition-colors";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };
const labelCls = "text-xs font-mono text-slate-400 mb-1 block";

const PRESETS = {
  "CMC Dark": {
    bg_0: "#050b14", bg_1: "#0a1320", bg_2: "#0f1c30",
    container_bg: "#0d1f36", container_border: "#1e3a5f",
    button_primary_bg: "#2282fc", button_primary_text: "#fff",
    button_answer_style: "filled", button_radius: "4px",
    progress_color: "#2282fc", font_display: "Bricolage Grotesque", font_body: "Manrope",
  },
  "Midnight Glass": {
    bg_0: "#08090e", bg_1: "#12131f", bg_2: "#1a1b2e",
    container_bg: "rgba(255,255,255,0.05)", container_border: "rgba(255,255,255,0.1)",
    button_primary_bg: "#6366f1", button_primary_text: "#fff",
    button_answer_style: "outlined", button_radius: "8px",
    progress_color: "#6366f1", font_display: "Bricolage Grotesque", font_body: "Manrope",
  },
  "CMC Light": {
    bg_0: "#f8fafc", bg_1: "#f1f5f9", bg_2: "#e2e8f0",
    container_bg: "#fff", container_border: "#cbd5e1",
    button_primary_bg: "#2282fc", button_primary_text: "#fff",
    button_answer_style: "outlined", button_radius: "6px",
    progress_color: "#2282fc", font_display: "Bricolage Grotesque", font_body: "Manrope",
  },
};

const AI_KEYWORDS = {
  bold: { bg_0: "#050b14", bg_1: "#0a1320", button_primary_bg: "#2282fc", button_radius: "2px", button_primary_text: "#fff" },
  minimal: { bg_0: "#fafafa", bg_1: "#f5f5f5", container_bg: "#fff", button_primary_bg: "#333", button_radius: "4px", button_primary_text: "#fff" },
  luxury: { bg_0: "#0a0a0a", bg_1: "#111", container_bg: "#1a1a1a", button_primary_bg: "#c9a84c", button_radius: "2px", button_primary_text: "#000" },
  trustworthy: { bg_0: "#f0f9ff", bg_1: "#e0f2fe", container_bg: "#fff", button_primary_bg: "#0891b2", button_radius: "8px", button_primary_text: "#fff" },
};

export default function SettingsTheme({ survey, theme, onChange }) {
  const [tokens, setTokens] = useState(theme?.tokens || PRESETS["CMC Dark"]);
  const [customCss, setCustomCss] = useState(theme?.custom_css || "");
  const [selectedPreset, setSelectedPreset] = useState("CMC Dark");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDiff, setAiDiff] = useState(null);
  const [applying, setApplying] = useState(false);

  const updateToken = (key, val) => {
    const next = { ...tokens, [key]: val };
    setTokens(next);
    // Save to theme if it exists
    if (theme?.id) base44.entities.SurveyTheme.update(theme.id, { tokens: next });
  };

  const applyPreset = (name) => {
    const p = PRESETS[name];
    setTokens({ ...tokens, ...p });
    setSelectedPreset(name);
    if (theme?.id) base44.entities.SurveyTheme.update(theme.id, { tokens: { ...tokens, ...p } });
  };

  const runAI = () => {
    const prompt = aiPrompt.toLowerCase();
    let match = PRESETS["CMC Dark"];
    if (prompt.includes("luxury") || prompt.includes("gold") || prompt.includes("premium")) match = { ...tokens, ...AI_KEYWORDS.luxury };
    else if (prompt.includes("minimal") || prompt.includes("clean")) match = { ...tokens, ...AI_KEYWORDS.minimal };
    else if (prompt.includes("trust") || prompt.includes("medical")) match = { ...tokens, ...AI_KEYWORDS.trustworthy };
    else if (prompt.includes("bold") || prompt.includes("aggressive")) match = { ...tokens, ...AI_KEYWORDS.bold };
    const diff = {};
    Object.keys(match).forEach(k => { if (match[k] !== tokens[k]) diff[k] = { from: tokens[k], to: match[k] }; });
    setAiDiff({ tokens: match, diff });
  };

  const applyAI = () => {
    if (!aiDiff) return;
    setTokens(aiDiff.tokens);
    if (theme?.id) base44.entities.SurveyTheme.update(theme.id, { tokens: aiDiff.tokens });
    setAiDiff(null);
    setAiPrompt("");
  };

  const saveCss = () => {
    if (theme?.id) base44.entities.SurveyTheme.update(theme.id, { custom_css: customCss });
  };

  const TOKEN_SECTIONS = [
    { title: "Background", keys: [["bg_0","Bg-0"],["bg_1","Bg-1"],["bg_2","Bg-2"]] },
    { title: "Container", keys: [["container_bg","Container BG"],["container_border","Border Color"]] },
    { title: "Buttons", keys: [["button_primary_bg","Primary Fill"],["button_primary_text","Primary Text"],["button_radius","Radius"]] },
    { title: "Progress", keys: [["progress_color","Bar Color"]] },
    { title: "Typography", keys: [["font_display","Display Font"],["font_body","Body Font"]] },
  ];

  return (
    <div className="p-4 max-w-5xl space-y-5">
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2" style={{ color: "#2282fc" }}>Theme Editor</div>

      {/* Live preview */}
      <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
        <div className="px-3 py-2 border-b border-white/10 text-xs text-slate-500 font-mono">Preview</div>
        <ThemePreview tokens={tokens} customCss={customCss} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Preset */}
          <div>
            <label className={labelCls}>Preset</label>
            <select value={selectedPreset} onChange={e => applyPreset(e.target.value)} className={inp + " cursor-pointer"} style={inpStyle}>
              {Object.keys(PRESETS).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* AI generator */}
          <div style={{ background: "#050b14", border: "1px solid rgba(34,130,252,0.2)", borderRadius: 6, padding: 12 }}>
            <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "#a78bfa" }}>
              <Sparkles className="w-3 h-3" /> AI Theme Generator
            </div>
            <input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder='e.g. "luxury black and gold"'
              className={inp + " mb-2"}
              style={{ ...inpStyle, fontSize: 12 }}
              onKeyDown={e => e.key === "Enter" && runAI()}
            />
            <button onClick={runAI} className="px-3 py-1.5 rounded text-xs font-semibold w-full" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>
              Generate Theme
            </button>
            {aiDiff && (
              <div className="mt-3 space-y-1">
                <div className="text-xs text-slate-400 mb-1">Changes preview:</div>
                {Object.entries(aiDiff.diff).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500">{k}:</span>
                    <span style={{ color: "#ef4444", textDecoration: "line-through" }}>{v.from}</span>
                    <span style={{ color: "#3ab54b" }}>{v.to}</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <button onClick={applyAI} className="px-3 py-1.5 rounded text-xs font-semibold flex-1" style={{ background: "#3ab54b", color: "#fff" }}>Apply</button>
                  <button onClick={() => setAiDiff(null)} className="px-3 py-1.5 rounded text-xs text-slate-400 hover:bg-white/5">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Token controls */}
          {TOKEN_SECTIONS.map(sec => (
            <div key={sec.title}>
              <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>{sec.title}</div>
              <div className="space-y-2">
                {sec.keys.map(([key, lbl]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="text-xs text-slate-400 w-28 flex-shrink-0">{lbl}</label>
                    {(tokens[key] || "").startsWith("#") || (tokens[key] || "").startsWith("rgba") ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="color" value={tokens[key]?.startsWith("#") ? tokens[key] : "#0a1320"} onChange={e => updateToken(key, e.target.value)} style={{ width: 28, height: 28, borderRadius: 4, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                        <input value={tokens[key] || ""} onChange={e => updateToken(key, e.target.value)} className="flex-1 px-2 py-1.5 rounded text-xs text-white outline-none" style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace" }} />
                      </div>
                    ) : (
                      <input value={tokens[key] || ""} onChange={e => updateToken(key, e.target.value)} className="flex-1 px-2 py-1.5 rounded text-xs text-white outline-none" style={inpStyle} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom CSS */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>Custom CSS</div>
          <textarea
            value={customCss}
            onChange={e => setCustomCss(e.target.value)}
            onBlur={saveCss}
            rows={20}
            style={{ width: "100%", background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e2e8f0", lineHeight: 1.6, outline: "none", resize: "none" }}
            placeholder="/* applied to survey preview */&#10;.survey-card { ... }"
            spellCheck={false}
          />
          <button onClick={saveCss} className="mt-2 px-3 py-1.5 rounded text-xs font-semibold" style={{ background: "rgba(34,130,252,0.15)", color: "#2282fc", border: "1px solid rgba(34,130,252,0.3)" }}>
            Save CSS
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-white/10">
        <button onClick={() => applyPreset(selectedPreset)} className="px-3 py-1.5 rounded text-xs text-slate-400 hover:bg-white/5">Reset to Preset</button>
        <button onClick={() => { const j = JSON.stringify(tokens, null, 2); navigator.clipboard.writeText(j); }} className="px-3 py-1.5 rounded text-xs text-slate-400 hover:bg-white/5">Export Theme JSON</button>
      </div>
    </div>
  );
}

function ThemePreview({ tokens, customCss }) {
  const t = tokens || {};
  return (
    <div style={{ background: t.bg_0 || "#050b14", padding: 24, minHeight: 180, position: "relative" }}>
      <style>{customCss}</style>
      <div style={{ maxWidth: 400, margin: "0 auto", background: t.container_bg || "#0d1f36", border: `1px solid ${t.container_border || "#1e3a5f"}`, borderRadius: 8, padding: 24 }}>
        <div style={{ fontFamily: `'${t.font_display || "Bricolage Grotesque"}', sans-serif`, fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 8 }}>
          How were you injured?
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ width: "40%", height: "100%", background: t.progress_color || "#2282fc", borderRadius: 2 }} />
        </div>
        <div className="flex flex-col gap-2">
          {["Auto Accident","Rideshare (Uber/Lyft)","Motorcycle"].map(opt => (
            <div key={opt} style={{
              padding: "10px 14px", borderRadius: t.button_radius || "4px",
              background: t.button_answer_style === "filled" ? (t.button_primary_bg || "#2282fc") : "transparent",
              border: `1px solid ${t.button_primary_bg || "#2282fc"}`,
              color: t.button_answer_style === "filled" ? (t.button_primary_text || "#fff") : (t.button_primary_bg || "#2282fc"),
              fontFamily: `'${t.font_body || "Manrope"}', sans-serif`,
              fontSize: 13, fontWeight: 500, cursor: "pointer"
            }}>
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { MIDNIGHT_GLASS_FALLBACK } from "@/lib/themeTokens";

function NodeMiniCard({ label, color, glow }) {
  return (
    <div style={{
      background: `rgba(0,0,0,0.3)`, border: `1px solid ${color}`,
      borderRadius: 6, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4,
      boxShadow: `0 0 8px ${glow}`,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 9, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}

export default function ThemeEditorPreview({ theme }) {
  const t = theme?.tokens || MIDNIGHT_GLASS_FALLBACK.tokens;
  const n = theme?.node_accents || MIDNIGHT_GLASS_FALLBACK.node_accents;

  return (
    <div className="sticky top-6">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Live Preview</div>
      <div style={{
        background: t.background_gradient || t.background || "#0a0a1f",
        borderRadius: `${t.radius_card}px`,
        border: `1px solid ${t.border_subtle}`,
        padding: 20, overflow: "hidden",
        boxShadow: t.shadow_card,
        minHeight: 380,
      }}>
        {/* Fake step card */}
        <div style={{
          background: t.surface_glass,
          border: `1px solid ${t.border_emphasis}`,
          borderRadius: `${t.radius_card}px`,
          padding: 20,
          backdropFilter: "blur(12px)",
          boxShadow: t.shadow_card,
          marginBottom: 12,
        }}>
          <div style={{ fontFamily: t.font_heading, fontWeight: t.font_heading_weight || 600, fontSize: 15, color: t.text_primary, letterSpacing: t.letter_spacing_tight, marginBottom: 4 }}>
            Were you injured in an accident?
          </div>
          <div style={{ fontFamily: t.font_body, fontSize: 11, color: t.text_muted, marginBottom: 14 }}>
            Select the option that best describes your situation.
          </div>
          {["Yes, I was injured", "No, I wasn't hurt", "Not sure yet"].map((opt, i) => (
            <div key={i} style={{
              background: i === 0 ? t.primary : t.surface_elevated,
              border: `1px solid ${i === 0 ? t.primary : t.border_subtle}`,
              borderRadius: `${t.radius_button}px`,
              padding: "8px 12px",
              fontFamily: t.font_body,
              fontSize: 11,
              color: i === 0 ? "#fff" : t.text_primary,
              marginBottom: 6,
              cursor: "pointer",
              boxShadow: i === 0 ? t.shadow_button : "none",
              transition: "all 0.12s",
            }}>
              {opt}
            </div>
          ))}
          <div style={{
            background: t.primary, borderRadius: `${t.radius_button}px`, padding: "9px 14px",
            textAlign: "center", fontFamily: t.font_body, fontWeight: 700, fontSize: 11, color: "#fff",
            marginTop: 8, boxShadow: t.shadow_button,
          }}>
            Continue →
          </div>
        </div>

        {/* Node accent row */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
          <NodeMiniCard label="input" color={n?.input?.color || "#06b6d4"} glow={n?.input?.glow || "transparent"} />
          <NodeMiniCard label="logic" color={n?.logic?.color || "#8b5cf6"} glow={n?.logic?.glow || "transparent"} />
          <NodeMiniCard label="action" color={n?.action?.color || "#10b981"} glow={n?.action?.glow || "transparent"} />
          <NodeMiniCard label="result" color={n?.result?.color || "#22c55e"} glow={n?.result?.glow || "transparent"} />
          <NodeMiniCard label="dq" color={n?.dq?.color || "#f43f5e"} glow={n?.dq?.glow || "transparent"} />
        </div>

        {/* Color swatches */}
        <div style={{ display: "flex", gap: 6 }}>
          {[["primary", t.primary], ["accent", t.accent], ["success", t.success], ["error", t.error]].map(([lbl, clr]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: 4, background: clr, border: "1px solid rgba(255,255,255,0.1)", marginBottom: 2 }} />
              <div style={{ fontSize: 8, color: t.text_faint, fontFamily: t.font_mono }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography preview */}
      <div className="mt-4 bg-[#0f1e35] border border-white/10 rounded-xl p-4 space-y-2">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Typography</div>
        {[
          { label: "Heading", family: t.font_heading, weight: t.font_heading_weight || 600, size: 15 },
          { label: "Body", family: t.font_body, weight: 400, size: 12 },
          { label: "Mono", family: t.font_mono, weight: 400, size: 11 },
        ].map(({ label, family, weight, size }) => (
          <div key={label} style={{ fontFamily: family, fontWeight: weight, fontSize: size, color: "#f1f5f9" }}>
            <span className="text-slate-600 text-xs mr-2">{label}:</span>
            The quick brown fox jumps
          </div>
        ))}
      </div>
    </div>
  );
}
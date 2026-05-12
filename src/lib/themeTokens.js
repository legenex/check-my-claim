/**
 * Inject a Theme record's tokens as CSS variables onto a DOM element.
 * Call with the editor root element and the resolved theme object.
 */
export const MIDNIGHT_GLASS_FALLBACK = {
  tokens: {
    primary: "#8b5cf6",
    primary_hover: "#7c3aed",
    primary_glow: "#a78bfa",
    accent: "#06b6d4",
    background: "#0a0a1f",
    background_gradient: "radial-gradient(ellipse at top left, #1a1230 0%, #0a0a1f 40%, #050511 100%)",
    surface_glass: "rgba(20, 18, 40, 0.6)",
    surface_elevated: "rgba(30, 28, 55, 0.5)",
    border_subtle: "rgba(255, 255, 255, 0.06)",
    border_emphasis: "rgba(139, 92, 246, 0.4)",
    text_primary: "#f1f5f9",
    text_muted: "#94a3b8",
    text_faint: "#64748b",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#fb7185",
    font_heading: "Inter, system-ui, sans-serif",
    font_body: "Inter, system-ui, sans-serif",
    font_mono: "JetBrains Mono, ui-monospace, monospace",
    font_display: "Inter, system-ui, sans-serif",
    font_heading_weight: 600,
    letter_spacing_tight: "-0.01em",
    radius_card: 16,
    radius_button: 10,
    radius_input: 10,
    shadow_card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
    shadow_button: "0 4px 16px rgba(139, 92, 246, 0.3)",
    density: "comfortable",
  },
  node_accents: {
    input:  { color: "#06b6d4", glow: "rgba(6, 182, 212, 0.3)" },
    logic:  { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.3)" },
    action: { color: "#10b981", glow: "rgba(16, 185, 129, 0.3)" },
    result: { color: "#22c55e", glow: "rgba(34, 197, 94, 0.3)" },
    dq:     { color: "#f43f5e", glow: "rgba(244, 63, 94, 0.3)" },
  },
};

export function applyThemeVars(el, theme) {
  if (!el) return;
  const t = theme?.tokens || MIDNIGHT_GLASS_FALLBACK.tokens;
  const n = theme?.node_accents || MIDNIGHT_GLASS_FALLBACK.node_accents;
  const vars = {
    "--theme-primary": t.primary,
    "--theme-primary-hover": t.primary_hover,
    "--theme-primary-glow": t.primary_glow,
    "--theme-accent": t.accent,
    "--theme-background": t.background,
    "--theme-background-gradient": t.background_gradient,
    "--theme-surface-glass": t.surface_glass,
    "--theme-surface-elevated": t.surface_elevated,
    "--theme-border-subtle": t.border_subtle,
    "--theme-border-emphasis": t.border_emphasis,
    "--theme-text-primary": t.text_primary,
    "--theme-text-muted": t.text_muted,
    "--theme-text-faint": t.text_faint,
    "--theme-success": t.success,
    "--theme-warning": t.warning,
    "--theme-error": t.error,
    "--theme-font-heading": t.font_heading,
    "--theme-font-body": t.font_body,
    "--theme-font-mono": t.font_mono,
    "--theme-font-display": t.font_display,
    "--theme-font-heading-weight": t.font_heading_weight,
    "--theme-letter-spacing-tight": t.letter_spacing_tight,
    "--theme-radius-card": `${t.radius_card}px`,
    "--theme-radius-button": `${t.radius_button}px`,
    "--theme-radius-input": `${t.radius_input}px`,
    "--theme-shadow-card": t.shadow_card,
    "--theme-shadow-button": t.shadow_button,
    "--theme-node-input-color":  n?.input?.color,
    "--theme-node-input-glow":   n?.input?.glow,
    "--theme-node-logic-color":  n?.logic?.color,
    "--theme-node-logic-glow":   n?.logic?.glow,
    "--theme-node-action-color": n?.action?.color,
    "--theme-node-action-glow":  n?.action?.glow,
    "--theme-node-result-color": n?.result?.color,
    "--theme-node-result-glow":  n?.result?.glow,
    "--theme-node-dq-color":     n?.dq?.color,
    "--theme-node-dq-glow":      n?.dq?.glow,
  };
  Object.entries(vars).forEach(([k, v]) => {
    if (v !== undefined && v !== null) el.style.setProperty(k, String(v));
  });
}

/** Derive a minimal theme from a Brand record (Phase 1 backward compat) */
export function themeFromBrand(brand) {
  const primary = brand?.primary_color || "#1e90ff";
  const bg = brand?.background_color || "#0b1220";
  return {
    tokens: {
      ...MIDNIGHT_GLASS_FALLBACK.tokens,
      primary,
      primary_hover: primary,
      primary_glow: primary,
      accent: brand?.accent_color || "#22c55e",
      background: bg,
      background_gradient: bg,
      text_primary: brand?.text_color || "#ffffff",
      font_heading: brand?.font_family ? `${brand.font_family}, sans-serif` : "Inter, sans-serif",
      font_body: brand?.font_family ? `${brand.font_family}, sans-serif` : "Inter, sans-serif",
      font_display: brand?.font_family ? `${brand.font_family}, sans-serif` : "Inter, sans-serif",
    },
    node_accents: MIDNIGHT_GLASS_FALLBACK.node_accents,
  };
}

/** Return the step's category for node accent coloring */
export function stepCategory(stepType) {
  const INPUT_TYPES = ["single_select", "multi_choice", "dropdown", "yes_no", "text_field",
    "email_input", "phone_input", "number_input", "date_picker", "slider", "address", "smart_date"];
  const LOGIC_TYPES = ["decision", "webhook", "script"];
  const ACTION_TYPES = ["start", "notification", "redirect", "form"];
  const RESULT_TYPES = ["results"];
  if (INPUT_TYPES.includes(stepType)) return "input";
  if (LOGIC_TYPES.includes(stepType)) return "logic";
  if (ACTION_TYPES.includes(stepType)) return "action";
  if (RESULT_TYPES.includes(stepType)) return "result";
  return null;
}
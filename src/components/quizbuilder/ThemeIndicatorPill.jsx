import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Palette, Lock, Cpu, ExternalLink } from "lucide-react";

function Swatch({ color, size = 10 }) {
  return <div style={{ width: size, height: size, borderRadius: 2, background: color, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />;
}

export default function ThemeIndicatorPill({ quiz, onThemeChange }) {
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    base44.entities.Theme.list("-updated_date", 100).then(setThemes);
  }, []);

  useEffect(() => {
    if (quiz?.theme_id && themes.length) {
      setActiveTheme(themes.find(t => t.id === quiz.theme_id) || null);
    } else {
      setActiveTheme(null);
    }
  }, [quiz?.theme_id, themes]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectTheme = (theme) => {
    onThemeChange(theme.id);
    setActiveTheme(theme);
    setOpen(false);
  };

  const t = activeTheme?.tokens || {};
  const displayName = activeTheme?.name || "No Theme";

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs"
        style={{
          background: "var(--theme-surface-glass, rgba(20,18,40,0.6))",
          borderColor: "var(--theme-border-subtle, rgba(255,255,255,0.06))",
          color: "var(--theme-text-muted, #94a3b8)",
        }}>
        <Palette className="w-3 h-3" />
        <div className="flex items-center gap-0.5">
          <Swatch color={t.primary || "#8b5cf6"} />
          <Swatch color={t.accent || "#06b6d4"} />
          <Swatch color={t.background || "#0a0a1f"} />
          <Swatch color={t.success || "#34d399"} />
        </div>
        <span className="hidden sm:block max-w-[80px] truncate">{displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 z-50 rounded-xl border overflow-hidden"
          style={{
            background: "var(--theme-surface-elevated, rgba(30,28,55,0.95))",
            borderColor: "var(--theme-border-subtle, rgba(255,255,255,0.1))",
            boxShadow: "var(--theme-shadow-card, 0 8px 32px rgba(0,0,0,0.4))",
            backdropFilter: "blur(16px)",
          }}>
          <div className="p-2 border-b" style={{ borderColor: "var(--theme-border-subtle, rgba(255,255,255,0.06))" }}>
            <p className="text-xs font-semibold px-2" style={{ color: "var(--theme-text-faint, #64748b)" }}>ACTIVE THEME</p>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {themes.map(theme => {
              const tt = theme.tokens || {};
              const isActive = quiz?.theme_id === theme.id;
              return (
                <button key={theme.id} onClick={() => selectTheme(theme)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all"
                  style={{
                    background: isActive ? "var(--theme-primary, #8b5cf6)22" : "transparent",
                    border: isActive ? "1px solid var(--theme-primary, #8b5cf6)44" : "1px solid transparent",
                  }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.background = "transparent")}>
                  <div className="flex items-center gap-0.5">
                    <Swatch color={tt.primary || "#888"} />
                    <Swatch color={tt.accent || "#888"} />
                    <Swatch color={tt.background || "#888"} />
                    <Swatch color={tt.success || "#888"} />
                  </div>
                  <span className="flex-1 text-xs truncate" style={{ color: "var(--theme-text-primary, #f1f5f9)" }}>
                    {theme.name}
                  </span>
                  {theme.is_system && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "var(--theme-warning, #fbbf24)" }} />}
                  {theme.ai_generated && <Cpu className="w-3 h-3 flex-shrink-0" style={{ color: "var(--theme-primary, #8b5cf6)" }} />}
                </button>
              );
            })}
          </div>
          {activeTheme && (
            <div className="p-2 border-t" style={{ borderColor: "var(--theme-border-subtle, rgba(255,255,255,0.06))" }}>
              <button onClick={() => { setOpen(false); navigate(`/admin/Themes/${activeTheme.id}`); }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: "var(--theme-primary, #8b5cf6)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <ExternalLink className="w-3 h-3" /> Customize this theme
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
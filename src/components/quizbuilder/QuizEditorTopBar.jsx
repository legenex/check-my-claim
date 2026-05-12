import React, { useState } from "react";
import { ArrowLeft, Globe, Eye, RefreshCw } from "lucide-react";
import ThemeIndicatorPill from "./ThemeIndicatorPill";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 60);
}

export default function QuizEditorTopBar({ quiz, brands, saving, lastSaved, publishErrors, onTitleChange, onSlugChange, onBrandChange, onThemeChange, onPublish, onBack }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(quiz?.title || "");
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugVal, setSlugVal] = useState(quiz?.slug || "");

  const commitTitle = () => { setEditingTitle(false); if (titleVal !== quiz?.title) onTitleChange(titleVal); };
  const commitSlug = () => { setEditingSlug(false); if (slugVal !== quiz?.slug) onSlugChange(slugVal); };
  const regenSlug = () => { const s = slugify(quiz?.title || ""); setSlugVal(s); onSlugChange(s); };

  const inputStyle = {
    background: "var(--theme-surface-elevated, rgba(30,28,55,0.5))",
    border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))",
    color: "var(--theme-text-primary, #f1f5f9)",
    borderRadius: "var(--theme-radius-input, 10px)",
    padding: "4px 8px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--theme-font-heading, Inter, sans-serif)",
    outline: "none",
  };

  return (
    <div className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0 flex-wrap">
      <button onClick={onBack}
        className="p-1.5 rounded-lg transition-all"
        style={{ color: "var(--theme-text-muted, #94a3b8)" }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--theme-text-primary, #f1f5f9)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--theme-text-muted, #94a3b8)"}>
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="w-px h-5" style={{ background: "var(--theme-border-subtle, rgba(255,255,255,0.08))" }} />

      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input value={titleVal} onChange={e => setTitleVal(e.target.value)} onBlur={commitTitle}
            onKeyDown={e => e.key === "Enter" && commitTitle()} autoFocus
            style={{ ...inputStyle, width: 240 }} />
        ) : (
          <button onClick={() => { setTitleVal(quiz?.title || ""); setEditingTitle(true); }}
            className="font-semibold text-sm truncate max-w-xs block transition-colors"
            style={{
              color: "var(--theme-text-primary, #f1f5f9)",
              fontFamily: "var(--theme-font-heading, Inter, sans-serif)",
              fontWeight: "var(--theme-font-heading-weight, 600)",
              letterSpacing: "var(--theme-letter-spacing-tight, -0.01em)",
            }}>
            {quiz?.title || "Untitled Quiz"}
          </button>
        )}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs" style={{ color: "var(--theme-text-faint, #64748b)" }}>/q/</span>
          {editingSlug ? (
            <input value={slugVal} onChange={e => setSlugVal(e.target.value)} onBlur={commitSlug}
              onKeyDown={e => e.key === "Enter" && commitSlug()} autoFocus
              style={{ ...inputStyle, fontSize: 11, fontWeight: 400, width: 140 }} />
          ) : (
            <button onClick={() => { setSlugVal(quiz?.slug || ""); setEditingSlug(true); }}
              className="text-xs transition-colors"
              style={{ color: "var(--theme-text-faint, #64748b)" }}>
              {quiz?.slug || "slug"}
            </button>
          )}
          <button onClick={regenSlug} title="Regenerate from title" style={{ color: "var(--theme-text-faint, #64748b)", marginLeft: 2 }}>
            <RefreshCw className="w-3 h-3" />
          </button>
          <span className="text-xs ml-1" style={{ color: "var(--theme-text-faint, #64748b)" }}>
            {saving ? "Saving..." : lastSaved ? `· Saved ${lastSaved.toLocaleTimeString()}` : ""}
          </span>
        </div>
      </div>

      {/* Steps + Fields stats */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--theme-surface-elevated, rgba(30,28,55,0.5))", color: "var(--theme-text-muted, #94a3b8)", border: "1px solid var(--theme-border-subtle)" }}>
          {quiz?._stepCount || 0} steps
        </span>
      </div>

      {/* Brand picker */}
      <select value={quiz?.brand_id || ""} onChange={e => onBrandChange(e.target.value)}
        className="text-xs focus:outline-none"
        style={{ background: "var(--theme-surface-elevated, rgba(30,28,55,0.5))", border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))", color: "var(--theme-text-muted, #94a3b8)", borderRadius: "var(--theme-radius-input, 10px)", padding: "6px 8px" }}>
        <option value="">— No Brand —</option>
        {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
      </select>

      {/* Status pill */}
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{
          background: quiz?.status === "published" ? "rgba(52,211,153,0.15)" : "rgba(100,116,139,0.2)",
          color: quiz?.status === "published" ? "var(--theme-success, #34d399)" : "var(--theme-text-muted, #94a3b8)",
          border: `1px solid ${quiz?.status === "published" ? "rgba(52,211,153,0.3)" : "rgba(100,116,139,0.2)"}`,
        }}>
        {quiz?.status || "draft"} v{quiz?.version || 1}
      </span>

      {/* Theme indicator pill */}
      {onThemeChange && (
        <ThemeIndicatorPill quiz={quiz} onThemeChange={onThemeChange} />
      )}

      {/* View public */}
      {quiz?.status === "published" && quiz?.slug && (
        <a href={`/q/${quiz.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ color: "var(--theme-text-muted, #94a3b8)", border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))" }}>
          <Eye className="w-3.5 h-3.5" /> View
        </a>
      )}

      {/* Publish button */}
      <button onClick={onPublish} disabled={saving}
        className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50 text-white"
        style={{
          background: publishErrors?.length ? "var(--theme-error, #fb7185)" : "var(--theme-primary, #8b5cf6)",
          boxShadow: "var(--theme-shadow-button)",
          borderRadius: "var(--theme-radius-button, 10px)",
        }}>
        <Globe className="w-3.5 h-3.5" /> {quiz?.status === "published" ? "Update" : "Publish"}
      </button>
    </div>
  );
}
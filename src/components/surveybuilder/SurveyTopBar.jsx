import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Eye, Globe, ArrowLeft, ChevronDown, Copy, Check, ExternalLink } from "lucide-react";
import { TIER_META } from "./constants";

const TABS = ["Editor", "Flow", "Settings", "Templates"];

export default function SurveyTopBar({ survey, steps, fields, theme, activeTab, onTabChange, onTitleChange, onPublish, onUnpublish, saveState, savedLabel, onPreview, onSeedSteps, seeding }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(survey?.name || "");
  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const activeTiers = survey?.tiers_active || [];
  const isPublished = survey?.status === "published";
  const liveUrl = `/s/${survey?.slug || ""}`;
  const fullUrl = window.location.origin + liveUrl;

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (localTitle.trim() && localTitle !== survey?.name) onTitleChange(localTitle.trim());
  };

  const copyLink = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-0 flex-shrink-0 border-b border-white/10" style={{ height: 56, background: "#0a1320", padding: "0 12px" }}>
      {/* Back */}
      <Link to="/admin/QuizBuilder" className="flex items-center gap-2 mr-4 flex-shrink-0">
        <ArrowLeft className="w-4 h-4 text-slate-500" />
        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: "#2282fc", letterSpacing: "-0.01em" }}>
          CMC Builder
        </span>
      </Link>

      <div className="w-px h-6 bg-white/10 mr-4 flex-shrink-0" />

      {/* Title */}
      <div className="flex items-center gap-3 mr-4 flex-shrink-0 max-w-xs">
        {editingTitle ? (
          <input
            ref={inputRef}
            value={localTitle}
            onChange={e => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={e => { if (e.key === "Enter") inputRef.current?.blur(); if (e.key === "Escape") { setEditingTitle(false); setLocalTitle(survey?.name || ""); } }}
            className="bg-transparent border-b border-[#2282fc] text-white outline-none"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16 }}
            autoFocus
          />
        ) : (
          <span
            onClick={() => { setEditingTitle(true); setLocalTitle(survey?.name || ""); }}
            className="cursor-text hover:text-white transition-colors truncate"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}
            title="Click to rename"
          >
            {survey?.name || "Untitled Survey"}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mr-4 flex-shrink-0">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
          {steps.length} steps
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>·</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
          {fields.length} fields
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>·</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
          {activeTiers.length} tiers active
        </span>
      </div>

      <div className="w-px h-6 bg-white/10 mr-4 flex-shrink-0" />

      {/* Tabs */}
      <div className="flex items-center gap-0 mr-4 flex-shrink-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="transition-colors px-4 h-9 text-sm font-semibold rounded"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 13,
              color: activeTab === tab ? "#fff" : "#64748b",
              background: activeTab === tab ? "rgba(34,130,252,0.15)" : "transparent",
              borderBottom: activeTab === tab ? "2px solid #2282fc" : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Published: live link + copy */}
      {isPublished && (
        <div className="mr-3 flex items-center gap-2 flex-shrink-0">
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3ab54b" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ab54b", display: "inline-block" }} />
            Published
          </span>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2282fc", textDecoration: "none" }}
            title={fullUrl}
          >
            {liveUrl} <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={copyLink}
            title="Copy live URL"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: copied ? "#3ab54b" : "#64748b", cursor: "pointer" }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Theme chip */}
      {theme && (
        <div className="mr-3 flex-shrink-0 px-2 py-1 rounded text-xs font-mono border" style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.08)" }}>
          {theme.name}
        </div>
      )}

      {/* Seed steps (admin utility) */}
      {onSeedSteps && (
        <button
          onClick={onSeedSteps}
          disabled={seeding}
          className="mr-2 flex-shrink-0 text-xs font-mono px-2 py-1 rounded border transition-colors"
          style={{ color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.06)", cursor: seeding ? "not-allowed" : "pointer", opacity: seeding ? 0.6 : 1 }}
          title="Wipe and re-seed all 15 CMC steps with semantic IDs"
        >
          {seeding ? "Seeding..." : "Seed Steps"}
        </button>
      )}

      {/* Preview */}
      <button
        onClick={onPreview}
        className="mr-2 flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded border border-[#2282fc]/40 hover:border-[#2282fc] transition-colors"
        style={{ color: "#2282fc", fontFamily: "'Manrope', sans-serif" }}
      >
        <Eye className="w-3.5 h-3.5" /> Preview
      </button>

      {/* Publish / Update + dropdown */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <div className="flex items-center">
          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 transition-colors"
            style={{
              background: "#3ab54b", color: "#fff",
              fontFamily: "'Manrope', sans-serif",
              borderRadius: "4px 0 0 4px",
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            {isPublished ? "Update" : "Publish"}
          </button>
          <button
            onClick={() => setShowPublishMenu(v => !v)}
            style={{ background: "#2d8f3b", color: "#fff", padding: "7px 6px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRadius: "0 4px 4px 0", cursor: "pointer" }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {showPublishMenu && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#0a1320", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, minWidth: 160, zIndex: 50 }}>
            {isPublished && (
              <button
                onClick={() => { onUnpublish?.(); setShowPublishMenu(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600 }}
              >
                Unpublish
              </button>
            )}
            {isPublished && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPublishMenu(false)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", color: "#2282fc", textDecoration: "none", fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600 }}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open live URL
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Eye, Globe, ArrowLeft } from "lucide-react";
import { TIER_META } from "./constants";

const TABS = ["Editor", "Flow", "Settings", "Templates"];

export default function SurveyTopBar({ survey, steps, fields, theme, activeTab, onTabChange, onTitleChange, onPublish, saveState, savedLabel, onPreview }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(survey?.name || "");
  const inputRef = useRef(null);

  const activeTiers = survey?.tiers_active || [];
  const fieldsUsed = new Set(steps.map(s => s.save_to_field).filter(Boolean)).size;

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (localTitle.trim() && localTitle !== survey?.name) onTitleChange(localTitle.trim());
  };

  return (
    <div className="flex items-center gap-0 flex-shrink-0 border-b border-white/10" style={{ height: 56, background: "#0a1320", padding: "0 12px" }}>
      {/* Brand */}
      <Link to="/admin/Surveys" className="flex items-center gap-2 mr-4 flex-shrink-0">
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

      {/* Theme chip */}
      {theme && (
        <div className="mr-3 flex-shrink-0 px-2 py-1 rounded text-xs font-mono border" style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.08)" }}>
          {theme.name}
        </div>
      )}

      {/* Preview */}
      <button
        onClick={onPreview}
        className="mr-2 flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded border border-[#2282fc]/40 hover:border-[#2282fc] transition-colors"
        style={{ color: "#2282fc", fontFamily: "'Manrope', sans-serif" }}
      >
        <Eye className="w-3.5 h-3.5" /> Preview
      </button>

      {/* Publish */}
      <button
        onClick={onPublish}
        className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded transition-colors"
        style={{ background: "#3ab54b", color: "#fff", fontFamily: "'Manrope', sans-serif" }}
      >
        <Globe className="w-3.5 h-3.5" /> Publish
      </button>
    </div>
  );
}
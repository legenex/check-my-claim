import React from "react";

export default function SurveyStatusBar({ saveState, savedLabel, steps, fields, errors, onErrorClick }) {
  const dot = saveState === "error" ? "#ef4444" : saveState === "saving" ? "#f59e0b" : "#3ab54b";

  return (
    <div
      className="flex items-center gap-4 px-4 flex-shrink-0 border-t border-white/10"
      style={{ height: 28, background: "#050b14", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}
    >
      <span className="flex items-center gap-1.5">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
        {savedLabel()}
      </span>
      <span className="text-white/20">·</span>
      <span>{steps.length} steps</span>
      <span className="text-white/20">·</span>
      <span>{fields.length} fields</span>
      <span className="text-white/20">·</span>
      <button
        onClick={errors.length > 0 ? onErrorClick : undefined}
        style={{ color: errors.length > 0 ? "#ef4444" : "#475569", cursor: errors.length > 0 ? "pointer" : "default" }}
      >
        {errors.length} validation error{errors.length !== 1 ? "s" : ""}
      </button>
      <span className="text-white/20">·</span>
      <span style={{ color: "#2282fc" }}>BQ proxy: online</span>
      <span className="ml-auto text-white/20">v0.2.0</span>
    </div>
  );
}
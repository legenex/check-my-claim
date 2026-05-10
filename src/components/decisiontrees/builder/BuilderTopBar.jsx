import React, { useState } from "react";
import { ArrowLeft, Save, Globe, BarChart2, Eye, Layers, GitBranch } from "lucide-react";

export default function BuilderTopBar({ quiz, saving, lastSaved, onTitleChange, onModeSwitch, onPublish, onBack, onViewAnalytics }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(quiz?.title || "");

  const commitTitle = () => {
    setEditingTitle(false);
    if (titleVal !== quiz?.title) onTitleChange(titleVal);
  };

  const currentMode = quiz?.builder_mode || "basic";

  return (
    <div className="bg-[#0f1e35] border-b border-white/10 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
      {/* Back */}
      <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            value={titleVal}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => e.key === "Enter" && commitTitle()}
            autoFocus
            className="bg-white/10 text-white text-sm font-semibold px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#1e90ff] w-64"
          />
        ) : (
          <button onClick={() => { setTitleVal(quiz?.title || ""); setEditingTitle(true); }}
            className="text-white font-semibold text-sm hover:text-[#1e90ff] transition-colors truncate max-w-xs block">
            {quiz?.title || "Untitled"}
          </button>
        )}
        <div className="text-xs text-slate-500 mt-0.5">
          {saving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ""}
          {quiz?.slug && <span className="ml-2 opacity-60">/q/{quiz.slug}</span>}
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex items-center bg-[#0a1628] rounded-lg p-0.5 border border-white/10">
        <button
          onClick={() => onModeSwitch("basic")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${currentMode === "basic" ? "bg-[#1e90ff] text-white" : "text-slate-400 hover:text-white"}`}
        >
          <Layers className="w-3.5 h-3.5" /> Basic
        </button>
        <button
          onClick={() => onModeSwitch("advanced")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${currentMode === "advanced" ? "bg-[#1e90ff] text-white" : "text-slate-400 hover:text-white"}`}
        >
          <GitBranch className="w-3.5 h-3.5" /> Advanced
        </button>
      </div>

      <div className="w-px h-5 bg-white/10" />

      {/* Status badge */}
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${quiz?.status === "Published" ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
        {quiz?.status || "Draft"} v{quiz?.version || 1}
      </span>

      {/* Analytics */}
      <button onClick={onViewAnalytics} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
        <BarChart2 className="w-3.5 h-3.5" /> Analytics
      </button>

      {/* Preview */}
      {quiz?.slug && (
        <a href={`/q/${quiz.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
          <Eye className="w-3.5 h-3.5" /> Preview
        </a>
      )}

      {/* Publish */}
      <button onClick={onPublish} disabled={saving}
        className="flex items-center gap-1.5 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">
        <Globe className="w-3.5 h-3.5" /> {quiz?.status === "Published" ? "Update" : "Publish"}
      </button>
    </div>
  );
}
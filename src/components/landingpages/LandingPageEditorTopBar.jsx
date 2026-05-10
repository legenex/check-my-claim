import React, { useState } from "react";
import { ArrowLeft, Globe, Eye, Monitor, Smartphone, Copy } from "lucide-react";

export default function LandingPageEditorTopBar({ page, saving, lastSaved, previewMode, setPreviewMode, onTitleChange, onSlugChange, onPublish, onBack }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(page?.title || "");
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugVal, setSlugVal] = useState(page?.slug || "");

  const commitTitle = () => { setEditingTitle(false); if (titleVal !== page?.title) onTitleChange(titleVal); };
  const commitSlug = () => { setEditingSlug(false); if (slugVal !== page?.slug) onSlugChange(slugVal); };

  return (
    <div className="bg-[#0f1e35] border-b border-white/10 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
      <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-white/10" />

      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input value={titleVal} onChange={e => setTitleVal(e.target.value)} onBlur={commitTitle}
            onKeyDown={e => e.key === "Enter" && commitTitle()} autoFocus
            className="bg-white/10 text-white text-sm font-semibold px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#1e90ff] w-64" />
        ) : (
          <button onClick={() => { setTitleVal(page?.title || ""); setEditingTitle(true); }}
            className="text-white font-semibold text-sm hover:text-[#1e90ff] transition-colors truncate max-w-xs block">
            {page?.title || "Untitled"}
          </button>
        )}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-slate-500">/lp/</span>
          {editingSlug ? (
            <input value={slugVal} onChange={e => setSlugVal(e.target.value)} onBlur={commitSlug}
              onKeyDown={e => e.key === "Enter" && commitSlug()} autoFocus
              className="bg-white/10 text-white text-xs px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#1e90ff] w-40" />
          ) : (
            <button onClick={() => { setSlugVal(page?.slug || ""); setEditingSlug(true); }}
              className="text-xs text-slate-500 hover:text-white transition-colors">
              {page?.slug || "slug"}
            </button>
          )}
          <span className="text-xs text-slate-600 ml-1">
            {saving ? "Saving..." : lastSaved ? `· Saved ${lastSaved.toLocaleTimeString()}` : ""}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${page?.status === "published" ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
        {page?.status || "draft"} v{page?.version || 1}
      </span>

      {/* Preview viewport */}
      <div className="flex items-center bg-[#0a1628] rounded-lg p-0.5 border border-white/10">
        <button onClick={() => setPreviewMode("desktop")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${previewMode === "desktop" ? "bg-[#1e90ff] text-white" : "text-slate-400 hover:text-white"}`}>
          <Monitor className="w-3 h-3" /> Desktop
        </button>
        <button onClick={() => setPreviewMode("mobile")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${previewMode === "mobile" ? "bg-[#1e90ff] text-white" : "text-slate-400 hover:text-white"}`}>
          <Smartphone className="w-3 h-3" /> Mobile
        </button>
      </div>

      {page?.slug && (
        <a href={`/lp/${page.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
          <Eye className="w-3.5 h-3.5" /> View Live
        </a>
      )}

      <button onClick={onPublish} disabled={saving}
        className="flex items-center gap-1.5 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">
        <Globe className="w-3.5 h-3.5" /> {page?.status === "published" ? "Update" : "Publish"}
      </button>
    </div>
  );
}
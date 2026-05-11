import React, { useState } from "react";
import { ArrowLeft, Globe, Eye, RefreshCw } from "lucide-react";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 60);
}

export default function QuizEditorTopBar({ quiz, brands, saving, lastSaved, publishErrors, onTitleChange, onSlugChange, onBrandChange, onPublish, onBack }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(quiz?.title || "");
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugVal, setSlugVal] = useState(quiz?.slug || "");

  const commitTitle = () => { setEditingTitle(false); if (titleVal !== quiz?.title) onTitleChange(titleVal); };
  const commitSlug = () => { setEditingSlug(false); if (slugVal !== quiz?.slug) onSlugChange(slugVal); };
  const regenSlug = () => { const s = slugify(quiz?.title || ""); setSlugVal(s); onSlugChange(s); };

  return (
    <div className="bg-[#0f1e35] border-b border-white/10 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 flex-wrap">
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
          <button onClick={() => { setTitleVal(quiz?.title || ""); setEditingTitle(true); }}
            className="text-white font-semibold text-sm hover:text-[#1e90ff] transition-colors truncate max-w-xs block">
            {quiz?.title || "Untitled Quiz"}
          </button>
        )}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-slate-500">/q/</span>
          {editingSlug ? (
            <input value={slugVal} onChange={e => setSlugVal(e.target.value)} onBlur={commitSlug}
              onKeyDown={e => e.key === "Enter" && commitSlug()} autoFocus
              className="bg-white/10 text-white text-xs px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#1e90ff] w-40" />
          ) : (
            <button onClick={() => { setSlugVal(quiz?.slug || ""); setEditingSlug(true); }}
              className="text-xs text-slate-500 hover:text-white transition-colors">{quiz?.slug || "slug"}</button>
          )}
          <button onClick={regenSlug} title="Regenerate slug from title" className="text-slate-600 hover:text-slate-400 ml-1">
            <RefreshCw className="w-3 h-3" />
          </button>
          <span className="text-xs text-slate-600 ml-1">
            {saving ? "Saving..." : lastSaved ? `· Saved ${lastSaved.toLocaleTimeString()}` : ""}
          </span>
        </div>
      </div>

      {/* Brand picker */}
      <select value={quiz?.brand_id || ""} onChange={e => onBrandChange(e.target.value)}
        className="bg-[#0a1628] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
        <option value="">— No Brand —</option>
        {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
      </select>

      {/* Status */}
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${quiz?.status === "published" ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
        {quiz?.status || "draft"} v{quiz?.version || 1}
      </span>

      {/* View public */}
      {quiz?.status === "published" && quiz?.slug && (
        <a href={`/q/${quiz.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
          <Eye className="w-3.5 h-3.5" /> View
        </a>
      )}

      <button onClick={onPublish} disabled={saving}
        className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${publishErrors.length ? "bg-red-600 hover:bg-red-700" : "bg-[#1e90ff] hover:bg-blue-600"} disabled:opacity-50 text-white`}>
        <Globe className="w-3.5 h-3.5" /> {quiz?.status === "published" ? "Update" : "Publish"}
      </button>
    </div>
  );
}
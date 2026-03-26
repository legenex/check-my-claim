import React, { useState } from "react";

function charCount(val, max) {
  const len = (val || "").length;
  return <span className={`text-xs ml-1 ${len > max ? "text-red-400 font-semibold" : "text-slate-500"}`}>{len}/{max}</span>;
}

export default function SEOPanel({ seo, onChange }) {
  const body = seo.body || "";
  const wordCount = body.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  const keyword = seo.focusKeyword || "";
  const kwCount = keyword ? (body.toLowerCase().split(keyword.toLowerCase()).length - 1) : 0;
  const kwDensity = wordCount > 0 ? ((kwCount / wordCount) * 100).toFixed(1) : "0.0";

  const aeo = [
    { label: "Direct answer in first 100 words", ok: body.replace(/<[^>]+>/g, "").substring(0, 400).length > 50 },
    { label: "Question-format H2 present", ok: body.includes("?") && body.includes("<h2") },
    { label: "FAQ section present", ok: seo.hasFaq },
    { label: "Statistics cited (% or numbers)", ok: /\d+%|\$\d+/.test(body) },
    { label: "Internal links present", ok: /<a\s/.test(body) },
    { label: "Focus keyword in title", ok: keyword && (seo.seoTitle || "").toLowerCase().includes(keyword.toLowerCase()) },
    { label: "Meta description filled", ok: (seo.metaDescription || "").length > 50 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 mb-1 flex items-center">SEO Title {charCount(seo.seoTitle, 60)}</label>
        <input value={seo.seoTitle || ""} onChange={e => onChange("seoTitle", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" placeholder="SEO title…" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 flex items-center">Meta Description {charCount(seo.metaDescription, 160)}</label>
        <textarea value={seo.metaDescription || ""} onChange={e => onChange("metaDescription", e.target.value)} rows={3} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff] resize-none" placeholder="Meta description…" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Focus Keyword</label>
        <input value={seo.focusKeyword || ""} onChange={e => onChange("focusKeyword", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" placeholder="primary keyword…" />
        {keyword && <div className="text-xs text-slate-500 mt-1">Density: <span className={parseFloat(kwDensity) < 0.5 ? "text-yellow-400" : parseFloat(kwDensity) > 3 ? "text-red-400" : "text-green-400"}>{kwDensity}%</span> ({kwCount} uses)</div>}
      </div>
      <div className="border-t border-white/10 pt-3">
        <label className="text-xs text-slate-400 mb-1 block">OG Title {charCount(seo.ogTitle, 60)}</label>
        <input value={seo.ogTitle || ""} onChange={e => onChange("ogTitle", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" placeholder="OG title…" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">OG Description {charCount(seo.ogDescription, 160)}</label>
        <textarea value={seo.ogDescription || ""} onChange={e => onChange("ogDescription", e.target.value)} rows={2} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff] resize-none" placeholder="OG description…" />
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Canonical URL</label>
        <input value={seo.canonicalUrl || ""} onChange={e => onChange("canonicalUrl", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" placeholder="https://checkmyclaim.co/blog/…" />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400">Index this page</label>
        <button onClick={() => onChange("noIndex", !seo.noIndex)} className={`w-9 h-5 rounded-full relative transition-all ${!seo.noIndex ? "bg-[#1e90ff]" : "bg-white/10"}`}>
          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${!seo.noIndex ? "right-0.5" : "left-0.5"}`} />
        </button>
      </div>
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Schema Type</label>
        <select value={seo.schemaType || "BlogPosting"} onChange={e => onChange("schemaType", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
          <option>BlogPosting</option>
          <option>Article</option>
          <option>FAQPage</option>
        </select>
      </div>

      {/* AEO Checklist */}
      <div className="border-t border-white/10 pt-3">
        <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">AEO Checklist</div>
        <div className="space-y-1.5">
          {aeo.map(item => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? "bg-green-500/20 text-green-400" : "bg-white/5 text-slate-600"}`}>
                {item.ok ? "✓" : "○"}
              </div>
              <span className={item.ok ? "text-slate-300" : "text-slate-500"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
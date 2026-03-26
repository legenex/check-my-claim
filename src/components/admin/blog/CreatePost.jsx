import React, { useState, useEffect } from "react";
import { Save, Eye, Cpu, PenLine, Image, RefreshCw, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SEOPanel from "@/components/admin/blog/SEOPanel";
import AIGenerator from "@/components/admin/blog/AIGenerator";

export default function CreatePost({ initialPost, onSaved }) {
  const [mode, setMode] = useState("manual");
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [ctaTemplates, setCtaTemplates] = useState([]);
  const [kbDocs, setKbDocs] = useState([]);

  const [post, setPost] = useState({
    title: "", slug: "", excerpt: "", body: "", featuredImage: "",
    category: "Legal Advice", tags: [], authorName: "Check My Claim Team",
    authorBio: "", publishedAt: "", readTimeMinutes: 5,
    status: "Draft", isAIGenerated: false, isFeatured: false,
    seoTitle: "", metaDescription: "", ogTitle: "", ogDescription: "",
    canonicalUrl: "", noIndex: false, schemaType: "BlogPosting",
    focusKeyword: "", faqItems: [], notes: "",
    ctaHeadline: "Find Out If You Have a Case — It's Free",
    ctaSubtext: "Takes less than 2 minutes. No upfront fees.",
    ctaButtonText: "Start Your Free Claim Check →",
    ctaUrl: "https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Blog-Page&utm_medium={slug}&term={primary_keyword}",
  });

  useEffect(() => {
    if (initialPost) setPost({ ...post, ...initialPost });
    base44.entities.CTATemplate.filter({ isActive: true }).then(setCtaTemplates).catch(() => {});
    base44.entities.KnowledgeBaseDoc.filter({ isActive: true }).then(setKbDocs).catch(() => {});
  }, [initialPost]);

  const setField = (key, val) => setPost(p => ({ ...p, [key]: val }));
  const handleSeoChange = (key, val) => setPost(p => ({ ...p, [key]: val }));

  const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").substring(0, 80);

  const handleTitleChange = (val) => {
    setPost(p => ({ ...p, title: val, slug: p.slug || autoSlug(val) }));
  };

  const generateFeaturedImage = async () => {
    if (!post.title) return;
    setImageLoading(true);
    const res = await base44.integrations.Core.GenerateImage({
      prompt: `Professional editorial photography for a legal blog article: "${post.title}". Clean, modern, trustworthy aesthetic. Suitable for a legal claims matching website hero image. 16:9 composition.`
    });
    const keyword = (post.focusKeyword || post.title).toLowerCase().replace(/\s+/g, "-");
    setPost(p => ({
      ...p,
      featuredImage: res.url,
      featuredImageAlt: `${post.focusKeyword || post.title} - Check My Claim`,
      featuredImageFileName: `${keyword}-check-my-claim.jpg`
    }));
    setImageLoading(false);
  };

  const handleSave = async (status) => {
    setSaving(true);
    const slug = post.slug || autoSlug(post.title);
    const ctaUrl = post.ctaUrl.replace("{slug}", slug).replace("{primary_keyword}", post.focusKeyword || "");
    const data = {
      ...post,
      slug,
      status: status || post.status,
      ctaUrl,
      seoTitle: post.seoTitle || `${post.title} | Check My Claim`,
      canonicalUrl: post.canonicalUrl || `https://checkmyclaim.co/blog/${slug}`,
    };
    if (initialPost?.id) {
      await base44.entities.BlogPost.update(initialPost.id, data);
    } else {
      await base44.entities.BlogPost.create(data);
    }
    setSaving(false);
    onSaved();
  };

  const handleAIGenerated = (generatedPost) => {
    setPost(p => ({ ...p, ...generatedPost }));
    setMode("manual");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-0">
      {/* Main Editor */}
      <div className="flex-1 min-w-0">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-[#0f1e35] rounded-xl border border-white/10 w-fit">
          <button onClick={() => setMode("manual")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "manual" ? "bg-[#1e90ff] text-white shadow-lg" : "text-slate-300 hover:text-white"}`}>
            <PenLine className="w-4 h-4" /> ✍️ Manual Write
          </button>
          <button onClick={() => setMode("ai")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "ai" ? "bg-[#1e90ff] text-white shadow-lg" : "text-slate-300 hover:text-white"}`}>
            <Cpu className="w-4 h-4" /> 🤖 AI Generate
          </button>
        </div>

        {mode === "ai" ? (
          <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-6">
            <AIGenerator onGenerated={handleAIGenerated} ctaTemplates={ctaTemplates} kbDocs={kbDocs} />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Title & Slug */}
            <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Post Title</label>
                <input value={post.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Enter article title…" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs text-slate-400 flex-shrink-0">Slug:</label>
                <input value={post.slug} onChange={e => setField("slug", e.target.value)} className="flex-1 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#1e90ff] font-mono focus:outline-none focus:border-[#1e90ff]" />
                <button onClick={() => setField("slug", autoSlug(post.title))} className="text-xs text-slate-400 hover:text-white bg-white/5 px-2 py-1.5 rounded-lg transition-all flex-shrink-0"><RefreshCw className="w-3 h-3" /></button>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Excerpt (used in blog grid & meta fallback)</label>
                <textarea value={post.excerpt} onChange={e => setField("excerpt", e.target.value)} rows={2} placeholder="Brief description for the blog listing…" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none" />
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
              <h4 className="text-sm font-semibold text-white mb-3">Featured Image</h4>
              {post.featuredImage ? (
                <div className="flex gap-4 items-start">
                  <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} className="w-40 h-24 object-cover rounded-xl border border-white/10" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Alt Text (SEO required)</label>
                      <input value={post.featuredImageAlt || ""} onChange={e => setField("featuredImageAlt", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" placeholder="Descriptive alt text…" />
                    </div>
                    <div className="text-xs text-slate-500">File: {post.featuredImageFileName || "—"}</div>
                    <div className="flex gap-2">
                      <button onClick={generateFeaturedImage} disabled={imageLoading} className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-all">
                        {imageLoading ? <div className="w-3 h-3 border border-purple-300/30 border-t-purple-300 rounded-full animate-spin" /> : "🎨"} Regenerate
                      </button>
                      <button onClick={() => setField("featuredImage", "")} className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all">
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  <button onClick={generateFeaturedImage} disabled={imageLoading || !post.title} className="flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    {imageLoading ? <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" /> : "🎨"}
                    {imageLoading ? "Generating…" : "Generate with AI"}
                  </button>
                  <label className="flex items-center gap-2 bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all">
                    <Image className="w-4 h-4" /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files[0];
                      if (file) {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        const keyword = (post.focusKeyword || post.title || "legal").toLowerCase().replace(/\s+/g, "-");
                        setPost(p => ({ ...p, featuredImage: file_url, featuredImageFileName: `${keyword}-check-my-claim.jpg`, featuredImageAlt: `${post.title} - Check My Claim` }));
                      }
                    }} />
                  </label>
                </div>
              )}
            </div>

            {/* Article Body */}
            <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
              <label className="text-xs text-slate-400 mb-2 block">Article Body <span className="text-slate-500">(HTML / Markdown supported)</span></label>
              <textarea
                value={post.body}
                onChange={e => setField("body", e.target.value)}
                rows={20}
                placeholder="Write your article content here, or use AI Generate mode to produce the full article automatically…"
                className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none font-mono leading-relaxed"
              />
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>{post.body ? post.body.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length.toLocaleString() : 0} words</span>
                <span>~{post.body ? Math.round(post.body.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length / 200) : 0} min read</span>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
              <h4 className="text-sm font-semibold text-white mb-4">Publish Settings</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Status</label>
                  <select value={post.status} onChange={e => setField("status", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
                    <option>Draft</option><option>Published</option><option>Scheduled</option><option>Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <select value={post.category} onChange={e => setField("category", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
                    {["Car Accidents", "Personal Injury", "Legal Process", "Settlement Tips", "Slip & Fall", "Legal Advice", "Medical Malpractice"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Author</label>
                  <input value={post.authorName} onChange={e => setField("authorName", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Publish Date</label>
                  <input type="datetime-local" value={post.publishedAt ? post.publishedAt.substring(0, 16) : ""} onChange={e => setField("publishedAt", new Date(e.target.value).toISOString())} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={post.isFeatured} onChange={e => setField("isFeatured", e.target.checked)} className="rounded" />
                  Featured post
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={post.isAIGenerated} onChange={e => setField("isAIGenerated", e.target.checked)} className="rounded" />
                  AI-generated badge
                </label>
              </div>
            </div>

            {/* CTA Block */}
            <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
              <h4 className="text-sm font-semibold text-white mb-4">CTA Block</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">CTA Headline</label>
                    <input value={post.ctaHeadline} onChange={e => setField("ctaHeadline", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Button Text</label>
                    <input value={post.ctaButtonText} onChange={e => setField("ctaButtonText", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CTA URL <span className="text-slate-500">({"{slug}"} and {"{primary_keyword}"} auto-replaced on publish)</span></label>
                  <input value={post.ctaUrl} onChange={e => setField("ctaUrl", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#1e90ff] font-mono focus:outline-none focus:border-[#1e90ff]" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
              <h4 className="text-sm font-semibold text-white mb-2">Internal Notes <span className="text-xs text-slate-500 font-normal">(never published)</span></h4>
              <textarea
                value={post.notes}
                onChange={e => setField("notes", e.target.value)}
                rows={4}
                placeholder="Add any internal notes, editorial direction, compliance reminders, or context for this post…"
                className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap pb-4">
              <button onClick={() => handleSave("Draft")} disabled={saving} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button onClick={() => handleSave("Published")} disabled={saving || !post.title} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {saving ? "Saving…" : "Publish Post"}
              </button>
              {post.slug && (
                <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
                  <Eye className="w-4 h-4" /> Preview
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SEO Sidebar */}
      <aside className="xl:w-72 flex-shrink-0">
        <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5 sticky top-4">
          <h3 className="text-sm font-bold text-white mb-4">SEO & AEO Panel</h3>
          <SEOPanel seo={{ ...post, hasFaq: post.faqItems?.length > 0 }} onChange={handleSeoChange} />
        </div>
      </aside>
    </div>
  );
}
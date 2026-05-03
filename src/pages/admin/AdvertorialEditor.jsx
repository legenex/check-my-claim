import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Save, Globe, ArrowLeft, Sparkles, Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["Rideshare", "Pedestrian/Cyclist", "Listicle", "Personal Narrative", "Urgency", "Anti-Lawyer", "Pride and Pain", "Other"];
const TABS = ["Content", "Media", "CTAs & Tracking", "SEO", "Settings"];

const EMPTY = {
  title: "", headline: "", subheadline: "", slug: "", category: "Rideshare",
  author_name: "Check My Claim Editorial Team", author_role: "Consumer Advocacy Desk",
  published_date: new Date().toISOString().split("T")[0],
  featured_image_url: "", featured_image_alt: "", body_content: "", inline_images: [],
  soft_cta_text_1: "", soft_cta_text_2: "", soft_cta_text_3: "",
  primary_cta_text: "Start Your Free 30-Second Claim Check",
  primary_cta_url: "https://qualify.checkmyclaim.co/s/mva",
  estimated_reading_time: 5, status: "draft",
  meta_description: "", meta_title: "", tracking_pixel_meta: "", tracking_pixel_taboola: "",
  payout: "", traffic_source_label: "", view_count: 0, conversion_count: 0,
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
}

export default function AdvertorialEditor() {
  const navigate = useNavigate();
  const [id, setId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState("Content");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiModal, setAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("Rideshare");
  const [aiTone, setAiTone] = useState("Emotional/Narrative");
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const idIdx = pathParts.indexOf("advertorials") + 1;
    const pathId = pathParts[idIdx];
    if (pathId && pathId !== "new") {
      setId(pathId);
      base44.entities.Advertorial.filter({ id: pathId }).then(res => {
        if (res.length > 0) setForm({ ...EMPTY, ...res[0] });
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const set = (field, value) => {
    setForm(f => {
      const next = { ...f, [field]: value };
      if (field === "headline" && !id) next.slug = slugify(value);
      return next;
    });
  };

  const save = async (newStatus) => {
    setSaving(true);
    const data = { ...form };
    if (newStatus) data.status = newStatus;
    if (id) {
      await base44.entities.Advertorial.update(id, data);
    } else {
      const created = await base44.entities.Advertorial.create(data);
      navigate(`/admin/advertorials/${created.id}/edit`, { replace: true });
      setId(created.id);
    }
    setForm(f => ({ ...f, ...data }));
    setSaving(false);
  };

  const generateWithAI = async () => {
    setAiGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are writing a direct-response advertorial for Check My Claim, a legal claims matching website.

Category: ${aiCategory}
Tone: ${aiTone}
Brief/Angle: ${aiPrompt}

Generate:
1. headline (compelling, direct-response, max 15 words)
2. subheadline (supporting 1-2 sentences)
3. body_content (1,400-1,600 words of full HTML article body using <h2>, <h3>, <p>, <ul>, <strong> tags. Open with a vivid scene. Use "you" language. Short punchy sentences. Real numbers. Pattern interrupts.)
4. soft_cta_text_1 (1 sentence, italic, placed at ~1/3 mark — hint at free check)
5. soft_cta_text_2 (1 sentence, italic, placed at ~2/3 mark)
6. soft_cta_text_3 (1 sentence, italic, near end)

Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          body_content: { type: "string" },
          soft_cta_text_1: { type: "string" },
          soft_cta_text_2: { type: "string" },
          soft_cta_text_3: { type: "string" },
        }
      },
      model: "claude_sonnet_4_6"
    });
    setForm(f => ({
      ...f,
      category: aiCategory,
      headline: res.headline || f.headline,
      subheadline: res.subheadline || f.subheadline,
      body_content: res.body_content || f.body_content,
      soft_cta_text_1: res.soft_cta_text_1 || f.soft_cta_text_1,
      soft_cta_text_2: res.soft_cta_text_2 || f.soft_cta_text_2,
      soft_cta_text_3: res.soft_cta_text_3 || f.soft_cta_text_3,
      slug: res.headline ? slugify(res.headline) : f.slug,
    }));
    setAiGenerating(false);
    setAiModal(false);
  };

  const addInlineImage = () => {
    setForm(f => ({ ...f, inline_images: [...(f.inline_images || []), { url: "", alt: "", caption: "" }] }));
  };
  const updateInlineImage = (i, field, val) => {
    setForm(f => {
      const imgs = [...(f.inline_images || [])];
      imgs[i] = { ...imgs[i], [field]: val };
      return { ...f, inline_images: imgs };
    });
  };
  const removeInlineImage = (i) => {
    setForm(f => ({ ...f, inline_images: (f.inline_images || []).filter((_, idx) => idx !== i) }));
  };

  if (loading) return <AdminLayout title="Loading..."><div className="text-slate-400 text-center py-8">Loading...</div></AdminLayout>;

  const isNew = !id;
  const title = isNew ? "New Advertorial" : `Edit: ${form.title || "Untitled"}`;

  return (
    <AdminLayout title={title} breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Advertorials", href: "/admin/advertorials" }, { label: isNew ? "New" : "Edit" }]}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/advertorials" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setAiModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
            <Sparkles className="w-4 h-4" /> Generate with AI
          </button>
          {form.slug && form.status === "published" && (
            <a href={`/advertorial/${form.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
              <Globe className="w-4 h-4" /> View Live
            </a>
          )}
          <button onClick={() => save("draft")} disabled={saving} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
            Save Draft
          </button>
          <button onClick={() => save("published")} disabled={saving} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition-all">
            <Globe className="w-4 h-4" /> {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t ? "text-white border-b-2 border-[#1e90ff]" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-5 max-w-4xl">

        {/* CONTENT TAB */}
        {tab === "Content" && (
          <>
            <Field label="Internal Title *"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Rideshare $1M Policy" className={inputCls} /></Field>
            <Field label={`Headline * (${form.headline?.length || 0} chars)`}>
              <input value={form.headline} onChange={e => set("headline", e.target.value)} placeholder="The big H1 shown to users" className={inputCls} />
            </Field>
            <Field label="Subheadline"><input value={form.subheadline} onChange={e => set("subheadline", e.target.value)} placeholder="Supporting deck under H1" className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Published Date"><input type="date" value={form.published_date} onChange={e => set("published_date", e.target.value)} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Author Name"><input value={form.author_name} onChange={e => set("author_name", e.target.value)} className={inputCls} /></Field>
              <Field label="Author Role"><input value={form.author_role} onChange={e => set("author_role", e.target.value)} className={inputCls} /></Field>
            </div>
            <Field label="Body Content (HTML supported)">
              <textarea value={form.body_content} onChange={e => set("body_content", e.target.value)} rows={20}
                placeholder="Full article body. Use <h2>, <h3>, <p>, <ul>, <strong>, <em> HTML tags. Separate paragraphs with blank lines."
                className={`${inputCls} font-mono text-xs`} />
              <p className="text-xs text-slate-500 mt-1">Tip: Use HTML tags for formatting. Separate paragraphs with double newlines.</p>
            </Field>
          </>
        )}

        {/* MEDIA TAB */}
        {tab === "Media" && (
          <>
            <Field label="Featured Image URL">
              <input value={form.featured_image_url} onChange={e => set("featured_image_url", e.target.value)} placeholder="https://images.unsplash.com/..." className={inputCls} />
              {form.featured_image_url && <img src={form.featured_image_url} alt="preview" className="mt-2 rounded-lg max-h-48 object-cover" />}
            </Field>
            <Field label="Featured Image Alt Text"><input value={form.featured_image_alt} onChange={e => set("featured_image_alt", e.target.value)} placeholder="Describe the image for accessibility" className={inputCls} /></Field>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-300">Inline Images</label>
                <button onClick={addInlineImage} className="flex items-center gap-1 text-xs text-[#1e90ff] hover:underline"><Plus className="w-3 h-3" /> Add Image</button>
              </div>
              {(form.inline_images || []).map((img, i) => (
                <div key={i} className="bg-[#0a1628] rounded-lg p-4 mb-3 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 font-semibold">Image {i + 1}</span>
                    <button onClick={() => removeInlineImage(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <input value={img.url} onChange={e => updateInlineImage(i, "url", e.target.value)} placeholder="Image URL" className={`${inputCls} mb-2`} />
                  <input value={img.alt} onChange={e => updateInlineImage(i, "alt", e.target.value)} placeholder="Alt text" className={`${inputCls} mb-2`} />
                  <input value={img.caption} onChange={e => updateInlineImage(i, "caption", e.target.value)} placeholder="Caption (optional)" className={inputCls} />
                  {img.url && <img src={img.url} alt={img.alt} className="mt-2 rounded max-h-32 object-cover" />}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTAs & TRACKING TAB */}
        {tab === "CTAs & Tracking" && (
          <>
            <Field label="Soft CTA 1 (shown at ~1/3 of article)">
              <input value={form.soft_cta_text_1} onChange={e => set("soft_cta_text_1", e.target.value)} placeholder="e.g. If you're wondering whether your offer is fair, there's a free 30-second check below." className={inputCls} />
            </Field>
            <Field label="Soft CTA 2 (~2/3 of article)">
              <input value={form.soft_cta_text_2} onChange={e => set("soft_cta_text_2", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Soft CTA 3 (near end)">
              <input value={form.soft_cta_text_3} onChange={e => set("soft_cta_text_3", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Primary CTA Text">
              <input value={form.primary_cta_text} onChange={e => set("primary_cta_text", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Primary CTA URL">
              <input value={form.primary_cta_url} onChange={e => set("primary_cta_url", e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Meta Pixel ID (optional)"><input value={form.tracking_pixel_meta} onChange={e => set("tracking_pixel_meta", e.target.value)} placeholder="e.g. 892894053744200" className={inputCls} /></Field>
              <Field label="Taboola Pixel ID (optional)"><input value={form.tracking_pixel_taboola} onChange={e => set("tracking_pixel_taboola", e.target.value)} className={inputCls} /></Field>
            </div>
            <Field label="Traffic Source Label">
              <input value={form.traffic_source_label} onChange={e => set("traffic_source_label", e.target.value)} placeholder="e.g. Meta, Taboola, Outbrain" className={inputCls} />
            </Field>
          </>
        )}

        {/* SEO TAB */}
        {tab === "SEO" && (
          <>
            <Field label="URL Slug">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">/advertorial/</span>
                <input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="my-article-slug" className={`${inputCls} flex-1`} />
              </div>
            </Field>
            <Field label="Meta Title (SEO)">
              <input value={form.meta_title} onChange={e => set("meta_title", e.target.value)} placeholder="e.g. Hit by Uber? There's a $1M Policy — Check My Claim" className={inputCls} />
            </Field>
            <Field label="Meta Description (SEO)">
              <textarea value={form.meta_description} onChange={e => set("meta_description", e.target.value)} rows={3} placeholder="150-160 character description for search engines" className={inputCls} />
            </Field>
            <Field label="Estimated Reading Time (minutes)">
              <input type="number" min="1" max="30" value={form.estimated_reading_time} onChange={e => set("estimated_reading_time", parseInt(e.target.value))} className={`${inputCls} w-24`} />
            </Field>
          </>
        )}

        {/* SETTINGS TAB */}
        {tab === "Settings" && (
          <>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Payout per Lead">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">$</span>
                <input type="number" step="0.01" min="0" value={form.payout} onChange={e => set("payout", parseFloat(e.target.value))} placeholder="45.00" className={`${inputCls} w-32`} />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a1628] rounded-lg p-4 border border-white/10">
                <div className="text-xs text-slate-400 mb-1">Total Views</div>
                <div className="text-2xl font-bold text-white">{(form.view_count || 0).toLocaleString()}</div>
              </div>
              <div className="bg-[#0a1628] rounded-lg p-4 border border-white/10">
                <div className="text-xs text-slate-400 mb-1">Outbound Clicks</div>
                <div className="text-2xl font-bold text-[#2BB6F6]">{(form.clicks || 0).toLocaleString()}</div>
              </div>
            </div>
          </>
        )}

        {/* Save footer */}
        <div className="pt-6 border-t border-white/10 flex gap-3">
          <button onClick={() => save()} disabled={saving} className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">Save</button>
          <button onClick={() => save("draft")} disabled={saving} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">Save as Draft</button>
          <button onClick={() => save("published")} disabled={saving} className="bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-sm">{saving ? "Saving..." : "Publish"}</button>
        </div>
      </div>

      {/* AI Modal */}
      {aiModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Generate with AI</h3>
              <button onClick={() => setAiModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="space-y-4">
              <Field label="Category">
                <select value={aiCategory} onChange={e => setAiCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Tone">
                <select value={aiTone} onChange={e => setAiTone(e.target.value)} className={inputCls}>
                  {["Emotional/Narrative", "Informational/Listicle", "Urgency", "Investigative"].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Brief / Angle">
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4}
                  placeholder="Describe the article angle, key points, target reader situation..."
                  className={inputCls} />
              </Field>
              <button onClick={generateWithAI} disabled={aiGenerating || !aiPrompt}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {aiGenerating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating (30-60s)…</> : <><Sparkles className="w-4 h-4" /> Generate Article</>}
              </button>
              {aiGenerating && <p className="text-xs text-slate-400 text-center">Using Claude Sonnet for best quality. Uses additional credits.</p>}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] transition-colors";
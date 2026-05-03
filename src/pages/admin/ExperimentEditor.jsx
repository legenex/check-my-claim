import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Save, Globe, ArrowLeft } from "lucide-react";

const TABS = ["Content", "CTAs & Tracking", "SEO", "Settings"];
const BUILD_STATUSES = ["planned", "in_progress", "beta", "live"];
const EXPERIMENT_TYPES = ["claim_estimator", "adjuster_simulator", "letter_analyzer", "lifestyle_calculator", "crash_clock", "injury_predictor", "letter_generator", "state_map", "case_index", "settlement_ticker", "other"];

const EMPTY = {
  title: "", slug: "", path: "", experiment_type: "other", category: "",
  hero_headline: "", hero_subheadline: "", short_description: "",
  featured_image_url: "", featured_image_alt: "",
  primary_cta_text: "Start My Free Claim Check",
  primary_cta_url: "https://qualify.checkmyclaim.co/s/mva",
  utm_medium_label: "", disclaimer_short: "This is an educational tool only — not legal advice.",
  meta_title: "", meta_description: "", tracking_pixel_meta: "", tracking_pixel_taboola: "",
  internal_notes: "", is_featured: false,
  status: "draft", build_status: "planned",
  view_count: 0, clicks: 0, submissions: 0,
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
}

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] transition-colors";

export default function ExperimentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState("Content");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pathError, setPathError] = useState("");
  const [allPaths, setAllPaths] = useState([]);

  useEffect(() => {
    const load = async () => {
      const all = await base44.entities.Experiment.list();
      setAllPaths(all.map(e => ({ id: e.id, path: e.path })));
      if (id && id !== "new") {
        const res = await base44.entities.Experiment.filter({ id });
        if (res.length > 0) setForm({ ...EMPTY, ...res[0] });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const set = (field, value) => {
    setForm(f => {
      const next = { ...f, [field]: value };
      if (field === "title" && !id) {
        next.slug = slugify(value);
        next.path = "/tools/" + slugify(value);
      }
      return next;
    });
    if (field === "path") validatePath(value);
  };

  const validatePath = (path) => {
    if (!path.startsWith("/")) { setPathError("Path must start with /"); return false; }
    const collision = allPaths.find(p => p.path === path && p.id !== id);
    if (collision) { setPathError("This path is already used by another experiment"); return false; }
    setPathError("");
    return true;
  };

  const save = async (newStatus) => {
    if (!validatePath(form.path)) return;
    setSaving(true);
    const data = { ...form };
    if (newStatus) data.status = newStatus;
    if (id && id !== "new") {
      await base44.entities.Experiment.update(id, data);
    } else {
      const created = await base44.entities.Experiment.create(data);
      navigate(`/admin/experiments/${created.id}/edit`, { replace: true });
    }
    setForm(f => ({ ...f, ...data }));
    setSaving(false);
  };

  if (loading) return <AdminLayout title="Loading..."><div className="text-slate-400 text-center py-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout
      title={id ? `Edit: ${form.title || "Untitled"}` : "New Experiment"}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Experiments", href: "/admin/experiments" }, { label: id ? "Edit" : "New" }]}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/experiments" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-3">
          {form.path && form.status === "published" && (
            <a href={form.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
              <Globe className="w-4 h-4" /> View Live
            </a>
          )}
          <button onClick={() => save("draft")} disabled={saving} className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg">Save Draft</button>
          <button onClick={() => save("published")} disabled={saving || !!pathError} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg">
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
        {tab === "Content" && (
          <>
            <F label="Title *"><input value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} /></F>
            <div className="grid grid-cols-2 gap-4">
              <F label="Slug (kebab-case)"><input value={form.slug} onChange={e => set("slug", e.target.value)} className={inputCls} /></F>
              <F label={<>Public Path * {pathError && <span className="text-red-400 font-normal ml-2">{pathError}</span>}</>}>
                <input value={form.path} onChange={e => set("path", e.target.value)} placeholder="/tools/my-tool" className={`${inputCls} ${pathError ? "border-red-500" : ""}`} />
                <p className="text-xs text-slate-500 mt-1">Public URL where this experiment renders. Must start with /</p>
              </F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Experiment Type">
                <select value={form.experiment_type} onChange={e => set("experiment_type", e.target.value)} className={inputCls}>
                  {EXPERIMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </F>
              <F label="Category"><input value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Estimator, Simulator" className={inputCls} /></F>
            </div>
            <F label={`Hero Headline (${form.hero_headline?.length || 0} chars)`}>
              <input value={form.hero_headline} onChange={e => set("hero_headline", e.target.value)} className={inputCls} />
            </F>
            <F label="Hero Subheadline">
              <textarea value={form.hero_subheadline} onChange={e => set("hero_subheadline", e.target.value)} rows={3} className={inputCls} />
            </F>
            <F label="Short Description (admin use)">
              <textarea value={form.short_description} onChange={e => set("short_description", e.target.value)} rows={2} className={inputCls} />
            </F>
            <F label="Featured Image URL">
              <input value={form.featured_image_url} onChange={e => set("featured_image_url", e.target.value)} placeholder="https://images.unsplash.com/..." className={inputCls} />
              {form.featured_image_url && <img src={form.featured_image_url} alt="preview" className="mt-2 rounded-lg max-h-40 object-cover" />}
            </F>
            <F label="Featured Image Alt"><input value={form.featured_image_alt} onChange={e => set("featured_image_alt", e.target.value)} className={inputCls} /></F>
          </>
        )}

        {tab === "CTAs & Tracking" && (
          <>
            <F label="Primary CTA Text"><input value={form.primary_cta_text} onChange={e => set("primary_cta_text", e.target.value)} className={inputCls} /></F>
            <F label="Primary CTA URL"><input value={form.primary_cta_url} onChange={e => set("primary_cta_url", e.target.value)} className={inputCls} /></F>
            <F label="UTM Medium Label (short identifier for this experiment)">
              <input value={form.utm_medium_label} onChange={e => set("utm_medium_label", e.target.value)} placeholder="e.g. estimator, simulator" className={inputCls} />
            </F>
            <F label="Disclaimer (short, shown on public page)">
              <textarea value={form.disclaimer_short} onChange={e => set("disclaimer_short", e.target.value)} rows={2} className={inputCls} />
            </F>
            <div className="grid grid-cols-2 gap-4">
              <F label="Meta Pixel ID"><input value={form.tracking_pixel_meta || ""} onChange={e => set("tracking_pixel_meta", e.target.value)} className={inputCls} /></F>
              <F label="Taboola Pixel ID"><input value={form.tracking_pixel_taboola || ""} onChange={e => set("tracking_pixel_taboola", e.target.value)} className={inputCls} /></F>
            </div>
          </>
        )}

        {tab === "SEO" && (
          <>
            <F label="Meta Title"><input value={form.meta_title} onChange={e => set("meta_title", e.target.value)} className={inputCls} /></F>
            <F label="Meta Description"><textarea value={form.meta_description} onChange={e => set("meta_description", e.target.value)} rows={3} className={inputCls} /></F>
          </>
        )}

        {tab === "Settings" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <F label="Status">
                <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </F>
              <F label="Build Status">
                <select value={form.build_status} onChange={e => set("build_status", e.target.value)} className={inputCls}>
                  {BUILD_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </F>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => set("is_featured", e.target.checked)} />
              <span className="text-sm text-slate-300">Featured experiment</span>
            </label>
            <F label="Internal Notes"><textarea value={form.internal_notes || ""} onChange={e => set("internal_notes", e.target.value)} rows={3} className={inputCls} /></F>
            <div className="grid grid-cols-3 gap-4">
              {[["view_count", "Views"], ["clicks", "Clicks"], ["submissions", "Submissions"]].map(([k, label]) => (
                <div key={k} className="bg-[#0a1628] rounded-lg p-4 border border-white/10">
                  <div className="text-xs text-slate-400 mb-1">{label}</div>
                  <div className="text-2xl font-bold text-white">{(form[k] || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pt-6 border-t border-white/10 flex gap-3">
          <button onClick={() => save()} disabled={saving} className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">Save</button>
          <button onClick={() => save("published")} disabled={saving || !!pathError} className="bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-sm">{saving ? "Saving..." : "Publish"}</button>
        </div>
      </div>
    </AdminLayout>
  );
}

function F({ label, children }) {
  return <div><label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>{children}</div>;
}
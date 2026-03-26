import React, { useState, useEffect } from "react";
import { Plus, Edit, Copy, Trash2, Eye, X, Cpu, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULT_URL = "https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Blog-Page&utm_medium={slug}&term={primary_keyword}";
const BG_STYLES = ["Dark Card", "Blue Banner", "Gradient", "White Card", "Solid Colour"];

function CTAPreview({ cta }) {
  const bg = cta.backgroundStyle === "Blue Banner"
    ? "bg-gradient-to-r from-[#4ba8ee] to-[#0486e9]"
    : cta.backgroundStyle === "Gradient"
    ? "bg-gradient-to-br from-[#0C2D5B] to-[#0f1e35]"
    : cta.backgroundStyle === "Dark Card"
    ? "bg-[#0f1e35] border border-white/10"
    : "bg-[#0f1e35] border border-[#1e90ff]/20";
  return (
    <div className={`rounded-2xl p-6 text-center ${bg}`}>
      {cta.icon && <div className="text-2xl mb-2">{cta.icon}</div>}
      <div className="text-lg font-bold text-white mb-1">{cta.headline || "CTA Headline"}</div>
      <div className="text-sm text-slate-200 mb-4">{cta.subtext || "CTA subtext appears here"}</div>
      <span className="inline-block px-6 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: cta.buttonColor || "#1e90ff" }}>
        {cta.buttonText || "Button Text"}
      </span>
    </div>
  );
}

function CTAEditor({ cta, onSave, onClose }) {
  const [mode, setMode] = useState("manual");
  const [form, setForm] = useState({ name: "", headline: "Find Out If You Have a Case — It's Free", subtext: "Takes less than 2 minutes. No upfront fees.", buttonText: "Start Your Free Claim Check →", ctaUrl: DEFAULT_URL, buttonColor: "#1e90ff", backgroundStyle: "Blue Banner", position: "End", icon: "⚖️", isActive: true, ...cta });
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Empathetic");
  const [aiContext, setAiContext] = useState("");
  const [aiVariations, setAiVariations] = useState(3);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showUtm, setShowUtm] = useState(false);

  const generateCTA = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate ${aiVariations} CTA (call-to-action) variations for a legal claims matching website (Check My Claim). 
Goal: ${aiPrompt}
Tone: ${aiTone}
Article context: ${aiContext || "General personal injury / accident claims content"}

Return JSON with a "variations" array, each with: headline, subtext, buttonText`,
      response_json_schema: {
        type: "object",
        properties: {
          variations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                subtext: { type: "string" },
                buttonText: { type: "string" }
              }
            }
          }
        }
      }
    });
    setAiResults(res.variations || []);
    setAiLoading(false);
  };

  const utmParts = (() => {
    try {
      const url = new URL(form.ctaUrl);
      return { source: url.searchParams.get("utm_source") || "CMC-Website", campaign: url.searchParams.get("utm_campaign") || "Blog-Page", medium: url.searchParams.get("utm_medium") || "{slug}", term: url.searchParams.get("term") || "{primary_keyword}" };
    } catch { return { source: "CMC-Website", campaign: "Blog-Page", medium: "{slug}", term: "{primary_keyword}" }; }
  })();

  const rebuildUrl = (parts) => {
    return `https://qualify.checkmyclaim.co/s/mva?utm_source=${parts.source}&utm_campaign=${parts.campaign}&utm_medium=${parts.medium}&term=${parts.term}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-[#0a1628] border border-white/10 rounded-2xl w-full max-w-4xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{cta?.id ? "Edit CTA Template" : "New CTA Template"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 py-4 border-b border-white/10 flex gap-2">
          <button onClick={() => setMode("manual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "manual" ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>✍️ Manual Build</button>
          <button onClick={() => setMode("ai")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "ai" ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}><Cpu className="w-4 h-4" /> 🤖 AI Generate CTA</button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Editor */}
          <div className="flex-1 p-6 space-y-4">
            {mode === "ai" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Describe the goal of this CTA</label>
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3} placeholder="e.g. Convert readers who just learned they might have an accident claim — drive them to take the free claim check survey" className="w-full bg-[#0f1e35] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Tone</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Urgent", "Empathetic", "Confident", "Reassuring"].map(t => (
                        <button key={t} onClick={() => setAiTone(t)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${aiTone === t ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Variations</label>
                    <div className="flex gap-2">
                      {[1, 3, 5].map(n => <button key={n} onClick={() => setAiVariations(n)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${aiVariations === n ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{n}</button>)}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Article type context (optional)</label>
                  <input value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder="e.g. This CTA will be used on articles about car accident injuries" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
                </div>
                <button onClick={generateCTA} disabled={!aiPrompt || aiLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e90ff] to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all">
                  {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? "Generating…" : "✨ Generate CTA Variations"}
                </button>
                {aiResults.length > 0 && (
                  <div className="space-y-3">
                    {aiResults.map((v, i) => (
                      <div key={i} className="bg-[#0f1e35] rounded-xl border border-white/10 p-4">
                        <div className="text-sm font-bold text-white mb-1">{v.headline}</div>
                        <div className="text-xs text-slate-400 mb-3">{v.subtext}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-[#1e90ff]/20 text-[#1e90ff] px-3 py-1 rounded-lg font-semibold">{v.buttonText}</span>
                          <button onClick={() => { setForm(f => ({ ...f, headline: v.headline, subtext: v.subtext, buttonText: v.buttonText })); setMode("manual"); }} className="text-xs text-white bg-[#1e90ff] hover:bg-blue-500 px-3 py-1.5 rounded-lg font-semibold transition-all">Use This →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Template Name (internal)</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Survey CTA" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Icon (emoji, optional)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="⚖️" className="w-24 bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CTA Headline</label>
                  <input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CTA Subtext</label>
                  <input value={form.subtext} onChange={e => setForm(f => ({ ...f, subtext: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Button Text</label>
                  <input value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
                </div>
                {/* URL Builder */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400">CTA URL</label>
                    <button onClick={() => setShowUtm(!showUtm)} className="text-xs text-[#1e90ff] hover:underline">{showUtm ? "Hide" : "Open"} URL Builder</button>
                  </div>
                  <input value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#1e90ff] font-mono focus:outline-none focus:border-[#1e90ff]" />
                  {showUtm && (
                    <div className="mt-2 bg-[#0a1628] rounded-lg p-3 border border-white/5 grid grid-cols-2 gap-2">
                      {[["utm_source", "source"], ["utm_campaign", "campaign"], ["utm_medium", "medium"], ["term", "term"]].map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs text-slate-500 mb-0.5 block">{label}</label>
                          <input defaultValue={utmParts[key]} onChange={e => setForm(f => ({ ...f, ctaUrl: rebuildUrl({ ...utmParts, [key]: e.target.value }) }))} className="w-full bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Button Colour</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.buttonColor} onChange={e => setForm(f => ({ ...f, buttonColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                      <input value={form.buttonColor} onChange={e => setForm(f => ({ ...f, buttonColor: e.target.value }))} className="flex-1 bg-[#0f1e35] border border-white/10 rounded-lg px-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#1e90ff]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Background Style</label>
                    <select value={form.backgroundStyle} onChange={e => setForm(f => ({ ...f, backgroundStyle: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
                      {BG_STYLES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Default Position</label>
                  <div className="flex flex-wrap gap-2">
                    {["Top", "Mid-article", "End", "All three"].map(p => (
                      <button key={p} onClick={() => setForm(f => ({ ...f, position: p }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.position === p ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-white/10 p-5">
            <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Live Preview</div>
            <CTAPreview cta={form} />
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`w-9 h-5 rounded-full relative transition-all ${form.isActive ? "bg-[#1e90ff]" : "bg-white/10"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.isActive ? "right-0.5" : "left-0.5"}`} />
                </button>
                <span className="text-xs text-slate-300">Active</span>
              </label>
            </div>
            <button onClick={() => onSave(form)} disabled={!form.name || !form.headline} className="w-full mt-4 bg-[#1e90ff] hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">Save Template</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CTATemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    base44.entities.CTATemplate.list("-updated_date", 100)
      .then(setTemplates).catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (form) => {
    if (form.id) {
      const updated = await base44.entities.CTATemplate.update(form.id, form);
      setTemplates(ts => ts.map(t => t.id === form.id ? updated : t));
    } else {
      const created = await base44.entities.CTATemplate.create(form);
      setTemplates(ts => [created, ...ts]);
    }
    setShowEditor(false); setEditing(null);
  };

  const handleDuplicate = async (t) => {
    const { id, created_date, updated_date, ...rest } = t;
    const dup = await base44.entities.CTATemplate.create({ ...rest, name: `${rest.name} (Copy)` });
    setTemplates(ts => [dup, ...ts]);
  };

  const handleDelete = async (id) => {
    await base44.entities.CTATemplate.delete(id);
    setTemplates(ts => ts.filter(t => t.id !== id));
  };

  const handleToggle = async (t) => {
    const updated = await base44.entities.CTATemplate.update(t.id, { isActive: !t.isActive });
    setTemplates(ts => ts.map(x => x.id === t.id ? updated : x));
  };

  return (
    <div>
      {showEditor && <CTAEditor cta={editing} onSave={handleSave} onClose={() => { setShowEditor(false); setEditing(null); }} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white">CTA Templates</h3>
          <p className="text-xs text-slate-400 mt-0.5">Reusable call-to-action blocks deployed across blog articles. Active templates appear in the AI article generator.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowEditor(true); }} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" /> Create New Template
        </button>
      </div>

      {templates.length === 0 && !loading ? (
        <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-12 text-center">
          <div className="text-3xl mb-3">🎯</div>
          <div className="text-white font-semibold mb-1">No CTA templates yet</div>
          <div className="text-slate-400 text-sm mb-5">Create reusable CTAs with UTM tracking to deploy across all your blog articles.</div>
          <button onClick={() => setShowEditor(true)} className="bg-[#1e90ff] hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">Create First Template</button>
        </div>
      ) : (
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Template</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium hidden md:table-cell">Button</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium hidden lg:table-cell">Position</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Active</th>
                <th className="px-4 py-3 text-right text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>)
               : templates.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.headline}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-semibold px-3 py-1 rounded-lg text-white" style={{ background: t.buttonColor || "#1e90ff" }}>{t.buttonText}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded">{t.position}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(t)} className={`w-9 h-5 rounded-full relative transition-all mx-auto block ${t.isActive ? "bg-[#1e90ff]" : "bg-white/10"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${t.isActive ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setPreview(preview?.id === t.id ? null : t)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setEditing(t); setShowEditor(true); }} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDuplicate(t)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div className="mt-4 max-w-xl">
          <div className="text-xs text-slate-400 mb-2">Preview: {preview.name}</div>
          <CTAPreview cta={preview} />
        </div>
      )}
    </div>
  );
}
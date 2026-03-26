import React, { useState } from "react";
import { Save, Info } from "lucide-react";

const DEFAULT = {
  articleTypes: ["MVA"],
  defaultTone: "Empathetic",
  defaultAudience: "Accident Victims",
  defaultReadingLevel: "Standard",
  defaultWordCount: "1500",
  brandName: "Check My Claim",
  brandUrl: "https://checkmyclaim.co",
  surveyUrl: "https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Blog-Page&utm_medium={slug}&term={primary_keyword}",
  legalDisclaimer: "Check My Claim is not a law firm and does not provide legal advice. All content is for informational purposes only. Always consult a qualified attorney for legal guidance specific to your situation.",
  mandatoryInclusions: "Always include a recommendation to consult a qualified attorney.\nAlways end with a CTA directing readers to the free claim check.\nNever guarantee specific settlement amounts or legal outcomes.",
  prohibited: "Do not name specific competitor law firms or claim matching services.\nDo not make specific legal promises or guarantees.\nDo not use scare tactics or misleading statistics.",
  defaultCtaUrl: "https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Blog-Page&utm_medium={slug}&term={primary_keyword}",
  enableAeo: true,
  enableFaqDefault: true,
  enableSchemaDefault: true,
  systemPromptPrefix: "You are an expert legal content writer for Check My Claim (checkmyclaim.co), a trusted legal claims matching platform that connects accident victims with top-rated personal injury attorneys in the US. Your content must be empathetic, authoritative, and conversion-focused. Every article should build trust with readers who are unsure if they have a claim.",
};

export default function BaseInstructions() {
  const [form, setForm] = useState(DEFAULT);
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    localStorage.setItem("blogBaseInstructions", JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ARTICLE_TYPES = ["MVA", "Workers Comp", "Slip & Fall", "Medical Malpractice", "Product Liability", "General PI"];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-[#1e90ff]/5 border border-[#1e90ff]/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#1e90ff] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300">These are the base-level defaults and rules applied to <strong className="text-white">every AI-generated article</strong>. Think of this as the framework the AI operates within. Individual post instructions in Step 5 can add to — but not override — these rules.</p>
      </div>

      {/* Article Scope */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-4">Article Type Scope</h3>
        <p className="text-xs text-slate-400 mb-3">Restrict AI content generation to these article types only.</p>
        <div className="flex flex-wrap gap-2">
          {ARTICLE_TYPES.map(type => (
            <button key={type} onClick={() => set("articleTypes", form.articleTypes.includes(type) ? form.articleTypes.filter(t => t !== type) : [...form.articleTypes, type])} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${form.articleTypes.includes(type) ? "bg-[#1e90ff] border-[#1e90ff] text-white" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Defaults */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-4">Default Content Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Default Tone", key: "defaultTone", options: ["Empathetic", "Authoritative", "Conversational", "Urgent"] },
            { label: "Default Reading Level", key: "defaultReadingLevel", options: ["Simple (8th grade)", "Standard", "Professional"] },
            { label: "Default Word Count", key: "defaultWordCount", options: ["600", "1000", "1500", "2000", "2500+"] },
            { label: "Default Audience", key: "defaultAudience", options: ["Accident Victims", "Families of Victims", "General Public"] },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-slate-400 mb-1 block">{field.label}</label>
              <select value={form[field.key]} onChange={e => set(field.key, e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
                {field.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4">
          {[
            { key: "enableAeo", label: "AEO Optimisation ON by default" },
            { key: "enableFaqDefault", label: "FAQ Section ON by default" },
            { key: "enableSchemaDefault", label: "Schema Markup ON by default" },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => set(item.key, !form[item.key])} className={`w-9 h-5 rounded-full relative transition-all ${form[item.key] ? "bg-[#1e90ff]" : "bg-white/10"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form[item.key] ? "right-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-xs text-slate-300">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand & URL Defaults */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white mb-2">Brand & URL Defaults</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Brand Name</label>
            <input value={form.brandName} onChange={e => set("brandName", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Brand URL</label>
            <input value={form.brandUrl} onChange={e => set("brandUrl", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Default CTA / Survey URL <span className="text-slate-500">({"{slug}"} and {"{primary_keyword}"} are replaced dynamically)</span></label>
          <input value={form.defaultCtaUrl} onChange={e => set("defaultCtaUrl", e.target.value)} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#1e90ff] font-mono focus:outline-none focus:border-[#1e90ff]" />
        </div>
      </div>

      {/* AI System Prompt Prefix */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-2">AI System Prompt Prefix</h3>
        <p className="text-xs text-slate-400 mb-3">This text is injected at the start of every AI article generation prompt, setting the base persona and context.</p>
        <textarea value={form.systemPromptPrefix} onChange={e => set("systemPromptPrefix", e.target.value)} rows={4} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none" />
      </div>

      {/* Mandatory Inclusions */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-2">Mandatory Inclusions</h3>
        <p className="text-xs text-slate-400 mb-3">Rules the AI must always follow. One per line.</p>
        <textarea value={form.mandatoryInclusions} onChange={e => set("mandatoryInclusions", e.target.value)} rows={4} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none" />
      </div>

      {/* Prohibited Content */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-2">Prohibited Content</h3>
        <p className="text-xs text-slate-400 mb-3">Things the AI must never include. One per line.</p>
        <textarea value={form.prohibited} onChange={e => set("prohibited", e.target.value)} rows={4} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none" />
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-2">Default Legal Disclaimer</h3>
        <p className="text-xs text-slate-400 mb-3">Appended to every published article when disclaimer is enabled.</p>
        <textarea value={form.legalDisclaimer} onChange={e => set("legalDisclaimer", e.target.value)} rows={3} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff] resize-none" />
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
        <Save className="w-4 h-4" />
        {saved ? "✓ Saved!" : "Save Base Instructions"}
      </button>
    </div>
  );
}
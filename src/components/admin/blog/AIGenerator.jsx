import React, { useState, useEffect } from "react";
import { Cpu, ChevronRight, ChevronLeft, Sparkles, ArrowRight, Image, RefreshCw, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STEPS = ["Idea Generation", "Article Brief", "Content Enrichment", "CTA Block", "Notes & Instructions"];

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array(total).fill(0).map((_, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center gap-2 ${i <= current ? "text-[#1e90ff]" : "text-slate-600"}`}>
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${i < current ? "bg-[#1e90ff] border-[#1e90ff] text-white" : i === current ? "border-[#1e90ff] text-[#1e90ff]" : "border-slate-600 text-slate-600"}`}>
              {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === current ? "text-white" : ""}`}>{STEPS[i]}</span>
          </div>
          {i < total - 1 && <div className={`flex-1 h-px ${i < current ? "bg-[#1e90ff]" : "bg-white/10"}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 bg-[#0a1628] border border-white/10 rounded-lg p-2 focus-within:border-[#1e90ff] min-h-[42px]">
      {values.map(v => (
        <span key={v} className="flex items-center gap-1 bg-[#1e90ff]/20 text-[#1e90ff] text-xs px-2 py-0.5 rounded-full">
          {v}
          <button onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-white">×</button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => (e.key === "Enter" || e.key === ",") && (e.preventDefault(), add())} placeholder={values.length === 0 ? placeholder : ""} className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none text-xs px-1" />
    </div>
  );
}

function PillGroup({ options, selected, onChange, multi = false }) {
  const toggle = (opt) => {
    if (multi) {
      onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
    } else {
      onChange(opt);
    }
  };
  const isSelected = (opt) => multi ? selected.includes(opt) : selected === opt;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} onClick={() => toggle(opt)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected(opt) ? "bg-[#1e90ff] border-[#1e90ff] text-white" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function AIGenerator({ onGenerated, ctaTemplates, kbDocs }) {
  const [step, setStep] = useState(0);
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [topicInput, setTopicInput] = useState("");

  const [brief, setBrief] = useState({
    title: "", primaryKeyword: "", secondaryKeywords: [],
    format: "Informative Article", audience: [], wordCount: "1500",
    readingLevel: "Standard", tone: "Empathetic", location: "", competitorUrl: ""
  });

  const [enrichment, setEnrichment] = useState({
    faq: true, faqSchema: true, articleSchema: true, toc: true,
    keyTakeaways: true, statsData: true, internalLinks: false,
    aeo: true, midCta: true
  });

  const [cta, setCta] = useState({
    useTemplate: null, headline: "Find Out If You Have a Case — It's Free",
    subtext: "Takes less than 2 minutes. No upfront fees.",
    buttonText: "Start Your Free Claim Check →",
    ctaUrl: "https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Blog-Page&utm_medium={slug}&term={primary_keyword}",
    buttonColor: "#1e90ff", position: "End"
  });

  const [notes, setNotes] = useState({ text: "", selectedKb: [], quickChecks: [] });
  const [generating, setGenerating] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const QUICK_CHECKS = [
    "Do not make specific legal promises or guarantees",
    "Always recommend consulting a qualified attorney",
    "Include a legal disclaimer at the end of the article",
    "Write in first-person plural (we/our) as Check My Claim",
    "Avoid competitor names",
    "Target readers who are unsure if they have a case",
  ];

  const generateIdeas = async () => {
    if (!topicInput) return;
    setIdeasLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 8 blog article ideas for a legal claims matching website (Check My Claim) about: "${topicInput}". 
Return JSON with array of ideas, each with: title, primaryKeyword, searchIntent (Informational/Commercial/Navigational), seoDifficulty (Low/Medium/High), contentAngle (one sentence), estimatedMonthlySearches (number or "Unknown").`,
      response_json_schema: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                primaryKeyword: { type: "string" },
                searchIntent: { type: "string" },
                seoDifficulty: { type: "string" },
                contentAngle: { type: "string" },
                estimatedMonthlySearches: { type: "string" }
              }
            }
          }
        }
      }
    });
    setIdeas(res.ideas || []);
    setIdeasLoading(false);
  };

  const applyIdea = (idea) => {
    setBrief(b => ({ ...b, title: idea.title, primaryKeyword: idea.primaryKeyword }));
    setStep(1);
  };

  const generateImage = async () => {
    setImageLoading(true);
    const prompt = `Professional editorial photography for a legal blog article about "${brief.title || topicInput}". Clean, modern, trustworthy. Suitable for a legal claims website hero image. 16:9 aspect ratio.`;
    const res = await base44.integrations.Core.GenerateImage({ prompt });
    setGeneratedImage({ url: res.url, altText: `${brief.primaryKeyword || brief.title} - Check My Claim`, fileName: `${(brief.primaryKeyword || "legal-claim").toLowerCase().replace(/\s+/g, "-")}-check-my-claim.jpg` });
    setImageLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const kbContext = (kbDocs || []).filter(d => notes.selectedKb.includes(d.id)).map(d => `--- ${d.title} ---\n${d.content}`).join("\n\n");
    const quickNotes = notes.quickChecks.join("\n");
    const allNotes = [notes.text, quickNotes, kbContext].filter(Boolean).join("\n\n");
    const ctaUrl = cta.ctaUrl.replace("{slug}", brief.title.toLowerCase().replace(/\s+/g, "-")).replace("{primary_keyword}", brief.primaryKeyword);

    const prompt = `You are an expert legal content writer for "Check My Claim" (checkmyclaim.co), a legal claims matching service.

Write a complete, SEO-optimised blog article with the following specifications:

TITLE: ${brief.title}
PRIMARY KEYWORD: ${brief.primaryKeyword}
SECONDARY KEYWORDS: ${brief.secondaryKeywords.join(", ")}
FORMAT: ${brief.format}
AUDIENCE: ${brief.audience.join(", ")}
WORD COUNT: ${brief.wordCount} words
READING LEVEL: ${brief.readingLevel}
TONE: ${brief.tone}
LOCATION TARGETING: ${brief.location || "Nationwide US"}
${brief.competitorUrl ? `COMPETITOR URL TO OUTRANK: ${brief.competitorUrl}` : ""}

CONTENT REQUIREMENTS:
${enrichment.keyTakeaways ? "- Include a Key Takeaways box at the top (bulleted summary)" : ""}
${enrichment.toc ? "- Include a Table of Contents after the intro" : ""}
${enrichment.statsData ? "- Cite relevant statistics with source attribution" : ""}
${enrichment.internalLinks ? "- Suggest 3-5 internal link opportunities [LINK: anchor text]" : ""}
${enrichment.aeo ? "- Format for AEO: use question-based H2s, direct answers in first paragraph, entity-rich language, structured lists" : ""}
${enrichment.midCta ? `- Insert a mid-article CTA block with this content: "${cta.headline}" / "${cta.subtext}" / Button: "${cta.buttonText}" → ${ctaUrl}` : ""}
${enrichment.faq ? "- Include a FAQ section with minimum 5 Q&As formatted for featured snippets" : ""}

End the article with a prominent CTA:
Headline: "${cta.headline}"
Subtext: "${cta.subtext}"
Button: "${cta.buttonText}" → ${ctaUrl}

OUTPUT FORMAT: Full HTML article body (use h2, h3, p, ul, ol, blockquote, strong tags).

ADDITIONAL INSTRUCTIONS:
${allNotes || "Write authoritative, empathetic content that builds trust with accident victims."}`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });

    const slug = brief.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-");
    onGenerated({
      title: brief.title,
      slug,
      body: result,
      category: brief.format.includes("Car") ? "Car Accidents" : "Legal Advice",
      authorName: "Check My Claim Team",
      isAIGenerated: true,
      status: "Draft",
      featuredImage: generatedImage?.url || "",
      readTimeMinutes: Math.round(parseInt(brief.wordCount) / 200),
      seoTitle: `${brief.title} | Check My Claim`,
      metaDescription: `${brief.title}. Expert legal guidance for accident victims. Check My Claim connects you with top-rated attorneys. No win, no fee.`,
      focusKeyword: brief.primaryKeyword,
    });
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <StepIndicator current={step} total={5} />

      {/* Step 0: Idea Generation */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">What do you want to write about?</h3>
            <p className="text-slate-400 text-sm mb-4">Describe your topic or niche, and we'll generate article ideas with keyword data.</p>
            <textarea
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              rows={4}
              placeholder="Describe your topic, niche, or a rough idea. e.g. 'car accident claims in Florida', 'what to do after a slip and fall', 'how insurance companies lowball settlements'..."
              className="w-full bg-[#0a1628] border border-white/15 rounded-xl px-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none text-base"
            />
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <button onClick={generateIdeas} disabled={!topicInput || ideasLoading} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all">
              {ideasLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {ideasLoading ? "Generating Ideas…" : "💡 Generate Article Ideas"}
            </button>
            <button onClick={() => setStep(1)} className="text-sm text-[#1e90ff] hover:underline">I already have a title — skip to brief →</button>
          </div>

          {ideas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Choose an idea to build from:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ideas.map((idea, i) => (
                  <div key={i} className="bg-[#0a1628] border border-white/10 rounded-xl p-4 hover:border-[#1e90ff]/40 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="text-sm font-bold text-white leading-snug">{idea.title}</h5>
                      <button onClick={() => applyIdea(idea)} className="flex-shrink-0 flex items-center gap-1 text-xs bg-[#1e90ff]/20 text-[#1e90ff] border border-[#1e90ff]/30 px-2 py-1 rounded-lg hover:bg-[#1e90ff]/30 transition-all font-semibold whitespace-nowrap">
                        Use <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs text-[#1e90ff] mb-1 font-mono">🔑 {idea.primaryKeyword}</div>
                    <p className="text-xs text-slate-400 mb-2">{idea.contentAngle}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded">{idea.searchIntent}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${idea.seoDifficulty === "Low" ? "bg-green-500/10 text-green-400" : idea.seoDifficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>{idea.seoDifficulty} difficulty</span>
                      {idea.estimatedMonthlySearches && <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">~{idea.estimatedMonthlySearches}/mo</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Brief */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-1">Article Brief</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Article Title *</label>
              <input value={brief.title} onChange={e => setBrief(b => ({ ...b, title: e.target.value }))} placeholder="e.g. How to File a Car Accident Claim in California" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Primary Target Keyword *</label>
              <input value={brief.primaryKeyword} onChange={e => setBrief(b => ({ ...b, primaryKeyword: e.target.value }))} placeholder="e.g. car accident claim California" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Secondary / LSI Keywords <span className="text-slate-600">(press Enter or comma to add)</span></label>
              <TagInput values={brief.secondaryKeywords} onChange={v => setBrief(b => ({ ...b, secondaryKeywords: v }))} placeholder="Type keyword + Enter…" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Content Format</label>
            <PillGroup options={["Informative Article", "How-To Guide", "Listicle", "FAQ-Led", "News/Update", "Case Study", "Comparison", "Step-by-Step"]} selected={brief.format} onChange={v => setBrief(b => ({ ...b, format: v }))} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Target Audience <span className="text-slate-600">(select all that apply)</span></label>
            <PillGroup options={["Accident Victims", "Families of Victims", "Insurance Claimants", "General Public", "Legal Professionals"]} selected={brief.audience} onChange={v => setBrief(b => ({ ...b, audience: v }))} multi />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Word Count</label>
              <PillGroup options={["600", "1000", "1500", "2000", "2500+"]} selected={brief.wordCount} onChange={v => setBrief(b => ({ ...b, wordCount: v }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Reading Level</label>
              <PillGroup options={["Simple (8th grade)", "Standard", "Professional"]} selected={brief.readingLevel} onChange={v => setBrief(b => ({ ...b, readingLevel: v }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Tone of Voice</label>
              <PillGroup options={["Empathetic", "Authoritative", "Conversational", "Urgent", "Neutral"]} selected={brief.tone} onChange={v => setBrief(b => ({ ...b, tone: v }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Location Targeting <span className="text-slate-600">(optional)</span></label>
              <input value={brief.location} onChange={e => setBrief(b => ({ ...b, location: e.target.value }))} placeholder="e.g. California, Florida, Nationwide" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Competitor URL to Outrank <span className="text-slate-600">(optional)</span></label>
              <input value={brief.competitorUrl} onChange={e => setBrief(b => ({ ...b, competitorUrl: e.target.value }))} placeholder="https://competitor.com/their-article" className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Content Enrichment */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-1">Content Enrichment</h3>
          <p className="text-slate-400 text-sm mb-4">Enable optional content features to enhance the article.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "faq", label: "FAQ Section", desc: "Add 5+ Q&As formatted for featured snippets and AEO" },
              { key: "faqSchema", label: "FAQ Schema (JSON-LD)", desc: "Auto-inject FAQ structured data into page <head>" },
              { key: "articleSchema", label: "Article Schema (JSON-LD)", desc: "Inject Article schema with author, date, publisher data" },
              { key: "toc", label: "Table of Contents", desc: "Auto-generated from H2/H3 headings, anchor-linked" },
              { key: "keyTakeaways", label: "Key Takeaways Box", desc: "Bulleted summary box placed at the top of the article" },
              { key: "statsData", label: "Stats & Data Pull", desc: "AI finds and cites relevant statistics inline with source attribution" },
              { key: "internalLinks", label: "Internal Link Suggestions", desc: "AI suggests existing site pages to link to contextually" },
              { key: "aeo", label: "AEO Optimisation Mode", desc: "Formats content so AI engines (ChatGPT, Perplexity, Google SGE) cite this article" },
              { key: "midCta", label: "Mid-Article CTA Block", desc: "Insert a CTA block in the middle of the article body" },
            ].map(item => (
              <div key={item.key} className="flex items-start gap-3 bg-[#0a1628] rounded-xl p-4 border border-white/10">
                <button onClick={() => setEnrichment(e => ({ ...e, [item.key]: !e[item.key] }))} className={`w-10 h-6 rounded-full relative flex-shrink-0 mt-0.5 transition-all ${enrichment[item.key] ? "bg-[#1e90ff]" : "bg-white/10"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${enrichment[item.key] ? "right-0.5" : "left-0.5"}`} />
                </button>
                <div>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: CTA Block */}
      {step === 3 && (
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-white mb-1">Call to Action for This Article</h3>
          {ctaTemplates?.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Choose a saved template:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {ctaTemplates.map(t => (
                  <button key={t.id} onClick={() => { setCta(c => ({ ...c, useTemplate: t.id, headline: t.headline, subtext: t.subtext, buttonText: t.buttonText, ctaUrl: t.ctaUrl, buttonColor: t.buttonColor || "#1e90ff" })); }} className={`text-left p-4 rounded-xl border transition-all ${cta.useTemplate === t.id ? "border-[#1e90ff] bg-[#1e90ff]/10" : "border-white/10 bg-[#0a1628] hover:border-white/20"}`}>
                    <div className="text-sm font-bold text-white mb-1">{t.headline}</div>
                    <div className="text-xs text-slate-400 mb-2">{t.subtext}</div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-lg text-white" style={{ background: t.buttonColor || "#1e90ff" }}>{t.buttonText}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400 text-center">— or create a custom CTA for this post —</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">CTA Headline</label>
              <input value={cta.headline} onChange={e => setCta(c => ({ ...c, headline: e.target.value }))} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">CTA Subtext</label>
              <input value={cta.subtext} onChange={e => setCta(c => ({ ...c, subtext: e.target.value }))} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Button Text</label>
              <input value={cta.buttonText} onChange={e => setCta(c => ({ ...c, buttonText: e.target.value }))} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">CTA URL <span className="text-slate-500">(UTM tokens: {"{slug}"}, {"{primary_keyword}"})</span></label>
              <input value={cta.ctaUrl} onChange={e => setCta(c => ({ ...c, ctaUrl: e.target.value }))} className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-xs text-[#1e90ff] font-mono focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Button Colour</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={cta.buttonColor} onChange={e => setCta(c => ({ ...c, buttonColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                  <input value={cta.buttonColor} onChange={e => setCta(c => ({ ...c, buttonColor: e.target.value }))} className="flex-1 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff] font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">CTA Position</label>
                <PillGroup options={["Top", "Mid-article", "End", "All three"]} selected={cta.position} onChange={v => setCta(c => ({ ...c, position: v }))} />
              </div>
            </div>
          </div>
          {/* Live Preview */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Live Preview:</label>
            <div className="rounded-2xl p-6 text-center bg-gradient-to-r from-[#0C2D5B] to-[#0f1e35] border border-[#1e90ff]/20">
              <div className="text-lg font-bold text-white mb-1">{cta.headline}</div>
              <div className="text-sm text-slate-300 mb-4">{cta.subtext}</div>
              <span className="inline-block px-6 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: cta.buttonColor }}>{cta.buttonText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Notes */}
      {step === 4 && (
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-white mb-1">Additional Instructions for the AI</h3>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Custom Instructions <span className="text-slate-500">(internal only, never published)</span></label>
            <textarea
              value={notes.text}
              onChange={e => setNotes(n => ({ ...n, text: e.target.value }))}
              rows={6}
              placeholder="Add any extra instructions, editorial direction, compliance notes, things to avoid, specific sources to reference, brand voice reminders, legal disclaimers to include, or anything else the AI should know before writing this article. These notes are internal only and will not be published."
              className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Quick-add common instructions:</label>
            <div className="space-y-2">
              {QUICK_CHECKS.map(check => (
                <label key={check} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={notes.quickChecks.includes(check)}
                    onChange={() => setNotes(n => ({ ...n, quickChecks: n.quickChecks.includes(check) ? n.quickChecks.filter(x => x !== check) : [...n.quickChecks, check] }))}
                    className="rounded border-white/20"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{check}</span>
                </label>
              ))}
            </div>
          </div>
          {kbDocs?.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Include context from Knowledge Base:</label>
              <div className="space-y-2">
                {kbDocs.filter(d => d.isActive).map(doc => (
                  <label key={doc.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notes.selectedKb.includes(doc.id)}
                      onChange={() => setNotes(n => ({ ...n, selectedKb: n.selectedKb.includes(doc.id) ? n.selectedKb.filter(x => x !== doc.id) : [...n.selectedKb, doc.id] }))}
                      className="rounded border-white/20"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{doc.title}</span>
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">{doc.docType}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Image Generation */}
          <div className="border-t border-white/10 pt-5">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Image className="w-4 h-4 text-[#1e90ff]" /> Featured Image</h4>
            {generatedImage ? (
              <div className="flex items-start gap-4">
                <img src={generatedImage.url} alt={generatedImage.altText} className="w-32 h-20 object-cover rounded-lg border border-white/10" />
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Alt Text (SEO)</label>
                    <input value={generatedImage.altText} onChange={e => setGeneratedImage(g => ({ ...g, altText: e.target.value }))} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
                  </div>
                  <div className="text-xs text-slate-500">File: {generatedImage.fileName}</div>
                  <button onClick={generateImage} className="flex items-center gap-1 text-xs text-[#1e90ff] hover:underline"><RefreshCw className="w-3 h-3" /> Regenerate</button>
                </div>
              </div>
            ) : (
              <button onClick={generateImage} disabled={imageLoading} className="flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                {imageLoading ? <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" /> : "🎨"}
                {imageLoading ? "Generating image…" : "Generate Featured Image with AI"}
              </button>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !brief.title}
            className="w-full bg-gradient-to-r from-[#1e90ff] to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-base transition-all flex items-center justify-center gap-3 mt-4"
          >
            {generating ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating Article… (this may take ~30 seconds)</>
            ) : (
              <><Cpu className="w-5 h-5" /> 🚀 Generate Article</>
            )}
          </button>
          {generating && <p className="text-xs text-slate-400 text-center">Using Claude Sonnet for highest quality output. This uses additional integration credits.</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {step < 4 && (
          <button onClick={() => setStep(s => Math.min(4, s + 1))} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
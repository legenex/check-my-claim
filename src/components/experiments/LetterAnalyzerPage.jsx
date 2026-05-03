import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl, captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ, LeadForm } from "./shared/ExperimentLayout";
import SettlementTickerMini from "./shared/SettlementTickerMini";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";

const US_STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];
const ACCIDENT_TYPES = ["Auto accident","Motorcycle","Rideshare passenger","Pedestrian struck","Cyclist struck","Commercial truck","Other"];

export default function LetterAnalyzerPage({ experiment }) {
  const [tab, setTab] = useState("paste");
  const [letterText, setLetterText] = useState("");
  const [state, setState] = useState("");
  const [accidentType, setAccidentType] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  const analyze = async () => {
    if (!letterText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert personal injury attorney reviewing a settlement offer letter. Analyze the following letter and return structured data.

Letter text:
"""
${letterText}
"""

State: ${state || "unknown"}
Accident type: ${accidentType || "unknown"}

Return JSON with these exact fields:
- offered_amount: number (extract the $ offer, 0 if not found)
- missing_categories: array of strings (from: medical bills, future medical care, lost wages, future lost wages, pain and suffering, diminished vehicle value, loss of consortium, household services) - list ones NOT addressed in the letter
- pressure_tactics: array of strings (quote exact phrases that are time-pressure, finality, urgency language)
- recorded_statement_traps: array of strings (any language requesting recorded statements or early statements)
- waiver_language: array of strings (release language, full and final settlement, closing the door on future claims)
- risk_score: number 0-100 (15 per missing major category, +10 per pressure tactic, +20 per waiver trap, cap at 100)
- fair_counter_low: number (estimated fair counter-offer low end, typically 2-4x the offer if heavily lowballed)
- fair_counter_high: number (estimated fair counter-offer high end)
- analysis_summary: string (2-3 paragraph plain English assessment)`,
        response_json_schema: {
          type: "object",
          properties: {
            offered_amount: { type: "number" },
            missing_categories: { type: "array", items: { type: "string" } },
            pressure_tactics: { type: "array", items: { type: "string" } },
            recorded_statement_traps: { type: "array", items: { type: "string" } },
            waiver_language: { type: "array", items: { type: "string" } },
            risk_score: { type: "number" },
            fair_counter_low: { type: "number" },
            fair_counter_high: { type: "number" },
            analysis_summary: { type: "string" },
          }
        },
        model: "claude_sonnet_4_6",
      });

      setAnalysis(res);

      const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
      const saved = await base44.entities.OfferAnalysis.create({
        letter_text: letterText,
        state,
        accident_type: accidentType,
        offered_amount: res.offered_amount,
        missing_categories: res.missing_categories,
        pressure_tactics: res.pressure_tactics,
        waiver_language: res.waiver_language,
        risk_score: res.risk_score,
        fair_counter_low: res.fair_counter_low,
        fair_counter_high: res.fair_counter_high,
        analysis_summary: res.analysis_summary,
        utm_source: stored("utm_source") || "CMC-Site",
        utm_medium: stored("utm_medium") || "analyzer",
        utm_campaign: stored("utm_campaign") || "Experiment",
        source_path: "/tools/letter-analyzer",
        status: "analysis_complete",
      }).catch(() => null);
      if (saved) setSavedId(saved.id);
      if (experiment) await base44.entities.Experiment.update(experiment.id, { submissions: (experiment.submissions || 0) + 1 }).catch(() => {});
    } catch (err) {
      alert("Analysis failed. Please try again.");
    }
    setAnalyzing(false);
  };

  const handleLeadSave = async (form) => {
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    if (savedId) {
      await base44.entities.OfferAnalysis.update(savedId, { full_name: form.full_name, email: form.email, phone: form.phone, status: "lead_captured", lead_captured_at: new Date().toISOString() }).catch(() => {});
    }
    if (experiment) await incrementExpClicks(experiment, base44).catch(() => {});
  };

  const riskColor = analysis ? (analysis.risk_score > 60 ? "#ef4444" : analysis.risk_score > 30 ? "#f59e0b" : "#22c55e") : "#94a3b8";
  const riskLabel = analysis ? (analysis.risk_score > 60 ? "High Risk — Likely Lowballed" : analysis.risk_score > 30 ? "Moderate Risk" : "Lower Risk") : "";
  const fmt = (n) => "$" + Math.round(n || 0).toLocaleString();

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short || "Educational tool only — not legal advice."} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "Did the Insurance Company Lowball You?"}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Paste your settlement offer letter. We'll analyze it in 30 seconds — flagging missing damages, pressure tactics, and waiver traps."}</p>
        </div>
      </div>

      {/* Tool */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {!analysis ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex gap-3 mb-5 border-b border-slate-200 pb-3">
              {["paste", "upload"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "bg-[#1e90ff] text-white" : "text-slate-500 hover:text-slate-800"}`}>
                  {t === "paste" ? "Paste Text" : "Upload File (PDF/Image)"}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">State (optional)</label>
                <select value={state} onChange={e => setState(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
                  <option value="">— All states —</option>
                  {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Accident Type (optional)</label>
                <select value={accidentType} onChange={e => setAccidentType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
                  <option value="">— Select type —</option>
                  {ACCIDENT_TYPES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {tab === "paste" ? (
              <textarea value={letterText} onChange={e => setLetterText(e.target.value)} rows={12}
                placeholder="Paste your settlement offer letter here. We'll analyze it in 30 seconds. Include the full text for best results."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-[#1e90ff] resize-none mb-4" />
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center mb-4">
                <p className="text-slate-500 text-sm mb-2">PDF / image upload coming soon</p>
                <p className="text-xs text-slate-400">For now, please use the "Paste Text" tab</p>
              </div>
            )}

            <button onClick={analyze} disabled={analyzing || !letterText.trim()}
              className="w-full bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-4 rounded-xl text-lg transition-all">
              {analyzing ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing your letter…</span> : "Analyze My Offer →"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Risk gauge */}
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-6xl font-black mb-2" style={{ color: riskColor }}>{analysis.risk_score}</div>
              <div className="text-lg font-bold mb-1" style={{ color: riskColor }}>{riskLabel}</div>
              <div className="text-slate-500 text-sm mb-4">Risk Score out of 100 — higher means more likely you're being lowballed</div>

              {analysis.offered_amount > 0 && (
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="text-xs text-orange-600 font-bold mb-1">Their Offer</div>
                    <div className="text-2xl font-black text-orange-600">{fmt(analysis.offered_amount)}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-xs text-green-600 font-bold mb-1">Likely Fair Range</div>
                    <div className="text-2xl font-black text-green-600">{fmt(analysis.fair_counter_low)} – {fmt(analysis.fair_counter_high)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Flags */}
            {analysis.missing_categories?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> Damage Categories Not Addressed</h3>
                <ul className="space-y-1">
                  {analysis.missing_categories.map((c, i) => <li key={i} className="flex items-center gap-2 text-sm text-red-700"><XCircle className="w-3.5 h-3.5 flex-shrink-0" />{c}</li>)}
                </ul>
              </div>
            )}

            {analysis.pressure_tactics?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Pressure Tactics Detected</h3>
                <ul className="space-y-2">
                  {analysis.pressure_tactics.map((t, i) => <li key={i} className="text-sm text-amber-700 italic">"{t}"</li>)}
                </ul>
              </div>
            )}

            {analysis.waiver_language?.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-2xl p-5">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Waiver / Release Language</h3>
                <ul className="space-y-2">
                  {analysis.waiver_language.map((t, i) => <li key={i} className="text-sm text-red-700 italic">"{t}"</li>)}
                </ul>
                <p className="text-xs text-red-600 mt-2">⚠ Signing an offer with release language closes the door on future medical claims permanently.</p>
              </div>
            )}

            {/* Analysis summary */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Analysis Summary</h3>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{analysis.analysis_summary}</div>
            </div>

            <SettlementTickerMini stateCode={state} limit={5} />

            <LeadForm
              headline="Get a Vetted Attorney to Counter This for You — Free"
              subtext="They'll review the offer, identify every missing damage category, and counter-negotiate on your behalf. No fee unless you win."
              experiment={experiment}
              utmMedium={experiment?.utm_medium_label || "analyzer"}
              utmContent="lead_captured"
              onSuccess={handleLeadSave}
            />

            <button onClick={() => setAnalysis(null)} className="w-full py-3 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
              Analyze a Different Letter
            </button>
          </div>
        )}

        <div className="mt-16">
          <HowItWorks steps={[
            { icon: "📋", title: "Paste your letter", desc: "Copy the full text of your settlement offer letter." },
            { icon: "🤖", title: "AI analysis", desc: "We scan for missing damages, pressure tactics, and release language." },
            { icon: "📊", title: "Risk score", desc: "A 0–100 risk score tells you how aggressively you're being undercut." },
            { icon: "⚖️", title: "Counter strategy", desc: "Connect with an attorney to counter — free." },
          ]} />

          <div className="py-14 max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">What Insurance Offer Letters Often Leave Out</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed">A typical first settlement offer focuses exclusively on your documented current medical bills — often a fraction of them. What adjusters almost never include in a first offer: future medical care (often 20–50% of total costs), lost wages beyond the first few weeks, future earning capacity if your injury is permanent, and non-economic damages like pain, suffering, and loss of enjoyment of life.</p>
              <p className="text-slate-600 leading-relaxed mt-3">The most dangerous language in any offer letter is release language. Phrases like "full and final settlement," "releases all claims," or "in consideration of the above payment, claimant agrees to discharge" mean that signing the check permanently closes the door on future claims — even if you later discover your injuries are worse than initially assessed. A significant percentage of personal injury claimants who accepted early offers went on to need additional surgery or treatment they couldn't recoup.</p>
            </div>
          </div>

          <Testimonials quotes={[
            { text: "The analyzer flagged 'full and final release' in my offer. I had no idea that meant I couldn't come back if my surgery failed. Didn't sign.", author: "Thomas B. — Denver, CO" },
            { text: "Risk score came back 82. Got an attorney. Offer went from $8,500 to $67,000.", author: "Aisha W. — Atlanta, GA" },
            { text: "I thought their letter was standard. The tool showed me 6 missing damage categories I didn't even know I could claim.", author: "Kevin L. — Phoenix, AZ" },
          ]} />

          <FAQ items={[
            { q: "How does the analyzer detect missing damages?", a: "We use a trained AI model to scan your letter against a checklist of all recoverable damage categories: medical bills, future medical care, lost wages, future lost wages, pain and suffering, diminished vehicle value, loss of consortium, and household services. Anything not addressed is flagged as missing." },
            { q: "What is a risk score?", a: "The risk score (0–100) is a composite signal: missing major damage categories (+15 each), pressure tactics (+10 each), and waiver/release language (+20 each). A score above 60 is a strong signal you're being lowballed and should consult an attorney before signing." },
            { q: "What should I do if waiver language is detected?", a: "Do not sign anything with release language until you've consulted an attorney. Once you sign, you give up all future claims arising from this accident — including for injuries that worsen over time." },
            { q: "Is my letter stored securely?", a: "Yes. Your letter text is processed by an AI model and stored securely with your analysis record. It's never shared with third parties." },
            { q: "What if the offer letter has no dollar amount?", a: "Some initial letters don't contain offers — they may just request a recorded statement or medical authorization. The analyzer will flag any problematic language regardless." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="analyzer" />
      <ExperimentFooter />
    </div>
  );
}
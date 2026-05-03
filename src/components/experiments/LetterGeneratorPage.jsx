import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ, LeadForm } from "./shared/ExperimentLayout";
import { Copy, Download, CheckCircle } from "lucide-react";

const US_STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];

export default function LetterGeneratorPage({ experiment }) {
  const [form, setForm] = useState({ accident_description: "", incident_date: "", accident_type: "Auto accident", state: "TX", injuries_summary: "", insurance_company: "", offered_amount: "" });
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [leadGated, setLeadGated] = useState(false);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  const generate = async () => {
    if (!form.accident_description || !form.injuries_summary) return;
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional personal injury attorney drafting a response letter on behalf of a claimant.

Accident description: ${form.accident_description}
Incident date: ${form.incident_date}
Accident type: ${form.accident_type}
State: ${form.state}
Injuries: ${form.injuries_summary}
Insurance company: ${form.insurance_company || "the insurance company"}
Their current offer: ${form.offered_amount ? "$" + form.offered_amount : "not provided"}

Write a professional, firm but polite response letter that:
1. Acknowledges receipt of the settlement offer
2. Respectfully declines the offer at this time
3. Requests an itemized written justification for the offered figure
4. Requests confirmation of full policy limits
5. Reserves the right to supplement the claim with future medical costs, lost wages, and non-economic damages
6. States the claimant is actively evaluating attorney representation
7. Requests a 30-day response window
8. Includes a note that any recorded statement will only be provided through legal counsel
9. Does NOT include the claimant's name (leave [CLAIMANT NAME])
10. Does NOT include a specific dollar counter-offer
11. Is 3-4 paragraphs, professional in tone

Format as a complete letter with date, salutation, body, and closing.`,
        model: "claude_sonnet_4_6",
      });

      const letterText = typeof res === "string" ? res : (res?.text || res?.content || JSON.stringify(res));
      setLetter(letterText);

      const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
      const saved = await base44.entities.LetterGenerationRequest.create({
        accident_description: form.accident_description,
        incident_date: form.incident_date,
        accident_type: form.accident_type,
        state: form.state,
        injuries_summary: form.injuries_summary,
        insurance_company: form.insurance_company,
        offered_amount: parseFloat(form.offered_amount) || 0,
        generated_letter: letterText,
        utm_source: stored("utm_source") || "CMC-Site",
        utm_medium: stored("utm_medium") || "letter-gen",
        utm_campaign: stored("utm_campaign") || "Experiment",
        source_path: "/tools/letter-generator",
        status: "generated",
      }).catch(() => null);
      if (saved) setSavedId(saved.id);
      if (experiment) await base44.entities.Experiment.update(experiment.id, { submissions: (experiment.submissions || 0) + 1 }).catch(() => {});
    } catch {
      alert("Generation failed. Please try again.");
    }
    setGenerating(false);
  };

  const copyLetter = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSave = async (formData) => {
    if (savedId) await base44.entities.LetterGenerationRequest.update(savedId, { full_name: formData.full_name, email: formData.email, phone: formData.phone, status: "lead_captured", lead_captured_at: new Date().toISOString() }).catch(() => {});
    if (experiment) await incrementExpClicks(experiment, base44).catch(() => {});
    setLeadGated(true);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short} />

      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "The Response Letter the Insurance Company Doesn't Want You to Send"}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Fill in your details. Get a professionally drafted response letter in 30 seconds — declining the offer and demanding full justification."}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {!letter ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Describe the accident *</label>
                <textarea value={form.accident_description} onChange={e => set("accident_description", e.target.value)} rows={3}
                  placeholder="e.g. I was rear-ended at a red light on March 15th while stopped at an intersection. The other driver ran the light at approximately 40mph."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1e90ff] resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">Incident Date</label>
                  <input type="date" value={form.incident_date} onChange={e => set("incident_date", e.target.value)} max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff] text-sm" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">State</label>
                  <select value={form.state} onChange={e => set("state", e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff] text-sm">
                    {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Describe your injuries *</label>
                <textarea value={form.injuries_summary} onChange={e => set("injuries_summary", e.target.value)} rows={3}
                  placeholder="e.g. Whiplash, cervical strain, herniated disc at C4-C5. Ongoing physical therapy, MRI confirmed disc injury. Missed 3 weeks of work."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#1e90ff] resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">Insurance Company</label>
                  <input value={form.insurance_company} onChange={e => set("insurance_company", e.target.value)} placeholder="e.g. State Farm, Geico, Allstate"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff] text-sm" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">Their Offer Amount (if any)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input type="number" value={form.offered_amount} onChange={e => set("offered_amount", e.target.value)} placeholder="0"
                      className="w-full pl-7 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff] text-sm" />
                  </div>
                </div>
              </div>
              <button onClick={generate} disabled={generating || !form.accident_description || !form.injuries_summary}
                className="w-full bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-4 rounded-xl text-lg transition-all">
                {generating ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Drafting your letter…</span> : "Generate My Response Letter →"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Your Response Letter</h2>
                <div className="flex gap-2">
                  <button onClick={copyLetter} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-serif text-slate-800 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                {letter.replace("[CLAIMANT NAME]", "[Your Name]")}
              </pre>
              <p className="text-xs text-slate-400 mt-3">Replace [Your Name] with your actual name before sending. Consider having an attorney review before sending.</p>
            </div>

            {!leadGated && (
              <LeadForm
                headline="Have an Attorney Review This Letter Before You Send It — Free"
                subtext="A vetted attorney will review your letter, strengthen it with case-specific details, and connect you with full representation if appropriate."
                experiment={experiment}
                utmMedium={experiment?.utm_medium_label || "letter-gen"}
                utmContent="lead_captured"
                onSuccess={handleLeadSave}
              />
            )}

            <button onClick={() => { setLetter(""); setForm(f => ({ ...f, accident_description: "", injuries_summary: "", offered_amount: "" })); }} className="w-full py-3 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 text-sm font-medium">
              Generate a Different Letter
            </button>
          </div>
        )}

        <div className="mt-16">
          <HowItWorks steps={[
            { icon: "📝", title: "Fill in your details", desc: "Accident description, injuries, and the current offer." },
            { icon: "🤖", title: "AI drafts your letter", desc: "Professional, firm tone that preserves your legal rights." },
            { icon: "📋", title: "Copy and send", desc: "Or have an attorney review it first — free." },
            { icon: "⏰", title: "Set a 30-day deadline", desc: "The letter requests insurer response within 30 days." },
          ]} />

          <div className="py-14 max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">When to Send This Letter — and When Not To</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-bold text-green-800 mb-2">Send if:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ You've received a written settlement offer</li>
                  <li>✓ You believe the offer is low</li>
                  <li>✓ You haven't signed anything</li>
                  <li>✓ You're still in treatment</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <h3 className="font-bold text-red-800 mb-2">Don't send if:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>✗ You've already signed a release</li>
                  <li>✗ You're represented by an attorney (let them handle it)</li>
                  <li>✗ The SOL is less than 30 days away (get an attorney immediately)</li>
                </ul>
              </div>
            </div>
          </div>

          <Testimonials quotes={[
            { text: "Sent the letter. Got a callback within a week. Offer went from $6,000 to $41,000 after my attorney took over.", author: "James K. — Columbus, OH" },
            { text: "The letter bought me 30 days to find an attorney. That's exactly what I needed.", author: "Priya S. — Los Angeles, CA" },
            { text: "I didn't know I could ask for policy limit disclosure. The letter did that automatically.", author: "Brian M. — Charlotte, NC" },
          ]} />

          <FAQ items={[
            { q: "Will sending this letter make the insurer angry?", a: "No. Declining an offer in writing is completely standard. Insurance adjusters expect counter-negotiation. A professional letter actually signals that you understand your rights — which is often enough to improve the offer immediately." },
            { q: "Should I modify the letter?", a: "Yes — at minimum, replace [Your Name] with your name. Add your address, claim number, and contact information. Do not add the dollar amount you want — that's a counter-offer, which requires more careful consideration." },
            { q: "Does this create an attorney-client relationship?", a: "No. This is an AI-drafted template for informational purposes. It does not create any legal relationship. For full representation, connect with a vetted attorney." },
            { q: "Can I send this via email?", a: "Yes, but also send a hard copy via certified mail with return receipt requested. This creates a paper trail that's admissible in court if needed." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="letter-gen" />
      <ExperimentFooter />
    </div>
  );
}
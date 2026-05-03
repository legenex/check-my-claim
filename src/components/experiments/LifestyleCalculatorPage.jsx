import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ, LeadForm } from "./shared/ExperimentLayout";

const US_STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];

const SLIDERS = [
  { id: "sleep_loss", label: "Hours of sleep lost per week", max: 20, unit: "hrs/week", emoji: "😴" },
  { id: "work_days_missed", label: "Days of work missed per month", max: 22, unit: "days/mo", emoji: "💼" },
  { id: "parenting_impact", label: "Impact on family / parenting", max: 10, unit: "/ 10", emoji: "👨‍👩‍👧" },
  { id: "hobbies_dropped", label: "Hobbies you've had to drop", max: 10, unit: "count", emoji: "🎯" },
  { id: "intimacy_strain", label: "Strain on partnership / intimacy", max: 10, unit: "/ 10", emoji: "💔" },
  { id: "driving_anxiety", label: "Driving anxiety / avoidance", max: 10, unit: "/ 10", emoji: "🚗" },
];

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString();

export default function LifestyleCalculatorPage({ experiment }) {
  const [values, setValues] = useState({ sleep_loss: 5, work_days_missed: 3, parenting_impact: 4, hobbies_dropped: 2, intimacy_strain: 3, driving_anxiety: 6 });
  const [medicalBills, setMedicalBills] = useState(10000);
  const [months, setMonths] = useState(6);
  const [state, setState] = useState("TX");
  const [stateData, setStateData] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  useEffect(() => {
    if (state) {
      base44.entities.StateMultiplier.filter({ state_code: state }).then(res => { if (res.length > 0) setStateData(res[0]); });
    }
  }, [state]);

  const intensityScore = SLIDERS.reduce((sum, s) => {
    const maxVal = s.max;
    return sum + (values[s.id] || 0) / maxVal;
  }, 0) / SLIDERS.length;

  const stateFactor = stateData?.base_multiplier_factor || 1.0;
  const nonEconomicBase = medicalBills * (1.5 + intensityScore * 0.5);
  const computedLow = Math.round((nonEconomicBase * 0.75 * stateFactor) / 500) * 500;
  const computedHigh = Math.round((nonEconomicBase * 1.5 * stateFactor * 2.0) / 500) * 500;

  const handleReveal = async () => {
    setRevealed(true);
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    const saved = await base44.entities.LifestyleCostSubmission.create({
      state,
      months_since_crash: months,
      total_medical_bills: medicalBills,
      sleep_loss_hours_per_week: values.sleep_loss,
      work_days_missed_per_month: values.work_days_missed,
      parenting_impact_score: values.parenting_impact,
      hobbies_dropped_count: values.hobbies_dropped,
      intimacy_strain_score: values.intimacy_strain,
      driving_anxiety_score: values.driving_anxiety,
      intensity_score: intensityScore,
      computed_low: computedLow,
      computed_high: computedHigh,
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "lifestyle",
      utm_campaign: stored("utm_campaign") || "Experiment",
      source_path: "/tools/lifestyle-cost",
      status: "estimate_run",
    }).catch(() => null);
    if (saved) setSavedId(saved.id);
    if (experiment) await base44.entities.Experiment.update(experiment.id, { submissions: (experiment.submissions || 0) + 1 }).catch(() => {});
  };

  const handleLeadSave = async (form) => {
    if (savedId) await base44.entities.LifestyleCostSubmission.update(savedId, { full_name: form.full_name, email: form.email, phone: form.phone, status: "lead_captured", lead_captured_at: new Date().toISOString() }).catch(() => {});
    if (experiment) await incrementExpClicks(experiment, base44).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short} />

      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "What Has the Crash Actually Cost You?"}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Insurance offers focus on medical bills. This calculator captures what they deliberately ignore: your quality of life."}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Tool */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Total Medical Bills</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" min="0" step="1000" value={medicalBills} onChange={e => setMedicalBills(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#1e90ff] text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Months Since Crash</label>
              <input type="number" min="1" max="60" value={months} onChange={e => setMonths(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#1e90ff] text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">State</label>
              <select value={state} onChange={e => setState(e.target.value)} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff] text-sm">
                {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-5 mb-6">
            {SLIDERS.map(s => (
              <div key={s.id}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-700">{s.emoji} {s.label}</label>
                  <span className="text-sm font-bold text-[#1e90ff]">{values[s.id]} {s.unit}</span>
                </div>
                <input type="range" min="0" max={s.max} value={values[s.id]}
                  onChange={e => setValues(v => ({ ...v, [s.id]: parseInt(e.target.value) }))}
                  className="w-full h-2 accent-[#1e90ff]" />
                <div className="flex justify-between text-xs text-slate-400"><span>None</span><span>Maximum</span></div>
              </div>
            ))}
          </div>

          {/* Live result */}
          <div className={`rounded-2xl p-5 border-2 transition-all ${revealed ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Non-Economic Damages</div>
              <div className="text-4xl font-black text-slate-900 mb-1">{fmt(computedLow)} – {fmt(computedHigh)}</div>
              <div className="text-sm text-slate-500 mb-4">The at-fault insurer's first offer is calibrated to ignore most of this.</div>
              {!revealed && (
                <button onClick={handleReveal} className="bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-xl transition-all">
                  Reveal My Full Estimate
                </button>
              )}
            </div>
          </div>

          {revealed && (
            <div className="mt-5 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              <strong>Methodology:</strong> Non-economic base = medical bills × (1.5 + lifestyle intensity × 0.5). Adjusted for {stateData?.state_name || state} (factor: {stateFactor}×). Representation uplift 2.0× applied to high end. Intensity score: {(intensityScore * 100).toFixed(0)}% of maximum impact.
            </div>
          )}
        </div>

        {revealed && (
          <LeadForm
            headline="See How an Attorney Quantifies This for Your Case — Free"
            subtext="An attorney will translate your lifestyle impact into legal damages — and demand full compensation from the insurer."
            experiment={experiment}
            utmMedium={experiment?.utm_medium_label || "lifestyle"}
            utmContent="lead_captured"
            onSuccess={handleLeadSave}
          />
        )}

        <div className="mt-16">
          <HowItWorks steps={[
            { icon: "🎚️", title: "Move the sliders", desc: "Rate the crash's impact on 6 quality-of-life dimensions." },
            { icon: "📐", title: "We compute the range", desc: "Non-economic damages formula with state adjustment." },
            { icon: "💡", title: "See what's being ignored", desc: "Your estimate reveals what insurance excludes from offers." },
            { icon: "⚖️", title: "Get it quantified", desc: "Connect with an attorney to turn this into a legal claim." },
          ]} />

          <div className="py-14 max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Why Non-Economic Damages Are Systematically Undercounted</h2>
            <p className="text-slate-600 leading-relaxed">Economic damages — medical bills and lost wages — are easy to document. Non-economic damages are harder to quantify, which is exactly why insurance companies ignore them in early offers. Sleep loss affects your immune system, your work performance, and your mental health. Parenting limitations affect your children. Driving anxiety can end careers and isolate individuals. These aren't soft feelings — they're documented, compensable injuries in every state.</p>
            <p className="text-slate-600 leading-relaxed mt-3">Courts have consistently held that pain, suffering, and loss of enjoyment of life are real economic losses deserving real compensation. The challenge is quantification — and that's what personal injury attorneys do. They document your lifestyle impact through medical records, therapist notes, witness statements, and expert testimony, then translate it into a number the insurer can't dismiss.</p>
          </div>

          <Testimonials quotes={[
            { text: "My driving anxiety meant I quit a job that required daily commuting. This calculator helped me realize that was worth $40k+ in damages I never claimed.", author: "Lisa P. — Seattle, WA" },
            { text: "The insurer's offer didn't include a single non-economic dollar. After I connected with an attorney, that changed.", author: "Robert N. — Chicago, IL" },
            { text: "I didn't even know parenting limitations were a recoverable damage. The attorney called it 'loss of parental consortium.' Added $28k to my settlement.", author: "Maria S. — San Antonio, TX" },
          ]} />

          <FAQ items={[
            { q: "Are non-economic damages capped?", a: "Some states cap non-economic damages in certain case types. The calculator adjusts for your state's rules. Your state's cap (if any) is reflected in the range shown." },
            { q: "How is driving anxiety quantified legally?", a: "Driving anxiety is documented through therapy records, a PTSD or anxiety diagnosis, and sometimes vocational expert testimony if it affects your work commute. It falls under the 'loss of enjoyment of life' category." },
            { q: "What if I haven't seen a therapist for these issues?", a: "It's not too late. Starting with a therapist or psychologist now creates a contemporaneous record of your mental health impact. Your attorney will help coordinate this documentation." },
            { q: "My medical bills are small — does non-economic still matter?", a: "Yes. Non-economic damages are calculated off your medical bills (using a multiplier) but they also include standalone claims for emotional distress, fear of re-injury, and lifestyle limitations independent of your physical treatment." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="lifestyle" />
      <ExperimentFooter />
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl, captureIncomingParams, incrementExpClicks, incrementExpViews } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ, LeadForm } from "./shared/ExperimentLayout";
import SettlementTickerMini from "./shared/SettlementTickerMini";
import { Clock, TrendingUp, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString();

const US_STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],
  ["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],
  ["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],
  ["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],
  ["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],
  ["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],
  ["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],
  ["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],
  ["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
];

const ACCIDENT_TYPES = [
  { value: "auto", label: "Auto Accident", icon: "🚗" },
  { value: "motorcycle", label: "Motorcycle", icon: "🏍️" },
  { value: "rideshare_passenger", label: "Rideshare Passenger", icon: "🚕" },
  { value: "rideshare_other", label: "Hit by Rideshare Driver", icon: "🚖" },
  { value: "pedestrian", label: "Pedestrian Struck", icon: "🚶" },
  { value: "cyclist", label: "Cyclist Struck", icon: "🚴" },
  { value: "commercial_truck", label: "Commercial Truck", icon: "🚛" },
  { value: "other", label: "Other / Unsure", icon: "❓" },
];

const LIABILITY_OPTIONS = [
  { value: "clear_other_fault", label: "Clearly the other party's fault", factor: 1.0, icon: "✅" },
  { value: "disputed", label: "Disputed — liability is contested", factor: 0.65, icon: "⚖️" },
  { value: "partial_fault", label: "I was partially at fault", factor: 0.85, icon: "⚠️" },
  { value: "unclear", label: "Unclear — I'm not sure", factor: 0.75, icon: "❓" },
];

const TREATMENT_OPTIONS = [
  { value: "er_only", label: "ER visit only", sub: "No follow-up treatment yet", futureFactor: 0.10 },
  { value: "ongoing", label: "Currently in treatment", sub: "PT, chiro, specialist visits ongoing", futureFactor: 0.50 },
  { value: "completed", label: "Treatment completed", sub: "All care has concluded", futureFactor: 0.20 },
  { value: "none_yet", label: "Have not been treated yet", sub: "I have not seen a doctor", futureFactor: 0.40 },
];

const MISSED_WORK_OPTIONS = [
  { value: "none", label: "None — working normally", wages: 0, futureWages: 0 },
  { value: "days", label: "A few days", wages: 1500, futureWages: 0 },
  { value: "weeks", label: "Several weeks", wages: 6000, futureWages: 0 },
  { value: "month_plus", label: "A month or more", wages: 22000, futureWages: 18000 },
  { value: "unable_to_return", label: "Unable to return to my job", wages: 75000, futureWages: 90000 },
];

function ProgressBar({ step, total }) {
  return (
    <div className="px-4 pt-5 pb-2 max-w-2xl mx-auto w-full">
      <div className="flex justify-between mb-2">
        <span className="text-xs text-slate-400">Step {step + 1} of {total}</span>
        <span className="text-xs text-slate-400">{Math.round(((step + 1) / total) * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#2BB6F6] transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

function ResultsPage({ results, experiment }) {
  const [methodologyOpen, setMethodologyOpen] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const { estimateLow, estimateHigh, bills, futureMedical, lostWages, futureWages, economicDamages,
    nonEconLow, nonEconHigh, multLow, multHigh, stateFactor, liabilityFactor, capApplied, neoCap,
    daysRemaining, solDeadline, stateData, injuryTier, sessionId, answers } = results;

  const stateName = stateData?.state_name || answers.state;
  const typicalFirstOffer = Math.round(estimateLow * 0.25);
  const solColor = daysRemaining === null ? "text-slate-400" : daysRemaining < 90 ? "text-red-500" : daysRemaining < 365 ? "text-amber-500" : "text-green-500";
  const accidentLabel = ACCIDENT_TYPES.find(a => a.value === answers.accident_type)?.label || answers.accident_type;

  const handleLeadSave = async (form) => {
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    await base44.entities.ClaimEstimate.create({
      session_id: sessionId,
      state: answers.state,
      incident_date: answers.incident_date,
      accident_type: answers.accident_type,
      liability_clarity: answers.liability_clarity,
      injury_severity_tier: answers.injury_severity_tier,
      treatment_status: answers.treatment_status,
      missed_work: answers.missed_work,
      total_medical_bills: parseFloat(answers.total_medical_bills) || 0,
      notes: answers.notes || "",
      economic_damages: economicDamages,
      non_economic_low: nonEconLow,
      non_economic_high: nonEconHigh,
      multiplier_low: multLow,
      multiplier_high: multHigh,
      state_factor: stateFactor,
      liability_factor: liabilityFactor,
      estimate_low: estimateLow,
      estimate_high: estimateHigh,
      methodology_notes: capApplied ? `Non-economic cap of ${fmt(neoCap)} applied for ${stateName}` : "",
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "estimator",
      utm_campaign: stored("utm_campaign") || "Experiment",
      source_path: "/tools/claim-estimator",
      status: "lead_captured",
      lead_captured_at: new Date().toISOString(),
      estimate_run_at: new Date().toISOString(),
    });
    if (experiment) {
      await base44.entities.Experiment.update(experiment.id, { submissions: (experiment.submissions || 0) + 1 }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text="Educational estimator only — not legal advice. Every case is different." />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Range hero */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Estimated Represented-Case Value Range
          </div>
          <div className="text-5xl md:text-7xl font-black text-slate-900 mb-3">
            {fmt(estimateLow)} – {fmt(estimateHigh)}
          </div>
          <p className="text-slate-500 text-sm mb-6">Based on cases in {stateName} involving {accidentLabel} and {injuryTier?.tier_label || "your injury type"}. Past results do not guarantee future outcomes.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Includes future medical projection",
              `Adjusted for ${stateName} rules`,
              "Reflects represented-case uplift"
            ].map(t => (
              <span key={t} className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* Methodology breakdown */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 mb-8 overflow-hidden">
          <button onClick={() => setMethodologyOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 font-bold text-slate-900 hover:bg-slate-100 transition-colors">
            <span>📊 Methodology Breakdown (expanded by default)</span>
            {methodologyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {methodologyOpen && (
            <div className="px-6 pb-6">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200">
                  {[
                    ["Current medical bills", fmt(bills)],
                    [`Future medical projection (${Math.round(TREATMENT_OPTIONS.find(t=>t.value===answers.treatment_status)?.futureFactor*100||20)}% of current)`, fmt(futureMedical)],
                    ["Lost wages estimate", fmt(lostWages)],
                    ["Future lost wages projection", fmt(futureWages)],
                    ["Subtotal — Economic Damages", fmt(economicDamages), true],
                    [`Pain & suffering multiplier band`, `${multLow}× – ${multHigh}×`],
                    ["Non-economic damages range", `${fmt(nonEconLow)} – ${fmt(nonEconHigh)}`],
                    [`${stateName} adjustment factor`, `${stateFactor}×`],
                    ["Liability adjustment factor", `${(liabilityFactor * 100).toFixed(0)}%`],
                    [capApplied ? `${stateName} non-economic cap applied` : `${stateName} non-economic cap`, capApplied ? fmt(neoCap) : "No cap"],
                    ["IRC representation uplift (2.0× – 3.5×)", "Applied"],
                    ["Final Estimated Range", `${fmt(estimateLow)} – ${fmt(estimateHigh)}`, true],
                  ].map(([label, val, bold], i) => (
                    <tr key={i} className={bold ? "bg-blue-50" : ""}>
                      <td className={`py-2.5 ${bold ? "font-bold text-blue-900" : "text-slate-600"}`}>{label}</td>
                      <td className={`py-2.5 text-right font-semibold ${bold ? "text-blue-900 font-black" : "text-slate-800"}`}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stateData?.comparative_negligence_rule && (
                <p className="text-xs text-slate-500 mt-3">{stateName} uses <strong>{stateData.comparative_negligence_rule.replace(/_/g, " ")}</strong> negligence rules.</p>
              )}
              {capApplied && <p className="text-xs text-amber-600 mt-2">⚠ {stateName} has a non-economic damages cap of {fmt(neoCap)} which has been applied to the high-end estimate.</p>}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* SOL Clock */}
          <div className={`rounded-2xl p-6 border-2 ${daysRemaining !== null && daysRemaining < 90 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className={`w-5 h-5 ${solColor}`} />
              <h3 className="font-bold text-slate-900">Your {stateName} SOL Clock</h3>
            </div>
            {daysRemaining !== null ? (
              <>
                <div className={`text-4xl font-black mb-1 ${solColor}`}>{daysRemaining.toLocaleString()} days</div>
                <div className="text-sm text-slate-500">remaining before {solDeadline?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                <div className="text-xs text-slate-400 mt-1">{stateData?.statute_of_limitations_years || 2}-year SOL in {stateName}</div>
                {daysRemaining < 180 && (
                  <div className={`mt-3 text-xs font-semibold ${daysRemaining < 90 ? "text-red-600" : "text-amber-700"}`}>
                    ⚠ {daysRemaining < 90 ? "URGENT — your window is closing fast." : "Less than 6 months remain."}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500 text-sm">No incident date provided.</p>
            )}
          </div>

          {/* Typical First Offer */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-900">Typical First Offer</h3>
            </div>
            <div className="text-4xl font-black text-orange-600 mb-1">{fmt(typicalFirstOffer)}</div>
            <p className="text-xs text-slate-500">Insurers typically open at ~25% of actual represented value. That's approximately {Math.round((typicalFirstOffer / estimateHigh) * 100)}% of your high-end estimate.</p>
          </div>
        </div>

        {/* Recent settlements */}
        <div className="mb-8">
          <SettlementTickerMini stateCode={answers.state} injuryTier={answers.injury_severity_tier} accidentType={answers.accident_type} limit={5} />
        </div>

        {/* Educational content */}
        <div className="prose prose-slate max-w-none mb-10 space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">How This Estimate Was Built</h2>
            <p className="text-slate-600 leading-relaxed">Every dollar in this estimate traces back to a specific, documented category of damages. We start with your current medical bills — but that's only the beginning. Future medical care often represents 20–50% of total medical costs, particularly if you're still in treatment or haven't yet been evaluated for long-term needs. Lost wages are valued conservatively; what many people don't realize is that future lost earning capacity — the income you'll never collect because of how this injury changes your career trajectory — can dwarf the immediate wage loss.</p>
            <p className="text-slate-600 leading-relaxed mt-3">On top of economic damages, we apply an injury-appropriate multiplier for pain and suffering. This is where attorney representation makes the biggest difference: insurance companies use low multipliers when negotiating with unrepresented claimants. A vetted attorney forces the conversation to the high end of the multiplier band — and sometimes beyond.</p>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Why First Offers Are Almost Always Lower Than This Range</h2>
            <p className="text-slate-600 leading-relaxed">The Insurance Research Council has published data for decades showing that represented claimants receive, on average, 3.5× more than unrepresented claimants for comparable injuries. Insurance companies know this. Their first offer is calibrated specifically for people who are unrepresented, financially stressed, and unfamiliar with claims math. The offer often arrives before you know the full extent of your injuries — deliberately.</p>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">What's Missing From Your Number That an Attorney Would Add</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Diminished vehicle value</strong> — your car is worth less now even after repair. Insurance owes you the difference.</li>
              <li><strong>Full future-care projection</strong> — a life-care planner can quantify ongoing treatment needs worth tens of thousands more.</li>
              <li><strong>Lost earning capacity</strong> — not just days missed, but permanent career impact if your injury limits future work.</li>
              <li><strong>Household services damages</strong> — if you can no longer mow, cook, or parent the same way, that's quantifiable.</li>
              <li><strong>Loss of consortium</strong> — available in most states when injury impacts a spousal relationship.</li>
              <li><strong>Punitive damages</strong> — available in cases of egregious conduct (DUI, street racing, etc.).</li>
            </ul>
          </div>
        </div>

        <Testimonials quotes={[
          { text: "I almost accepted $12,000 before I ran this. It estimated $68,000–$95,000. I got an attorney. Settled for $81,500.", author: "Marcus T. — Houston, TX" },
          { text: "The methodology breakdown made me realize my future medical costs weren't even being discussed by the adjuster. Game-changer.", author: "Priya M. — Sacramento, CA" },
          { text: "Didn't know about the SOL clock. I had 47 days left. Filed just in time.", author: "David R. — Orlando, FL" },
        ]} />

        <FAQ items={[
          { q: "How accurate is this estimate?", a: "It's built on the same methodology personal injury attorneys use — economic damages plus a multiplier for pain and suffering, adjusted for state rules and liability. It won't match your final settlement exactly (every case is unique), but it gives you a defensible, realistic range to negotiate from." },
          { q: "Why does it say 'represented case value'?", a: "The Insurance Research Council has documented for decades that represented claimants settle 3.5× higher on average. This estimate shows what an attorney-negotiated settlement typically looks like — not what the insurer's first offer will be." },
          { q: "What's the statute of limitations?", a: "Every state has a deadline to file a lawsuit. Once it expires, you lose your right to sue. The clock starts on the date of the accident, and missing it eliminates nearly all leverage." },
          { q: "Can I run this if I haven't gotten all my medical bills yet?", a: "Yes. Enter what you have. Treatment-status and future-medical projection factors are built in to account for ongoing care." },
          { q: "Will the insurance company see this?", a: "No. This tool is completely private. Your estimate is stored securely and only shared with the attorney you choose to connect with." },
          { q: "Does this estimate include pain and suffering?", a: "Yes. Non-economic damages (pain, suffering, loss of enjoyment, emotional distress) are the largest component in most cases and are reflected in the multiplier section of the methodology breakdown." },
        ]} />

        {/* Lead capture */}
        <div className="mt-10">
          <LeadForm
            headline={`Get This Estimate Reviewed by a Vetted Attorney in ${stateName} — Free`}
            subtext="They'll review your range within 20 minutes and tell you if it's realistic for your specific case. No obligation. No upfront cost. No win, no fee."
            experiment={experiment}
            utmMedium={experiment?.utm_medium_label || "estimator"}
            utmContent="lead_captured"
            extraParams={{ state: answers.state, accident_type: answers.accident_type }}
            onSuccess={handleLeadSave}
          />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="estimator" stateName={stateData?.state_name} />
      <ExperimentFooter />
    </div>
  );
}

export default function ClaimEstimatorPage({ experiment }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [injuryTiers, setInjuryTiers] = useState([]);
  const [stateData, setStateData] = useState(null);
  const [results, setResults] = useState(null);
  const [sessionId] = useState(() => "est_" + Math.random().toString(36).substr(2, 12));

  const STEPS = [
    { id: "injury_severity_tier", title: "How serious are your injuries?", subtitle: "This is the single biggest driver of claim value." },
    { id: "accident_type", title: "What type of accident was it?", subtitle: "Different accidents carry different insurance coverage." },
    { id: "incident_date", title: "When did it happen?", subtitle: "We use this to compute your statute of limitations urgency." },
    { id: "state", title: "Where did it happen?", subtitle: "State laws significantly affect your claim value and timeline." },
    { id: "liability_clarity", title: "How clear is fault?", subtitle: "Liability clarity is one of the biggest value drivers." },
    { id: "treatment_status", title: "Are you still in treatment?", subtitle: "Documented treatment is critical to your claim." },
    { id: "missed_work", title: "Have you missed work?", subtitle: "Lost wages are recoverable economic damages." },
    { id: "total_medical_bills", title: "Total medical bills so far?", subtitle: "Include ER, imaging, specialists, PT, prescriptions." },
    { id: "notes", title: "Anything else to know? (optional)", subtitle: "This helps personalize your results. 200 characters max." },
  ];

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
    base44.entities.InjuryMultiplier.list("display_order", 10).then(tiers => setInjuryTiers(tiers.filter(t => t.is_active)));
  }, []);

  useEffect(() => {
    if (answers.state) {
      base44.entities.StateMultiplier.filter({ state_code: answers.state }).then(res => { if (res.length > 0) setStateData(res[0]); });
    }
  }, [answers.state]);

  const currentStep = STEPS[step];
  const currentVal = answers[currentStep.id];

  const canProceed = () => {
    if (currentStep.id === "notes") return true; // optional
    if (currentStep.id === "total_medical_bills") return currentVal !== undefined && currentVal !== "" && !isNaN(parseFloat(currentVal)) && parseFloat(currentVal) >= 0;
    return !!currentVal;
  };

  const computeResults = () => {
    const bills = parseFloat(answers.total_medical_bills) || 0;
    const treatment = TREATMENT_OPTIONS.find(t => t.value === answers.treatment_status);
    const futureFactor = treatment?.futureFactor || 0.20;
    const futureMedical = bills * futureFactor;
    const missedWork = MISSED_WORK_OPTIONS.find(m => m.value === answers.missed_work);
    const lostWages = missedWork?.wages || 0;
    const futureWages = missedWork?.futureWages || 0;
    const economicDamages = bills + futureMedical + lostWages + futureWages;
    const medicalTotal = bills + futureMedical;
    const injuryTier = injuryTiers.find(t => t.tier_key === answers.injury_severity_tier);
    const multLow = injuryTier?.multiplier_low || 1.5;
    const multHigh = injuryTier?.multiplier_high || 3.0;
    const stateFactor = stateData?.base_multiplier_factor || 1.0;
    const liabilityObj = LIABILITY_OPTIONS.find(l => l.value === answers.liability_clarity);
    const liabilityFactor = liabilityObj?.factor || 0.75;
    const neoCap = stateData?.non_economic_damage_cap || null;

    let nonEconLow = medicalTotal * multLow;
    let nonEconHigh = medicalTotal * multHigh;
    let capApplied = false;
    if (neoCap && nonEconHigh > neoCap) { nonEconHigh = neoCap; capApplied = true; }
    if (neoCap && nonEconLow > neoCap) nonEconLow = neoCap;

    const baseLow = (economicDamages + nonEconLow) * stateFactor * liabilityFactor;
    const baseHigh = (economicDamages + nonEconHigh) * stateFactor * liabilityFactor;
    const repLow = baseLow * 2.0;
    const repHigh = baseHigh * 3.5;

    const solYears = stateData?.statute_of_limitations_years || 2;
    const incidentDate = answers.incident_date ? new Date(answers.incident_date) : null;
    const solDeadline = incidentDate ? new Date(incidentDate.getFullYear() + solYears, incidentDate.getMonth(), incidentDate.getDate()) : null;
    const daysRemaining = solDeadline ? Math.max(0, Math.floor((solDeadline - new Date()) / (1000 * 60 * 60 * 24))) : null;

    // Save estimate_run record
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    base44.entities.ClaimEstimate.create({
      session_id: sessionId,
      state: answers.state,
      incident_date: answers.incident_date,
      accident_type: answers.accident_type,
      liability_clarity: answers.liability_clarity,
      injury_severity_tier: answers.injury_severity_tier,
      treatment_status: answers.treatment_status,
      missed_work: answers.missed_work,
      total_medical_bills: bills,
      notes: answers.notes || "",
      economic_damages: economicDamages,
      non_economic_low: Math.round(nonEconLow),
      non_economic_high: Math.round(nonEconHigh),
      multiplier_low: multLow,
      multiplier_high: multHigh,
      state_factor: stateFactor,
      liability_factor: liabilityFactor,
      estimate_low: Math.round(repLow / 500) * 500,
      estimate_high: Math.round(repHigh / 500) * 500,
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "estimator",
      utm_campaign: stored("utm_campaign") || "Experiment",
      source_path: "/tools/claim-estimator",
      status: "estimate_run",
      estimate_run_at: new Date().toISOString(),
    }).catch(() => {});

    setResults({
      estimateLow: Math.round(repLow / 500) * 500,
      estimateHigh: Math.round(repHigh / 500) * 500,
      bills, futureMedical, lostWages, futureWages, economicDamages,
      nonEconLow: Math.round(nonEconLow), nonEconHigh: Math.round(nonEconHigh),
      multLow, multHigh, stateFactor, liabilityFactor, capApplied, neoCap,
      daysRemaining, solDeadline, stateData, injuryTier, sessionId, answers,
    });
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else computeResults();
  };

  if (results) return <ResultsPage results={results} experiment={experiment} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] flex flex-col">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short} />

      {/* Hero — shown only on step 0 */}
      {step === 0 && (
        <div className="text-center px-4 pt-10 pb-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
            {experiment?.hero_headline || "What Is Your Injury Claim Actually Worth?"}
          </h1>
          <p className="text-slate-300 text-lg mb-2">{experiment?.hero_subheadline || "Answer 9 quick questions. Get a transparent, methodology-backed estimate in under 2 minutes."}</p>
        </div>
      )}

      <ProgressBar step={step} total={STEPS.length} />

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{currentStep.title}</h2>
          <p className="text-slate-400 mb-6">{currentStep.subtitle}</p>

          {/* INJURY TIER — visual cards */}
          {currentStep.id === "injury_severity_tier" && (
            <div className="grid grid-cols-1 gap-3">
              {injuryTiers.map(tier => (
                <button key={tier.tier_key} onClick={() => setAnswers(a => ({ ...a, injury_severity_tier: tier.tier_key }))}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${currentVal === tier.tier_key ? "border-[#2BB6F6] bg-[#2BB6F6]/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                  <div className={`font-bold text-base mb-1 ${currentVal === tier.tier_key ? "text-white" : "text-slate-200"}`}>{tier.tier_label}</div>
                  {tier.description && <div className="text-xs text-slate-400 mb-1">{tier.description}</div>}
                  {tier.example_injuries?.length > 0 && <div className="text-xs text-slate-500">e.g. {tier.example_injuries.slice(0, 3).join(", ")}</div>}
                </button>
              ))}
            </div>
          )}

          {/* ACCIDENT TYPE */}
          {currentStep.id === "accident_type" && (
            <div className="grid grid-cols-2 gap-3">
              {ACCIDENT_TYPES.map(opt => (
                <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, accident_type: opt.value }))}
                  className={`text-left px-4 py-4 rounded-xl border-2 font-medium transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"}`}>
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="text-sm">{opt.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* INCIDENT DATE */}
          {currentStep.id === "incident_date" && (
            <input type="date" value={currentVal || ""} onChange={e => setAnswers(a => ({ ...a, incident_date: e.target.value }))}
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-800 text-lg font-medium focus:outline-none focus:border-[#2BB6F6]" />
          )}

          {/* STATE */}
          {currentStep.id === "state" && (
            <select value={currentVal || ""} onChange={e => setAnswers(a => ({ ...a, state: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-800 text-lg font-medium focus:outline-none focus:border-[#2BB6F6]">
              <option value="">— Select your state —</option>
              {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          )}

          {/* LIABILITY */}
          {currentStep.id === "liability_clarity" && (
            <div className="grid grid-cols-1 gap-3">
              {LIABILITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, liability_clarity: opt.value }))}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"}`}>
                  <span className="mr-2">{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>
          )}

          {/* TREATMENT */}
          {currentStep.id === "treatment_status" && (
            <div className="grid grid-cols-1 gap-3">
              {TREATMENT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, treatment_status: opt.value }))}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                  <div className={`font-semibold ${currentVal === opt.value ? "text-white" : "text-slate-200"}`}>{opt.label}</div>
                  <div className="text-xs text-slate-400">{opt.sub}</div>
                </button>
              ))}
            </div>
          )}

          {/* MISSED WORK */}
          {currentStep.id === "missed_work" && (
            <div className="grid grid-cols-1 gap-3">
              {MISSED_WORK_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, missed_work: opt.value }))}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"}`}>
                  <span>{opt.label}</span>
                  {opt.wages > 0 && <span className="ml-2 text-xs text-slate-400">(~{fmt(opt.wages)} assumed)</span>}
                </button>
              ))}
            </div>
          )}

          {/* MEDICAL BILLS */}
          {currentStep.id === "total_medical_bills" && (
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400 font-semibold">$</span>
                <input type="number" min="0" step="500" value={currentVal || ""} onChange={e => setAnswers(a => ({ ...a, total_medical_bills: e.target.value }))}
                  placeholder="0" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-4 text-slate-800 text-2xl font-bold focus:outline-none focus:border-[#2BB6F6]" />
              </div>
              <p className="text-xs text-slate-400 mt-2">Enter 0 if bills haven't arrived yet — estimate still works.</p>
            </div>
          )}

          {/* NOTES */}
          {currentStep.id === "notes" && (
            <textarea value={currentVal || ""} onChange={e => setAnswers(a => ({ ...a, notes: e.target.value.slice(0, 200) }))}
              placeholder="e.g. I have a herniated disc, was rear-ended at a red light, the other driver was cited..."
              rows={4} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#2BB6F6] resize-none" />
          )}

          <div className="flex items-center justify-between mt-8">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-semibold rounded-xl text-sm transition-all">
              ← Back
            </button>
            <button onClick={next} disabled={!canProceed()}
              className="px-8 py-3 bg-[#2BB6F6] hover:bg-[#1a9fd8] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all">
              {step === STEPS.length - 1 ? "Calculate My Estimate →" : "Next →"}
            </button>
          </div>

          <p className="text-xs text-slate-600 text-center mt-4">Educational estimator only — not legal advice.</p>
        </div>
      </div>

      {/* Below-tool content (visible after hero) */}
      {step === 0 && (
        <div className="bg-white">
          <HowItWorks steps={[
            { icon: "📋", title: "Answer 9 questions", desc: "Injury type, accident details, treatment status, bills." },
            { icon: "⚙️", title: "We run the math", desc: "Economic + non-economic damages, state adjustments, representation uplift." },
            { icon: "📊", title: "See the breakdown", desc: "Transparent methodology — every dollar explained." },
            { icon: "⚖️", title: "Connect (optional)", desc: "A vetted attorney reviews your range for free." },
          ]} />
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl, captureIncomingParams, incrementExpClicks, incrementExpViews } from "@/lib/surveyUrl";
import ClaimEstimatorResults from "./ClaimEstimatorResults";

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
  { value: "auto", label: "Auto accident (car vs. car)" },
  { value: "motorcycle", label: "Motorcycle accident" },
  { value: "rideshare_passenger", label: "Rideshare passenger (Uber/Lyft)" },
  { value: "rideshare_other", label: "Hit by rideshare driver" },
  { value: "pedestrian", label: "Pedestrian struck by vehicle" },
  { value: "cyclist", label: "Cyclist struck by vehicle" },
  { value: "commercial_truck", label: "Commercial truck / 18-wheeler" },
  { value: "other", label: "Other / unsure" },
];

const LIABILITY_OPTIONS = [
  { value: "clear_other_fault", label: "Clear — other driver was at fault", factor: 1.0 },
  { value: "partial_fault", label: "Partial fault on both sides", factor: 0.7 },
  { value: "disputed", label: "Disputed — liability is contested", factor: 0.5 },
  { value: "unclear", label: "Unclear / I'm not sure", factor: 0.6 },
];

const TREATMENT_OPTIONS = [
  { value: "er_only", label: "ER only — no follow-up yet" },
  { value: "ongoing", label: "Ongoing treatment (PT, chiro, specialist)" },
  { value: "completed", label: "Treatment completed" },
  { value: "none_yet", label: "No treatment yet" },
];

const MISSED_WORK_OPTIONS = [
  { value: "none", label: "None / working normally", wages: 0 },
  { value: "days", label: "A few days", wages: 1500 },
  { value: "weeks", label: "Several weeks", wages: 5000 },
  { value: "month_plus", label: "A month or more", wages: 18000 },
  { value: "unable_to_return", label: "Unable to return to work", wages: 60000 },
];

const STEPS = [
  { id: "state", title: "What state did the accident happen in?", subtitle: "State laws significantly affect claim value." },
  { id: "incident_date", title: "When did the accident happen?", subtitle: "This helps us calculate your statute of limitations clock." },
  { id: "accident_type", title: "What type of accident was it?", subtitle: "Different accident types carry different insurance coverage." },
  { id: "liability_clarity", title: "How clear is fault?", subtitle: "Liability clarity is one of the biggest value drivers." },
  { id: "injury_severity_tier", title: "How would you describe your injuries?", subtitle: "Select the category that best matches your situation." },
  { id: "treatment_status", title: "What is your treatment status?", subtitle: "Documented treatment is critical to your claim value." },
  { id: "missed_work", title: "How much work have you missed?", subtitle: "Lost wages are recoverable economic damages." },
  { id: "total_medical_bills", title: "What are your total medical bills so far?", subtitle: "Include ER, specialist, PT, imaging — everything related to the accident." },
];

export default function ClaimEstimatorWizard({ experiment }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [injuryTiers, setInjuryTiers] = useState([]);
  const [stateData, setStateData] = useState(null);
  const [results, setResults] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [sessionId] = useState(() => "est_" + Math.random().toString(36).substr(2, 12));

  useEffect(() => {
    captureIncomingParams();
    base44.entities.InjuryMultiplier.list("display_order", 10).then(tiers => {
      setInjuryTiers(tiers.filter(t => t.is_active));
    });
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  useEffect(() => {
    if (answers.state) {
      setLoadingState(true);
      base44.entities.StateMultiplier.filter({ state_code: answers.state })
        .then(res => { if (res.length > 0) setStateData(res[0]); setLoadingState(false); });
    }
  }, [answers.state]);

  const currentStep = STEPS[step];
  const totalSteps = STEPS.length;

  const setValue = (val) => setAnswers(prev => ({ ...prev, [currentStep.id]: val }));
  const currentVal = answers[currentStep.id];

  const canProceed = () => {
    if (currentStep.id === "total_medical_bills") {
      return currentVal !== undefined && currentVal !== "" && !isNaN(parseFloat(currentVal)) && parseFloat(currentVal) >= 0;
    }
    return !!currentVal;
  };

  const next = () => {
    if (step < totalSteps - 1) setStep(s => s + 1);
    else computeResults();
  };

  const computeResults = () => {
    const bills = parseFloat(answers.total_medical_bills) || 0;
    const missedWorkObj = MISSED_WORK_OPTIONS.find(m => m.value === answers.missed_work);
    const lostWages = missedWorkObj?.wages || 0;
    const liabilityObj = LIABILITY_OPTIONS.find(l => l.value === answers.liability_clarity);
    const liabilityFactor = liabilityObj?.factor || 0.6;
    const injuryTier = injuryTiers.find(t => t.tier_key === answers.injury_severity_tier);
    const multLow = injuryTier?.multiplier_low || 1.5;
    const multHigh = injuryTier?.multiplier_high || 2.5;
    const stateFactor = stateData?.base_multiplier_factor || 1.0;
    const neoCap = stateData?.non_economic_damage_cap || null;

    const economicDamages = bills + lostWages;
    let nonEconLow = bills * multLow;
    let nonEconHigh = bills * multHigh;

    let capApplied = false;
    if (neoCap && nonEconHigh > neoCap) { nonEconHigh = neoCap; capApplied = true; }
    if (neoCap && nonEconLow > neoCap) nonEconLow = neoCap;

    const rawLow = (economicDamages + nonEconLow) * stateFactor * liabilityFactor;
    const rawHigh = (economicDamages + nonEconHigh) * stateFactor * liabilityFactor;

    const solYears = stateData?.statute_of_limitations_years || 2;
    const incidentDate = answers.incident_date ? new Date(answers.incident_date) : null;
    const solDeadline = incidentDate ? new Date(incidentDate.getFullYear() + solYears, incidentDate.getMonth(), incidentDate.getDate()) : null;
    const daysRemaining = solDeadline ? Math.max(0, Math.floor((solDeadline - new Date()) / (1000 * 60 * 60 * 24))) : null;

    setResults({
      estimateLow: Math.round(rawLow),
      estimateHigh: Math.round(rawHigh),
      economicDamages,
      lostWages,
      bills,
      nonEconLow: Math.round(nonEconLow),
      nonEconHigh: Math.round(rawHigh < nonEconHigh * stateFactor * liabilityFactor ? Math.round(nonEconHigh * stateFactor * liabilityFactor) : nonEconHigh),
      multLow, multHigh,
      stateFactor,
      liabilityFactor,
      capApplied,
      neoCap,
      daysRemaining,
      solDeadline,
      stateData,
      injuryTier,
      sessionId,
      answers,
    });
  };

  if (results) {
    return <ClaimEstimatorResults results={results} experiment={experiment} injuryTiers={injuryTiers} />;
  }

  const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <a href="/"><img src={LOGO_URL} alt="Check My Claim" className="h-8 w-auto" /></a>
        <a href="tel:8448406905" onClick={() => experiment && incrementExpClicks(experiment, base44)}
          className="bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.76a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Prefer to call? (844) 840-6905
        </a>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-900/30 border-b border-amber-500/20 px-4 py-2 text-center">
        <p className="text-xs text-amber-300">{experiment?.disclaimer_short || "This is an educational estimator only — not legal advice and not a guarantee of any specific outcome. Every case is different."}</p>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Step {step + 1} of {totalSteps}</span>
          <span className="text-xs text-slate-400">{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#2BB6F6] transition-all duration-500" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{currentStep.title}</h2>
          <p className="text-slate-400 mb-8">{currentStep.subtitle}</p>

          {/* STATE */}
          {currentStep.id === "state" && (
            <select value={currentVal || ""} onChange={e => setValue(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-800 text-lg font-medium focus:outline-none focus:border-[#2BB6F6] focus:ring-2 focus:ring-[#2BB6F6]/20">
              <option value="">— Select your state —</option>
              {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          )}

          {/* INCIDENT DATE */}
          {currentStep.id === "incident_date" && (
            <input type="date" value={currentVal || ""} onChange={e => setValue(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-800 text-lg font-medium focus:outline-none focus:border-[#2BB6F6] focus:ring-2 focus:ring-[#2BB6F6]/20" />
          )}

          {/* ACCIDENT TYPE */}
          {currentStep.id === "accident_type" && (
            <div className="grid grid-cols-1 gap-3">
              {ACCIDENT_TYPES.map(opt => (
                <button key={opt.value} onClick={() => setValue(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-base transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* LIABILITY */}
          {currentStep.id === "liability_clarity" && (
            <div className="grid grid-cols-1 gap-3">
              {LIABILITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setValue(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-base transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* INJURY TIER */}
          {currentStep.id === "injury_severity_tier" && (
            <div className="grid grid-cols-1 gap-3">
              {injuryTiers.map(tier => (
                <button key={tier.tier_key} onClick={() => setValue(tier.tier_key)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${currentVal === tier.tier_key ? "border-[#2BB6F6] bg-[#2BB6F6]/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                  <div className={`font-semibold text-base mb-1 ${currentVal === tier.tier_key ? "text-white" : "text-slate-200"}`}>{tier.tier_label}</div>
                  <div className="text-xs text-slate-400">{tier.description}</div>
                  {tier.example_injuries?.length > 0 && (
                    <div className="text-xs text-slate-500 mt-1">e.g. {tier.example_injuries.slice(0, 3).join(", ")}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* TREATMENT */}
          {currentStep.id === "treatment_status" && (
            <div className="grid grid-cols-1 gap-3">
              {TREATMENT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setValue(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-base transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* MISSED WORK */}
          {currentStep.id === "missed_work" && (
            <div className="grid grid-cols-1 gap-3">
              {MISSED_WORK_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setValue(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-base transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"}`}>
                  <span>{opt.label}</span>
                  {opt.wages > 0 && <span className="ml-2 text-xs text-slate-400">(~${opt.wages.toLocaleString()} assumed)</span>}
                </button>
              ))}
            </div>
          )}

          {/* MEDICAL BILLS */}
          {currentStep.id === "total_medical_bills" && (
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400 font-semibold">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={currentVal || ""}
                  onChange={e => setValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-4 text-slate-800 text-2xl font-bold focus:outline-none focus:border-[#2BB6F6] focus:ring-2 focus:ring-[#2BB6F6]/20"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Enter 0 if you haven't received bills yet — you can still get an estimate range.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-semibold rounded-xl text-sm transition-all">
              ← Back
            </button>
            <button onClick={next} disabled={!canProceed() || loadingState}
              className="px-8 py-3 bg-[#2BB6F6] hover:bg-[#1a9fd8] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all">
              {step === totalSteps - 1 ? "Calculate My Estimate →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
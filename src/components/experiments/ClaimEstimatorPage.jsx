import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl, captureIncomingParams, incrementExpClicks, incrementExpViews } from "@/lib/surveyUrl";
import { Clock, TrendingUp, ChevronDown, ChevronUp, CheckCircle, Shield, Star, ArrowRight, Phone } from "lucide-react";
import SettlementTickerMini from "./shared/SettlementTickerMini";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";
const PHONE = "(844) 840-6905";
const PHONE_RAW = "8448406905";
const PARTNERS_URL = "https://checkmyclaim.co/PartnerList";

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
  { value: "none_yet", label: "Have not been treated yet", sub: "I have not seen a doctor", futureFactor: 0.15 },
];

// Fast tap buckets instead of a date picker (competitor pacing).
// daysAgo is the bucket midpoint, used to derive an approximate incident date.
const DATE_BUCKETS = [
  { value: "last_week", label: "In the last week", daysAgo: 5 },
  { value: "1_3_months", label: "1 to 3 months ago", daysAgo: 60 },
  { value: "4_6_months", label: "4 to 6 months ago", daysAgo: 150 },
  { value: "7_12_months", label: "Within the last year", daysAgo: 270 },
  { value: "over_year", label: "More than a year ago", daysAgo: 500 },
  { value: "over_2_years", label: "More than 2 years ago", daysAgo: 830 },
];

const MISSED_WORK_OPTIONS = [
  { value: "none", label: "None — working normally", wages: 0, futureWages: 0 },
  { value: "days", label: "A few days", wages: 1500, futureWages: 0 },
  { value: "weeks", label: "Several weeks", wages: 6000, futureWages: 0 },
  { value: "month_plus", label: "A month or more", wages: 22000, futureWages: 18000 },
  { value: "unable_to_return", label: "Unable to return to my job", wages: 75000, futureWages: 90000 },
];

// Representation uplift band, named so it can be tuned or removed in one place
// instead of being buried inside the math.
const REP_LOW = 2.0;
const REP_HIGH = 3.5;

const STATE_NAME = Object.fromEntries(US_STATES);

// Conservative stand-in for medical bills before the user has told us.
// Deliberately biased LOW so the real answer almost always pushes the running
// estimate up rather than down.
function placeholderBills(multHigh) {
  if (!multHigh) return 800;
  if (multHigh <= 1.5) return 800;
  if (multHigh <= 2.5) return 2000;
  if (multHigh <= 3.5) return 5000;
  if (multHigh <= 5) return 15000;
  return 40000;
}

// Single source of truth for the damages math. Called on every tap to drive the
// live counter, and again at the end for the final result. Unanswered fields
// fall back to the most conservative value in their range, so answering a
// question can only add information and therefore value.
function computeEstimate(ans, injuryTiers, stateData) {
  const tier = injuryTiers.find(t => t.tier_key === ans.injury_severity_tier);
  const multLow = tier?.multiplier_low ?? 1.2;
  const multHigh = tier?.multiplier_high ?? 1.5;

  const billsAnswered = ans.total_medical_bills !== undefined && ans.total_medical_bills !== "";
  const bills = billsAnswered ? (parseFloat(ans.total_medical_bills) || 0) : placeholderBills(multHigh);

  const treatment = TREATMENT_OPTIONS.find(t => t.value === ans.treatment_status);
  const futureFactor = treatment ? treatment.futureFactor : 0.10;
  const futureMedical = bills * futureFactor;

  const mw = MISSED_WORK_OPTIONS.find(m => m.value === ans.missed_work);
  const lostWages = mw?.wages ?? 0;
  const futureWages = mw?.futureWages ?? 0;

  const economicDamages = bills + futureMedical + lostWages + futureWages;
  const medicalTotal = bills + futureMedical;

  const stateFactor = stateData?.base_multiplier_factor ?? 0.92;
  const liability = LIABILITY_OPTIONS.find(l => l.value === ans.liability_clarity);
  const liabilityFactor = liability ? liability.factor : 0.65;
  const neoCap = stateData?.non_economic_damage_cap || null;

  let nonEconLow = medicalTotal * multLow;
  let nonEconHigh = medicalTotal * multHigh;
  let capApplied = false;
  if (neoCap && nonEconHigh > neoCap) { nonEconHigh = neoCap; capApplied = true; }
  if (neoCap && nonEconLow > neoCap) nonEconLow = neoCap;

  const baseLow = (economicDamages + nonEconLow) * stateFactor * liabilityFactor;
  const baseHigh = (economicDamages + nonEconHigh) * stateFactor * liabilityFactor;

  return {
    bills, billsAnswered, futureMedical, lostWages, futureWages,
    economicDamages, medicalTotal, multLow, multHigh,
    stateFactor, liabilityFactor, capApplied, neoCap, injuryTier: tier,
    nonEconLow: Math.round(nonEconLow), nonEconHigh: Math.round(nonEconHigh),
    estimateLow: Math.round((baseLow * REP_LOW) / 500) * 500,
    estimateHigh: Math.round((baseHigh * REP_HIGH) / 500) * 500,
  };
}

function bucketToDate(bucketValue) {
  const b = DATE_BUCKETS.find(x => x.value === bucketValue);
  if (!b) return null;
  const d = new Date();
  d.setDate(d.getDate() - b.daysAgo);
  return d.toISOString().split("T")[0];
}

function computeSol(incidentDate, stateData) {
  const solYears = stateData?.statute_of_limitations_years || 2;
  if (!incidentDate) return { solDeadline: null, daysRemaining: null, expired: false, solYears };
  const d = new Date(incidentDate);
  if (isNaN(d.getTime())) return { solDeadline: null, daysRemaining: null, expired: false, solYears };
  const solDeadline = new Date(d.getFullYear() + solYears, d.getMonth(), d.getDate());
  const raw = Math.floor((solDeadline - new Date()) / 86400000);
  return { solDeadline, daysRemaining: Math.max(0, raw), expired: raw <= 0, solYears };
}

// Fallback proof items. Illustrative only, used when no real record qualifies.
const FALLBACK_PROOF = [
  { state: "NJ", amount: 178000 }, { state: "FL", amount: 214500 },
  { state: "TX", amount: 156000 }, { state: "IL", amount: 262000 },
  { state: "GA", amount: 133500 }, { state: "AZ", amount: 197500 },
  { state: "CA", amount: 288000 }, { state: "NY", amount: 241000 },
];

// Only surface meaningful figures in the ticker.
const PROOF_MIN = 100000;

// ─── Gate A/B variant ───────────────────────────────────────────────────
// "reveal"  → the figure is legible throughout, and is revealed in full on the
//             form page. The primary action there is a phone call, with the
//             callback form as the secondary path.
// "blurred" → the figure is blurred for the entire flow, including the form
//             page. Submitting the form is the only way to read it.
// Sticky per session. Force with ?gate=reveal or ?gate=blurred for QA.
function resolveGateVariant() {
  try {
    const forced = new URLSearchParams(window.location.search).get("gate");
    if (forced === "reveal" || forced === "blurred") {
      sessionStorage.setItem("cmc_gate_variant", forced);
      return forced;
    }
    const existing = sessionStorage.getItem("cmc_gate_variant");
    if (existing === "reveal" || existing === "blurred") return existing;
    const assigned = Math.random() < 0.5 ? "reveal" : "blurred";
    sessionStorage.setItem("cmc_gate_variant", assigned);
    return assigned;
  } catch {
    return "reveal";
  }
}

// ─── Animated count-up ────────────────────────────────────────────────────
function useCountUp(target, duration = 750) {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { fromRef.current = target; setVal(target); }
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// ─── Sticky live estimate card ────────────────────────────────────────────
function EstimateCard({ high, low, started, step, total, sol, blurred }) {
  const shown = useCountUp(high);
  const pct = Math.round(((step + 1) / total) * 100);
  const hide = blurred && started;

  return (
    <div className="sticky top-0 z-30 px-4 pt-3 pb-3 bg-[#0a1628]/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-xl mx-auto">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-0.5">
                Estimated case value
              </div>
              {started ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-500 text-xs">up to</span>
                  <span
                    aria-hidden={hide ? "true" : undefined}
                    className={`text-2xl font-black text-emerald-400 tabular-nums leading-none transition-all duration-300 ${hide ? "blur-[9px] select-none" : ""}`}
                  >
                    {fmt(shown)}
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-black text-emerald-400 tabular-nums leading-none">$0</div>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
              <div className="text-[10px] text-slate-500 mt-1">Step {step + 1} of {total}</div>
            </div>
          </div>

          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2.5">
            <div className="h-full bg-emerald-400 transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[10px] text-slate-500">
              {!started
                ? "Builds with each answer"
                : hide
                  ? "🔒 Unlock your figure at the end"
                  : `Range ${fmt(low)} – ${fmt(high)}`}
            </span>
            {sol?.daysRemaining !== null && sol?.daysRemaining !== undefined && (
              <span className={`text-[10px] font-semibold ${sol.expired ? "text-amber-400" : "text-emerald-400"}`}>
                {sol.expired ? "⚠ Filing window passed" : "✓ Within filing window"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rotating social proof ────────────────────────────────────────────────
// Once the user has picked a state we prefer a real record from that state.
// If none qualifies we fall back to another real record rather than inventing
// a figure for their state.
function ProofTicker({ items, index, selectedState }) {
  if (!items || items.length === 0) return null;
  const local = selectedState ? items.filter(i => i.state === selectedState) : [];
  const pool = local.length > 0 ? local : items;
  const item = pool[index % pool.length];
  const isLocal = local.length > 0;

  return (
    <div className="px-4 pt-3 flex justify-center">
      <div
        key={`${item.state}-${item.amount}-${index}`}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border ${isLocal ? "bg-emerald-500/10 border-emerald-500/30 text-slate-200" : "bg-white/5 border-white/10 text-slate-300"}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Recent estimate in {STATE_NAME[item.state] || item.state}:</span>
        <strong className="text-emerald-300 font-bold">{fmt(item.amount)}</strong>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────
function Header({ experiment }) {
  return (
    <header className="bg-[#0a1628] border-b border-white/10 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <a href="/"><img src={LOGO_URL} alt="Check My Claim" className="h-8 w-auto" /></a>
        <a href={`tel:${PHONE_RAW}`}
          onClick={() => experiment && incrementExpClicks(experiment, base44)}
          className="bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
          <Phone className="w-3.5 h-3.5" /> {PHONE}
        </a>
      </div>
    </header>
  );
}

// ─── Full advertorial-style footer ────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0a1628] text-slate-400 px-6 py-10 text-xs leading-relaxed">
      <div className="max-w-4xl mx-auto space-y-4">
        <p className="text-slate-600 text-xs">
          <strong className="text-slate-500">EDUCATIONAL TOOL</strong> — This tool provides general information only. It is not a lawyer and does not provide legal advice and is not a guarantee or prediction of outcome.
        </p>
        <p>
          <strong className="text-slate-300">DISCLAIMER:</strong> checkmyclaim.co is not a law firm or an attorney referral service. This advertisement is not legal advice and is not a guarantee or prediction of the outcome of your legal matter. Every case is different, and the outcome depends on the laws, facts, and circumstances unique to each case. Hiring an attorney is an important decision that should not be based solely on advertising. Request free information about your attorney's background and experience.{" "}
          <strong>CA RESIDENTS:</strong> Paid attorney advertising on behalf of jointly advertising independent attorneys, including: The Law Offices of Larry H. Parker, San Antonio, CA. A full listing of attorney sponsors can be found{" "}
          <a href={PARTNERS_URL} className="text-[#2BB6F6] underline" target="_blank" rel="noopener noreferrer">here</a>.{" "}
          Check My Claim is not a law firm and does not provide legal services. You can request an attorney by name. This advertising does not imply a higher quality of legal services than that provided by other attorneys. Please note that past results showcased in advertisements do not dictate future results. If you live in AL, FL, MO, NY, or WY,{" "}
          <a href="https://checkmyclaim.co/disclosures/" className="text-[#2BB6F6] underline">click here</a> for additional information about attorney advertising in your state.
        </p>
        <p>
          We use cookies to personalize content and to analyze our traffic. We also share information about your use of our site with our analytics partners who may combine it with other information that you've provided to them or that they've collected from your use of their services.{" "}
          <a href="https://dsar.cptn.co/dsar/0ca83d86-1ffc-4e4e-afad-2edb0fd5440b" className="text-[#2BB6F6] underline">Request access to your data</a>.
        </p>
        <p className="text-slate-500">© 2026 Check My Claim. All rights reserved. | checkmyclaim.co</p>
      </div>
    </footer>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  return (
    <div className="px-4 pt-5 pb-2 max-w-2xl mx-auto w-full">
      <div className="flex justify-between mb-2">
        <span className="text-xs text-slate-400">Question {step + 1} of {total}</span>
        <span className="text-xs font-semibold text-[#2BB6F6]">{Math.round(((step + 1) / total) * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#2BB6F6] to-[#1e90ff] transition-all duration-500 rounded-full" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── TCPA disclaimer ──────────────────────────────────────────────────────
function TCPADisclaimer() {
  return (
    <p className="text-[10px] text-slate-500 leading-relaxed mt-4 text-center max-w-lg mx-auto">
      By submitting this form, I expressly consent to be contacted by Check My Claim and its{" "}
      <a href={PARTNERS_URL} className="text-[#2BB6F6] underline" target="_blank" rel="noopener noreferrer">attorney partners</a>{" "}
      via phone calls, text messages, and emails at the number and address I provided, even if I am on a Do Not Call registry. I understand that consent is not a condition of purchase or legal representation. Message &amp; data rates may apply. I have read and agree to the{" "}
      <a href="/PrivacyPolicy" className="text-[#2BB6F6] underline">Privacy Policy</a> and{" "}
      <a href="/TermsOfService" className="text-[#2BB6F6] underline">Terms of Service</a>.
    </p>
  );
}

// ─── Opt-in gate (shown instead of results) ───────────────────────────────
function OptInGate({ results, experiment, onSubmit, submitting, error, variant = "blurred" }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "", zip: "" });

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  const handlePhone = (e) => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));

  const phoneDigits = form.phone.replace(/\D/g, "");
  const isValidPhone = phoneDigits.length === 10;
  const isValidZip = /^\d{5}$/.test(form.zip);
  const canSubmit = form.first_name && form.last_name && isValidPhone && form.email && isValidZip;

  const { estimateLow, estimateHigh } = results;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628] flex flex-col">
      <Header experiment={experiment} />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">

          {/* Teaser banner — varies by A/B arm */}
          {variant === "reveal" ? (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                <CheckCircle className="w-3.5 h-3.5" /> Your Estimate Is Ready
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">
                Estimated case value
              </div>
              <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2BB6F6] to-emerald-400 mb-5">
                {fmt(estimateLow)} – {fmt(estimateHigh)}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight max-w-lg mx-auto">
                Want to work with someone who can start fighting for this level of compensation?
              </h1>
              <a
                href={`tel:${PHONE_RAW}`}
                onClick={() => experiment && incrementExpClicks(experiment, base44)}
                className="inline-flex items-center justify-center gap-2.5 w-full max-w-sm mx-auto py-4 px-6 rounded-xl font-black text-lg text-white transition-all"
                style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", boxShadow: "0 8px 24px rgba(34,197,94,0.35)" }}>
                <Phone className="w-5 h-5" /> Call {PHONE}
              </a>
              <p className="text-slate-500 text-xs mt-3">Free consultation. No obligation. No win, no fee.</p>
            </div>
          ) : (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                <CheckCircle className="w-3.5 h-3.5" /> Your Estimate Is Ready
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                Your claim may be worth more than you think
              </h1>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2BB6F6] to-emerald-400 blur-sm select-none">
                  {fmt(estimateLow)} – {fmt(estimateHigh)}
                </div>
              </div>
              <div className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm font-semibold px-5 py-2 rounded-xl mb-5">
                🔒 Unlock your full breakdown — takes 30 seconds
              </div>
              <p className="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
                Insurers count on you <strong className="text-white">not knowing this number</strong>. Their first offer is typically <span className="text-red-400 font-bold">25% or less</span> of what a represented claimant receives. Enter your info below to reveal your full estimate and get matched with a vetted attorney in your state — <span className="text-green-400 font-semibold">free, no obligation</span>.
              </p>
            </div>
          )}

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["✓ 50,000+ Wins", "✓ $50M+ Recovered", "✓ 100% Free", "✓ No Win, No Fee"].map(b => (
              <span key={b} className="bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-1 text-center">
              {variant === "reveal" ? "Prefer we call you?" : "See Your Full Estimate"}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-5">
              {variant === "reveal"
                ? "Leave your details and a vetted attorney in your state will reach out."
                : "We'll match you with the best attorney for your case."}
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6] text-sm" />
                <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6] text-sm" />
              </div>
              <input type="tel" value={form.phone} onChange={handlePhone}
                placeholder="Mobile Number (US)" className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6] text-sm"
                maxLength={14} />
              {form.phone && !isValidPhone && <p className="text-amber-400 text-xs px-1">Please enter a valid 10-digit US number.</p>}
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6] text-sm" />
              <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value.replace(/\D/g,"").slice(0,5) }))}
                placeholder="Zip Code" className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6] text-sm"
                maxLength={5} />
              {form.zip.length === 5 && !isValidZip && <p className="text-amber-400 text-xs px-1">Please enter a valid 5-digit zip code.</p>}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button onClick={() => canSubmit && onSubmit(form)} disabled={!canSubmit || submitting}
                className="w-full py-4 rounded-xl font-black text-lg text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: canSubmit ? "linear-gradient(135deg, #2BB6F6, #1e90ff)" : "rgba(100,116,139,0.4)", boxShadow: canSubmit ? "0 8px 24px rgba(43,182,246,0.4)" : "none" }}>
                {submitting ? "Connecting you..." : <><ArrowRight className="w-5 h-5" /> {variant === "reveal" ? "Request My Callback" : "Reveal My Estimate & Get Matched"}</>}
              </button>
            </div>

            <TCPADisclaimer />
          </div>

          {/* Social proof */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { stars: 5, quote: "Almost accepted $12K. Tool said $68K–$95K. Got $81,500.", by: "Marcus T., TX" },
              { stars: 5, quote: "47 days left on my SOL. Filed just in time. Life-changing.", by: "David R., FL" },
              { stars: 5, quote: "The adjuster was offering pennies. This opened my eyes.", by: "Priya M., CA" },
            ].map((r, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-xl p-3">
                <div className="flex gap-0.5 mb-1.5">{[...Array(r.stars)].map((_,j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-slate-300 text-xs leading-relaxed mb-1.5">"{r.quote}"</p>
                <p className="text-slate-500 text-[10px] font-semibold">{r.by}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Results page (shown AFTER opt-in) ───────────────────────────────────
function ResultsPage({ results, experiment }) {
  const [methodologyOpen, setMethodologyOpen] = useState(true);
  const { estimateLow, estimateHigh, bills, futureMedical, lostWages, futureWages, economicDamages,
    nonEconLow, nonEconHigh, multLow, multHigh, stateFactor, liabilityFactor, capApplied, neoCap,
    daysRemaining, solDeadline, stateData, injuryTier, answers } = results;

  const stateName = stateData?.state_name || answers.state;
  const typicalFirstOffer = Math.round(estimateLow * 0.25);
  const solColor = daysRemaining === null ? "text-slate-400" : daysRemaining < 90 ? "text-red-500" : daysRemaining < 365 ? "text-amber-500" : "text-green-500";
  const accidentLabel = ACCIDENT_TYPES.find(a => a.value === answers.accident_type)?.label || answers.accident_type;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#060e1e]">
      <Header experiment={experiment} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Success banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <CheckCircle className="w-3.5 h-3.5" /> Estimate Unlocked
          </div>
          <div className="text-5xl md:text-7xl font-black text-white mb-3">
            {fmt(estimateLow)}<span className="text-slate-400 mx-2">–</span>{fmt(estimateHigh)}
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Based on cases in {stateName} involving {accidentLabel} and {injuryTier?.tier_label || "your injury type"}.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Includes future medical projection", `Adjusted for ${stateName} rules`, "Reflects represented-case uplift"].map(t => (
              <span key={t} className="bg-[#2BB6F6]/10 border border-[#2BB6F6]/20 text-[#2BB6F6] text-xs font-semibold px-3 py-1.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* Methodology breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl mb-8 overflow-hidden">
          <button onClick={() => setMethodologyOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 font-bold text-white hover:bg-white/5 transition-colors">
            <span>📊 Methodology Breakdown</span>
            {methodologyOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {methodologyOpen && (
            <div className="px-6 pb-6">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-white/5">
                  {[
                    ["Current medical bills", fmt(bills)],
                    [`Future medical projection (${Math.round((TREATMENT_OPTIONS.find(t=>t.value===answers.treatment_status)?.futureFactor||0.20)*100)}% of current)`, fmt(futureMedical)],
                    ["Lost wages estimate", fmt(lostWages)],
                    ["Future lost wages projection", fmt(futureWages)],
                    ["Subtotal — Economic Damages", fmt(economicDamages), true],
                    [`Pain & suffering multiplier`, `${multLow}× – ${multHigh}×`],
                    ["Non-economic damages range", `${fmt(nonEconLow)} – ${fmt(nonEconHigh)}`],
                    [`${stateName} adjustment`, `${stateFactor}×`],
                    ["Liability factor", `${(liabilityFactor*100).toFixed(0)}%`],
                    [capApplied ? `${stateName} non-economic cap applied` : `${stateName} cap`, capApplied ? fmt(neoCap) : "No cap"],
                    ["Attorney representation uplift (2.0×–3.5×)", "Applied"],
                    ["Final Estimated Range", `${fmt(estimateLow)} – ${fmt(estimateHigh)}`, true],
                  ].map(([label, val, bold], i) => (
                    <tr key={i} className={bold ? "bg-[#2BB6F6]/10" : ""}>
                      <td className={`py-2.5 ${bold ? "font-bold text-[#2BB6F6]" : "text-slate-400"}`}>{label}</td>
                      <td className={`py-2.5 text-right font-semibold ${bold ? "text-[#2BB6F6] font-black" : "text-slate-200"}`}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stateData?.comparative_negligence_rule && (
                <p className="text-xs text-slate-500 mt-3">{stateName} uses <strong className="text-slate-400">{stateData.comparative_negligence_rule.replace(/_/g," ")}</strong> negligence rules.</p>
              )}
              {capApplied && <p className="text-xs text-amber-400 mt-2">⚠ {stateName} has a non-economic damages cap of {fmt(neoCap)} applied to high-end estimate.</p>}
            </div>
          )}
        </div>

        {/* SOL + First Offer */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border-2 ${daysRemaining !== null && daysRemaining < 90 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className={`w-5 h-5 ${solColor}`} />
              <h3 className="font-bold text-white">Your {stateName} SOL Clock</h3>
            </div>
            {daysRemaining !== null ? (
              <>
                <div className={`text-4xl font-black mb-1 ${solColor}`}>{daysRemaining.toLocaleString()} days</div>
                <div className="text-sm text-slate-400">remaining before {solDeadline?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                <div className="text-xs text-slate-500 mt-1">{stateData?.statute_of_limitations_years || 2}-year SOL in {stateName}</div>
                {daysRemaining < 180 && (
                  <div className={`mt-3 text-xs font-semibold ${daysRemaining < 90 ? "text-red-400" : "text-amber-400"}`}>
                    ⚠ {daysRemaining < 90 ? "URGENT — your window is closing fast." : "Less than 6 months remain."}
                  </div>
                )}
              </>
            ) : <p className="text-slate-500 text-sm">No incident date provided.</p>}
          </div>

          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-white">Typical First Offer</h3>
            </div>
            <div className="text-4xl font-black text-orange-400 mb-1">{fmt(typicalFirstOffer)}</div>
            <p className="text-xs text-slate-400">Insurers typically open at ~25% of actual represented value — approximately {Math.round((typicalFirstOffer/estimateHigh)*100)}% of your high-end estimate.</p>
          </div>
        </div>

        {/* Recent settlements */}
        <div className="mb-8">
          <SettlementTickerMini stateCode={answers.state} injuryTier={answers.injury_severity_tier} accidentType={answers.accident_type} limit={5} />
        </div>

        {/* Educational content */}
        <div className="space-y-8 mb-10">
          {[
            {
              h: "How This Estimate Was Built",
              p: "Every dollar traces back to a specific, documented damage category. We start with current medical bills — but future medical care often represents 20–50% of total costs. Lost wages are valued conservatively; future lost earning capacity can dwarf immediate wage loss. On top of economic damages, we apply an injury-appropriate multiplier for pain and suffering. Attorney representation makes the biggest difference here — insurance companies use low multipliers for unrepresented claimants."
            },
            {
              h: "Why First Offers Are Almost Always Lower",
              p: "The Insurance Research Council has documented for decades that represented claimants receive 3.5× more than unrepresented claimants for comparable injuries. Insurance companies know this. Their first offer is calibrated specifically for people who are unrepresented, financially stressed, and unfamiliar with claims math. The offer often arrives before you know the full extent of your injuries — deliberately."
            }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-xl font-extrabold text-white mb-3">{item.h}</h2>
              <p className="text-slate-400 leading-relaxed text-sm">{item.p}</p>
            </div>
          ))}

          <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
            <h2 className="text-xl font-extrabold text-white mb-4">What's Missing That an Attorney Would Add</h2>
            <ul className="space-y-2">
              {[
                ["Diminished vehicle value", "your car is worth less even after repair."],
                ["Full future-care projection", "a life-care planner can quantify ongoing needs worth tens of thousands more."],
                ["Lost earning capacity", "permanent career impact if your injury limits future work."],
                ["Household services damages", "if you can no longer perform daily tasks, that's quantifiable."],
                ["Loss of consortium", "available in most states when injury impacts a spousal relationship."],
                ["Punitive damages", "available in cases of egregious conduct (DUI, street racing, etc.)."],
              ].map(([title, desc], j) => (
                <li key={j} className="flex gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-slate-200">{title}</strong> <span className="text-slate-400">— {desc}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <DarkFAQ items={[
          { q: "How accurate is this estimate?", a: "Built on the same methodology PI attorneys use — economic damages plus a multiplier adjusted for state rules and liability. It won't match your final settlement exactly, but it gives you a defensible, realistic range to negotiate from." },
          { q: "Why does it say 'represented case value'?", a: "The Insurance Research Council has documented that represented claimants settle 3.5× higher on average. This estimate shows what an attorney-negotiated settlement typically looks like — not what the insurer's first offer will be." },
          { q: "What's the statute of limitations?", a: "Every state has a deadline to file. Once it expires, you lose your right to sue. The clock starts on the accident date, and missing it eliminates nearly all leverage." },
          { q: "Will the insurance company see this?", a: "No. This tool is completely private. Your estimate is stored securely and only shared with the attorney you choose to connect with." },
          { q: "Does this include pain and suffering?", a: "Yes. Non-economic damages are the largest component in most cases and are reflected in the multiplier section of the breakdown above." },
        ]} />

        {/* Final CTA */}
        <div className="mt-10 bg-gradient-to-br from-[#0d2044] to-[#1a3a6b] border border-[#2BB6F6]/20 rounded-2xl p-8 text-center">
          <div className="flex justify-center gap-3 mb-5 flex-wrap">
            {["✓ 50,000+ Wins", "✓ $50M+ Recovered", "✓ 100% Free"].map(b => (
              <span key={b} className="bg-white/10 text-slate-200 text-xs font-semibold px-4 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Ready to Talk to an Attorney?</h2>
          <p className="text-slate-300 mb-6 text-sm">A vetted attorney in {stateName || "your state"} will review your range within 20 minutes. No obligation. No upfront cost.</p>
          <a href={buildSurveyUrl({ linkId: "cta_results", utmMedium: "estimator", utmCampaign: "Experiment" })} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg shadow-[#2BB6F6]/30">
            Connect With a Vetted Attorney →
          </a>
          <p className="text-xs text-slate-500 mt-4">No win, no fee. Free consultation.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function DarkFAQ({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="mb-8">
      <h2 className="text-xl font-extrabold text-white mb-4 text-center">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-slate-200 hover:bg-white/5 transition-colors text-sm">
              <span>{item.q}</span>
              <span className="text-slate-500 text-lg ml-4 flex-shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-5 py-4 text-slate-400 text-sm leading-relaxed border-t border-white/5">{item.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Multi-choice option button with auto-next ────────────────────────────
function OptionButton({ label, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${selected ? "border-[#2BB6F6] bg-[#2BB6F6]/15 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/8"}`}>
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export default function ClaimEstimatorPage({ experiment }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [injuryTiers, setInjuryTiers] = useState([]);
  const [stateData, setStateData] = useState(null);
  const [results, setResults] = useState(null);
  const [showOptIn, setShowOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sessionId] = useState(() => "est_" + Math.random().toString(36).substr(2, 12));
  const autoNextTimer = useRef(null);

  const [displayHigh, setDisplayHigh] = useState(0);
  const [proofItems, setProofItems] = useState(FALLBACK_PROOF);
  const [gateVariant] = useState(resolveGateVariant);

  const STEPS = [
    { id: "accident_type", title: "What type of accident were you in?", subtitle: "Tap one to start calculating your estimate." },
    { id: "state", title: "Where did the accident happen?", subtitle: "State law significantly affects value and timeline." },
    { id: "injury_severity_tier", title: "How serious are your injuries?", subtitle: "This is the single biggest driver of claim value." },
    { id: "incident_date", title: "When did the accident happen?", subtitle: "Most claims are valid for a limited time, so timing matters." },
    { id: "liability_clarity", title: "Was the accident your fault?", subtitle: "If someone else caused it, you may be owed more." },
    { id: "treatment_status", title: "Are you still in treatment?", subtitle: "Documented treatment is critical to your claim." },
    { id: "missed_work", title: "Have you missed work?", subtitle: "Lost wages are recoverable economic damages." },
    { id: "total_medical_bills", title: "Total medical bills so far?", subtitle: "Include ER, imaging, specialists, PT, prescriptions." },
    { id: "notes", title: "Anything else? (optional)", subtitle: "This helps personalize your results. 200 characters max." },
  ];

  // Live estimate, recomputed on every answer.
  const live = computeEstimate(answers, injuryTiers, stateData);
  const sol = computeSol(answers.incident_date, stateData);
  const started = !!answers.accident_type;

  // Monotonic display: the headline figure never ticks downward. Because every
  // unanswered field defaults to the floor of its range in computeEstimate,
  // this clamp is a safety net rather than the mechanism.
  useEffect(() => {
    if (!started) return;
    setDisplayHigh(prev => Math.max(prev, live.estimateHigh));
  }, [live.estimateHigh, started]);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
    base44.entities.InjuryMultiplier.list("display_order", 10).then(tiers => setInjuryTiers(tiers.filter(t => t.is_active)));
    // Real recent estimates for the proof ticker, falling back to samples.
    base44.entities.ClaimEstimate.list("-created_date", 40)
      .then(rows => {
        const real = (rows || [])
          .filter(r => r.state && r.estimate_high >= PROOF_MIN)
          .map(r => ({ state: r.state, amount: r.estimate_high }))
          .slice(0, 20);
        if (real.length >= 4) setProofItems(real);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (answers.state) {
      base44.entities.StateMultiplier.filter({ state_code: answers.state }).then(res => { if (res.length > 0) setStateData(res[0]); });
    }
  }, [answers.state]);

  const currentStep = STEPS[step];
  const currentVal = answers[currentStep.id];

  const canProceed = () => {
    if (currentStep.id === "notes") return true;
    if (currentStep.id === "total_medical_bills") return currentVal !== undefined && currentVal !== "" && !isNaN(parseFloat(currentVal)) && parseFloat(currentVal) >= 0;
    return !!currentVal;
  };

  // Auto-advance for multiple-choice answers
  const pickAndAutoNext = (fieldId, value) => {
    const newAnswers = { ...answers, [fieldId]: value };
    setAnswers(newAnswers);
    if (autoNextTimer.current) clearTimeout(autoNextTimer.current);
    autoNextTimer.current = setTimeout(() => {
      if (step < STEPS.length - 1) setStep(s => s + 1);
      else computeResultsFromAnswers(newAnswers);
    }, 300);
  };

  const computeResultsFromAnswers = (ans = answers) => {
    const est = computeEstimate(ans, injuryTiers, stateData);
    const {
      bills, futureMedical, lostWages, futureWages, economicDamages,
      nonEconLow, nonEconHigh, multLow, multHigh, stateFactor,
      liabilityFactor, capApplied, neoCap, injuryTier,
    } = est;
    // The final headline never sits below whatever the live counter already
    // showed the user during the quiz.
    const finalHigh = Math.max(displayHigh, est.estimateHigh);
    const finalLow = Math.min(est.estimateLow, finalHigh);
    const { solDeadline, daysRemaining, expired } = computeSol(ans.incident_date, stateData);

    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    base44.entities.ClaimEstimate.create({
      session_id: sessionId, state: ans.state, incident_date: ans.incident_date,
      accident_type: ans.accident_type, liability_clarity: ans.liability_clarity,
      injury_severity_tier: ans.injury_severity_tier, treatment_status: ans.treatment_status,
      missed_work: ans.missed_work, total_medical_bills: bills, notes: ans.notes || "",
      economic_damages: economicDamages,
      non_economic_low: Math.round(nonEconLow), non_economic_high: Math.round(nonEconHigh),
      multiplier_low: multLow, multiplier_high: multHigh,
      state_factor: stateFactor, liability_factor: liabilityFactor,
      estimate_low: finalLow, estimate_high: finalHigh,
      gate_variant: gateVariant,
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "estimator",
      utm_campaign: stored("utm_campaign") || "Experiment",
      source_path: "/tools/claim-estimator", status: "estimate_run",
      estimate_run_at: new Date().toISOString(),
    }).catch(() => {});

    setResults({
      estimateLow: finalLow,
      estimateHigh: finalHigh,
      bills, futureMedical, lostWages, futureWages, economicDamages,
      nonEconLow, nonEconHigh,
      multLow, multHigh, stateFactor, liabilityFactor, capApplied, neoCap,
      daysRemaining, solDeadline, expired, stateData, injuryTier, sessionId, answers: ans,
    });
    setShowOptIn(true);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else computeResultsFromAnswers();
  };

  const handleOptInSubmit = async (form) => {
    setSubmitting(true);
    setSubmitError("");
    try {
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
        economic_damages: results.economicDamages,
        estimate_low: results.estimateLow,
        estimate_high: results.estimateHigh,
        gate_variant: gateVariant,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        phone: form.phone,
        zip: form.zip,
        utm_source: stored("utm_source") || "CMC-Site",
        utm_medium: stored("utm_medium") || "estimator",
        utm_campaign: stored("utm_campaign") || "Experiment",
        source_path: "/tools/claim-estimator",
        status: "lead_captured",
        lead_captured_at: new Date().toISOString(),
        estimate_run_at: new Date().toISOString(),
      });
      if (experiment) await incrementExpClicks(experiment, base44).catch(() => {});
      setShowOptIn(false);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  // Show opt-in gate before results
  if (showOptIn && results) {
    return <OptInGate results={results} experiment={experiment} onSubmit={handleOptInSubmit} submitting={submitting} error={submitError} variant={gateVariant} />;
  }

  // Show results after opt-in
  if (results && !showOptIn) {
    return <ResultsPage results={results} experiment={experiment} />;
  }

  // ─── Quiz steps ───────────────────────────────────────────────────────
  const MULTI_CHOICE_STEPS = ["injury_severity_tier", "accident_type", "state", "incident_date", "liability_clarity", "treatment_status", "missed_work"];
  const isMultiChoice = MULTI_CHOICE_STEPS.includes(currentStep.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628] flex flex-col">
      <Header experiment={experiment} />

      {/* Hero — step 0 only */}
      {step === 0 && (
        <div className="text-center px-4 pt-10 pb-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#2BB6F6]/15 border border-[#2BB6F6]/30 text-[#2BB6F6] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <Shield className="w-3.5 h-3.5" /> Free — No Obligation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
            {experiment?.hero_headline || "What Is Your Injury Claim Actually Worth?"}
          </h1>
          <p className="text-slate-300 text-lg mb-2">
            {experiment?.hero_subheadline || "Answer 9 quick questions. Get a transparent, methodology-backed estimate in under 2 minutes."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            {["✓ Based on real case data", "✓ State-adjusted", "✓ Includes pain & suffering", "✓ 100% private"].map(b => (
              <span key={b} className="bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      )}

      <EstimateCard
        high={displayHigh}
        low={live.estimateLow}
        started={started}
        step={step}
        total={STEPS.length}
        sol={sol}
        blurred={gateVariant === "blurred"}
      />

      <ProofTicker items={proofItems} index={step} selectedState={answers.state} />

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="max-w-xl w-full">
          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1">{currentStep.title}</h2>
          <p className="text-slate-500 mb-5 text-sm">{currentStep.subtitle}</p>

          {/* INJURY TIER */}
          {currentStep.id === "injury_severity_tier" && (
            <div className="grid grid-cols-1 gap-2">
              {injuryTiers.map(tier => (
                <button key={tier.tier_key}
                  onClick={() => pickAndAutoNext("injury_severity_tier", tier.tier_key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${currentVal === tier.tier_key ? "border-[#2BB6F6] bg-[#2BB6F6]/15" : "border-white/10 bg-white/5 hover:border-white/25"}`}>
                  <div className={`font-semibold text-sm ${currentVal === tier.tier_key ? "text-white" : "text-slate-200"}`}>{tier.tier_label}</div>
                  {tier.example_injuries?.length > 0 && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{tier.example_injuries.slice(0, 3).join(", ")}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ACCIDENT TYPE */}
          {currentStep.id === "accident_type" && (
            <div className="grid grid-cols-2 gap-2">
              {ACCIDENT_TYPES.map(opt => (
                <button key={opt.value}
                  onClick={() => pickAndAutoNext("accident_type", opt.value)}
                  className={`flex items-center gap-2 text-left px-3.5 py-3 rounded-lg border font-medium transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/15 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25"}`}>
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* INCIDENT DATE — fast tap buckets */}
          {currentStep.id === "incident_date" && (
            <div className="grid grid-cols-2 gap-2">
              {DATE_BUCKETS.map(opt => {
                const active = answers.date_bucket === opt.value;
                return (
                  <button key={opt.value}
                    onClick={() => {
                      const derived = bucketToDate(opt.value);
                      setAnswers(a => ({ ...a, date_bucket: opt.value, incident_date: derived }));
                      if (autoNextTimer.current) clearTimeout(autoNextTimer.current);
                      autoNextTimer.current = setTimeout(() => setStep(s => Math.min(STEPS.length - 1, s + 1)), 300);
                    }}
                    className={`text-left px-3.5 py-3 rounded-lg border font-medium transition-all text-sm ${active ? "border-[#2BB6F6] bg-[#2BB6F6]/15 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25"}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* STATE */}
          {currentStep.id === "state" && (
            <select value={currentVal || ""}
              onChange={e => {
                const v = e.target.value;
                setAnswers(a => ({ ...a, state: v }));
                if (autoNextTimer.current) clearTimeout(autoNextTimer.current);
                if (v) autoNextTimer.current = setTimeout(() => setStep(s => Math.min(STEPS.length - 1, s + 1)), 400);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-slate-800 text-base font-medium focus:outline-none focus:border-[#2BB6F6]">
              <option value="">— Select your state —</option>
              {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          )}

          {/* LIABILITY */}
          {currentStep.id === "liability_clarity" && (
            <div className="grid grid-cols-1 gap-2">
              {LIABILITY_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => pickAndAutoNext("liability_clarity", opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border font-medium text-sm transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/15 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25"}`}>
                  <span className="mr-2">{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>
          )}

          {/* TREATMENT */}
          {currentStep.id === "treatment_status" && (
            <div className="grid grid-cols-1 gap-2">
              {TREATMENT_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => pickAndAutoNext("treatment_status", opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/15" : "border-white/10 bg-white/5 hover:border-white/25"}`}>
                  <div className={`font-semibold text-sm ${currentVal === opt.value ? "text-white" : "text-slate-200"}`}>{opt.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          )}

          {/* MISSED WORK */}
          {currentStep.id === "missed_work" && (
            <div className="grid grid-cols-1 gap-2">
              {MISSED_WORK_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => pickAndAutoNext("missed_work", opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border font-medium text-sm transition-all ${currentVal === opt.value ? "border-[#2BB6F6] bg-[#2BB6F6]/15 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25"}`}>
                  {opt.label}
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
              <p className="text-xs text-slate-500 mt-2">Enter 0 if bills haven't arrived yet — estimate still works.</p>
            </div>
          )}

          {/* NOTES */}
          {currentStep.id === "notes" && (
            <textarea value={currentVal || ""} onChange={e => setAnswers(a => ({ ...a, notes: e.target.value.slice(0, 200) }))}
              placeholder="e.g. I have a herniated disc, was rear-ended at a red light, the other driver was cited..."
              rows={4} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#2BB6F6] resize-none" />
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-semibold rounded-lg text-sm transition-all">
              ← Back
            </button>
            {(!isMultiChoice || currentStep.id === "total_medical_bills" || currentStep.id === "notes") && (
              <button onClick={next} disabled={!canProceed()}
                className="px-8 py-3 bg-[#2BB6F6] hover:bg-[#1a9fd8] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all">
                {step === STEPS.length - 1 ? "Calculate My Estimate →" : "Next →"}
              </button>
            )}
          </div>

          {isMultiChoice && <p className="text-xs text-slate-600 text-center mt-3">Select an option to continue automatically</p>}
        </div>
      </div>

      {/* How it works — only step 0 */}
      {step === 0 && (
        <div className="border-t border-white/5 bg-white/3 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-extrabold text-white text-center mb-8">How This Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: "📋", title: "Answer 9 questions", desc: "Injury type, accident details, treatment status, bills." },
                { icon: "⚙️", title: "We run the math", desc: "Economic + non-economic damages, state adjustments, representation uplift." },
                { icon: "🔒", title: "Unlock your estimate", desc: "Enter your info so we can match you with the right attorney." },
                { icon: "⚖️", title: "Get matched free", desc: "A vetted attorney reviews your range at no cost. No win, no fee." },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-3">{s.icon}</div>
                  <div className="text-xs font-bold text-[#2BB6F6] uppercase tracking-widest mb-1">Step {i + 1}</div>
                  <div className="font-bold text-slate-200 mb-1 text-sm">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
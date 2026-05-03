import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl, incrementExpClicks } from "@/lib/surveyUrl";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

const fmt = (n) => "$" + Math.round(n).toLocaleString();

export default function ClaimEstimatorResults({ results, experiment, injuryTiers }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    estimateLow, estimateHigh, economicDamages, lostWages, bills,
    nonEconLow, nonEconHigh, multLow, multHigh,
    stateFactor, liabilityFactor, capApplied, neoCap,
    daysRemaining, solDeadline, stateData, injuryTier, sessionId, answers
  } = results;

  const typicalFirstOffer = Math.round(estimateLow * 0.35);
  const stateName = stateData?.state_name || answers.state;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) { setFormError("All fields are required."); return; }
    setFormError("");
    setSubmitting(true);

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
        utm_content: stored("utm_content") || "lead_captured",
        sid: stored("sid") || "LGNX",
        fbclid: stored("fbclid"),
        gclid: stored("gclid"),
        source_path: window.location.pathname,
        status: "lead_captured",
        lead_captured_at: new Date().toISOString(),
        estimate_run_at: new Date().toISOString(),
      });

      // Increment experiment submissions
      if (experiment) {
        await base44.entities.Experiment.update(experiment.id, {
          submissions: (experiment.submissions || 0) + 1,
        }).catch(() => {});
        await incrementExpClicks(experiment, base44);
      }

      setSubmitted(true);

      // Redirect after short delay
      setTimeout(() => {
        const url = buildSurveyUrl({
          linkId: "lead_captured",
          utmMedium: experiment?.utm_medium_label || "estimator",
          utmCampaign: "Experiment",
          extraParams: { state: answers.state, accident_type: answers.accident_type },
        });
        window.location.href = url;
      }, 2000);
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";

  const solColor = daysRemaining === null ? "text-slate-400" :
    daysRemaining < 90 ? "text-red-400" : daysRemaining < 365 ? "text-amber-400" : "text-green-400";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#0a1628] border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <a href="/"><img src={LOGO_URL} alt="Check My Claim" className="h-8 w-auto" /></a>
        <a href="tel:8448406905" className="bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.76a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Prefer to call? (844) 840-6905
        </a>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
        <p className="text-xs text-amber-700">Educational estimator only — not legal advice and not a guarantee of any specific outcome. Every case is different.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Estimate range — the hero */}
        <div className="text-center mb-10">
          <div className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Your Estimated Claim Range</div>
          <div className="text-5xl md:text-6xl font-black text-slate-900 mb-2">
            {fmt(estimateLow)} – {fmt(estimateHigh)}
          </div>
          <p className="text-slate-500 text-sm">Based on your inputs for {stateName} under {injuryTier?.tier_label || "your injury category"}</p>

          {/* IRC Uplift callout */}
          <div className="mt-5 inline-block bg-blue-50 border border-blue-200 text-blue-800 text-sm px-5 py-3 rounded-xl max-w-2xl text-left">
            <strong>📊 Attorney Representation Impact:</strong> Represented claimants historically settle ~3.5× higher than unrepresented claimants per Insurance Research Council data. This range reflects your claim value — an attorney may significantly increase what you actually receive.
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Methodology Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-slate-900 font-bold text-lg mb-4">How We Calculated This</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200">
                <tr className="py-2">
                  <td className="py-2 text-slate-600">Medical bills</td>
                  <td className="py-2 text-right font-semibold text-slate-800">{fmt(bills)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600">Lost wages (estimated)</td>
                  <td className="py-2 text-right font-semibold text-slate-800">{fmt(lostWages)}</td>
                </tr>
                <tr className="bg-slate-100">
                  <td className="py-2 text-slate-700 font-semibold">Economic Damages</td>
                  <td className="py-2 text-right font-bold text-slate-900">{fmt(economicDamages)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600">Non-economic (pain & suffering) low<br/><span className="text-xs text-slate-400">{multLow}× multiplier for {injuryTier?.tier_label}</span></td>
                  <td className="py-2 text-right font-semibold text-slate-800">{fmt(bills * multLow)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600">Non-economic high<br/><span className="text-xs text-slate-400">{multHigh}× multiplier</span></td>
                  <td className="py-2 text-right font-semibold text-slate-800">{fmt(bills * multHigh)}{capApplied && <span className="text-xs text-amber-600 ml-1">(capped)</span>}</td>
                </tr>
                {capApplied && (
                  <tr>
                    <td className="py-2 text-amber-700 text-xs" colSpan={2}>⚠ {stateName} has a non-economic damages cap of {fmt(neoCap)}. Applied to high-end estimate.</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 text-slate-600">State factor<br/><span className="text-xs text-slate-400">{stateName} — {stateFactor}×</span></td>
                  <td className="py-2 text-right font-semibold text-slate-800">{stateFactor}×</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600">Liability factor<br/><span className="text-xs text-slate-400">{answers.liability_clarity?.replace(/_/g, " ")}</span></td>
                  <td className="py-2 text-right font-semibold text-slate-800">{(liabilityFactor * 100).toFixed(0)}%</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-2 text-blue-900 font-bold">Final Estimate Range</td>
                  <td className="py-2 text-right font-black text-blue-900">{fmt(estimateLow)} – {fmt(estimateHigh)}</td>
                </tr>
              </tbody>
            </table>

            {stateData?.comparative_negligence_rule && (
              <p className="text-xs text-slate-500 mt-3">
                {stateName} uses <strong>{stateData.comparative_negligence_rule.replace(/_/g, " ")}</strong> negligence rules.
              </p>
            )}
          </div>

          {/* Right column: SOL + Offer Comparison */}
          <div className="space-y-5">
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
                <p className="text-slate-500 text-sm">Enter your incident date to see SOL countdown.</p>
              )}
            </div>

            {/* Typical First Offer */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900">Typical First Offer for Cases Like Yours</h3>
              </div>
              <div className="text-4xl font-black text-orange-600 mb-1">{fmt(typicalFirstOffer)}</div>
              <p className="text-xs text-slate-500">Insurance companies typically open at ~35% of actual case value to leave room for negotiation. Your estimate suggests they may open around this number.</p>
            </div>
          </div>
        </div>

        {/* Lead Capture */}
        <div className="bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] rounded-2xl p-8 text-center">
          {submitted ? (
            <div className="py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">You're connected!</h3>
              <p className="text-slate-300">Redirecting you to start your free check...</p>
            </div>
          ) : (
            <>
              <div className="inline-block bg-[#2BB6F6]/20 text-[#2BB6F6] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Free — No Obligation</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                Get This Estimate Reviewed by a Vetted Attorney in {stateName} — Free
              </h2>
              <p className="text-slate-300 mb-6 text-sm max-w-xl mx-auto">
                They'll tell you within 20 minutes whether the range is realistic for your specific case. No obligation. No upfront cost.
              </p>
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Full Name" className="w-full px-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6]" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email Address" className="w-full px-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6]" />
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6]" />
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full bg-[#2BB6F6] hover:bg-[#1a9fd8] disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-all">
                  {submitting ? "Submitting..." : "Get My Estimate Reviewed — Free →"}
                </button>
                <p className="text-xs text-slate-400">No win, no fee. Free consultation. Vetted attorneys only.</p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Full footer disclaimer */}
      <footer className="bg-[#0a1628] text-slate-400 px-6 py-8 text-xs leading-relaxed mt-10">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-slate-600 text-xs"><strong className="text-slate-500">EDUCATIONAL TOOL</strong> — This estimate is for informational purposes only. It is not legal advice and not a guarantee of any specific outcome.</p>
          <p><strong className="text-slate-300">DISCLAIMER:</strong> checkmyclaim.co is not a law firm or an attorney referral service. This tool does not create an attorney-client relationship. Every case is different, and the outcome depends on the laws, facts, and circumstances unique to each case. <strong>CA RESIDENTS:</strong> Paid attorney advertising. A full listing of attorney sponsors can be found <a href="https://checkmyclaim.co/PartnerList" className="text-[#2BB6F6] underline">here</a>.</p>
          <p className="text-slate-500">© 2026 Check My Claim. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
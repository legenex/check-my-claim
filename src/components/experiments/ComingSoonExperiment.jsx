import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl, captureIncomingParams, incrementExpClicks, incrementExpViews } from "@/lib/surveyUrl";
import { Bell, CheckCircle } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";

export default function ComingSoonExperiment({ experiment }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  const handleNotify = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    // Store lead to Lead entity (reusing existing entity)
    await base44.entities.Lead.create({
      quizId: experiment?.id || "experiment",
      sessionId: "notify_" + Date.now(),
      email: email.trim(),
      status: "Partial",
      utmMedium: experiment?.utm_medium_label || "experiment",
      utmCampaign: "Experiment",
      utmSource: "CMC-Site",
      notes: `Notify-me signup from ${experiment?.path || window.location.pathname}`,
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleCTA = async () => {
    if (experiment) await incrementExpClicks(experiment, base44);
    const url = buildSurveyUrl({
      linkId: "link_cta_section",
      utmMedium: experiment?.utm_medium_label || "experiment",
      utmCampaign: "Experiment",
    });
    window.open(url, "_blank");
  };

  const phone = "(844) 840-6905";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#0a1628] border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <a href="/"><img src={LOGO_URL} alt="Check My Claim" className="h-8 w-auto" /></a>
        <a href="tel:8448406905" onClick={() => experiment && incrementExpClicks(experiment, base44)}
          className="bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.76a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Prefer to call? {phone}
        </a>
      </header>

      {/* Disclaimer above fold */}
      {experiment?.disclaimer_short && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-xs text-amber-700">{experiment.disclaimer_short}</p>
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-[#2BB6F6]/20 text-[#2BB6F6] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">Coming Soon</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            {experiment?.hero_headline || "Something Powerful Is Being Built"}
          </h1>
          {experiment?.hero_subheadline && (
            <p className="text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">{experiment.hero_subheadline}</p>
          )}

          {/* Notify form */}
          {!submitted ? (
            <form onSubmit={handleNotify} className="max-w-md mx-auto flex gap-3">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email for early access"
                className="flex-1 px-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6]"
              />
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white font-bold px-5 py-3 rounded-xl whitespace-nowrap transition-all">
                <Bell className="w-4 h-4" /> Notify Me
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-400 text-lg font-semibold">
              <CheckCircle className="w-6 h-6" /> You're on the list!
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3">No spam. One email when we launch.</p>
        </div>
      </div>

      {/* Featured image */}
      {experiment?.featured_image_url && (
        <div className="max-w-4xl mx-auto px-4 -mt-8 mb-0">
          <img src={experiment.featured_image_url} alt={experiment.featured_image_alt || ""} className="w-full max-h-72 object-cover rounded-2xl shadow-xl" />
        </div>
      )}

      {/* Short description */}
      {experiment?.short_description && (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-slate-600 text-lg leading-relaxed">{experiment.short_description}</p>
        </div>
      )}

      {/* CTA Section (same pattern as advertorials) */}
      <div className="bg-gradient-to-b from-[#dbeafe] to-[#bfdbfe] py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-3 mb-7 flex-wrap">
            {["✓ 50,000+ Wins", "✓ $50M+ Recovered", "✓ 100% Free"].map(badge => (
              <span key={badge} className="bg-white text-[#1a6fc4] font-semibold text-sm px-4 py-1.5 rounded-full shadow-sm border border-blue-200">{badge}</span>
            ))}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            Don't Wait — Check Your Claim Now
          </h2>
          <p className="text-slate-600 mb-8 text-base leading-relaxed">
            While we're building this tool, you can get a real assessment of your claim in 30 seconds.
          </p>
          <button onClick={handleCTA}
            className="inline-block bg-[#1e90ff] hover:bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg shadow-blue-400/30">
            {experiment?.primary_cta_text || "Start Your Free 30-Second Claim Check"} →
          </button>
          <p className="text-xs text-slate-500 mt-4">No win, no fee. No upfront costs. Free consultation.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-slate-400 px-6 py-8 text-xs leading-relaxed">
        <div className="max-w-4xl mx-auto space-y-3">
          <p><strong className="text-slate-300">DISCLAIMER:</strong> checkmyclaim.co is not a law firm or an attorney referral service. This tool does not create an attorney-client relationship. Not legal advice. <strong>CA RESIDENTS:</strong> Paid attorney advertising. <a href="https://checkmyclaim.co/PartnerList" className="text-[#2BB6F6] underline">Partner list</a>.</p>
          <p className="text-slate-500">© 2026 Check My Claim. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
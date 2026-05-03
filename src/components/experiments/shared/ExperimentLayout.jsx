import React, { useState } from "react";
import { buildSurveyUrl, incrementExpClicks } from "@/lib/surveyUrl";
import { base44 } from "@/api/base44Client";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";

export function ExperimentHeader({ experiment }) {
  return (
    <header className="bg-[#0a1628] border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <a href="/"><img src={LOGO_URL} alt="Check My Claim" className="h-8 w-auto" /></a>
      <a href="tel:8448406905" onClick={() => experiment && incrementExpClicks(experiment, base44)}
        className="bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.76a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        Prefer to call? (844) 840-6905
      </a>
    </header>
  );
}

export function DisclaimerStrip({ text }) {
  return (
    <div className="bg-[#0a1628] border-b border-white/5 px-4 py-1.5 text-center">
      <p className="text-xs text-slate-600">{text || "Educational tool only — not legal advice and not a guarantee of any specific outcome."}</p>
    </div>
  );
}

export function ExperimentCTA({ experiment, utmMedium, stateName }) {
  const handleClick = async () => {
    if (experiment) await incrementExpClicks(experiment, base44);
    const url = buildSurveyUrl({
      linkId: "link_cta_section",
      utmMedium: utmMedium || experiment?.utm_medium_label || "experiment",
      utmCampaign: "Experiment",
    });
    window.open(url, "_blank");
  };

  return (
    <div className="bg-gradient-to-b from-[#dbeafe] to-[#bfdbfe] py-14 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center gap-3 mb-7 flex-wrap">
          {["✓ 50,000+ Wins", "✓ $50M+ Recovered", "✓ 100% Free"].map(badge => (
            <span key={badge} className="bg-white text-[#1a6fc4] font-semibold text-sm px-4 py-1.5 rounded-full shadow-sm border border-blue-200">{badge}</span>
          ))}
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
          Ready to Find Out What Your Case Is Actually Worth?
        </h2>
        <p className="text-slate-600 mb-8 text-base leading-relaxed">
          Get a free 30-second case review from a vetted attorney{stateName ? ` in ${stateName}` : " in your state"}. No obligation. No win, no fee.
        </p>
        <button onClick={handleClick}
          className="inline-block bg-[#1e90ff] hover:bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg shadow-blue-400/30">
          {experiment?.primary_cta_text || "Connect With a Vetted Attorney"} →
        </button>
        <p className="text-xs text-slate-500 mt-4">No win, no fee. No upfront costs. Free consultation.</p>
      </div>
    </div>
  );
}

export function ExperimentFooter() {
  return (
    <footer className="bg-[#0a1628] text-slate-400 px-6 py-10 text-xs leading-relaxed">
      <div className="max-w-4xl mx-auto space-y-4">
        <p className="text-slate-600 text-xs">
          <strong className="text-slate-500">EDUCATIONAL TOOL</strong> — This tool provides general information only. It is not a lawyer and does not provide legal advice and is not a guarantee or prediction of outcome.
        </p>
        <p>
          <strong className="text-slate-300">DISCLAIMER:</strong> checkmyclaim.co is not a law firm or an attorney referral service. Every case is different, and outcomes depend on the laws, facts, and circumstances unique to each case. Hiring an attorney is an important decision that should not be based solely on advertising. <strong>CA RESIDENTS:</strong> Paid attorney advertising on behalf of jointly advertising independent attorneys, including: The Law Offices of Larry H. Parker, San Antonio, CA. A full listing of attorney sponsors can be found <a href="https://checkmyclaim.co/PartnerList" className="text-[#2BB6F6] underline">here</a>. Please note that past results do not dictate future results. If you live in AL, FL, MO, NY, or WY, <a href="https://checkmyclaim.co/disclosures/" className="text-[#2BB6F6] underline">click here</a> for additional information.
        </p>
        <p>
          We use cookies to personalize content and analyze traffic. <a href="https://dsar.cptn.co/dsar/0ca83d86-1ffc-4e4e-afad-2edb0fd5440b" className="text-[#2BB6F6] underline">Request access to your data</a>.
        </p>
        <p className="text-slate-500">© 2026 Check My Claim. All rights reserved. | checkmyclaim.co</p>
      </div>
    </footer>
  );
}

export function HowItWorks({ steps }) {
  return (
    <div className="py-14 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 text-center">How This Works</h2>
        <p className="text-slate-500 text-center mb-10">Simple, transparent, and built for real claimants.</p>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl mx-auto mb-4">{s.icon}</div>
              <div className="text-xs font-bold text-[#1e90ff] uppercase tracking-widest mb-1">Step {i + 1}</div>
              <div className="font-bold text-slate-900 mb-1">{s.title}</div>
              <div className="text-sm text-slate-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ quotes }) {
  return (
    <div className="py-14 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">What Others Said After Using This Tool</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}</div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">"{q.text}"</p>
              <div className="text-xs font-bold text-slate-500">{q.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FAQ({ items }) {
  const [open, setOpen] = React.useState(null);
  return (
    <div className="py-14 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                <span>{item.q}</span>
                <span className="text-slate-400 text-lg ml-4 flex-shrink-0">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-5 py-4 text-slate-600 text-sm leading-relaxed bg-slate-50 border-t border-slate-200">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeadForm({ headline, subtext, experiment, utmMedium, utmContent, extraParams, onSuccess }) {
  const [form, setForm] = React.useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) { setError("All fields are required."); return; }
    setError("");
    setSubmitting(true);
    try {
      if (onSuccess) await onSuccess(form);
      if (experiment) await incrementExpClicks(experiment, base44).catch(() => {});
      setSubmitted(true);
      setTimeout(() => {
        const url = buildSurveyUrl({
          linkId: utmContent || "lead_captured",
          utmMedium: utmMedium || experiment?.utm_medium_label || "experiment",
          utmCampaign: "Experiment",
          extraParams,
        });
        window.location.href = url;
      }, 1800);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-white mb-2">You're connected!</h3>
        <p className="text-slate-300">Redirecting you now...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] rounded-2xl p-8 text-center max-w-2xl mx-auto">
      <div className="inline-block bg-[#2BB6F6]/20 text-[#2BB6F6] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Free — No Obligation</div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{headline}</h2>
      <p className="text-slate-300 mb-6 text-sm max-w-xl mx-auto">{subtext}</p>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
        <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          placeholder="Full Name" className="w-full px-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6]" />
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="Email Address" className="w-full px-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6]" />
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2BB6F6]" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={submitting}
          className="w-full bg-[#2BB6F6] hover:bg-[#1a9fd8] disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-all">
          {submitting ? "Submitting..." : "Get My Free Case Review →"}
        </button>
        <p className="text-xs text-slate-400">No win, no fee. Free consultation. Vetted attorneys only.</p>
      </form>
    </div>
  );
}
import React from "react";
import { buildSurveyUrl, incrementAdvClicks } from "@/lib/surveyUrl";
import { base44 } from "@/api/base44Client";

/**
 * Light-blue CTA section that sits between article body and footer.
 * Used on every advertorial page.
 */
export default function AdvertorialCTASection({ advertorial }) {
  const handleClick = async () => {
    await incrementAdvClicks(advertorial, base44);
    const url = buildSurveyUrl({
      linkId: "link_cta_section",
      utmMedium: advertorial?.utm_medium_label || "advertorial",
      baseUrl: advertorial?.primary_cta_url,
    });
    window.open(url, "_blank");
  };

  return (
    <div className="bg-gradient-to-b from-[#dbeafe] to-[#bfdbfe] py-14 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Pill badges */}
        <div className="flex justify-center gap-3 mb-7 flex-wrap">
          {["✓ 50,000+ Wins", "✓ $50M+ Recovered", "✓ 100% Free"].map(badge => (
            <span key={badge} className="bg-white text-[#1a6fc4] font-semibold text-sm px-4 py-1.5 rounded-full shadow-sm border border-blue-200">
              {badge}
            </span>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
          Ready to Find Out What Your Case Is Worth?
        </h2>
        <p className="text-slate-600 mb-8 text-base leading-relaxed">
          It takes 30 seconds. No obligation. No law firm pressure. Just answers.
        </p>

        <button
          onClick={handleClick}
          className="inline-block bg-[#1e90ff] hover:bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg shadow-blue-400/30"
        >
          {advertorial?.primary_cta_text || "Start Your Free 30-Second Claim Check"} →
        </button>

        <p className="text-xs text-slate-500 mt-4">No win, no fee. No upfront costs. Free consultation.</p>
      </div>
    </div>
  );
}
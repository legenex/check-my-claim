import React from "react";
import Footer from "@/components/Footer";
import CallBanner from "@/components/survey/CallBanner";
import SurveyProcess from "@/components/survey/SurveyProcess";
import SurveyFightingForYou from "@/components/survey/SurveyFightingForYou";
import SurveyRecentWins from "@/components/survey/SurveyRecentWins";
import SurveyGuarantee from "@/components/survey/SurveyGuarantee";
import SurveyTestimonials from "@/components/survey/SurveyTestimonials";
import SurveyFAQ from "@/components/survey/SurveyFAQ";

export default function Survey() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061D32] via-[#0C2D5B] to-[#1B3A4F] overflow-x-hidden">
      <CallBanner />

      {/* Quiz Image Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/614888e84_image.png"
            alt="Get The Maximum Cash Payout For Your Accident Injury"
            className="w-full rounded-3xl shadow-2xl"
          />
        </div>
      </section>

      {/* Process Section */}
      <SurveyProcess />

      {/* Fighting For You Section */}
      <SurveyFightingForYou />

      {/* Recent Wins Section */}
      <SurveyRecentWins />

      {/* Guarantee Section */}
      <SurveyGuarantee />

      {/* Testimonials Section */}
      <SurveyTestimonials />

      {/* FAQ Section */}
      <SurveyFAQ />

      {/* Survey Embed Section */}
      <section id="survey-embed" className="py-20 md:py-28 px-4">
        <div className="max-w-2xl mx-auto">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/3fa63fe05_image.png"
            alt="Check My Claim Survey"
            className="w-full rounded-3xl shadow-2xl"
          />
        </div>
      </section>

      <footer className="bg-[#0C2D5B] border-t border-white/10 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-white/60">© 2024 Check My Claim. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 text-white/70">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="/advertising-disclosure" className="hover:text-white transition-colors">Advertising Disclosure</a>
            <a href="/" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
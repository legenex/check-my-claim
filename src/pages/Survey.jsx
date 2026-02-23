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
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #061D32 0%, #0C2D5B 50%, #1B3A4F 100%)',
        backgroundAttachment: 'fixed',
        position: 'relative'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      <div className="relative z-10">
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
    </div>
  );
}
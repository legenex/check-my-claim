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
      <section className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/614888e84_image.png"
            alt="Get The Maximum Cash Payout For Your Accident Injury"
            className="w-full rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Process Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <SurveyProcess />
        </div>
      </div>

      {/* Fighting For You Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <SurveyFightingForYou />
        </div>
      </div>

      {/* Recent Wins Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <SurveyRecentWins />
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <SurveyGuarantee />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <SurveyTestimonials />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <SurveyFAQ />
        </div>
      </div>

      <footer className="bg-[#0C2D5B] border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-white/70 text-xs sm:text-sm mb-6 pb-6 border-b border-white/10">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="/advertising-disclosure" className="hover:text-white transition-colors">Advertising Disclosure</a>
            <a href="/" className="hover:text-white transition-colors">Contact</a>
          </div>

          {/* Disclaimer */}
          <div className="text-white/60 text-xs space-y-4 mb-6">
            <p>
              <strong>DISCLAIMER:</strong> CheckMyClaim.co is not a law firm or an attorney referral service. This advertisement is not legal advice and does not guarantee or predict the outcome of your legal matter. Every case is different, and results depend on the specific laws, facts, and circumstances of each individual case. Hiring an attorney is an important decision and should not be based solely on advertising. You may request free information about an attorney's background and experience.
            </p>
            <p>
              Advertising is paid for by participating attorneys in a joint advertising program. A complete list of participating attorneys is available upon request. You may request an attorney by name. This advertisement does not imply a higher quality of legal services than those provided by other attorneys, nor does it imply that any participating attorney is certified as a specialist or expert in any area of law. Past results referenced in advertising materials do not guarantee future outcomes.
            </p>
            <p>
              If you live in AL, FL, MO, NY, or WY, <a href="/advertising-disclosure" className="text-[#0285E9] hover:underline">click here to view additional information regarding attorney advertising disclosures in your state.</a>
            </p>
            <p>
              <strong>Cookies & Data Notice:</strong> We use cookies to personalize content and analyze website traffic. We may share information about your use of our site with analytics partners who may combine it with other information you have provided or that they have collected through your use of their services. By continuing to use this website, you consent to our use of cookies. You may request access to your data at any time.
            </p>
          </div>

          {/* Copyright */}
          <p className="text-white/40 text-xs text-center pt-4 border-t border-white/10">
            © 2024 Check My Claim. All rights reserved.
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
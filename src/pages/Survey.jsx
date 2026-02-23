import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/Footer";
import CallBanner from "@/components/survey/CallBanner";
import SurveyHero from "@/components/survey/SurveyHero";
import SurveyProcess from "@/components/survey/SurveyProcess";
import SurveyTestimonials from "@/components/survey/SurveyTestimonials";
import SurveyFAQ from "@/components/survey/SurveyFAQ";

export default function Survey() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061D32] via-[#0C2D5B] to-[#1B3A4F] overflow-x-hidden">
      <CallBanner />
      <Navbar />

      {/* Hero Section */}
      <SurveyHero />

      {/* Process Section */}
      <SurveyProcess />

      {/* Testimonials Section */}
      <SurveyTestimonials />

      {/* FAQ Section */}
      <SurveyFAQ />

      {/* Survey Embed Section */}
      <section id="survey-embed" className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/3fa63fe05_image.png"
            alt="Check My Claim Survey"
            className="w-full rounded-3xl shadow-2xl"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
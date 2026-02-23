import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/Footer";
import SurveyHero from "@/components/survey/SurveyHero";
import SurveyProcess from "@/components/survey/SurveyProcess";
import SurveyTestimonials from "@/components/survey/SurveyTestimonials";
import SurveyFAQ from "@/components/survey/SurveyFAQ";

export default function Survey() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061D32] via-[#0C2D5B] to-[#1B3A4F] overflow-x-hidden">
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
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#111E30] mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-center text-[#595E64] mb-8">
              The survey will load below. Answer a few quick questions about your accident to see if you qualify for compensation.
            </p>
            
            {/* Placeholder for external survey embed */}
            <div className="bg-gradient-to-br from-[#0C2D5B]/10 to-[#0285E9]/10 rounded-2xl p-8 md:p-12 text-center border-2 border-dashed border-[#0285E9]/30">
              <p className="text-[#595E64] mb-4">
                External Survey Widget will be embedded here
              </p>
              <p className="text-sm text-[#595E64]">
                Replace this with your actual survey embed code
              </p>
              {/* Example: <iframe src="..." style={{ width: '100%', height: '600px' }}></iframe> */}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-sm text-[#595E64]">
                ✓ 100% Free • ✓ No Win, No Fee • ✓ No Obligation • ✓ Instant Results
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
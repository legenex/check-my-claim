import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle, ArrowRight } from "lucide-react";

const before = [
  "Stressed and unsure if you even have a case.",
  "Buried in medical bills or lost income with no help.",
  "Confused by insurance offers or legal steps.",
];

const after = [
  "Clear answers on whether you might qualify for a claim in minutes.",
  "Matched with a top attorney suited to your case, at no upfront cost.",
  "Peace of mind knowing someone's fighting for what you might deserve.",
];

export default function Transformation() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#EBB63E] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F18913] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Floating icons/illustrations */}
      <div className="absolute top-20 left-10 opacity-20">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#EBB63E] to-[#F18913] flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F18913] to-[#EBB63E] flex items-center justify-center animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#EBB63E]/20 text-[#EBB63E] font-bold text-sm px-4 py-2 rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
            THE TRANSFORMATION
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            From Confusion to Clarity
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Life after an accident can be overwhelming. See the difference Claim Checker makes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Background card image */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/930aab1eb_2.png"
                alt="Before"
                className="w-full h-full object-cover opacity-10"
              />
            </div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 border-2 border-red-100 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-16 translate-x-16 opacity-50" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-bold text-sm px-5 py-2.5 rounded-full mb-6 shadow-sm">
                  <XCircle className="w-4 h-4" />
                  BEFORE
                </div>
                <div className="space-y-5">
                  {before.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-red-50/30 rounded-xl p-4">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[#1B2737] leading-relaxed font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Background card image */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/c7a33cdfe_1.png"
                alt="After"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative bg-gradient-to-br from-[#0C2D5B] to-[#1B2737] rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-[#EBB63E]/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBB63E]/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-[#EBB63E]/20 text-[#EBB63E] font-bold text-sm px-5 py-2.5 rounded-full mb-6 shadow-lg">
                  <CheckCircle className="w-4 h-4" />
                  AFTER
                </div>
                <div className="space-y-5">
                  {after.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-[#EBB63E]/10">
                      <CheckCircle className="w-5 h-5 text-[#EBB63E] mt-0.5 flex-shrink-0" />
                      <p className="text-gray-200 leading-relaxed font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center relative">
          {/* Decorative arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-50 animate-bounce">
            <svg className="w-8 h-8 text-[#EBB63E]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <button
            onClick={scrollTo}
            className="group bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
          >
            Transform Your Situation—Check Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
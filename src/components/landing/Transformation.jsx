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
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background images */}
      <div className="absolute top-10 left-0 w-64 h-64 opacity-5">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/930aab1eb_2.png"
          alt=""
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div className="absolute bottom-10 right-0 w-64 h-64 opacity-5">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/c7a33cdfe_1.png"
          alt=""
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-4">
            From Confusion to Clarity
          </h2>
          <p className="text-[#595E64] text-lg max-w-2xl mx-auto">
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

        <div className="text-center">
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
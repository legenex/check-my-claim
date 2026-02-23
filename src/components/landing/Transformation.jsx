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
    <section className="py-20 md:py-28 bg-[#F9F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-10 border border-red-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-bold text-sm px-4 py-2 rounded-full mb-6">
                <XCircle className="w-4 h-4" />
                BEFORE
              </div>
              <div className="space-y-5">
                {before.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[#1B2737] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0C2D5B] to-[#1B2737] rounded-3xl p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBB63E]/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-[#EBB63E]/20 text-[#EBB63E] font-bold text-sm px-4 py-2 rounded-full mb-6">
                <CheckCircle className="w-4 h-4" />
                AFTER
              </div>
              <div className="space-y-5">
                {after.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#EBB63E] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
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
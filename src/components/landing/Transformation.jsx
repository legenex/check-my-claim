import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle, ArrowRight } from "lucide-react";

const before = [
  "Stressed and unsure if you even have a case",
  "Buried in medical bills or lost income with no help",
  "Confused by insurance offers or legal steps",
];

const after = [
  "Clear answers on whether you might qualify for a claim in minutes",
  "Matched with a top attorney suited to your case, at no upfront cost",
  "Peace of mind knowing someone's fighting for what you might deserve",
];

export default function Transformation() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold text-sm px-5 py-2.5 rounded-full mb-4 shadow-lg">
            YOUR JOURNEY TO JUSTICE
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-4">
            From Confusion to Clarity
          </h2>
          <p className="text-[#595E64] text-xl max-w-3xl mx-auto leading-relaxed">
            See how Claim Checker transforms your accident recovery experience
          </p>
        </motion.div>

        {/* Before & After Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto mb-16">
          {/* BEFORE Block */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-3xl p-8 lg:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-full mb-6">
                <XCircle className="w-4 h-4" />
                BEFORE
              </div>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-[#0C2D5B] mb-6">
                Without Claim Checker
              </h3>
              <ul className="space-y-4">
                {before.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[#595E64] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* AFTER Block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl p-8 lg:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-green-500 text-white font-bold text-xs px-4 py-2 rounded-full mb-6">
                <CheckCircle className="w-4 h-4" />
                AFTER
              </div>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-[#0C2D5B] mb-6">
                With Claim Checker
              </h3>
              <ul className="space-y-4">
                {after.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-[#595E64] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="text-center relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[EBB63E] via-[#001634] to-[EBB63E] rounded-3xl p-10 md:p-12 shadow-2xl"
          >
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
              Ready to Transform Your Situation?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands who've found clarity, justice, and compensation through Claim Checker
            </p>
            <button
              onClick={scrollTo}
              className="group bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-10 py-5 rounded-full hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3 text-lg"
            >
              Start Your Free Claim Check Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-400 text-sm mt-4">✓ 100% Free • ✓ No Obligation • ✓ Takes 2 Minutes</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
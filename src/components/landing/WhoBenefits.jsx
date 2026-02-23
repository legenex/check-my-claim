import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const bullets = [
  "Injured in a car, truck, or rideshare accident in the last 12 months",
  "Struggling with medical bills, lost wages, or ongoing pain after a crash",
  "Unsure if you have a valid claim or if insurance offered enough",
  "Looking for a trusted way to connect with an attorney at no upfront cost",
];

export default function WhoBenefits() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - image/visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#0C2D5B] to-[#1B2737] rounded-3xl p-10 md:p-14 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#EBB63E] to-[#F18913] flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-2xl md:text-3xl font-bold mb-3">Free Claim Check</p>
              <p className="text-gray-400 mb-6">Find out in minutes if you may qualify</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Auto", "Slip & Fall", "Work", "Medical"].map((t, i) => (
                  <span key={i} className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 md:bottom-4 md:-right-6 bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-100">
              <p className="text-[#F18913] font-extrabold text-xl">$0</p>
              <p className="text-[#595E64] text-xs">Upfront Cost</p>
            </div>
          </motion.div>

          {/* Right - content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-4">
              Who Can Claim Checker Help?
            </h2>
            <p className="text-[#595E64] text-lg mb-8 leading-relaxed">
              If you've been in an accident, you might benefit from our free claim check. Here's who we're here for:
            </p>

            <div className="space-y-5 mb-10">
              {bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#EBB63E] to-[#F18913] flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[#1B2737] text-base leading-relaxed">{b}</p>
                </motion.div>
              ))}
            </div>

            <button
              onClick={scrollTo}
              className="group bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              See If You Qualify Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
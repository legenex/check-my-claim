import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield } from "lucide-react";

export default function SurveyGuarantee() {
  const guarantees = [
    "Free claim eligibility check, always 100% free",
    "Connected to attorneys who work on contingency",
    "Attorneys only get paid if you win your case",
    "No upfront costs or surprise bills from matched attorneys"
  ];

  return (
    <section className="py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#0285E9]/20 text-[#0285E9] text-sm font-bold px-4 py-2 rounded-full border border-[#0285E9]/30 uppercase tracking-wider">
            Our Guarantee
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Guarantee Badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="bg-gradient-to-br from-[#0285E9]/10 to-[#0486e9]/5 rounded-3xl p-12 border border-[#0285E9]/20 backdrop-blur-sm">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex justify-center mb-6"
                >
                  <div className="bg-gradient-to-r from-[#0285E9] to-[#0486e9] rounded-full p-6 shadow-lg">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">RISK-FREE GUARANTEE</p>
                  <p className="text-4xl font-extrabold text-white mb-2">100% FREE</p>
                  <p className="text-white/70">Zero Risk Guarantee</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Our Attorneys Don't Get Paid Unless You Do
            </h2>

            <p className="text-white/70 text-lg mb-8 font-semibold">
              THE NO WIN, NO FEE GUARANTEE
            </p>

            <p className="text-white/70 text-base mb-8 leading-relaxed">
              Check My Claim connects you with vetted attorneys in our network who work on a "no win, no fee" basis. This means the attorneys we match you with will not charge you a cent if they do not secure a positive outcome in your case. Our role is simple: we provide a free eligibility check and connect you with the right legal professional.
            </p>

            {/* Guarantee Points */}
            <div className="space-y-4 mb-10">
              {guarantees.map((guarantee, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-[#0285E9] flex-shrink-0 mt-0.5" />
                  <p className="text-white text-base leading-relaxed">{guarantee}</p>
                </motion.div>
              ))}
            </div>

            {/* Bottom Highlight */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-[#0285E9]/20 border-2 border-[#0285E9]/40 rounded-2xl p-6 text-center"
            >
              <p className="text-[#0285E9] font-extrabold text-xl uppercase tracking-wider">
                You Have Nothing To Lose!
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              href="#survey-embed"
              className="group block w-full text-center bg-gradient-to-r from-[#0285E9] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 mt-8"
            >
              Start Your Free Claim Check
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
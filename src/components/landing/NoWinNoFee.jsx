import React from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Users, ArrowRight } from "lucide-react";

export default function NoWinNoFee() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/c610dc138_Screenshot2026-02-23at123631.png"
                alt="Professional attorney"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C2D5B]/60 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl px-6 py-4 border-4 border-[#0C2D5B]">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#F18913]" />
                <div>
                  <p className="text-[#0C2D5B] font-extrabold text-xl">100% FREE</p>
                  <p className="text-[#595E64] text-xs">Zero Risk Guarantee</p>
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
            <div className="inline-flex items-center gap-2 bg-[#EBB63E]/20 text-[#EBB63E] font-bold text-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              OUR GUARANTEE
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              Our Attorneys Don't Get Paid Unless You Do
            </h2>

            <p className="text-xl font-bold text-[#EBB63E] mb-6">
              THE NO WIN, NO FEE GUARANTEE
            </p>

            <p className="text-gray-300 leading-relaxed mb-8">
              Claim Checker connects you with vetted attorneys in our network who work on a "no win, no fee" basis. This means the attorneys we match you with will not charge you a cent if they do not secure a positive outcome in your case. Our role is simple: we provide a free eligibility check and connect you with the right legal professional.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Free claim eligibility check—always 100% free",
                "Connected to attorneys who work on contingency",
                "Attorneys only get paid if you win your case",
                "No upfront costs or surprise bills from matched attorneys",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#EBB63E] to-[#F18913] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white font-medium">{item}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-[#EBB63E]/10 border border-[#EBB63E]/30 rounded-2xl p-6 mb-8">
              <p className="text-2xl font-extrabold text-[#EBB63E] text-center">
                YOU HAVE NOTHING TO LOSE!
              </p>
            </div>

            <button
              onClick={scrollTo}
              className="group bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
            >
              Start Your Free Claim Check
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
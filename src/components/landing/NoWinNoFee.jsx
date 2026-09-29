import React from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Users, ArrowRight } from "lucide-react";

export default function NoWinNoFee() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
<section className="py-20 md:py-28 bg-white relative overflow-hidden">
      
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
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/00a60e981_portrait-of-a-confident-young-businesswoman-workin-2026-01-09-09-11-16-utc.jpg"
                alt="Professional attorney"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111E30]/60 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl px-6 py-4 border-4 border-[#111E30]">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#0285E9]" />
                <div>
                  <p className="text-[#111E30] font-extrabold text-xl">100% FREE</p>
                  <p className="text-[#111E30] text-xs">Zero Risk Guarantee</p>
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
            <div className="inline-flex items-center gap-2 bg-[#0285E9]/20 text-[#0285E9] font-bold text-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              OUR GUARANTEE
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111E30] mb-6 leading-tight">
              Our Attorneys Don't Get Paid Unless You Do
            </h2>

            <p className="text-xl font-bold text-[#111E30] mb-6">
              THE NO WIN, NO FEE GUARANTEE
            </p>

            <p className="text-[#595E64] leading-relaxed mb-8">
              Check My Claim connects you with vetted attorneys in our network who work on a "no win, no fee" basis. This means the attorneys we match you with will not charge you a cent if they do not secure a positive outcome in your case. Our role is simple: we provide a free eligibility check and connect you with the right legal professional.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Free claim eligibility check, always 100% free",
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
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[#111E30] font-medium">{item}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-[#0285E9]/10 border border-[#0285E9]/30 rounded-2xl p-6 mb-8">
              <p className="text-2xl font-extrabold text-[#0285E9] text-center">
                YOU HAVE NOTHING TO LOSE!
              </p>
            </div>

            <a
              href="https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Home-Page&utm_medium=10th-Button"
              className="group bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
            >
              Start Your Free Claim Check
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
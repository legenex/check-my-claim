import React from "react";
import { motion } from "framer-motion";
import { Shield, Users, Award, HeartHandshake } from "lucide-react";

const stats = [
  { icon: Users, value: "10,000+", label: "People Helped" },
  { icon: Award, value: "500+", label: "Vetted Attorneys" },
  { icon: Shield, value: "$0", label: "Upfront Cost" },
  { icon: HeartHandshake, value: "100%", label: "Commitment" },
];

export default function AboutUs() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111E30] mb-4">
              About Check My Claim
            </h2>
            <p className="text-[#595E64] text-lg mb-6 leading-relaxed">
              We're here to help accident victims get the clarity and support they need. Fast and risk-free.
            </p>
            <p className="text-[#595E64] leading-relaxed mb-8">
              At Check My Claim, our mission is simple: to empower those injured in accidents by providing a free, AI-powered claim check. We connect you with top attorneys who work on a "no win, no fee" basis, so you have nothing to lose. With thousands helped nationwide, we're committed to fighting for the compensation you might deserve.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#F9F9FB] rounded-xl p-4 text-center"
                >
                  <stat.icon className="w-6 h-6 text-[#2590E6] mx-auto mb-2" />
                  <p className="text-2xl font-extrabold text-[#111E30]">{stat.value}</p>
                  <p className="text-[#595E64] text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#E8F4FD] to-[#2590E6]/20 rounded-3xl p-10 md:p-14">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/76654a39d_CheckMyClaimLogo.png"
                alt="Check My Claim"
                className="w-56 mx-auto mb-8"
              />
              <div className="space-y-4">
                {[
                  "Free AI-powered eligibility check",
                  "No win, no fee—zero risk",
                  "Matched with top attorneys nationwide",
                  "Fast, compassionate support",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#2590E6] to-[#1E7ACC]" />
                    <span className="text-[#111E30] font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
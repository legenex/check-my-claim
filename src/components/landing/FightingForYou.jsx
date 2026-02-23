import React from "react";
import { motion } from "framer-motion";
import { Scale, Award, Users, Shield, ArrowRight } from "lucide-react";

export default function FightingForYou() {
  const scrollTo = () =>
    document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F18913]/15 text-[#F18913] font-bold text-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#F18913]" />
              YOUR TRUSTED PARTNER
            </div>

            {/* Headline (was white -> navy) */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-6 leading-tight">
              We'll Never Stop Fighting For You
            </h2>

            {/* Subcopy (was light grey -> dark grey) */}
            <p className="text-xl text-[#595E64] mb-8 leading-relaxed">
              We work with only the best attorneys to get you the compensation you deserve.
            </p>

            {/* Feature list (clean white cards) */}
            <div className="space-y-6 mb-10">
              {[
                { icon: Scale, text: "Vetted attorneys with proven track records" },
                { icon: Award, text: "Thousands of successful claims nationwide" },
                { icon: Users, text: "Personalized legal care for every client" },
                { icon: Shield, text: "100% commitment to your success" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-200 hover:border-[#EBB63E]/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#EBB63E] to-[#F18913] flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Feature text (was white -> navy) */}
                  <p className="text-[#0C2D5B] font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA button (white text stays white for contrast) */}
            <button
              onClick={scrollTo}
              className="group bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
            >
              Get Your Free Claim Check
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/d2af9541c_Screenshot2026-02-23at123641.png"
                alt="Professional attorney"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>

            {/* Floating stats - left (label was light grey -> dark grey) */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl px-6 py-4 border border-gray-200">
              <p className="text-[#F18913] font-extrabold text-3xl">98%</p>
              <p className="text-[#595E64] text-sm font-medium">Success Rate</p>
            </div>

            {/* Floating stats - right (white -> navy, white/90 -> dark grey) */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-[#EBB63E] to-[#F18913] rounded-2xl shadow-2xl px-6 py-4">
              <p className="text-[#0C2D5B] font-extrabold text-3xl">$50M+</p>
              <p className="text-[#595E64] text-sm font-medium">Recovered</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
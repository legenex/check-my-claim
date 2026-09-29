import React from "react";
import { motion } from "framer-motion";
import { Scale, Award, Users, Shield, ArrowRight } from "lucide-react";

export default function FightingForYou() {
  const scrollTo = () =>
    document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[#111E30] via-[#0C1A2A] to-[#1B2737] relative overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#0285E9]/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-[#0486e9]/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-[#0285E9]/20 text-[#0285E9] font-bold text-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              YOUR TRUSTED PARTNER
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              We'll Never Stop Fighting For You
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We work with only the best attorneys to get you the compensation you
              deserve.
            </p>

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
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <a
              href="https://qualify.checkmyclaim.co/s/mva?utm_source=CMC-Website&utm_campaign=Home-Page&utm_medium=9th-Button"
              className="group bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
            >
              Get Your Free Claim Check
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#111E30]/30 to-transparent" />
            </div>

            {/* Floating stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl px-6 py-4 border-4 border-[#F9F9FB]">
              <p className="text-[#0285E9] font-extrabold text-3xl">98%</p>
              <p className="text-[#595E64] text-sm font-medium">Success Rate</p>
            </div>

            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] rounded-2xl shadow-2xl px-6 py-4">
              <p className="text-white font-extrabold text-3xl">$50M+</p>
              <p className="text-white/90 text-sm font-medium">Recovered</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
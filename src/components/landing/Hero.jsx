import React from "react";
import { motion } from "framer-motion";
import { Shield, Clock, DollarSign, ArrowRight } from "lucide-react";

export default function Hero() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-[#EBB63E] text-sm font-medium px-4 py-2 rounded-full mb-8 border border-[#EBB63E]/20"
          >
            <Shield className="w-4 h-4" />
            100% Free • No Win, No Fee • Fast Results
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
          >
            Check Your Claim,{" "}
            <span className="bg-gradient-to-r from-[#EBB63E] to-[#F18913] bg-clip-text text-transparent">
              Get What You Deserve
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            Unsure if you have a case after an accident? Our AI tool instantly checks if you may qualify for compensation and matches you with the best-suited attorney—at no upfront cost.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <button
              onClick={() => scrollTo("#home")}
              className="group relative bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold text-lg px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              Start Your Free Claim Check
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-400 text-sm">Takes less than 2 minutes</p>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { icon: Shield, label: "Vetted Attorneys Only" },
              { icon: DollarSign, label: "No Upfront Fees" },
              { icon: Clock, label: "Results in Minutes" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <item.icon className="w-4 h-4 text-[#EBB63E]" />
                <span className="text-white/80 text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
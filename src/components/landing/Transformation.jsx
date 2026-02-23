import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, ArrowRight, Clock, DollarSign, FileQuestion, CheckCircle2, Users, Shield } from "lucide-react";

export default function Transformation() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-[#EBB63E]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#0C2D5B]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold text-sm px-5 py-2.5 rounded-full mb-4 shadow-lg">
            <TrendingUp className="w-4 h-4" />
            YOUR JOURNEY TO JUSTICE
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-4">
            From Confusion to Clarity
          </h2>
          <p className="text-[#595E64] text-xl max-w-3xl mx-auto leading-relaxed">
            See how Claim Checker transforms your accident recovery experience in three simple steps
          </p>
        </motion.div>

        {/* Journey Timeline */}
        <div className="relative max-w-5xl mx-auto mb-16">
          {/* Timeline connector */}
          <div className="hidden md:block absolute left-1/2 top-24 bottom-24 w-1 bg-gradient-to-b from-red-200 via-yellow-200 to-green-200 -translate-x-1/2 z-0" />
          
          <div className="space-y-16">
            {/* Step 1: Before (Overwhelmed) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="md:text-right">
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-bold text-xs px-3 py-1.5 rounded-full mb-3">
                  <TrendingDown className="w-3.5 h-3.5" />
                  WITHOUT CLAIM CHECKER
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#0C2D5B] mb-4">Lost & Overwhelmed</h3>
                <p className="text-[#595E64] mb-6 text-lg">
                  After an accident, victims face mounting medical bills, confusing legal processes, and don't know where to turn for help.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: FileQuestion, text: "Don't know if you have a valid claim" },
                    { icon: Clock, text: "Waste weeks researching and calling attorneys" },
                    { icon: DollarSign, text: "Worried about upfront legal costs" },
                  ].map((item, i) => (
                    <div key={i} className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
                      <item.icon className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-[#1B2737] font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="order-first md:order-last">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=500&h=500&fit=crop"
                    alt="Stressed person"
                    className="rounded-2xl shadow-xl w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent rounded-2xl" />
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    ❌ Struggling Alone
                  </div>
                </div>
              </div>
              
              {/* Timeline dot */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-400 rounded-full border-4 border-white shadow-lg z-10" />
            </motion.div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
                <span>Start Free Claim Check</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Step 2: During (Getting Help) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-2 gap-8 items-center"
            >
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop"
                  alt="Getting help"
                  className="rounded-2xl shadow-xl w-full h-72 object-cover"
                />
                <div className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  ⚡ Taking Action
                </div>
              </div>
              
              <div>
                <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-600 font-bold text-xs px-3 py-1.5 rounded-full mb-3">
                  <Clock className="w-3.5 h-3.5" />
                  WITH CLAIM CHECKER
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#0C2D5B] mb-4">Quick Clarity & Support</h3>
                <p className="text-[#595E64] mb-6 text-lg">
                  Our AI-powered tool instantly evaluates your case and connects you with the perfect attorney—all in under 2 minutes.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle2, text: "Instant eligibility check in minutes" },
                    { icon: Users, text: "Matched with vetted attorneys" },
                    { icon: Shield, text: "100% free, no upfront costs" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-yellow-50 px-4 py-3 rounded-lg">
                      <item.icon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <span className="text-sm text-[#1B2737] font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Timeline dot */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-lg z-10" />
            </motion.div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
                <span>Get Justice</span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Step 3: After (Success) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="md:text-right">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 font-bold text-xs px-3 py-1.5 rounded-full mb-3">
                  <TrendingUp className="w-3.5 h-3.5" />
                  THE RESULT
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#0C2D5B] mb-4">Peace of Mind & Compensation</h3>
                <p className="text-[#595E64] mb-6 text-lg">
                  Your attorney fights for you on a no-win, no-fee basis, and you receive the compensation you deserve to move forward.
                </p>
                <div className="space-y-3">
                  {[
                    "Expert legal representation at zero upfront cost",
                    "Maximum compensation for your injuries and losses",
                    "Focus on recovery while we handle the legal battle",
                  ].map((text, i) => (
                    <div key={i} className="inline-flex items-start gap-2 bg-green-50 px-4 py-3 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#1B2737] font-medium text-left">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="order-first md:order-last">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=500&fit=crop"
                    alt="Happy family"
                    className="rounded-2xl shadow-xl w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent rounded-2xl" />
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    ✓ Life Restored
                  </div>
                  
                  {/* Success metric */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-extrabold text-green-600">$50M+</p>
                        <p className="text-xs text-[#595E64] font-medium">Recovered for clients</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-green-600">98%</p>
                        <p className="text-xs text-[#595E64] font-medium">Success rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timeline dot */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg z-10" />
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737] rounded-3xl p-10 md:p-12 shadow-2xl"
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
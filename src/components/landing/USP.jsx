import React from "react";
import { motion } from "framer-motion";
import { Zap, MessageSquare, DollarSign, ArrowRight } from "lucide-react";

const usps = [
  {
    icon: Zap,
    title: "Fast Approval",
    desc: "Other law firms can take weeks to return your calls and emails. Simply answer a few questions about your injury to see if we can help.",
  },
  {
    icon: MessageSquare,
    title: "Simple Case Management",
    desc: "Check in and see how your case is progressing, message your legal care team, or upload documents right from your phone.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    desc: "When we win a case, our fee ranges between 15-40% of the verdict or settlement we obtain. If we don't win, you'll never see a bill.",
  },
];

export default function USP() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F9E6BB]/30 to-transparent rounded-full -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#EBB63E]/10 to-transparent rounded-full translate-y-48 -translate-x-48" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-4">
            We Make Injury Claims Easy
          </h2>
          <p className="text-[#595E64] text-lg max-w-2xl mx-auto">
            Navigating the legal process shouldn't be complicated. We've streamlined everything to get you the help you need, when you need it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {usps.map((usp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-gradient-to-br from-white to-[#F9F9FB] rounded-2xl p-8 border border-gray-100 hover:border-[#EBB63E]/30 hover:shadow-xl transition-all duration-500 group"
            >
              <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-[#EBB63E] to-[#F18913] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                <usp.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0C2D5B] mb-3">{usp.title}</h3>
              <p className="text-[#595E64] leading-relaxed">{usp.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={scrollTo}
            className="group bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
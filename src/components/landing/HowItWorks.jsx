import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, Cpu, UserCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "Step 1",
    title: "Complete Our Free Eligibility Check",
    desc: "Answer a few quick questions about your accident. This service is 100% free with no obligations.",
  },
  {
    icon: Cpu,
    step: "Step 2",
    title: "Get Your Results Instantly",
    desc: "Our AI-powered tool analyzes your information to determine if you might qualify for compensation.",
  },
  {
    icon: UserCheck,
    step: "Step 3",
    title: "We Connect You to a Vetted Attorney",
    desc: "If eligible, we'll match you with a trusted attorney from our network who works on a no win, no fee basis. From there, the attorney takes over your case.",
  },
];

export default function HowItWorks() {
  const scrollTo = () => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111E30] mb-4">
            Our Simple 3-Step Process
          </h2>
          <p className="text-[#595E64] text-lg max-w-2xl mx-auto">
            Getting help after an accident shouldn't be hard. Here's how Check My Claim works:
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] opacity-30" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[#0285E9] font-bold text-sm tracking-wider uppercase mb-2 block">
                {step.step}
              </span>
              <h3 className="text-xl font-bold text-[#111E30] mb-3">{step.title}</h3>
              <p className="text-[#595E64] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={scrollTo}
            className="group bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
          >
            Start Your Free Survey Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
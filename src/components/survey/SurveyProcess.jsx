import React from "react";
import { motion } from "framer-motion";
import { CheckSquare, Zap, Users } from "lucide-react";

export default function SurveyProcess() {
  const steps = [
    {
      icon: CheckSquare,
      number: "1",
      title: "Complete Our Free Eligibility Check",
      description: "Answer a few quick questions about your accident. This service is 100% free with no obligations."
    },
    {
      icon: Zap,
      number: "2",
      title: "Get Your Results Instantly",
      description: "Our AI-powered tool analyzes your information to determine if you might qualify for compensation."
    },
    {
      icon: Users,
      number: "3",
      title: "We Connect You to a Vetted Attorney",
      description: "If eligible, we'll match you with a trusted attorney from our network who works on a no win, no fee basis."
    }
  ];

  return (
    <section className="py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-5xl font-extrabold text-white mb-4"
          >
            Our Simple 3-Step Process
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs md:text-lg text-white/80 max-w-2xl mx-auto"
          >
            Getting help after an accident shouldn't be hard. Here's how Check My Claim works:
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-1 bg-gradient-to-r from-[#0285E9] to-transparent" />
              )}

              <div className="text-center">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0285E9] to-[#0486e9] flex items-center justify-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Step Number */}
                <p className="text-[#0285E9] font-bold text-sm mb-3 uppercase tracking-wider">
                  Step {step.number}
                </p>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <a
            href="#survey-embed"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#0285E9] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
          >
            Start Your Free Survey Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export default function SurveyRecentWins() {
  const wins = [
    { amount: "$132,700", name: "Mike P", age: 31, location: "Memphis, TN" },
    { amount: "$197,500", name: "John M", age: 54, location: "Tampa, FL" },
    { amount: "$114,600", name: "Sarah J", age: 43, location: "Los Angeles, CA" }
  ];

  return (
    <section className="py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            We'll Never Stop Fighting For You
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/70"
          >
            We work with only the best attorneys to get you the compensation you deserve.
          </motion.p>
        </div>

        {/* Wins Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {wins.map((win, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0285E9] to-[#0486e9] flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>

              <p className="text-[#0285E9] font-bold text-sm uppercase tracking-wider mb-2">
                Recent Win
              </p>
              <p className="text-4xl font-extrabold text-[#111E30] mb-4">
                {win.amount}
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-[#111E30] font-bold">{win.name}, {win.age}</p>
                <p className="text-[#595E64] text-sm">{win.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <a
            href="#survey-embed"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#0285E9] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
          >
            Check My Claim Now
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
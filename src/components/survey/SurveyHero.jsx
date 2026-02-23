import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function SurveyHero() {
  const handleStartSurvey = () => {
    document.getElementById("survey-embed").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#0285E9] font-semibold text-center mb-4"
          >
            FREE 30-SECOND QUIZ
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-center text-[#111E30] mb-4"
          >
            Get The Maximum Cash Payout For Your Accident Injury!!
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center text-[#595E64] text-lg mb-8"
          >
            Take the 30 second quiz to start the process of seeing how much your claim could be worth
          </motion.p>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#111E30] text-center mb-2">
              How Were You Injured?
            </h2>
            <p className="text-center text-[#595E64]">
              Select The Type Of Accident You Were Involved In:
            </p>
          </motion.div>

          {/* Accident Type Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
          >
            {[
              "Auto / Motorcycle Accident",
              "Commercial / Semi Accident",
              "Passenger / Rideshare / Pedestrian Accident",
              "At Work / Other / I Wasn't Injured"
            ].map((type, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(2, 133, 233, 0.3)" }}
                onClick={handleStartSurvey}
                className="bg-gradient-to-r from-[#0C2D5B] to-[#1B3A4F] hover:from-[#0285E9] hover:to-[#0486e9] text-white font-bold py-4 px-6 rounded-2xl border-2 border-[#0285E9]/30 hover:border-[#0285E9] transition-all duration-300"
              >
                {type}
              </motion.button>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={handleStartSurvey}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#0285E9] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              Start Your Free Survey Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-[#595E64]"
          >
            <span>✓ 100% Free</span>
            <span>✓ No Win, No Fee</span>
            <span>✓ No Obligation</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
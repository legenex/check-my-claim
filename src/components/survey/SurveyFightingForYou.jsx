import React from "react";
import { motion } from "framer-motion";
import { Award, Target, Users, Shield } from "lucide-react";

export default function SurveyFightingForYou() {
  const benefits = [
    {
      icon: Award,
      title: "Vetted attorneys with proven track records"
    },
    {
      icon: Target,
      title: "Thousands of successful claims nationwide"
    },
    {
      icon: Users,
      title: "Personalized legal care for every client"
    },
    {
      icon: Shield,
      title: "100% commitment to your success"
    }
  ];

  return (
    <section className="py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#0285E9]/20 text-[#0285E9] text-sm font-bold px-4 py-2 rounded-full border border-[#0285E9]/30 uppercase tracking-wider">
            Your Trusted Partner
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-lg md:text-5xl font-extrabold text-white mb-6 leading-tight">
              We'll Never Stop Fighting For You
            </h2>
            <p className="text-white/70 text-sm md:text-lg mb-8">
              We work with only the best attorneys to get you the compensation you deserve.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#0285E9]/20">
                      <benefit.icon className="h-6 w-6 text-[#0285E9]" />
                    </div>
                  </div>
                  <p className="text-white font-medium text-sm md:text-base">{benefit.title}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              href="#survey-embed"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#0285E9] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 mt-8"
            >
              Get Your Free Claim Check
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Right Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#0285E9]/20 to-[#0486e9]/10 rounded-3xl p-8 border border-[#0285E9]/20 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-8 -right-8 bg-gradient-to-r from-[#0285E9] to-[#0486e9] text-white px-6 py-4 rounded-2xl shadow-xl"
              >
                <p className="text-2xl md:text-3xl font-extrabold">$50M+</p>
                <p className="text-xs md:text-sm font-semibold">Recovered</p>
              </motion.div>

              <div className="pt-8">
                <p className="text-white/60 text-xs md:text-sm mb-2">TOTAL CLIENT WINS</p>
                <p className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                  50,000+
                </p>
                <p className="text-white/70">
                  Successful claims resolved nationwide, with millions recovered for clients
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
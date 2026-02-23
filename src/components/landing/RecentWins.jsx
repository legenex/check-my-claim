import React from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";

const wins = [
  { amount: "$132,700", name: "Mike P, 31", location: "Memphis, TN" },
  { amount: "$197,500", name: "John M, 54", location: "Tampa, FL" },
  { amount: "$114,600", name: "Sarah J, 43", location: "Los Angeles, CA" },
];

export default function RecentWins() {
  const scrollTo = () =>
    document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          {/* white -> navy */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111E30] mb-4">
            We'll Never Stop Fighting For You
          </h2>

          {/* light grey -> dark grey */}
          <p className="text-[#595E64] text-lg max-w-2xl mx-auto">
            We work with only the best attorneys to get you the compensation you deserve.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {wins.map((win, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-[#0285E9]/40 hover:shadow-xl transition-all duration-500 group"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#0285E9]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-[#0285E9]" />
              </div>

              {/* light grey -> dark grey */}
              <p className="text-sm text-[#595E64] font-medium uppercase tracking-wider mb-1">
                Recent Win
              </p>

              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] bg-clip-text text-transparent mb-3">
                {win.amount}
              </p>

              {/* white -> navy */}
              <p className="text-[#111E30] font-semibold">{win.name}</p>

              {/* light grey -> dark grey */}
              <p className="text-[#595E64] text-sm">{win.location}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={scrollTo}
            className="group bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
          >
            Check My Claim Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
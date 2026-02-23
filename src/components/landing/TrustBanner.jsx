import React from "react";
import { motion } from "framer-motion";

const items = ["100% FREE", "NO WIN, NO FEE", "FAST RESULTS", "VETTED ATTORNEYS"];

export default function TrustBanner() {
  return (
    <section className="relative bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-white font-extrabold text-sm md:text-base tracking-[0.15em]">
                {item}
              </span>
              {i < items.length - 1 && (
                <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
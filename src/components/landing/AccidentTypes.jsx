import React from "react";
import { motion } from "framer-motion";
import { Car, Truck, Users, HardHat } from "lucide-react";

const types = [
  {
    icon: Car,
    title: "Auto Accidents",
    desc: "Getting paid for your injury shouldn't be an accident.",
  },
  {
    icon: Truck,
    title: "Commercial Accidents",
    desc: "Get the compensation you deserve from commercial vehicle incidents.",
  },
  {
    icon: Users,
    title: "Ride Share Accidents",
    desc: "Don't let ride share companies deny your rightful claim.",
  },
  {
    icon: HardHat,
    title: "Work Place Accidents",
    desc: "Filing an injury claim shouldn't feel like working another job.",
  },
];

export default function AccidentTypes() {


  return (
    <section id="services" className="py-20 md:py-28 bg-[#F9F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111E30] mb-4">
            We're Accident Compensation Specialists
          </h2>
          <p className="text-[#595E64] text-lg max-w-2xl mx-auto">
            Every case is special. Our team is large and diverse, but our mission is singular: To deliver the best results for you and your family.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {types.map((type, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl p-8 text-center border border-gray-100 hover:border-[#0285E9]/30 hover:shadow-xl transition-all duration-500 cursor-pointer"
              onClick={scrollTo}
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <type.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#111E30] mb-2">{type.title}</h3>
              <p className="text-[#595E64] text-sm leading-relaxed mb-4">{type.desc}</p>
              <span className="text-[#0285E9] font-semibold text-sm group-hover:underline">
                Check Your Claim →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function SurveyTestimonials() {
  const testimonials = [
    {
      name: "Jason Lambert",
      time: "1 Month ago",
      rating: 5,
      text: "I had no clue how to handle my claim after my crash, but they did everything. Start to finish: professional, efficient, and got me the best possible outcome.",
      initials: "JL",
      bgColor: "bg-slate-700"
    },
    {
      name: "Dana Hopson",
      time: "2 Weeks ago",
      rating: 5,
      text: "My car was totaled, and I had no idea what to do next. Thanks to Check a Case, I received compensation fast, and it was more than I expected!",
      initials: "DH",
      bgColor: "bg-blue-600"
    },
    {
      name: "Kyle Benavides",
      time: "4 Months ago",
      rating: 3,
      text: "I wasn't sure at first but really check a case turned out to be a blessing! We got connected with top specialists and our claim was handled smoothly.",
      initials: "KB",
      bgColor: "bg-blue-600"
    },
    {
      name: "Trevon Obral",
      time: "3 Weeks ago",
      rating: 5,
      text: "Got covered for all the damage and had money to spare. Check came through fast and they were a pleasure to deal with.",
      initials: "TO",
      bgColor: "bg-slate-700"
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
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl font-extrabold text-white mb-4"
            >
             Loved By Thousands of Clients
            </motion.h2>
            <motion.p
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-sm md:text-lg text-white/80"
          >
            See what our satisfied clients have to say
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - testimonial.rating)].map((_, j) => (
                  <Star key={j + testimonial.rating} className="w-5 h-5 text-gray-300" />
                ))}
              </div>

              {/* Text */}
              <p className="text-[#595E64] text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className={`w-10 h-10 rounded-full ${testimonial.bgColor} flex items-center justify-center text-white font-bold text-sm`}>
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-bold text-[#111E30] text-sm">{testimonial.name}</p>
                  <p className="text-[#595E64] text-xs">{testimonial.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
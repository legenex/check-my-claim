import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Jason Lambert",
    time: "1 Month ago",
    stars: 5,
    text: "I had no clue how to handle my claim after my crash, but they did everything. Start to finish: professional, efficient, and got me the best possible outcome.",
    avatar: "JL",
    color: "bg-[#0C2D5B]",
  },
  {
    name: "Dana Hopson",
    time: "2 Weeks ago",
    stars: 5,
    text: "My car was totaled, and I had no idea what to do next. Thanks to Claim Checker, I received compensation fast, and it was more than I expected!",
    avatar: "DH",
    color: "bg-[#F18913]",
  },
  {
    name: "Kyle Benavides",
    time: "4 Months ago",
    stars: 4,
    text: "I wasn't sure at first but really check a case turned out to be a blessing! We got connected with top specialists and our claim was handled smoothly.",
    avatar: "KB",
    color: "bg-[#EBB63E]",
  },
  {
    name: "Trevon Obral",
    time: "3 Weeks ago",
    stars: 5,
    text: "Got covered for all the damage and had money to spare. Claim Checker came through fast and they were a pleasure to deal with.",
    avatar: "TO",
    color: "bg-[#0C2D5B]",
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? "fill-[#EBB63E] text-[#EBB63E]" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-4">
            Real Stories, Real Results
          </h2>
          <p className="text-[#595E64] text-lg max-w-2xl mx-auto">
            Don't just take our word for it—hear from real people who used Claim Checker to get the compensation they deserved.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold">{review.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0C2D5B] text-sm">{review.name}</p>
                    <p className="text-xs text-[#595E64]">{review.time}</p>
                  </div>
                </div>
                {/* Google icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <StarRating count={review.stars} />
              <p className="mt-4 text-[#595E64] text-sm leading-relaxed">
                {review.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
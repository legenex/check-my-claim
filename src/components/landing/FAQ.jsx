import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Personal injury lawyer: how does Claim Checker help you find one?",
    a: "If you are searching for a personal injury lawyer after an accident, Claim Checker helps you start with a quick eligibility check instead of calling random firms. If your case looks like a fit, we connect you with a vetted attorney for a review. Claim Checker is not a law firm and does not provide legal advice.",
  },
  {
    q: "Personal injury attorney vs personal injury lawyer: what is the difference?",
    a: "In most states, the terms personal injury attorney and personal injury lawyer are used the same way. What matters is whether the lawyer handles your type of accident and can explain fees and next steps clearly. Claim Checker can help you do a fast claim check and get routed to a vetted attorney if eligible.",
  },
  {
    q: "Injury lawyer: when should I talk to one after an accident?",
    a: "If you have injuries, medical visits, time off work, or an insurance offer that feels low, it is worth getting a legal review. Claim Checker helps you check eligibility quickly and connect with an injury lawyer if your claim qualifies for review.",
  },
  {
    q: "Lawyer for motor vehicle accident: do I need one to file a claim?",
    a: "You can often start a claim without a lawyer, but legal review can help if fault is disputed, injuries are serious, or the insurer is delaying or lowballing. Claim Checker helps you do a quick motor vehicle accident claim check and, if eligible, connect you with a vetted lawyer for review.",
  },
  {
    q: "Motor vehicle accident attorneys: how do I find the right one?",
    a: "Look for an attorney who regularly handles motor vehicle accident cases, explains fees upfront, and is responsive. Claim Checker helps you avoid wasted calls by screening your situation first and connecting you with a vetted attorney if your claim appears eligible.",
  },
  {
    q: "Car accident personal injury lawyer: what can they help with?",
    a: "A car accident personal injury lawyer can review liability, medical documentation, damages, and settlement offers. If you are unsure whether your case is worth pursuing, Claim Checker starts with a quick eligibility check and can connect you with a vetted attorney for a review.",
  },
  {
    q: "Car accident personal injury attorney: how fast can I speak to one?",
    a: "Timing depends on availability, but the fastest path is to have your basic details ready and start with a structured claim check. Claim Checker helps you capture the key facts quickly and can connect you with a vetted car accident personal injury attorney if eligible.",
  },
  {
    q: "Auto accident personal injury lawyer: do I qualify if I was partly at fault?",
    a: "In many states, you may still have options even if you share some fault, but the rules can affect the outcome. Claim Checker helps you check eligibility based on your situation and connect to a vetted auto accident personal injury lawyer for review if it looks like a fit.",
  },
  {
    q: "Car accident injury lawyers: what should I ask before hiring?",
    a: "Ask about experience with your injury type, typical timelines, how fees work, and what they need from you to evaluate the claim. Claim Checker helps you start with an eligibility check so your first attorney conversation is more focused.",
  },
];

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left gap-4 group"
      >
        <span className={`text-base md:text-lg font-semibold transition-colors duration-300 ${isOpen ? "text-[#F18913]" : "text-[#0C2D5B]"}`}>
          {faq.q}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isOpen ? "rotate-180 text-[#F18913]" : "text-[#595E64]"}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-[#595E64] leading-relaxed pb-6 pr-8">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#F9F9FB]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0C2D5B] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[#595E64] text-lg">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 md:px-8"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
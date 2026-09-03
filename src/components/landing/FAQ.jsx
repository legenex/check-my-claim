import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Personal injury lawyer: how does Check My Claim help you find one?",
    a: "If you are searching for a personal injury lawyer after an accident, Check My Claim helps you start with a quick eligibility check instead of calling random firms. If your case looks like a fit, we connect you with a vetted attorney for a review. Check My Claim is not a law firm and does not provide legal advice.",
  },
  {
    q: "Personal injury attorney vs personal injury lawyer: what is the difference?",
    a: "In most states, the terms personal injury attorney and personal injury lawyer are used the same way. What matters is whether the lawyer handles your type of accident and can explain fees and next steps clearly. Check My Claim can help you do a fast claim check and get routed to a vetted attorney if eligible.",
  },
  {
    q: "Injury lawyer: when should I talk to one after an accident?",
    a: "If you have injuries, medical visits, time off work, or an insurance offer that feels low, it is worth getting a legal review. Check My Claim helps you check eligibility quickly and connect with an injury lawyer if your claim qualifies for review.",
  },
  {
    q: "Lawyer for motor vehicle accident: do I need one to file a claim?",
    a: "You can often start a claim without a lawyer, but legal review can help if fault is disputed, injuries are serious, or the insurer is delaying or lowballing. Check My Claim helps you do a quick motor vehicle accident claim check and, if eligible, connect you with a vetted lawyer for review.",
  },
  {
    q: "Motor vehicle accident attorneys: how do I find the right one?",
    a: "Look for an attorney who regularly handles motor vehicle accident cases, explains fees upfront, and is responsive. Check My Claim helps you avoid wasted calls by screening your situation first and connecting you with a vetted attorney if your claim appears eligible.",
  },
  {
    q: "Car accident personal injury lawyer: what can they help with?",
    a: "A car accident personal injury lawyer can review liability, medical documentation, damages, and settlement offers. If you are unsure whether your case is worth pursuing, Check My Claim starts with a quick eligibility check and can connect you with a vetted attorney for a review.",
  },
  {
    q: "Car accident personal injury attorney: how fast can I speak to one?",
    a: "Timing depends on availability, but the fastest path is to have your basic details ready and start with a structured claim check. Check My Claim helps you capture the key facts quickly and can connect you with a vetted car accident personal injury attorney if eligible.",
  },
  {
    q: "Auto accident personal injury lawyer: do I qualify if I was partly at fault?",
    a: "In many states, you may still have options even if you share some fault, but the rules can affect the outcome. Check My Claim helps you check eligibility based on your situation and connect to a vetted auto accident personal injury lawyer for review if it looks like a fit.",
  },
  {
    q: "Car accident injury lawyers: what should I ask before hiring?",
    a: "Ask about experience with your injury type, typical timelines, how fees work, and what they need from you to evaluate the claim. Check My Claim helps you start with an eligibility check so your first attorney conversation is more focused.",
  },
];

function FAQItem({ faq, isOpen, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <button
        onClick={onClick}
        className="w-full flex items-start justify-between p-6 md:p-8 text-left gap-4 group"
      >
        <div className="flex items-start gap-4 flex-1">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-gradient-to-br from-[#4ba8ee] to-[#0486e9]" : "bg-[#0285E9]/10"}`}>
            <HelpCircle className={`w-5 h-5 transition-colors duration-300 ${isOpen ? "text-white" : "text-[#0285E9]"}`} />
          </div>
          <span className={`text-base md:text-lg font-semibold transition-colors duration-300 leading-relaxed ${isOpen ? "text-[#0285E9]" : "text-[#111E30]"}`}>
            {faq.q}
          </span>
        </div>
        <ChevronDown
          className={`w-6 h-6 flex-shrink-0 transition-all duration-300 ${isOpen ? "rotate-180 text-[#0285E9]" : "text-[#595E64]"}`}
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
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <div className="pl-14">
                <p className="text-[#595E64] leading-relaxed text-base">{faq.a}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-gradient-to-br from-[#F9FAFB] to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0285E9]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#0486e9]/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#0285E9]/10 text-[#0285E9] font-bold text-sm px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111E30] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[#595E64] text-lg md:text-xl max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <div className="grid gap-4 md:gap-6">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>

        {/* CTA at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-[#595E64] text-lg mb-6">
            Still have questions? Start your free claim check now.
          </p>
          <a
            href="https://qualify.checkmyclaim.co/s/auto?utm_source=CMC-Website&utm_campaign=Home-Page&utm_medium=12th-Button"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
          >
            Get Started Now
            <ChevronDown className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
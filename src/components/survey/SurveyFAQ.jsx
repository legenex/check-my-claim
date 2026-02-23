import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function SurveyFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How long does the survey take?",
      answer: "Our free eligibility check takes just 30 seconds to complete. You'll answer a few quick questions about your accident, and we'll provide instant results."
    },
    {
      question: "Is the survey really free?",
      answer: "Yes, 100% free with no hidden costs or obligations. You can complete the survey risk-free and see if you qualify for compensation."
    },
    {
      question: "What happens after I complete the survey?",
      answer: "If you qualify, one of our trusted advisors will contact you to discuss your case and connect you with a vetted attorney from our network."
    },
    {
      question: "Do I have to pay an attorney if I hire one?",
      answer: "No upfront costs. Our network attorneys work on a 'No Win, No Fee' basis, meaning they only get paid if you receive compensation."
    },
    {
      question: "Will my information be kept private?",
      answer: "Yes, your privacy is important to us. All information is handled securely and we never share your details without your consent."
    },
    {
      question: "Can I redo the survey if I made a mistake?",
      answer: "Absolutely. You can retake the survey at any time or discuss any details with one of our advisors who will be happy to clarify your answers."
    }
  ];

  return (
    <section className="py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80"
          >
            Everything you need to know about our survey and process
          </motion.p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-6 md:px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-colors duration-300"
              >
                <h3 className="text-left text-lg font-bold text-white">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-[#0285E9] flex-shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 md:px-8 pb-5 border-t border-white/10"
                  >
                    <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
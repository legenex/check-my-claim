import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Clock, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/e98b03e94_PrimaryLogo_ClaimChecker1.png";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Claim Checker" className="h-12 mx-auto" />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-extrabold text-[#0C2D5B] text-center mb-4"
          >
            Thank You for Submitting Your Claim!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#595E64] text-lg text-center mb-8"
          >
            We've received your information and are working to match you with the perfect attorney for your case.
          </motion.p>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-[#EBB63E]/10 to-[#F18913]/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-[#0C2D5B] mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#F18913]" />
              What Happens Next?
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Review & Analysis",
                  description: "Our team is reviewing your claim details right now",
                },
                {
                  step: "2",
                  title: "Attorney Match",
                  description: "We'll connect you with a qualified attorney from our network",
                },
                {
                  step: "3",
                  title: "Direct Contact",
                  description: "An attorney will reach out within 24-48 hours to discuss your case",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#EBB63E] to-[#F18913] flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0C2D5B]">{item.title}</h3>
                    <p className="text-[#595E64] text-sm">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-[#0C2D5B]/5 rounded-xl p-4 mb-8"
          >
            <p className="text-[#0C2D5B] text-sm font-medium text-center mb-2">
              Need immediate assistance?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-[#595E64]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F18913]" />
                support@claimchecker.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F18913]" />
                1-800-CLAIM-CK
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <Link
              to={createPageUrl("Home")}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#EBB63E] to-[#F18913] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
            >
              Return to Home
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-white/60 text-sm text-center mt-6"
        >
          ✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure
        </motion.p>
      </motion.div>
    </div>
  );
}
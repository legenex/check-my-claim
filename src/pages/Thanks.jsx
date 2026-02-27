import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Phone, ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import LandingFooter from "@/components/landing/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/ed9e4ff65_PrimaryLogo_CheckMyClaim.png";

export default function Thanks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737]">
      {/* Custom Header */}
      <header className="bg-white shadow-md px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src={LOGO_URL} alt="Check My Claim" className="h-10 md:h-14 w-auto" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[#111E30] text-sm font-medium">Prefer to speak to someone right now?</span>
            <a
              href="tel:+18447381035"
              className="flex items-center gap-2 bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-sm"
            >
              <Phone className="w-4 h-4" />
              <span className="__tc_dni_phone">(844) 738 1035</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center px-4 pb-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl w-full"
        >
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-extrabold text-[#0C2D5B] text-center mb-4"
            >
              Thank You!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#0C2D5B] text-xl font-bold text-center mb-4"
            >
              We Have Received Your Details!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-[#595E64] text-lg text-center mb-2"
            >
              One of our trusted advisors will call you in the next few minutes!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold text-center py-3 px-4 rounded-xl mb-2"
            >
              Please Make Sure To Answer your Phone!
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-[#595E64] text-sm text-center mb-8 italic"
            >
              <strong>PLEASE NOTE:</strong> We cannot proceed with your case without talking to you on the phone and confirming your case details…
            </motion.p>

            {/* Call Now CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-[#4ba8ee]/10 to-[#0486e9]/10 rounded-2xl p-6 mb-8 text-center"
            >
              <h3 className="text-xl font-bold text-[#0C2D5B] mb-4">
                Don't Wanna Wait? Click the button below to call now, and fast track your claim..
              </h3>
              <a
                href="tel:+18447381035"
                className="bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] hover:shadow-2xl hover:shadow-blue-500/40 text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
              >
                <Phone className="w-6 h-6" />
                Call Us Now
              </a>
              <p className="text-[#595E64] text-sm mt-3">
                <span className="__tc_dni_phone">(844) 738 1035</span>
              </p>
            </motion.div>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <Link
                to={createPageUrl("Home")}
                className="group inline-flex items-center gap-2 border border-gray-300 text-[#0C2D5B] font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-white/60 text-sm text-center mt-6"
          >
            ✓ 100% Free • ✓ No Obligation • ✓ Your Information is Secure
          </motion.p>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
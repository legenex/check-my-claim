import React from "react";
import { motion } from "framer-motion";
import { XCircle, Phone, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LandingFooter from "@/components/landing/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png";
const LOGO_BOTTOM_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/5fbaf5c73_PrimaryLogo_CheckMyClaim.png";

export default function Sorry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737]">
      {/* Custom Header - same as Thanks page */}
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
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-extrabold text-[#0C2D5B] text-center mb-4"
            >
              Sorry!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#0C2D5B] text-xl font-bold text-center mb-4"
            >
              Based on your answers, We Are Unable To Help!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[#595E64] text-lg text-center mb-6"
            >
              Unfortunately, based on the information you provided, we are unable to assist with your claim at this time.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-[#595E64] text-base text-center mb-8"
            >
              We appreciate your interest and wish you the best in finding the right assistance for your situation.
            </motion.p>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mb-8"
            >
              <Link
                to={createPageUrl("Home")}
                className="group inline-flex items-center gap-2 border border-gray-300 text-[#0C2D5B] font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Home
              </Link>
            </motion.div>

            {/* Bottom Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col items-center gap-3 border-t border-gray-200 pt-6"
            >
              <img src={LOGO_BOTTOM_URL} alt="Check My Claim" className="h-10" />
              <p className="text-[#595E64] text-xs text-center">
                Your privacy is important to us. We will never share your information without your consent.
              </p>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
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
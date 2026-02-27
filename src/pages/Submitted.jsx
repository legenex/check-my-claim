import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Clock, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LandingFooter from "@/components/landing/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/checkmyclaim-logo.png";
const PHONE_NUMBER = "1-800-CLAIM-CK";

export default function Submitted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737]">
      {/* Custom Header */}
      <header className="bg-white shadow-md px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src={LOGO_URL} alt="Check My Claim" className="h-10 md:h-14 w-auto" />
          <div className="flex items-center gap-3">
            <span className="text-[#111E30] text-sm font-medium hidden sm:inline">Prefer to speak to someone right now?</span>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-sm"
            >
              <Phone className="w-4 h-4" />
              {PHONE_NUMBER}
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
            Congrats!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#0C2D5B] text-xl font-bold text-center mb-4"
          >
            Based On Your Answers, It Appears You May Have A High Value Claim!
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

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-[#4ba8ee]/10 to-[#0486e9]/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-[#0C2D5B] mb-6 text-center flex items-center justify-center gap-2">
              <Clock className="w-6 h-6 text-[#0285E9]" />
              Here's What To Expect Next:
            </h2>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl p-5 shadow-lg border-2 border-[#0285E9]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0C2D5B] text-lg mb-2">📞 Step 1: We Will Call You (Next Few Minutes!)</h3>
                    <p className="text-[#595E64] font-medium">
                      One of our trusted advisors will call your phone to verify your details and connect you with the right attorney. <strong className="text-[#0285E9]">Please answer the call!</strong>
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4 bg-white rounded-xl p-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-[#0C2D5B] mb-1">Attorney Review</h3>
                  <p className="text-[#595E64] text-sm">Your matched attorney will review your case details thoroughly.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex gap-4 bg-white rounded-xl p-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-[#0C2D5B] mb-1">Case Initiation (No Cost To You)</h3>
                  <p className="text-[#595E64] text-sm">Your attorney starts your case with zero upfront fees - they only get paid when you win.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="flex gap-4 bg-white rounded-xl p-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-[#0C2D5B] mb-1">Settlement & Compensation</h3>
                  <p className="text-[#595E64] text-sm">Your attorney presents settlement options and fights for maximum compensation.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* NO WIN, NO FEE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-extrabold text-[#0C2D5B] mb-3 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              NO WIN, NO FEE Guarantee:
            </h3>
            <p className="text-[#595E64] text-sm leading-relaxed mb-4">
              The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident. They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
            </p>
            <p className="text-2xl font-extrabold text-[#0285E9] text-center">
              YOU HAVE NOTHING TO LOSE!
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="text-center"
          >
            <Link
              to={createPageUrl("Home")}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
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
          transition={{ delay: 1.4 }}
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
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/08c3eb029_CheckMyClaimLogoLight.png";

export default function Thanks() {
  const navigate = useNavigate();

  const handleCallNow = () => {
    window.location.href = "tel:1-800-CLAIM-CK";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full flex-1 flex items-center justify-center"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] px-8 py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4"
            >
              <CheckCircle2 className="w-12 h-12 text-[#0285E9]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-extrabold text-white mb-2"
            >
              Thank You!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white text-lg"
            >
              We Have Received Your Details!
            </motion.p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {/* Phone Call Alert */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-[#4ba8ee]/10 to-[#0486e9]/10 rounded-2xl p-8 mb-8 text-center border-2 border-[#0285E9]"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4ba8ee] to-[#0486e9] flex items-center justify-center">
                  <Phone className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0C2D5B] mb-4">
                One of our trusted advisors will call you in the next few minutes!
              </h2>
              <p className="text-xl font-bold text-[#0285E9] mb-6">
                Please Make Sure To Answer your Phone!
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <p className="text-[#595E64] font-medium">
                  <strong className="text-[#0C2D5B]">PLEASE NOTE:</strong> We cannot proceed with your case without talking to you on the phone and confirming your case details…
                </p>
              </div>
            </motion.div>

            {/* Call Now CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center mb-8"
            >
              <h3 className="text-xl font-bold text-[#0C2D5B] mb-4">
                Don't Wanna Wait? Click the button below to call now, and fast track your claim..
              </h3>
              <Button
                onClick={handleCallNow}
                className="bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] hover:shadow-2xl hover:shadow-blue-500/40 text-white font-bold text-lg px-10 py-6 rounded-full transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
              >
                <Phone className="w-6 h-6" />
                Call Us Now
              </Button>
              <p className="text-[#595E64] text-sm mt-3">1-800-CLAIM-CK</p>
            </motion.div>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Home"))}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-200">
            <img src={LOGO_URL} alt="Claim Checker" className="h-8 mx-auto mb-3" />
            <p className="text-[#595E64] text-xs">
              Your privacy is important to us. We will never share your information without your consent.
            </p>
          </div>
        </div>
      </motion.div>
      
      <Footer />
    </div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/checkmyclaim-logo.png";

export default function Sorry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737]">
      {/* Logo */}
      <div className="pt-8 pb-6 text-center">
        <img src={LOGO_URL} alt="Check My Claim" className="h-12 mx-auto" />
      </div>

      <div className="flex flex-col items-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-700 px-8 py-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4"
              >
                <XCircle className="w-12 h-12 text-gray-600" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-extrabold text-white mb-2"
              >
                Sorry!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white text-lg"
              >
                Based on your answers, We Are Unable To Help!
              </motion.p>
            </div>

            {/* Content */}
            <div className="px-8 py-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-8"
              >
                <p className="text-[#595E64] text-lg mb-6">
                  Unfortunately, based on the information you provided, we are unable to assist with your claim at this time.
                </p>
                <p className="text-[#595E64] text-base">
                  We appreciate your interest and wish you the best in finding the right assistance for your situation.
                </p>
              </motion.div>

              {/* Back to Home */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <Button
                  onClick={() => navigate(createPageUrl("Home"))}
                  className="bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] hover:shadow-2xl hover:shadow-blue-500/40 text-white font-bold px-8 py-6 rounded-full transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Return to Home
                </Button>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-200">
              <img src={LOGO_URL} alt="Check My Claim" className="h-8 mx-auto mb-3" />
              <p className="text-[#595E64] text-xs">
                Your privacy is important to us. We will never share your information without your consent.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
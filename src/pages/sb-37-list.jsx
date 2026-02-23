import React from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/a861a8079_DarkMode-PrimaryLogo_ClaimChecker.png";

export default function Sb37List() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C2D5B] via-[#001634] to-[#1B2737] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#EBB63E] to-[#F18913] px-8 py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4"
            >
              <Users className="w-12 h-12 text-[#F18913]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-extrabold text-white"
            >
              Affiliated Participants
            </motion.h1>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {/* Participants List */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-[#EBB63E]/10 to-[#F18913]/10 rounded-2xl p-8 mb-8"
            >
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-[#F18913]">
                  <h3 className="text-xl font-bold text-[#0C2D5B]">Kevin Danesh</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-[#F18913]">
                  <h3 className="text-xl font-bold text-[#0C2D5B]">The Law Offices of Larry H. Parker</h3>
                </div>
              </div>
            </motion.div>

            {/* NO WIN, NO FEE Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 mb-8 border-2 border-green-500"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Shield className="w-9 h-9 text-white" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0C2D5B] mb-6 text-center">
                NO WIN, NO FEE Guarantee:
              </h2>
              <div className="space-y-4 text-[#595E64] leading-relaxed">
                <p>
                  The attorney's guarantee every client that they will not charge you a cent if they do not secure a positive outcome in your case. If you do win, the bulk of the fees are usually paid by the opposing counsel's client, who was responsible for the accident.
                </p>
                <p>
                  They will discuss and agree upon the fee breakdown upfront and in detail, so there will be complete transparency and no disappointment once your case is won… That is a guarantee to you!
                </p>
                <p className="text-lg font-bold text-[#F18913] text-center">
                  YOU HAVE NOTHING TO LOSE!
                </p>
              </div>
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
    </div>
  );
}
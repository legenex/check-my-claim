import React from "react";

export default function CallBanner() {
  return (
    <div className="bg-gradient-to-r from-[#0C2D5B] to-[#1B3A4F] py-4 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo and Text */}
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/logo.png"
            alt="Check My Claim"
            className="h-12"
          />
          <span className="text-white font-bold text-sm hidden sm:inline">CHECK MY CLAIM</span>
        </div>

        {/* Call Section */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-white text-sm font-medium">Prefer To Speak To Someone Directly?</span>
          <a 
            href="tel:(888)270-1785"
            className="bg-[#0285E9] hover:bg-[#0486e9] text-white font-bold px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg text-sm whitespace-nowrap"
          >
            Click Here To Call
          </a>
        </div>
      </div>
    </div>
  );
}
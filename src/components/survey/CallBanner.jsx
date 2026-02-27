import React from "react";

export default function CallBanner() {
  return (
    <header className="bg-gradient-to-r from-[#0C2D5B] to-[#1B3A4F] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-full px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo - Left */}
        <div className="flex items-center gap-2">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/logo.png"
            alt="Check My Claim"
            className="h-10"
          />
          <span className="text-white font-bold text-sm hidden sm:inline">CHECK MY CLAIM</span>
        </div>

        {/* Call Button - Right */}
        <a 
          href="tel:+18447381035"
          className="flex items-center gap-2 bg-[#0285E9] hover:bg-[#0486e9] text-white font-bold px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg text-sm whitespace-nowrap"
        >
          <span className="__tc_dni_phone">(844) 738 1035</span>
        </a>
      </div>
    </header>
  );
}
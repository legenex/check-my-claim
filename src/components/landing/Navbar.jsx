import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/76654a39d_CheckMyClaimLogo.png";
const LOGO_DARK_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/76654a39d_CheckMyClaimLogo.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (href) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <button onClick={() => handleNav("#home")} className="flex-shrink-0">
            <img
              src={LOGO_DARK_URL}
              alt="Check My Claim"
              className="h-10 md:h-14 w-auto"
            />
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-sm font-medium tracking-wide transition-colors duration-300 text-[#111E30] hover:text-[#2590E6]"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNav("#home")}
              className="bg-gradient-to-r from-[#2590E6] to-[#1E7ACC] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              Start Your Free Claim Check
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#111E30]"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-white border-t shadow-xl px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="block w-full text-left text-[#111E30] font-medium py-3 px-3 rounded-lg hover:bg-[#2590E6]/10 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNav("#home")}
            className="w-full bg-gradient-to-r from-[#2590E6] to-[#1E7ACC] text-white font-semibold py-3 rounded-full mt-3"
          >
            Start Your Free Claim Check
          </button>
        </div>
      </div>
    </nav>
  );
}
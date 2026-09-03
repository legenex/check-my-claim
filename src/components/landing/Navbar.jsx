import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png";
const LOGO_DARK_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png";
const LOGO_LIGHT_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About Us", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === createPageUrl("Home");

  const handleNav = (href) => {
    setMobileOpen(false);
    
    if (!isHomePage) {
      // Navigate to home page first, then scroll
      navigate(createPageUrl("Home"));
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = () => {
    if (!isHomePage) {
      navigate(createPageUrl("Home"));
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <button onClick={handleLogoClick} className="flex-shrink-0 cursor-pointer">
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
                className="text-sm font-medium tracking-wide transition-colors duration-300 text-[#111E30] hover:text-[#0285E9]"
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://qualify.checkmyclaim.co/s/auto?utm_source=CMC-Website&utm_campaign=Home-Page&utm_medium=2nd-Button"
              className="bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              Start Your Free Claim Check
            </a>
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
          <a
            href="https://qualify.checkmyclaim.co/s/auto?utm_source=CMC-Website&utm_campaign=Home-Page&utm_medium=3rd-Button"
            className="w-full bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] text-white font-semibold py-3 rounded-full mt-3 block text-center"
          >
            Start Your Free Claim Check
          </a>
        </div>
      </div>
    </nav>
  );
}
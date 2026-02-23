import React from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c27e1ee245bcd8cd77386/e98b03e94_PrimaryLogo_ClaimChecker1.png";

export default function Footer() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="contact" className="bg-[#0C2D5B] relative overflow-hidden">
      {/* Final CTA band */}
      <div className="bg-gradient-to-r from-[#EBB63E] to-[#F18913] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Get the Compensation You Deserve
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Don't wait. Every day counts after an accident. Check your eligibility for free in less than 2 minutes.
          </p>
          <button
            onClick={() => scrollTo("#home")}
            className="group bg-white text-[#0C2D5B] font-bold text-lg px-8 py-4 rounded-full hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
          >
            Start Your Free Claim Check
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img src={LOGO_URL} alt="Claim Checker" className="h-8 mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering accident victims with free, AI-powered claim checks and connections to top-rated attorneys. No win, no fee.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: "Home", href: "#home" },
                { label: "About Us", href: "#about" },
                { label: "Services", href: "#services" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block text-gray-400 text-sm hover:text-[#EBB63E] transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-[#EBB63E]" />
                support@claimchecker.com
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-[#EBB63E]" />
                1-800-CLAIM-CK
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Claim Checker. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs max-w-lg text-center md:text-right">
            Claim Checker is not a law firm and does not provide legal advice. Results from the AI tool are for informational purposes only and do not guarantee compensation.
          </p>
        </div>
      </div>
    </footer>
  );
}
import React from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";

const LOGO_LIGHT_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/530d12638_CheckMyClaimLogoLight.png";

export default function Footer() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="contact" className="bg-[#111E30] relative overflow-hidden">
      {/* Final CTA band */}


      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img src={LOGO_LIGHT_URL} alt="Check My Claim" className="h-14 mb-4" />
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
                  className="block text-gray-400 text-sm hover:text-[#0285E9] transition-colors"
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
                <Mail className="w-4 h-4 text-[#0285E9]" />
                support@checkmyclaim.com
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-[#0285E9]" />
                1-800-CLAIM-CK
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Check My Claim. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs max-w-lg text-center md:text-right">
            Check My Claim is not a law firm and does not provide legal advice. Results from the AI tool are for informational purposes only and do not guarantee compensation.
          </p>
        </div>
      </div>
    </footer>
  );
}
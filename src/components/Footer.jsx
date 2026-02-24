import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-[#595E64] text-sm">
          © 2026 Check My Claim. All rights reserved.
        </p>
        <div className="flex gap-6 flex-wrap justify-center md:justify-end">
          <Link
            to={createPageUrl("PrivacyPolicy")}
            className="text-[#0285E9] hover:underline text-sm font-medium"
          >
            Privacy Policy
          </Link>
          <Link
            to={createPageUrl("TermsOfService")}
            className="text-[#0285E9] hover:underline text-sm font-medium"
          >
            Terms & Conditions
          </Link>
          <Link
            to={createPageUrl("AdvertisingDisclosure")}
            className="text-[#0285E9] hover:underline text-sm font-medium"
          >
            Advertising Disclosure
          </Link>
        </div>
      </div>
    </footer>
  );
}
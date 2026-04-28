import React from "react";
import { AlertCircle } from "lucide-react";

export default function ComplianceBanner() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <strong>Signal Engine Compliance Notice:</strong> This engine produces TARGETING DATA ONLY for paid advertising. Federal law (DPPA, 18 U.S.C. §2721) and state anti-solicitation rules prohibit using crash data to identify or contact individual accident victims. All campaign launches must use opt-in lead forms with TCPA consent. Never download or export individual victim contact information.
        </div>
      </div>
    </div>
  );
}
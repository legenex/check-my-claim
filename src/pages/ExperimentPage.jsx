import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ClaimEstimatorWizard from "@/components/experiments/ClaimEstimatorWizard";
import ComingSoonExperiment from "@/components/experiments/ComingSoonExperiment";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";
import { captureIncomingParams } from "@/lib/surveyUrl";

export default function ExperimentPage() {
  const location = useLocation();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    captureIncomingParams();
    // Normalize path: strip trailing slash
    const path = location.pathname.replace(/\/$/, "") || location.pathname;

    const load = async () => {
      try {
        // Find experiment by path
        const all = await base44.entities.Experiment.filter({ path });
        if (all.length === 0) {
          setLoading(false);
          return;
        }
        const exp = all[0];

        // Only show draft to admins
        if (exp.status !== "published") {
          let adminCheck = false;
          try { const me = await base44.auth.me(); adminCheck = me?.role === "admin"; } catch(_){}
          if (!adminCheck) { setLoading(false); return; }
          setIsDraft(true);
          setIsAdmin(true);
        }

        // Set SEO
        if (exp.meta_title) document.title = exp.meta_title;

        setExperiment(exp);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [location.pathname]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-[#2BB6F6] rounded-full animate-spin" />
    </div>
  );

  if (!experiment) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
        <a href="/" className="text-[#2BB6F6] hover:underline">← Back to Check My Claim</a>
      </div>
    </div>
  );

  const renderExperiment = () => {
    switch (experiment.experiment_type) {
      case "claim_estimator":
        return <ClaimEstimatorWizard experiment={experiment} />;
      default:
        return <ComingSoonExperiment experiment={experiment} />;
    }
  };

  return (
    <>
      {isDraft && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 text-center text-sm font-bold py-2">
          ⚠ DRAFT — This experiment is not published. Only admins can see this page.
        </div>
      )}
      {isDraft && <div className="h-10" />}
      {renderExperiment()}
      <ClaimBotWidget pageType="landing_page" />
    </>
  );
}
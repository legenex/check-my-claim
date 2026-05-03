import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";
import ClaimEstimatorPage from "@/components/experiments/ClaimEstimatorPage";
import AdjusterSimulatorPage from "@/components/experiments/AdjusterSimulatorPage";
import LetterAnalyzerPage from "@/components/experiments/LetterAnalyzerPage";
import LifestyleCalculatorPage from "@/components/experiments/LifestyleCalculatorPage";
import CrashClockPage from "@/components/experiments/CrashClockPage";
import InjuryPredictorPage from "@/components/experiments/InjuryPredictorPage";
import LetterGeneratorPage from "@/components/experiments/LetterGeneratorPage";
import StateMapPage from "@/components/experiments/StateMapPage";
import CaseIndexPage from "@/components/experiments/CaseIndexPage";
import SettlementTickerPage from "@/components/experiments/SettlementTickerPage";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-[#2BB6F6] rounded-full animate-spin" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
        <a href="/" className="text-[#2BB6F6] hover:underline">← Back to Check My Claim</a>
      </div>
    </div>
  );
}

export default function ExperimentPage() {
  const location = useLocation();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    captureIncomingParams();
    // Normalize path — strip trailing slash, and handle sub-paths like /tools/state-map/TX
    let path = location.pathname.replace(/\/$/, "");

    // For state-map sub-pages, match the parent path
    if (path.startsWith("/tools/state-map/") && path !== "/tools/state-map") {
      path = "/tools/state-map";
    }

    const load = async () => {
      try {
        const all = await base44.entities.Experiment.filter({ path });
        if (all.length === 0) {
          setLoading(false);
          return;
        }
        const exp = all[0];

        if (exp.status !== "published") {
          let adminCheck = false;
          try { const me = await base44.auth.me(); adminCheck = me?.role === "admin"; } catch (_) {}
          if (!adminCheck) { setLoading(false); return; }
          setIsDraft(true);
        }

        if (exp.meta_title) document.title = exp.meta_title;
        setExperiment(exp);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [location.pathname]);

  if (loading) return <LoadingScreen />;
  if (!experiment) return <NotFound />;

  const renderExperiment = () => {
    switch (experiment.experiment_type) {
      case "claim_estimator":      return <ClaimEstimatorPage experiment={experiment} />;
      case "adjuster_simulator":   return <AdjusterSimulatorPage experiment={experiment} />;
      case "letter_analyzer":      return <LetterAnalyzerPage experiment={experiment} />;
      case "lifestyle_calculator": return <LifestyleCalculatorPage experiment={experiment} />;
      case "crash_clock":          return <CrashClockPage experiment={experiment} />;
      case "injury_predictor":     return <InjuryPredictorPage experiment={experiment} />;
      case "letter_generator":     return <LetterGeneratorPage experiment={experiment} />;
      case "state_map":            return <StateMapPage experiment={experiment} />;
      case "case_index":           return <CaseIndexPage experiment={experiment} />;
      case "settlement_ticker":    return <SettlementTickerPage experiment={experiment} />;
      default:
        return (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-700 mb-2">{experiment.hero_headline || experiment.title}</h1>
              <p className="text-slate-400 text-sm">This tool is coming soon.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {isDraft && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 text-center text-sm font-bold py-2">
          ⚠ DRAFT — Not published. Admin-only view.
        </div>
      )}
      {isDraft && <div className="h-10" />}
      {renderExperiment()}
      <ClaimBotWidget pageType="landing_page" />
    </>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { Phone, ChevronLeft, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";
import { shouldSkipTrustedForm } from "@/utils/geoGate";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";

const DEFAULT_PHONE = "(844) 840-6905";
const INTAKE_ID = `CM-2026-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// ── Logic tables ─────────────────────────────────────────────────────────────

function getAttorneyType(tool, accidentType, surgery) {
  if (!tool?.attorney_type_map?.length) return deriveAttorneyType(accidentType, surgery);
  const row = tool.attorney_type_map.find(r => {
    const matchAcc = r.accident_type === accidentType;
    const matchSurg = r.surgery === "any" || r.surgery === surgery;
    return matchAcc && matchSurg;
  });
  return row?.label || deriveAttorneyType(accidentType, surgery);
}

function deriveAttorneyType(accidentType, surgery) {
  if (accidentType === "commercial_truck") return "Commercial Vehicle Litigation Specialist";
  if (accidentType === "rideshare") return "Rideshare Coverage Specialist";
  if (accidentType === "motorcycle") {
    if (surgery === "had_surgery" || surgery === "surgery_recommended") return "Motorcycle Catastrophic Injury Counsel";
    return "Motorcycle Injury Litigator";
  }
  if (accidentType === "pedestrian_or_bike") return "Pedestrian Injury Trial Counsel";
  if (accidentType === "passenger_car") {
    if (surgery === "had_surgery") return "Catastrophic Auto Injury Counsel";
    if (surgery === "surgery_recommended") return "Auto Injury Litigator";
    return "Auto Claim Negotiator";
  }
  return "General Personal Injury Counsel";
}

function getStatuteStatus(tool, when) {
  if (tool?.statute_map?.length) {
    const row = tool.statute_map.find(r => r.when_ids?.includes(when));
    if (row) return { status: row.status, label: row.label };
  }
  if (["lt_30d", "lt_6m", "lt_2y"].includes(when)) return { status: "GREEN", label: "Filing window open" };
  if (when === "lt_4y") return { status: "YELLOW", label: "Filing window narrowing" };
  return { status: "RED", label: "Outside typical filing window, manual review required" };
}

function getLiabilityComplexity(fault) {
  if (fault === "clearly_other") return "LOW";
  if (fault === "i_was") return "HIGH";
  return "MODERATE";
}

function getInsurerClass(accidentType) {
  if (accidentType === "commercial_truck") return "commercial trucking insurers";
  if (accidentType === "rideshare") return "rideshare and TNC carriers";
  return "major auto carriers";
}

function interpolate(str, vars) {
  if (!str) return "";
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`);
}

// ── US States ─────────────────────────────────────────────────────────────────

const US_STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],
  ["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],
  ["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],
  ["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],
  ["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],
  ["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],
  ["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],
  ["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],
  ["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],
  ["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
];

// ── Default questions (used when tool.quiz_questions is empty) ────────────────

const DEFAULT_QUESTIONS = [
  {
    id: "accident_type", type: "single_select",
    question: "What type of accident were you involved in?",
    help_text: "Select the option that best describes your situation.",
    options: [
      { id: "passenger_car", label: "Passenger car collision" },
      { id: "commercial_truck", label: "Hit by a commercial truck or van" },
      { id: "rideshare", label: "Uber or Lyft incident" },
      { id: "motorcycle", label: "Motorcycle accident" },
      { id: "pedestrian_or_bike", label: "Pedestrian or bicycle struck" },
      { id: "other", label: "Something else" },
    ],
  },
  {
    id: "state", type: "dropdown",
    question: "What state did the accident happen in?",
    help_text: "Statute of limitations and recovery rules vary by state.",
    options: US_STATES.map(([id, label]) => ({ id, label })),
  },
  {
    id: "when", type: "single_select",
    question: "When did the accident happen?",
    help_text: "This determines whether your filing window is still open.",
    options: [
      { id: "lt_30d", label: "Within the last 30 days" },
      { id: "lt_6m", label: "1 to 6 months ago" },
      { id: "lt_2y", label: "6 months to 2 years ago" },
      { id: "lt_4y", label: "2 to 4 years ago" },
      { id: "gt_4y", label: "More than 4 years ago" },
    ],
  },
  {
    id: "injury", type: "single_select",
    question: "What level of treatment have you received?",
    help_text: "Treatment history is a key factor in case valuation.",
    options: [
      { id: "er_or_hospital", label: "ER or hospital visit" },
      { id: "ongoing_treatment", label: "Ongoing treatment or therapy" },
      { id: "minor_no_hospital", label: "Sore but no hospital visit" },
      { id: "none_yet", label: "No treatment yet" },
    ],
  },
  {
    id: "surgery", type: "single_select",
    question: "Has surgery been involved or recommended?",
    help_text: "Surgical cases typically require specialist counsel.",
    options: [
      { id: "had_surgery", label: "Yes, I had surgery" },
      { id: "surgery_recommended", label: "Surgery has been recommended" },
      { id: "no_surgery", label: "No surgery involved" },
    ],
  },
  {
    id: "fault", type: "single_select",
    question: "Who was at fault?",
    help_text: "Fault profile affects which type of firm is best suited.",
    options: [
      { id: "clearly_other", label: "Clearly the other driver" },
      { id: "partial_shared", label: "Partially shared fault" },
      { id: "unsure", label: "I am not sure yet" },
      { id: "i_was", label: "I was at fault" },
    ],
  },
  {
    id: "current_attorney", type: "single_select",
    question: "Are you working with an attorney yet?",
    help_text: "No commitment needed. This helps us route your case correctly.",
    options: [
      { id: "no_want_review", label: "No, I want a free review" },
      { id: "consulted_only", label: "I consulted one, not signed yet" },
      { id: "yes_signed", label: "Yes, I have an attorney" },
    ],
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function AttorneyMatchEngine({ tool, isPreview }) {
  const questions = tool?.quiz_questions?.length ? tool.quiz_questions : DEFAULT_QUESTIONS;
  const storageKey = `cmc_tool_${tool?.slug || "attorney-match"}_answers`;

  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (_) { return {}; }
  });
  const [step, setStep] = useState(0); // 0-6 = quiz, 7 = analysis, 8 = capture, 9 = reveal
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [lead, setLead] = useState({ name: "", phone: "", zip: "" });
  const [leadErrors, setLeadErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [tfCert, setTfCert] = useState(null);

  // Analysis theater state
  const [analysisLines, setAnalysisLines] = useState([]);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [counterValue, setCounterValue] = useState(247);

  useEffect(() => {
    captureIncomingParams();
    if (!isPreview) {
      // Fire ViewContent pixel
      try { window.fbq && window.fbq("track", "ViewContent"); } catch (_) {}
    }
    // TrustedForm
    if (!shouldSkipTrustedForm()) {
      const s = document.createElement("script");
      s.src = "https://api.trustedform.com/t.js";
      s.async = true;
      s.onload = () => {
        if (window.TF) window.TF.getCertUrl(url => setTfCert(url));
      };
      document.body.appendChild(s);
      return () => { try { document.body.removeChild(s); } catch (_) {} };
    }
  }, []);

  // Persist answers
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(answers)); } catch (_) {}
  }, [answers]);

  // Auto-advance quiz on selection (220ms)
  const selectAnswer = (qId, optId) => {
    const q = questions[step];
    if (q.type === "dropdown") {
      setAnswers(prev => ({ ...prev, [qId]: optId }));
      return;
    }
    setPendingAnswer(optId);
    const timer = setTimeout(() => {
      setAnswers(prev => ({ ...prev, [qId]: optId }));
      setPendingAnswer(null);
      if (step < questions.length - 1) {
        setStep(s => s + 1);
      } else {
        startAnalysis();
      }
    }, 220);
    setAutoAdvanceTimer(timer);
  };

  const advanceDropdown = () => {
    if (!answers[questions[step].id]) return;
    if (step < questions.length - 1) setStep(s => s + 1);
    else startAnalysis();
  };

  const goBack = () => {
    if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); setPendingAnswer(null); }
    if (step > 0) setStep(s => s - 1);
  };

  // ── Analysis theater ───────────────────────────────────────────────────────
  const startAnalysis = () => {
    setStep(7);
    setAnalysisLines([]);
    setAnalysisPhase(0);

    const stateLabel = US_STATES.find(([id]) => id === answers.state)?.[1] || answers.state || "your state";
    const lines = [
      { delay: 500,  text: "Accident profile parsed" },
      { delay: 1000, text: `Statute window confirmed for ${stateLabel}` },
      { delay: 1600, text: "Liability complexity scored" },
      { delay: 2200, text: "Injury and treatment factors weighted" },
    ];

    lines.forEach(({ delay, text }) => {
      setTimeout(() => setAnalysisLines(prev => [...prev, text]), delay);
    });

    // Phase 2: searching
    setTimeout(() => setAnalysisPhase(1), 2900);

    // Counter spin
    const counts = [247, 184, 92, 41, 12, 3];
    counts.forEach((val, i) => {
      setTimeout(() => setCounterValue(val), 3400 + i * 200);
    });

    // Phase 3: match found
    setTimeout(() => setAnalysisPhase(2), 5000);

    // Reveal capture
    setTimeout(() => setStep(8), 6000);
  };

  // ── Lead submission ───────────────────────────────────────────────────────
  const validateLead = () => {
    const errs = {};
    if (!lead.name || lead.name.trim().length < 2) errs.name = "Please enter your full name.";
    const digits = (lead.phone || "").replace(/\D/g, "");
    if (digits.length !== 10) errs.phone = "Please enter a valid 10-digit US phone number.";
    if (!/^\d{5}$/.test(lead.zip)) errs.zip = "Please enter a valid 5-digit ZIP code.";
    setLeadErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitLead = async () => {
    if (!validateLead()) return;
    setSubmitting(true);

    const payload = {
      quizId: tool?.id || "attorney-match",
      sessionId: `ame-${Date.now()}`,
      name: lead.name.trim(),
      phone: (lead.phone || "").replace(/\D/g, ""),
      status: "Complete",
      utmSource: sessionStorage.getItem("cmc_utm_source") || "CMC-Site",
      utmMedium: sessionStorage.getItem("cmc_utm_medium") || "tools_match",
      utmCampaign: sessionStorage.getItem("cmc_utm_campaign") || "attorney-match",
      referrer: document.referrer || "",
      device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      notes: JSON.stringify({
        source: tool?.lead_endpoint_source || "tools_match",
        tool_slug: tool?.slug || "attorney-match",
        zip: lead.zip,
        answers,
        trustedform_cert_url: tfCert || "",
        page_url: window.location.href,
      }),
      tags: ["tools_match", answers.accident_type, answers.when].filter(Boolean),
    };

    try {
      await base44.entities.Lead.create(payload);
      try { window.fbq && window.fbq("track", "Lead"); } catch (_) {}
    } catch (_) {}

    setSubmitting(false);
    setStep(9);
  };

  const handleCTAClick = () => {
    try { window.fbq && window.fbq("track", "Schedule"); } catch (_) {}
  };

  const phone = tool?.call_tracking_number || DEFAULT_PHONE;
  const stateLabel = US_STATES.find(([id]) => id === answers.state)?.[1] || answers.state || "";
  const attorneyType = getAttorneyType(tool, answers.accident_type, answers.surgery);
  const statuteInfo = getStatuteStatus(tool, answers.when);
  const liabilityComplexity = getLiabilityComplexity(answers.fault);
  const insurerClass = getInsurerClass(answers.accident_type);

  const defaultCriteria = [
    "Strong negotiation history with {insurer_class}",
    "Experience with {liability_complexity} liability cases",
    "Medical documentation expertise",
    "Trial capable if the carrier resists",
  ];
  const criteriaLines = tool?.match_criteria_lines?.length ? tool.match_criteria_lines : defaultCriteria;
  const criteriaVars = { insurer_class: insurerClass, liability_complexity: liabilityComplexity, state: stateLabel, attorney_type: attorneyType };

  const injuryLabel = questions.find(q => q.id === "injury")?.options?.find(o => o.id === answers.injury)?.label || answers.injury || "";
  const surgeryLabel = questions.find(q => q.id === "surgery")?.options?.find(o => o.id === answers.surgery)?.label || answers.surgery || "";
  const accidentLabel = questions.find(q => q.id === "accident_type")?.options?.find(o => o.id === answers.accident_type)?.label || answers.accident_type || "";

  return (
    <div className="cmc-match-root min-h-screen relative" style={{ background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Serif:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        .cmc-match-root {
          --paper: #f7f3ea;
          --paper-soft: #fbf8f0;
          --paper-rule: #d8cfb8;
          --paper-deep: #ede5cf;
          --ink: #1a1d24;
          --ink-soft: #3d4350;
          --ink-muted: #6b7280;
          --gold: #b8860b;
          --gold-soft: #d4a853;
          --gold-deep: #8b6914;
          --gold-wash: rgba(184,134,11,0.08);
          --red-status: #9b2c2c;
          --yellow-status: #b8860b;
          --green-status: #2f6b3d;
          --display: 'Fraunces', 'Times New Roman', serif;
          --body: 'IBM Plex Serif', Georgia, serif;
          --mono: 'JetBrains Mono', ui-monospace, monospace;
        }
        .cmc-match-root * { box-sizing: border-box; }
        .cmc-match-root .font-display { font-family: var(--display); }
        .cmc-match-root .font-body { font-family: var(--body); }
        .cmc-match-root .font-mono { font-family: var(--mono); }

        .cmc-match-option {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; border: 1px solid var(--paper-rule);
          border-radius: 2px; cursor: pointer; transition: all 0.12s;
          background: var(--paper-soft); font-family: var(--body); font-size: 15px;
          color: var(--ink);
        }
        .cmc-match-option:hover { border-color: var(--gold-deep); background: var(--paper); }
        .cmc-match-option.selected { border-color: var(--gold-deep); background: rgba(184,134,11,0.08); }
        .cmc-match-option.pending { border-color: var(--gold-deep); background: rgba(184,134,11,0.12); }

        .gold-btn {
          display: block; width: 100%; padding: 14px 24px;
          background: var(--gold-deep); color: var(--paper);
          font-family: var(--mono); font-size: 13px; letter-spacing: 0.12em;
          text-transform: uppercase; font-weight: 500;
          border: none; border-radius: 2px; cursor: pointer;
          transition: background 0.15s; text-align: center;
        }
        .gold-btn:hover { background: var(--gold); }
        .gold-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .gold-wash-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse at 50% 20%, rgba(184,134,11,0.025) 0%, transparent 70%);
        }
        .analysis-line { opacity: 0; transform: translateY(4px); transition: all 0.4s ease; }
        .analysis-line.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 900px) {
          .match-layout { flex-direction: column !important; }
          .match-right { width: 100% !important; }
        }
        @media (max-width: 600px) {
          .key-facts-grid { grid-template-columns: 1fr !important; }
          .analysis-line { font-size: 13px !important; }
        }
        @media (max-width: 600px) {
          .sticky-cta-mobile { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; padding: 12px 16px; background: var(--paper); border-top: 1px solid var(--paper-rule); }
        }
      `}</style>

      <div className="gold-wash-overlay" />

      <MatchHeader phone={phone} />

      <div className="relative z-10">
        {/* Stage 1: Hero + Quiz (steps 0-6) */}
        {step <= 6 && (
          <HeroQuiz
            tool={tool}
            questions={questions}
            step={step}
            answers={answers}
            pendingAnswer={pendingAnswer}
            onSelect={selectAnswer}
            onBack={goBack}
            onAdvanceDropdown={advanceDropdown}
            intakeId={INTAKE_ID}
          />
        )}

        {/* Stage 2: Analysis */}
        {step === 7 && (
          <AnalysisTheater
            analysisLines={analysisLines}
            analysisPhase={analysisPhase}
            counterValue={counterValue}
          />
        )}

        {/* Stage 3+4: Case preview + lead capture */}
        {step === 8 && (
          <CaptureStage
            answers={answers}
            questions={questions}
            accidentLabel={accidentLabel}
            stateLabel={stateLabel}
            statuteInfo={statuteInfo}
            injuryLabel={injuryLabel}
            surgeryLabel={surgeryLabel}
            liabilityComplexity={liabilityComplexity}
            attorneyType={attorneyType}
            criteriaLines={criteriaLines}
            criteriaVars={criteriaVars}
            lead={lead}
            setLead={setLead}
            leadErrors={leadErrors}
            submitting={submitting}
            onSubmit={submitLead}
          />
        )}

        {/* Stage 5: Match reveal */}
        {step === 9 && (
          <RevealStage
            tool={tool}
            attorneyType={attorneyType}
            stateLabel={stateLabel}
            phone={phone}
            onCTAClick={handleCTAClick}
          />
        )}
      </div>

      <MatchFooter tool={tool} />
      <ClaimBotWidget pageType="landing_page" />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function MatchHeader({ phone }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6" style={{ height: 56, background: "var(--paper)", borderBottom: "1px solid var(--gold-deep)" }}>
      <div className="flex items-center gap-0.5">
        <span className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>CheckMyClaim</span>
        <span className="font-mono" style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: -2 }}>.co</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono hidden sm:block" style={{ fontSize: 10, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Docket Line</span>
        <a href={`tel:${phone}`} className="font-display" style={{ fontSize: 18, fontWeight: 500, color: "var(--gold-deep)", textDecoration: "underline", textDecorationColor: "var(--gold)", textDecorationThickness: "1.5px" }}>
          {phone}
        </a>
      </div>
    </header>
  );
}

// ── Hero + Quiz ───────────────────────────────────────────────────────────────

function HeroQuiz({ tool, questions, step, answers, pendingAnswer, onSelect, onBack, onAdvanceDropdown, intakeId }) {
  const keyFacts = tool?.key_facts?.length ? tool.key_facts : [
    "Analyzes 7 case factors against firm specialty data",
    "Average adjuster opening offer covers 38 percent of total damages",
    "Attorney-negotiated settlements recover an average of 3.5x the initial offer",
    "Matched firms work on contingency. No recovery, no fee.",
  ];

  const headline = tool?.hero_headline || "Find the Right Attorney for Your Specific Accident Case.";
  const subhead = tool?.hero_subhead || "Our match engine analyzes your accident details, injury severity, treatment status, fault profile, and case complexity, then routes your case to the firm best suited for your situation. CheckMyClaim is not a law firm. We are the layer that helps you choose smarter.";
  const lead = tool?.hero_lead || "Most accident victims hire the first attorney they speak with. That is usually a mistake. Different attorneys are stronger with different case types. Some are built for quick settlements. Some fight harder on surgery cases. Some work commercial trucking files better than others.\n\nThe match engine reads your case the way an experienced claims analyst would, then connects you with the firm whose track record fits your case shape. There is no charge to use the engine. There is no obligation after the match.";
  const eyebrow = tool?.hero_eyebrow || `ATTORNEY MATCH ENGINE · INTAKE ${intakeId} · CONFIDENTIAL`;

  const q = questions[step];

  return (
    <section className="px-4 sm:px-6 py-10 max-w-[1300px] mx-auto">
      <div className="match-layout flex gap-10 items-start">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          <div className="font-mono mb-4" style={{ fontSize: 11, color: "var(--gold-deep)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            {eyebrow}
          </div>

          <h1 className="font-display mb-5" style={{ fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 500, lineHeight: 1.06, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            {headline.split(/\b(Right)\b/).map((part, i) =>
              part === "Right" ? <em key={i}>{part}</em> : part
            )}
          </h1>

          <p className="font-body mb-6" style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-soft)", maxWidth: 580 }}>
            {subhead}
          </p>

          {lead.split("\n\n").map((para, i) => (
            <p key={i} className="font-body mb-4" style={{ fontSize: 16, lineHeight: 1.65, color: "var(--ink-soft)", maxWidth: 580 }}>
              {para}
            </p>
          ))}

          {/* Key Facts */}
          <div className="mt-8 key-facts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
            {keyFacts.slice(0, 4).map((fact, i) => (
              <div key={i} className="flex gap-3 items-start py-3" style={{ borderBottom: "1px solid var(--paper-rule)", paddingRight: 16 }}>
                <span className="font-mono" style={{ fontSize: 13, color: "var(--gold-deep)", fontWeight: 500, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="font-body" style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.45 }}>{fact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Quiz card */}
        <div className="match-right" style={{ width: 420, flexShrink: 0 }}>
          <div style={{ background: "var(--paper-soft)", border: "1px solid var(--gold-deep)", borderRadius: 2, padding: 28 }}>
            {/* Card header */}
            <div className="font-mono mb-3" style={{ fontSize: 10, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
              CASE INTAKE · STEP {step + 1} OF {questions.length}
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: "var(--paper-rule)", marginBottom: 20, borderRadius: 0 }}>
              <div style={{ height: "100%", width: `${((step + 1) / questions.length) * 100}%`, background: "var(--gold-deep)", transition: "width 0.3s ease" }} />
            </div>

            {/* Question */}
            <div className="font-display mb-1" style={{ fontSize: 18, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>
              {q.question}
            </div>
            {q.help_text && (
              <div className="font-body mb-5" style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink-muted)", lineHeight: 1.4 }}>
                {q.help_text}
              </div>
            )}

            {/* Options */}
            {q.type === "dropdown" ? (
              <div>
                <select
                  value={answers[q.id] || ""}
                  onChange={e => onSelect(q.id, e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--paper-rule)", borderRadius: 2, background: "var(--paper-soft)", color: "var(--ink)", fontFamily: "var(--body)", fontSize: 15, outline: "none", marginBottom: 12 }}
                >
                  <option value="">Select a state...</option>
                  {q.options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={onAdvanceDropdown}
                  disabled={!answers[q.id]}
                  className="gold-btn"
                  style={{ marginTop: 4 }}
                >
                  Continue
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => onSelect(q.id, opt.id)}
                    className={`cmc-match-option ${answers[q.id] === opt.id ? "selected" : ""} ${pendingAnswer === opt.id ? "pending" : ""}`}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid var(--paper-rule)", flexShrink: 0, background: (answers[q.id] === opt.id || pendingAnswer === opt.id) ? "var(--gold-deep)" : "transparent", transition: "all 0.12s" }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Back + footer */}
            <div className="flex items-center justify-between mt-4">
              {step > 0 ? (
                <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-muted)", fontFamily: "var(--mono)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <ChevronLeft style={{ width: 14, height: 14 }} /> BACK
                </button>
              ) : <div />}
              <span className="font-mono" style={{ fontSize: 9, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                CONFIDENTIAL · 60 SECONDS · NO SPAM
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Analysis Theater ──────────────────────────────────────────────────────────

function AnalysisTheater({ analysisLines, analysisPhase, counterValue }) {
  const phases = [
    "Analyzing your case...",
    "Searching network of qualified firms...",
    "Match found. Preparing your case brief...",
  ];

  return (
    <section style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      <div style={{ maxWidth: 560, width: "100%", background: "var(--paper-soft)", border: "1px solid var(--gold-deep)", borderRadius: 2, padding: 40 }}>
        <div className="font-display mb-8" style={{ fontSize: 26, fontWeight: 500, color: "var(--ink)", lineHeight: 1.2, transition: "all 0.5s" }}>
          {phases[analysisPhase]}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {analysisLines.map((line, i) => (
            <div key={i} className="analysis-line visible flex items-center gap-3" style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink)" }}>
              <CheckCircle2 style={{ width: 16, height: 16, color: "var(--gold-deep)", flexShrink: 0 }} />
              {line}
            </div>
          ))}
        </div>

        {analysisPhase >= 1 && (
          <div className="font-mono mt-8" style={{ fontSize: 20, color: "var(--gold-deep)", letterSpacing: "0.04em", fontWeight: 500 }}>
            REVIEWING {counterValue} FIRMS
          </div>
        )}
      </div>
    </section>
  );
}

// ── Case Preview + Lead Capture ───────────────────────────────────────────────

function CaptureStage({ answers, questions, accidentLabel, stateLabel, statuteInfo, injuryLabel, surgeryLabel, liabilityComplexity, attorneyType, criteriaLines, criteriaVars, lead, setLead, leadErrors, submitting, onSubmit }) {
  const statusColors = { GREEN: "#2f6b3d", YELLOW: "#b8860b", RED: "#9b2c2c" };

  return (
    <section style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      {/* Case analysis */}
      <div style={{ background: "var(--paper-soft)", border: "1px solid var(--gold-deep)", borderRadius: 2, padding: 32, marginBottom: 24 }}>
        <div className="font-mono mb-3" style={{ fontSize: 11, color: "var(--gold-deep)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
          YOUR CASE ANALYSIS
        </div>
        <div style={{ height: 1, background: "var(--gold-deep)", marginBottom: 20 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <CaseRow label="Accident Type" value={accidentLabel} />
          <CaseRow label="State" value={stateLabel} />
          <CaseRow
            label="Statute Status"
            value={
              <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: `${statusColors[statuteInfo.status]}20`, color: statusColors[statuteInfo.status], fontFamily: "var(--mono)" }}>
                {statuteInfo.label}
              </span>
            }
          />
          <CaseRow label="Treatment Profile" value={`${injuryLabel}${surgeryLabel ? " · " + surgeryLabel : ""}`} />
          <CaseRow label="Liability Complexity" value={liabilityComplexity} />
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--paper-rule)" }}>
          <div className="font-mono mb-2" style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Recommended Attorney Type
          </div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 500, color: "var(--ink)", lineHeight: 1.2 }}>
            {attorneyType}
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--paper-rule)" }}>
          <div className="font-mono mb-3" style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Recommended Match Criteria
          </div>
          {criteriaLines.map((line, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <CheckCircle2 style={{ width: 14, height: 14, color: "var(--gold-deep)", flexShrink: 0, marginTop: 3 }} />
              <span className="font-body" style={{ fontSize: 15, color: "var(--ink-soft)" }}>{interpolate(line, criteriaVars)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lead capture form */}
      <div style={{ background: "var(--paper-soft)", border: "1px solid var(--gold-deep)", borderRadius: 2, padding: 32 }}>
        <div className="font-display mb-6" style={{ fontSize: 24, fontWeight: 500, color: "var(--ink)", lineHeight: 1.25 }}>
          Your match is ready. Tell us where to send the case brief.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <LeadField label="Full Name" type="text" value={lead.name} onChange={v => setLead(p => ({ ...p, name: v }))} error={leadErrors.name} placeholder="Your legal name" />
          <LeadField label="Phone Number" type="tel" value={lead.phone} onChange={v => setLead(p => ({ ...p, phone: v }))} error={leadErrors.phone} placeholder="(555) 555-5555" />
          <LeadField label="ZIP Code" type="text" value={lead.zip} onChange={v => setLead(p => ({ ...p, zip: v }))} error={leadErrors.zip} placeholder="90210" maxLength={5} />
        </div>

        <p className="font-body mt-4 mb-6" style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-muted)", lineHeight: 1.5 }}>
          We use your phone to connect you with your matched firm. We do not sell your details to third parties beyond your assigned firm.
        </p>

        <button onClick={onSubmit} disabled={submitting} className="gold-btn" style={{ fontSize: 14, letterSpacing: "0.14em" }}>
          {submitting ? "PROCESSING..." : "REVEAL MY MATCH"}
        </button>
      </div>
    </section>
  );
}

function CaseRow({ label, value }) {
  return (
    <div className="flex items-start gap-3" style={{ fontSize: 15, fontFamily: "var(--body)" }}>
      <span style={{ color: "var(--ink-muted)", minWidth: 180, flexShrink: 0 }}>{label}:</span>
      <span style={{ color: "var(--ink)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function LeadField({ label, type, value, onChange, error, placeholder, maxLength }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-muted)", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ width: "100%", padding: "10px 14px", border: `1px solid ${error ? "#9b2c2c" : "var(--paper-rule)"}`, borderRadius: 2, background: "var(--paper)", fontFamily: "var(--body)", fontSize: 15, color: "var(--ink)", outline: "none" }}
      />
      {error && <p style={{ fontSize: 13, color: "#9b2c2c", marginTop: 4, fontFamily: "var(--body)" }}>{error}</p>}
    </div>
  );
}

// ── Match Reveal ──────────────────────────────────────────────────────────────

function RevealStage({ tool, attorneyType, stateLabel, phone, onCTAClick }) {
  const headline = tool?.match_reveal_headline || "Your match is ready.";
  const subhead = tool?.match_reveal_subhead || `Based on your case profile, your file has been routed to a {attorney_type} in the {state} network. The intake desk is standing by.`;
  const ctaText = tool?.cta_button_text || "CALL MY MATCH NOW";
  const ctaSubline = tool?.cta_subline || "Available 24/7. Average wait under 2 minutes. No fee unless they recover for you.";
  const trustStrip = tool?.trust_strip || "CHECKMYCLAIM.CO IS NOT A LAW FIRM. THE MATCH ENGINE CONNECTS YOU WITH INDEPENDENT ATTORNEYS IN OUR VETTED NETWORK.";

  const filledSubhead = interpolate(subhead, { attorney_type: attorneyType, state: stateLabel });

  return (
    <section style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
      <div className="font-display mb-3" style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 500, color: "var(--ink)", lineHeight: 1.05 }}>
        {headline}
      </div>
      <p className="font-body mb-10" style={{ fontSize: 19, color: "var(--ink-soft)", lineHeight: 1.55 }}>
        {filledSubhead}
      </p>

      {/* Match card */}
      <div style={{ background: "var(--paper-soft)", border: "1px solid var(--gold-deep)", borderRadius: 2, padding: 32, marginBottom: 28 }}>
        <div className="font-mono mb-4" style={{ fontSize: 11, color: "var(--gold-deep)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
          YOUR MATCHED FIRM PROFILE
        </div>
        {[
          `Specializes in ${attorneyType}`,
          `Active in ${stateLabel || "your state"}`,
          "Available now",
          "Free case review, no obligation",
        ].map((line, i) => (
          <div key={i} className="flex items-center gap-2 mb-3">
            <CheckCircle2 style={{ width: 16, height: 16, color: "var(--gold-deep)", flexShrink: 0 }} />
            <span className="font-mono" style={{ fontSize: 13, color: "var(--ink)" }}>{line}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href={`tel:${phone}`}
        onClick={onCTAClick}
        className="gold-btn sticky-cta-mobile"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 15, textDecoration: "none" }}
      >
        <Phone style={{ width: 18, height: 18 }} />
        {ctaText}
      </a>

      <p className="font-body mt-4 text-center" style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink-muted)", lineHeight: 1.5 }}>
        {ctaSubline}
      </p>

      {/* Trust strip */}
      <div className="font-mono mt-8 text-center" style={{ fontSize: 9, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.6 }}>
        {trustStrip}
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function MatchFooter({ tool }) {
  const trustStrip = tool?.trust_strip || "CHECKMYCLAIM.CO IS NOT A LAW FIRM. THE MATCH ENGINE CONNECTS YOU WITH INDEPENDENT ATTORNEYS IN OUR VETTED NETWORK.";
  return (
    <footer style={{ background: "var(--paper)", borderTop: "1px solid var(--gold-deep)", padding: "32px 24px", marginTop: 60 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="font-mono mb-4 text-center" style={{ fontSize: 9, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.7 }}>
          {trustStrip}
        </div>
        <p className="font-body text-center" style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.7 }}>
          CheckMyClaim.co is a case intake and attorney matching service. We are not a law firm, do not provide legal advice, and are not a referral service subject to state bar rules. Use of this tool does not create an attorney-client relationship. Results vary based on individual case circumstances.
        </p>
      </div>
    </footer>
  );
}
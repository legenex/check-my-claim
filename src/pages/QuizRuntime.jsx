import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";
import { applyThemeVars, MIDNIGHT_GLASS_FALLBACK, themeFromBrand } from "@/lib/themeTokens";

const DEFAULT_PHONE = "(844) 840-6905";

export default function QuizRuntime() {
  const { slug } = useParams();
  return <QuizRuntimeCore slug={slug} embedded={false} />;
}

export function QuizRuntimeEmbedded({ quizId, onFirstInteraction, quizThemeId }) {
  return <QuizRuntimeCore quizId={quizId} embedded={true} onFirstInteraction={onFirstInteraction} quizThemeId={quizThemeId} />;
}

function QuizRuntimeCore({ slug, quizId, embedded, onFirstInteraction, quizThemeId }) {
  const rootRef = useRef(null);
  const [quiz, setQuiz] = useState(null);
  const [brand, setBrand] = useState(null);
  const [theme, setTheme] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [tags, setTags] = useState([]);
  const [pathTaken, setPathTaken] = useState([]);
  const [finished, setFinished] = useState(false);
  const hasInteracted = useRef(false);
  const sessionId = useRef(`qs_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || sessionStorage.getItem("cmc_utm_source") || "";
  const utmMedium = urlParams.get("utm_medium") || sessionStorage.getItem("cmc_utm_medium") || "";
  const utmCampaign = urlParams.get("utm_campaign") || sessionStorage.getItem("cmc_utm_campaign") || "";
  const fbclid = urlParams.get("fbclid") || sessionStorage.getItem("cmc_fbclid") || "";
  const sid = urlParams.get("sid") || sessionStorage.getItem("cmc_sid") || "";

  useEffect(() => {
    if (!embedded) captureIncomingParams();
    loadQuiz();
  }, [slug, quizId]);

  // Apply theme vars whenever theme/brand changes
  useEffect(() => {
    if (!rootRef.current) return;
    if (theme) {
      applyThemeVars(rootRef.current, theme);
    } else if (brand) {
      applyThemeVars(rootRef.current, themeFromBrand(brand));
    } else {
      applyThemeVars(rootRef.current, MIDNIGHT_GLASS_FALLBACK);
    }
  }, [theme, brand]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      let q;
      if (quizId) {
        const qs = await base44.entities.Quiz.filter({ id: quizId });
        q = qs[0];
      } else {
        const qs = await base44.entities.Quiz.filter({ slug, status: "published" });
        q = qs[0];
      }
      if (!q) { setNotFound(true); setLoading(false); return; }
      setQuiz(q);

      const [stepList, brandList, themeList, quizThemeList] = await Promise.all([
        base44.entities.QuizStep.filter({ quiz_id: q.id }),
        q.brand_id ? base44.entities.Brand.filter({ id: q.brand_id }) : Promise.resolve([]),
        q.theme_id ? base44.entities.Theme.filter({ id: q.theme_id }) : Promise.resolve([]),
        quizThemeId ? base44.entities.QuizTheme.filter({ id: quizThemeId }) : Promise.resolve([]),
      ]);
      const sorted = stepList.slice().sort((a, b) => a.step_order - b.step_order);
      setSteps(sorted);
      if (brandList.length) setBrand(brandList[0]);
      // Use QuizTheme if provided (embedded context), otherwise fall back to Quiz.theme_id
      if (quizThemeList.length) {
        const qt = quizThemeList[0];
        // Convert QuizTheme to Theme format for applyThemeVars
        setTheme({
          tokens: {
            primary: qt.primary_color,
            accent: qt.accent_color,
            background: qt.background_color,
            text_primary: qt.text_color,
            text_muted: qt.text_color_muted,
            font_heading: qt.font_headline,
            font_body: qt.font_body,
            radius_card: qt.card_border_radius,
            radius_button: qt.answer_card_radius,
          },
        });
      } else if (themeList.length) {
        setTheme(themeList[0]);
      }

      const initFields = {};
      if (utmSource) initFields.utm_source = utmSource;
      if (utmMedium) initFields.utm_medium = utmMedium;
      if (utmCampaign) initFields.utm_campaign = utmCampaign;
      if (fbclid) initFields.fbclid = fbclid;
      if (sid) initFields.sid = sid;
      setFieldValues(initFields);

      const startId = q.start_step_id || (sorted[0]?.step_id);
      if (startId) { setCurrentStepId(startId); setPathTaken([startId]); }

      if (!embedded) document.title = q.meta_title || q.title || "Quiz";
    } catch (e) {
      console.error("QuizRuntime load error:", e);
      setNotFound(true);
    }
    setLoading(false);
  };

  const fireFirstInteraction = () => {
    if (!hasInteracted.current) { hasInteracted.current = true; onFirstInteraction?.(); }
  };

  const applyTransform = (val, transform) => {
    if (!transform || transform === "none") return val;
    if (transform === "lowercase") return String(val).toLowerCase();
    if (transform === "uppercase") return String(val).toUpperCase();
    if (transform === "trim") return String(val).trim();
    return val;
  };

  const advanceTo = (nextStepId) => {
    if (!nextStepId) { setFinished(true); return; }
    const nextStep = steps.find(s => s.step_id === nextStepId);
    if (!nextStep) { setFinished(true); return; }
    setCurrentStepId(nextStepId);
    setPathTaken(prev => [...prev, nextStepId]);
  };

  const handleAnswer = (value, step, selectedOption) => {
    fireFirstInteraction();
    const newFields = { ...fieldValues };
    if (step.custom_field_assignments?.length) {
      step.custom_field_assignments.forEach(a => {
        let val = value;
        if (a.value_source === "answer_label" && selectedOption) val = selectedOption.label;
        if (a.value_source === "static") val = a.default_value || "";
        newFields[a.custom_field_id] = applyTransform(val, a.transform);
      });
    }
    if (selectedOption?.custom_field_overrides) {
      Object.entries(selectedOption.custom_field_overrides).forEach(([k, v]) => { newFields[k] = v; });
    }
    const newTags = [...tags];
    if (selectedOption?.tags_to_add) selectedOption.tags_to_add.forEach(t => { if (!newTags.includes(t)) newTags.push(t); });
    if (selectedOption?.tags_to_remove) selectedOption.tags_to_remove.forEach(t => { const i = newTags.indexOf(t); if (i > -1) newTags.splice(i, 1); });
    setFieldValues(newFields);
    setTags(newTags);

    const nextId = selectedOption?.target_step_id ?? step.default_next_step_id;
    const autoMs = quiz?.settings?.auto_advance_ms ?? 120;
    if (step.step_type === "single_select" || step.step_type === "yes_no") {
      setTimeout(() => advanceTo(nextId), autoMs);
    } else {
      advanceTo(nextId);
    }
  };

  const brandPhone = brand?.phone_number || DEFAULT_PHONE;

  const spinner = (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ width: 32, height: 32, border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--theme-primary, #8b5cf6)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (loading) {
    if (embedded) return spinner;
    return (
      <div ref={rootRef} style={{ minHeight: "100vh", background: "var(--theme-background-gradient, #0a0a1f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {spinner}
      </div>
    );
  }

  if (notFound || !quiz) {
    const card = (
      <div style={{ textAlign: "center", padding: "40px 24px", background: "var(--theme-surface-glass, rgba(20,18,40,0.8))", borderRadius: "var(--theme-radius-card, 16px)", maxWidth: 400, border: "1px solid var(--theme-border-subtle)" }}>
        <p style={{ fontWeight: 700, color: "var(--theme-text-primary, #f1f5f9)", marginBottom: 8 }}>Quiz not found.</p>
        <p style={{ color: "var(--theme-text-muted, #94a3b8)", fontSize: 14 }}>Please refresh or call us at {brandPhone}</p>
      </div>
    );
    if (embedded) return card;
    return (
      <div ref={rootRef} style={{ minHeight: "100vh", background: "var(--theme-background-gradient, #0a0a1f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {card}
      </div>
    );
  }

  const currentStep = steps.find(s => s.step_id === currentStepId);

  const runtimeContent = (
    <div style={embedded ? {} : { maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>
      {/* Progress bar */}
      {quiz.settings?.progress_bar !== false && (
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: embedded ? 20 : 32, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "var(--theme-primary, #8b5cf6)", borderRadius: 2, transition: "width 0.4s", width: `${Math.min((pathTaken.length / Math.max(steps.length, 1)) * 100, 100)}%` }} />
        </div>
      )}

      {finished || !currentStep ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ fontWeight: 700, fontSize: 20, color: "var(--theme-text-primary, #f1f5f9)", fontFamily: "var(--theme-font-heading)" }}>{quiz.settings?.thank_you_message || "Thank you!"}</p>
        </div>
      ) : (
        <StepRenderer
          step={currentStep}
          fieldValues={fieldValues}
          embedded={embedded}
          onAnswer={(val, opt) => handleAnswer(val, currentStep, opt)}
          onAdvance={() => {
            fireFirstInteraction();
            const nextId = currentStep.default_next_step_id;
            setTimeout(() => advanceTo(nextId), quiz?.settings?.auto_advance_ms ?? 120);
          }}
        />
      )}
    </div>
  );

  if (embedded) return <div ref={rootRef}>{runtimeContent}</div>;

  return (
    <div ref={rootRef} style={{ minHeight: "100vh", background: "var(--theme-background-gradient, #0a0a1f)", fontFamily: "var(--theme-font-body, Inter, sans-serif)" }}>
      <header style={{
        background: "var(--theme-surface-glass, rgba(20,18,40,0.7))",
        borderBottom: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))",
        backdropFilter: "blur(16px)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ fontWeight: "var(--theme-font-heading-weight, 700)", fontFamily: "var(--theme-font-heading)", color: "var(--theme-primary, #8b5cf6)", fontSize: 18 }}>
          {quiz.title}
        </div>
        <a href={`tel:${brandPhone.replace(/\D/g, "")}`}
          style={{ background: "var(--theme-primary, #8b5cf6)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 16px", borderRadius: "var(--theme-radius-button, 10px)", textDecoration: "none", boxShadow: "var(--theme-shadow-button)" }}>
          CLICK HERE TO CALL
        </a>
      </header>
      {runtimeContent}
    </div>
  );
}

function StepRenderer({ step, fieldValues, embedded, onAnswer, onAdvance }) {
  const [inputVal, setInputVal] = useState("");
  const config = step.config || {};

  useEffect(() => {
    if (step.step_type === "start") {
      const timer = setTimeout(onAdvance, 300);
      return () => clearTimeout(timer);
    }
  }, [step.step_id]);

  const PHASE1 = ["start", "single_select", "text_field", "results"];
  if (!PHASE1.includes(step.step_type)) {
    return (
      <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--theme-radius-card, 16px)", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--theme-primary, #8b5cf6)", fontWeight: 700, marginBottom: 8 }}>This step type is available in Phase 2 or Phase 3</p>
        <p style={{ color: "var(--theme-text-muted, #94a3b8)", fontSize: 13 }}>Advancing automatically...</p>
        <AutoAdvanceEffect onAdvance={onAdvance} delay={1500} />
      </div>
    );
  }

  if (step.step_type === "start") {
    return (
      <div style={{ textAlign: "center" }}>
        {step.label && <p style={{ color: "var(--theme-text-muted, #94a3b8)", fontSize: 16, fontFamily: "var(--theme-font-body)" }}>{step.label}</p>}
        <div style={{ marginTop: 12, color: "var(--theme-text-faint, #64748b)", fontSize: 14 }}>Starting...</div>
      </div>
    );
  }

  if (step.step_type === "single_select") {
    const options = step.answer_options || [];
    return (
      <div style={{ background: "var(--theme-surface-glass, rgba(20,18,40,0.6))", borderRadius: "var(--theme-radius-card, 16px)", padding: "24px", border: "1px solid var(--theme-border-subtle)", boxShadow: "var(--theme-shadow-card)" }}>
        {step.label && (
          <h2 style={{ fontSize: embedded ? 20 : 26, fontWeight: "var(--theme-font-heading-weight, 600)", fontFamily: "var(--theme-font-heading)", color: "var(--theme-text-primary, #f1f5f9)", marginBottom: step.help_text ? 8 : 20, lineHeight: 1.3, letterSpacing: "var(--theme-letter-spacing-tight)" }}>
            {step.label}
          </h2>
        )}
        {step.help_text && <p style={{ color: "var(--theme-text-muted, #94a3b8)", fontSize: 14, marginBottom: 20, fontFamily: "var(--theme-font-body)" }}>{step.help_text}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map((opt, i) => (
            <ChoiceButton key={opt.id || i} label={opt.label} onClick={() => onAnswer(opt.value, opt)} />
          ))}
        </div>
      </div>
    );
  }

  if (step.step_type === "text_field") {
    return (
      <div style={{ background: "var(--theme-surface-glass, rgba(20,18,40,0.6))", borderRadius: "var(--theme-radius-card, 16px)", padding: "24px", border: "1px solid var(--theme-border-subtle)", boxShadow: "var(--theme-shadow-card)" }}>
        {step.label && (
          <h2 style={{ fontSize: embedded ? 20 : 26, fontWeight: "var(--theme-font-heading-weight, 600)", fontFamily: "var(--theme-font-heading)", color: "var(--theme-text-primary, #f1f5f9)", marginBottom: 8, lineHeight: 1.3, letterSpacing: "var(--theme-letter-spacing-tight)" }}>
            {step.label}
          </h2>
        )}
        {step.help_text && <p style={{ color: "var(--theme-text-muted, #94a3b8)", fontSize: 14, marginBottom: 16, fontFamily: "var(--theme-font-body)" }}>{step.help_text}</p>}
        <input
          type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && inputVal && onAnswer(inputVal, null)}
          placeholder={step.placeholder || ""}
          style={{ width: "100%", border: "2px solid var(--theme-border-subtle, rgba(255,255,255,0.08))", borderRadius: "var(--theme-radius-input, 10px)", padding: "14px 16px", fontSize: 16, background: "var(--theme-surface-elevated, rgba(30,28,55,0.5))", color: "var(--theme-text-primary, #f1f5f9)", outline: "none", boxSizing: "border-box", marginTop: 8, fontFamily: "var(--theme-font-body)", transition: "border-color 0.15s" }}
          onFocus={e => e.target.style.borderColor = "var(--theme-primary, #8b5cf6)"}
          onBlur={e => e.target.style.borderColor = "var(--theme-border-subtle, rgba(255,255,255,0.08))"}
          autoFocus
        />
        <button onClick={() => onAnswer(inputVal, null)} disabled={!inputVal}
          style={{ marginTop: 12, width: "100%", padding: "14px", borderRadius: "var(--theme-radius-button, 10px)", fontWeight: 700, color: "#fff", fontSize: 16, border: "none", cursor: inputVal ? "pointer" : "not-allowed", background: inputVal ? "var(--theme-primary, #8b5cf6)" : "rgba(100,116,139,0.3)", boxShadow: inputVal ? "var(--theme-shadow-button)" : "none", transition: "all 0.2s", fontFamily: "var(--theme-font-body)" }}>
          Continue →
        </button>
      </div>
    );
  }

  if (step.step_type === "results") {
    const template = config.result_template || "<p>Thank you!</p>";
    let rendered = template;
    Object.entries(fieldValues).forEach(([k, v]) => {
      rendered = rendered.replace(new RegExp(`\\{${k}\\}`, "g"), v || "");
    });
    return (
      <div style={{ background: "var(--theme-surface-glass, rgba(20,18,40,0.6))", borderRadius: "var(--theme-radius-card, 16px)", padding: "24px", border: "1px solid var(--theme-border-subtle)", boxShadow: "var(--theme-shadow-card)" }}>
        {step.label && <h2 style={{ fontSize: embedded ? 20 : 26, fontWeight: "var(--theme-font-heading-weight, 600)", fontFamily: "var(--theme-font-heading)", color: "var(--theme-text-primary, #f1f5f9)", marginBottom: 16, letterSpacing: "var(--theme-letter-spacing-tight)" }}>{step.label}</h2>}
        <div style={{ color: "var(--theme-text-primary, #f1f5f9)", fontFamily: "var(--theme-font-body)" }} dangerouslySetInnerHTML={{ __html: rendered }} />
      </div>
    );
  }

  return null;
}

function ChoiceButton({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left", padding: "14px 18px",
        borderRadius: "var(--theme-radius-button, 10px)",
        border: `2px solid ${hov ? "var(--theme-primary, #8b5cf6)" : "var(--theme-border-subtle, rgba(255,255,255,0.08))"}`,
        background: hov ? "var(--theme-primary, #8b5cf6)" : "var(--theme-surface-elevated, rgba(30,28,55,0.5))",
        color: hov ? "#fff" : "var(--theme-text-primary, #f1f5f9)",
        fontFamily: "var(--theme-font-body, Inter, sans-serif)",
        fontWeight: 600, fontSize: 15, cursor: "pointer",
        transition: "all 0.12s ease",
        boxShadow: hov ? "var(--theme-shadow-button)" : "none",
      }}>
      {label}
    </button>
  );
}

function AutoAdvanceEffect({ onAdvance, delay = 1000 }) {
  useEffect(() => {
    const t = setTimeout(onAdvance, delay);
    return () => clearTimeout(t);
  }, []);
  return null;
}
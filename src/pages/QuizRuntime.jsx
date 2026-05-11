import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";

const DEFAULT_PHONE = "(844) 840-6905";

/**
 * QuizRuntime — renders a published Quiz by slug.
 * Also exported as a component that accepts quizId + embedded props for /lp pages.
 */
export default function QuizRuntime() {
  const { slug } = useParams();
  return <QuizRuntimeCore slug={slug} embedded={false} />;
}

export function QuizRuntimeEmbedded({ quizId, onFirstInteraction }) {
  return <QuizRuntimeCore quizId={quizId} embedded={true} onFirstInteraction={onFirstInteraction} />;
}

function QuizRuntimeCore({ slug, quizId, embedded, onFirstInteraction }) {
  const [quiz, setQuiz] = useState(null);
  const [brand, setBrand] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [tags, setTags] = useState([]);
  const [pathTaken, setPathTaken] = useState([]);
  const [finished, setFinished] = useState(false);
  const hasInteracted = useRef(false);
  const runId = useRef(null);
  const sessionId = useRef(`qs_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  // Collect URL params
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

      const [stepList, brandList] = await Promise.all([
        base44.entities.QuizStep.filter({ quiz_id: q.id }),
        q.brand_id ? base44.entities.Brand.filter({ id: q.brand_id }) : Promise.resolve([]),
      ]);
      const sorted = stepList.slice().sort((a, b) => a.step_order - b.step_order);
      setSteps(sorted);
      if (brandList.length) setBrand(brandList[0]);

      // Set initial attribution fields
      const initFields = {};
      if (utmSource) initFields.utm_source = utmSource;
      if (utmMedium) initFields.utm_medium = utmMedium;
      if (utmCampaign) initFields.utm_campaign = utmCampaign;
      if (fbclid) initFields.fbclid = fbclid;
      if (sid) initFields.sid = sid;
      setFieldValues(initFields);

      // Start at start_step_id or first step
      const startId = q.start_step_id || (sorted[0]?.step_id);
      if (startId) {
        setCurrentStepId(startId);
        setPathTaken([startId]);
      }

      if (!embedded) {
        document.title = q.meta_title || q.title || "Quiz";
      }
    } catch (e) {
      console.error("QuizRuntime load error:", e);
      setNotFound(true);
    }
    setLoading(false);
  };

  const fireFirstInteraction = () => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      onFirstInteraction?.();
    }
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
    // Write custom field assignments
    const newFields = { ...fieldValues };
    if (step.custom_field_assignments?.length) {
      step.custom_field_assignments.forEach(a => {
        let val = value;
        if (a.value_source === "answer_label" && selectedOption) val = selectedOption.label;
        if (a.value_source === "static") val = a.default_value || "";
        newFields[a.custom_field_id] = applyTransform(val, a.transform);
      });
    }
    // Per-answer custom field overrides
    if (selectedOption?.custom_field_overrides) {
      Object.entries(selectedOption.custom_field_overrides).forEach(([k, v]) => { newFields[k] = v; });
    }
    // Tags
    const newTags = [...tags];
    if (selectedOption?.tags_to_add) selectedOption.tags_to_add.forEach(t => { if (!newTags.includes(t)) newTags.push(t); });
    if (selectedOption?.tags_to_remove) selectedOption.tags_to_remove.forEach(t => { const i = newTags.indexOf(t); if (i > -1) newTags.splice(i, 1); });
    setFieldValues(newFields);
    setTags(newTags);

    // Determine next step
    const nextId = selectedOption?.target_step_id ?? step.default_next_step_id;

    // Auto-advance delay for single_select
    const autoMs = quiz?.settings?.auto_advance_ms ?? 120;
    if (step.step_type === "single_select" || step.step_type === "yes_no") {
      setTimeout(() => advanceTo(nextId), autoMs);
    } else {
      advanceTo(nextId);
    }
  };

  const brandColor = brand?.primary_color || "#1e90ff";
  const brandPhone = brand?.phone_number || DEFAULT_PHONE;

  if (loading) {
    const spinner = (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ width: 32, height: 32, border: "4px solid #e2e8f0", borderTopColor: brandColor, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
    if (embedded) return spinner;
    return <div style={{ minHeight: "100vh", background: brand?.background_color || "#0b1220", display: "flex", alignItems: "center", justifyContent: "center" }}>{spinner}</div>;
  }

  if (notFound || !quiz) {
    const card = (
      <div style={{ textAlign: "center", padding: "40px 24px", background: "#fff", borderRadius: 12, maxWidth: 400 }}>
        <p style={{ fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Quiz not found.</p>
        <p style={{ color: "#64748b", fontSize: 14 }}>Please refresh or call us at {brandPhone}</p>
      </div>
    );
    if (embedded) return card;
    return <div style={{ minHeight: "100vh", background: "#0b1220", display: "flex", alignItems: "center", justifyContent: "center" }}>{card}</div>;
  }

  const currentStep = steps.find(s => s.step_id === currentStepId);

  const runtimeContent = (
    <div style={embedded ? {} : { maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>
      {/* Progress bar */}
      {!embedded && quiz.settings?.progress_bar !== false && (
        <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 32, overflow: "hidden" }}>
          <div style={{ height: "100%", background: brandColor, borderRadius: 2, transition: "width 0.4s", width: `${Math.min((pathTaken.length / Math.max(steps.length, 1)) * 100, 100)}%` }} />
        </div>
      )}
      {embedded && (
        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", background: brandColor, borderRadius: 2, transition: "width 0.4s", width: `${Math.min((pathTaken.length / Math.max(steps.length, 1)) * 100, 100)}%` }} />
        </div>
      )}

      {finished || !currentStep ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: embedded ? "#1e293b" : "#fff" }}>
          <p style={{ fontWeight: 700, fontSize: 20 }}>{quiz.settings?.thank_you_message || "Thank you!"}</p>
        </div>
      ) : (
        <StepRenderer
          step={currentStep}
          fieldValues={fieldValues}
          brandColor={brandColor}
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

  if (embedded) return runtimeContent;

  return (
    <div style={{ minHeight: "100vh", background: brand?.background_color || "#0b1220", fontFamily: brand?.font_family ? `${brand.font_family}, sans-serif` : "Inter, sans-serif" }}>
      {/* Standalone header */}
      <header style={{ background: brand?.background_color || "#0b1220", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontWeight: 700, color: brandColor, fontSize: 18 }}>{quiz.title}</div>
        <a href={`tel:${brandPhone.replace(/\D/g, "")}`}
          style={{ background: brandColor, color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 16px", borderRadius: 99, textDecoration: "none" }}>
          CLICK HERE TO CALL
        </a>
      </header>
      {runtimeContent}
    </div>
  );
}

function StepRenderer({ step, fieldValues, brandColor, embedded, onAnswer, onAdvance }) {
  const [inputVal, setInputVal] = useState("");
  const config = step.config || {};
  const textColor = embedded ? "#1e293b" : "#fff";
  const subColor = embedded ? "#475569" : "rgba(255,255,255,0.7)";

  // start — auto-advance
  useEffect(() => {
    if (step.step_type === "start") {
      const timer = setTimeout(onAdvance, 300);
      return () => clearTimeout(timer);
    }
  }, [step.step_id]);

  // Phase 2/3 placeholder — auto-advance
  const PHASE1 = ["start", "single_select", "text_field", "results"];
  if (!PHASE1.includes(step.step_type)) {
    return (
      <div style={{ background: embedded ? "#fffbeb" : "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
        <p style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>This step type is available in Phase 2 or Phase 3</p>
        <p style={{ color: subColor, fontSize: 13 }}>Advancing automatically...</p>
        <AutoAdvanceEffect onAdvance={onAdvance} delay={1500} />
      </div>
    );
  }

  if (step.step_type === "start") {
    return (
      <div style={{ textAlign: "center" }}>
        {step.label && <p style={{ color: subColor, fontSize: 16 }}>{step.label}</p>}
        <div style={{ marginTop: 12, color: subColor, fontSize: 14 }}>Starting...</div>
      </div>
    );
  }

  if (step.step_type === "single_select") {
    const options = step.answer_options || [];
    return (
      <div>
        {step.label && <h2 style={{ fontSize: embedded ? 20 : 26, fontWeight: 700, color: textColor, marginBottom: step.help_text ? 8 : 20, lineHeight: 1.3 }}>{step.label}</h2>}
        {step.help_text && <p style={{ color: subColor, fontSize: 14, marginBottom: 20 }}>{step.help_text}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map((opt, i) => (
            <ChoiceButton key={opt.id || i} label={opt.label} brandColor={brandColor} embedded={embedded}
              onClick={() => onAnswer(opt.value, opt)} />
          ))}
        </div>
      </div>
    );
  }

  if (step.step_type === "text_field") {
    return (
      <div>
        {step.label && <h2 style={{ fontSize: embedded ? 20 : 26, fontWeight: 700, color: textColor, marginBottom: 8, lineHeight: 1.3 }}>{step.label}</h2>}
        {step.help_text && <p style={{ color: subColor, fontSize: 14, marginBottom: 16 }}>{step.help_text}</p>}
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && inputVal && onAnswer(inputVal, null)}
          placeholder={step.placeholder || ""}
          style={{ width: "100%", border: `2px solid ${embedded ? "#e2e8f0" : "rgba(255,255,255,0.2)"}`, borderRadius: 12, padding: "14px 16px", fontSize: 16, background: embedded ? "#fff" : "rgba(255,255,255,0.05)", color: textColor, outline: "none", boxSizing: "border-box", marginTop: 8 }}
          onFocus={e => e.target.style.borderColor = brandColor}
          onBlur={e => e.target.style.borderColor = embedded ? "#e2e8f0" : "rgba(255,255,255,0.2)"}
          autoFocus
        />
        <button onClick={() => onAnswer(inputVal, null)} disabled={!inputVal}
          style={{ marginTop: 12, width: "100%", padding: "14px", borderRadius: 12, fontWeight: 700, color: "#fff", fontSize: 16, border: "none", cursor: "pointer", background: inputVal ? brandColor : "#cbd5e1", transition: "all 0.2s" }}>
          Continue →
        </button>
      </div>
    );
  }

  if (step.step_type === "results") {
    const template = config.result_template || "<p>Thank you!</p>";
    const dynamicFields = config.dynamic_fields || [];
    let rendered = template;
    dynamicFields.forEach(k => {
      // Try to find value by field_key (since fieldValues uses custom_field_id keys too, try both)
      const val = fieldValues[k] || Object.values(fieldValues).find((_, i) => Object.keys(fieldValues)[i] === k) || "";
      rendered = rendered.replace(new RegExp(`\\{${k}\\}`, "g"), val || "");
    });
    // Also try direct key match
    Object.entries(fieldValues).forEach(([k, v]) => {
      rendered = rendered.replace(new RegExp(`\\{${k}\\}`, "g"), v || "");
    });
    return (
      <div>
        {step.label && <h2 style={{ fontSize: embedded ? 20 : 26, fontWeight: 700, color: textColor, marginBottom: 16 }}>{step.label}</h2>}
        <div style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: rendered }} />
      </div>
    );
  }

  return null;
}

function ChoiceButton({ label, brandColor, embedded, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left", padding: "14px 18px", borderRadius: 12,
        border: `2px solid ${hov ? brandColor : (embedded ? "#e2e8f0" : "rgba(255,255,255,0.2)")}`,
        background: hov ? brandColor : (embedded ? "#f8fafc" : "rgba(255,255,255,0.05)"),
        color: hov ? "#fff" : (embedded ? "#1e293b" : "#fff"),
        fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.12s ease",
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
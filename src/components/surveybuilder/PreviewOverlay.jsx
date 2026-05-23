import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, RefreshCw, ChevronLeft } from "lucide-react";
import { TIER_META } from "./constants";

const US_STATES = ["auto","Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
const TIERS = ["auto","t1","t2","t3","t4","dq"];
const LOOKUP_URL = "https://script.google.com/macros/s/AKfycbzdr-Rd9vM_D6xJTNE4UMleA5VKOmj0SM1xq3lnw4b0VLlAa0lMPVIy9_GgH03dmkQJ-A/exec";

function getStartStep(survey, steps) {
  const startId = survey?.start_step_id;
  return steps.find(s => s.id === startId) || steps[0] || null;
}

function getNextStep(step, fieldValues, steps, forcedTier) {
  // Branching rules
  const rules = step.branching_rules || [];
  for (const rule of rules) {
    const fieldVal = fieldValues[rule.condition];
    let match = false;
    if (rule.operator === "equals") match = String(fieldVal) === String(rule.value);
    else if (rule.operator === "not_equals") match = String(fieldVal) !== String(rule.value);
    if (match && rule.target_step_id) {
      return { stepId: rule.target_step_id, tier: rule.set_tier || null };
    }
  }
  return { stepId: step.else_target_step_id || null, tier: null };
}

export default function PreviewOverlay({ survey, steps, fields, theme, onClose }) {
  const [stateOverride, setStateOverride] = useState("auto");
  const [tierOverride, setTierOverride] = useState("auto");
  const [showFields, setShowFields] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  // Session state
  const [currentStepId, setCurrentStepId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [events, setEvents] = useState([]);
  const [tier, setTier] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [history, setHistory] = useState([]);

  const stepOrder = survey?.step_order || [];
  const tokens = theme?.tokens || {};

  const fireEvent = useCallback((name, payload = {}) => {
    setEvents(ev => [...ev, { ts: new Date().toISOString(), name, payload }]);
  }, []);

  const setField = useCallback((key, val) => {
    setFieldValues(fv => ({ ...fv, [key]: val }));
    fireEvent("field_value_set", { key, val });
  }, [fireEvent]);

  const reset = useCallback(() => {
    const start = getStartStep(survey, steps);
    setCurrentStepId(start?.id || null);
    setFieldValues({});
    setEvents([]);
    setTier(null);
    setStepIdx(0);
    setHistory([]);
    fireEvent("survey_reset", {});
  }, [survey, steps, fireEvent]);

  useEffect(() => { reset(); }, []);

  const currentStep = steps.find(s => s.id === currentStepId) || null;

  const handleAnswer = useCallback(async (value) => {
    if (!currentStep) return;

    // Save field
    if (currentStep.save_to_field) setField(currentStep.save_to_field, value);
    fireEvent("step_submit", { step: currentStep.id, value });

    const updatedFields = currentStep.save_to_field ? { ...fieldValues, [currentStep.save_to_field]: value } : fieldValues;

    // Handle lookup step
    if (currentStep.type === "lookup") {
      const state = stateOverride !== "auto" ? stateOverride : updatedFields.accident_state;
      let lookupData = {};
      let finalTier = tierOverride !== "auto" ? tierOverride.replace("t", "") : null;

      if (!finalTier) {
        try {
          const url = `${LOOKUP_URL}?accident_state=${encodeURIComponent(state || "Arizona")}`;
          const res = await fetch(url);
          lookupData = await res.json();
          fireEvent("lookup_response", lookupData);

          // Map fields
          const mappings = currentStep.lookup_config?.field_mappings || [];
          const newFields = { ...updatedFields };
          mappings.forEach(m => { if (lookupData[m.property] !== undefined) newFields[m.field] = lookupData[m.property]; });
          setFieldValues(newFields);

          // Compute final_tier
          const band = newFields.incident_band || "7d";
          const tierMap = currentStep.lookup_config?.tier_selector_map || {};
          const tierFieldKey = tierMap[band];
          finalTier = tierFieldKey ? String(lookupData[tierFieldKey]) : "2";
          fireEvent("tier_assigned", { tier: `t${finalTier}`, band, final_tier: finalTier });
          setTier(`t${finalTier}`);
        } catch (e) {
          fireEvent("lookup_error", { error: e.message });
          finalTier = "2";
        }
      } else {
        setTier(tierOverride);
        fireEvent("tier_assigned", { tier: tierOverride });
      }

      // Route based on branching rules
      const rules = currentStep.branching_rules || [];
      let nextId = currentStep.else_target_step_id;
      for (const rule of rules) {
        let match = false;
        if (rule.condition === "final_tier" && rule.operator === "equals") match = String(finalTier) === String(rule.value);
        if (rule.condition === "active_state" && rule.operator === "equals") match = String(lookupData.active_state || "Yes") === rule.value;
        if (rule.condition === "verify" && rule.operator === "equals") match = String(lookupData.verify || "No") === rule.value;
        if (match && rule.target_step_id) { nextId = rule.target_step_id; break; }
      }

      setHistory(h => [...h, currentStepId]);
      setCurrentStepId(nextId);
      setStepIdx(i => i + 1);
      return;
    }

    // Standard next step
    const { stepId } = getNextStep(currentStep, updatedFields, steps);
    if (!stepId) {
      fireEvent("survey_complete", { fieldValues: updatedFields });
      setCurrentStepId("__done__");
    } else {
      setHistory(h => [...h, currentStepId]);
      setCurrentStepId(stepId);
      setStepIdx(i => i + 1);
    }
  }, [currentStep, fieldValues, stateOverride, tierOverride, fireEvent, setField]);

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentStepId(prev);
    setStepIdx(i => Math.max(0, i - 1));
  };

  const totalSteps = stepOrder.length;
  const progress = totalSteps > 0 ? (stepIdx / totalSteps) * 100 : 0;
  const phone = survey?.tracking_config?.default?.display_phone || "(844) 840-6905";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.95)" }}>
      {/* Debug strip */}
      <div className="flex items-center gap-3 px-4 flex-shrink-0 border-b border-white/10 flex-wrap" style={{ height: 44, background: "#050b14", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
        <span className="text-[#2282fc] font-bold">DEBUG</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">STATE:</span>
          <select value={stateOverride} onChange={e => setStateOverride(e.target.value)} className="bg-transparent text-white outline-none cursor-pointer text-xs border-b border-slate-600">
            {US_STATES.map(s => <option key={s} value={s} style={{ background: "#0a1320" }}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">TIER:</span>
          <select value={tierOverride} onChange={e => setTierOverride(e.target.value)} className="bg-transparent text-white outline-none cursor-pointer text-xs border-b border-slate-600">
            {TIERS.map(t => <option key={t} value={t} style={{ background: "#0a1320" }}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => setShowFields(v => !v)} className="px-2 py-0.5 rounded text-xs transition-colors" style={{ background: showFields ? "rgba(34,130,252,0.2)" : "rgba(255,255,255,0.05)", color: showFields ? "#2282fc" : "#64748b" }}>
          Fields
        </button>
        <button onClick={() => setShowEvents(v => !v)} className="px-2 py-0.5 rounded text-xs transition-colors" style={{ background: showEvents ? "rgba(58,181,75,0.2)" : "rgba(255,255,255,0.05)", color: showEvents ? "#3ab54b" : "#64748b" }}>
          Events
        </button>
        <button onClick={reset} className="px-2 py-0.5 rounded text-xs text-slate-500 hover:text-white hover:bg-white/5 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
        <button onClick={onClose} className="px-2 py-0.5 rounded text-xs text-slate-500 hover:text-white hover:bg-white/5 flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
        <div className="ml-auto">
          {tier && (
            <span className="px-2 py-0.5 rounded font-mono text-xs" style={{ background: TIER_META[tier]?.bg || "rgba(34,130,252,0.1)", color: TIER_META[tier]?.color || "#2282fc", border: `1px solid ${TIER_META[tier]?.border || "rgba(34,130,252,0.3)"}` }}>
              tier: {tier} . step: {currentStepId} . idx: {stepIdx}
            </span>
          )}
        </div>
        <button onClick={onClose} className="ml-2 p-1 rounded text-slate-500 hover:text-white hover:bg-white/5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Survey frame */}
        <div className="flex-1 overflow-y-auto relative" style={{ background: tokens.bg_0 || "#0d1f3a" }}>
          {/* Plus-grid pattern */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "20px 20px", opacity: 0.4, pointerEvents: "none" }} />

          {/* Header */}
          <div className="relative flex items-center justify-between px-6 py-3 border-b border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: "#2282fc" }}>CMC</div>
            <a href={`tel:${phone}`} className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold text-white" style={{ background: "#3ab54b" }}>
              CLICK TO CALL {phone}
            </a>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: tokens.progress_color || "#2282fc", transition: "width 0.4s ease" }} />
          </div>

          {/* Step content */}
          <div className="relative flex items-start justify-center px-4 py-12">
            <div style={{ width: "100%", maxWidth: 560 }}>
              {currentStepId === "__done__" ? (
                <DoneScreen fieldValues={fieldValues} tokens={tokens} />
              ) : currentStep ? (
                <StepRenderer step={currentStep} fields={fields} fieldValues={fieldValues} tokens={tokens} onAnswer={handleAnswer} onBack={history.length > 0 ? goBack : null} />
              ) : (
                <div className="text-center text-slate-500 text-sm">Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* Side panels */}
        {(showFields || showEvents) && (
          <div style={{ width: 320, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", background: "#0a1320", overflow: "hidden" }}>
            {showFields && <FieldsPanel fieldValues={fieldValues} />}
            {showEvents && <EventsPanel events={events} />}
          </div>
        )}
      </div>
    </div>
  );
}

function StepRenderer({ step, fields, fieldValues, tokens, onAnswer, onBack }) {
  const [inputVal, setInputVal] = useState("");
  const t = tokens;

  const cardStyle = {
    background: t.container_bg || "#0d1f36",
    border: `1px solid ${t.container_border || "#1e3a5f"}`,
    borderRadius: 8, padding: 28,
  };

  const btnStyle = (filled = true) => ({
    display: "block", width: "100%", padding: "12px 18px",
    borderRadius: t.button_radius || "4px",
    background: filled ? (t.button_primary_bg || "#2282fc") : "transparent",
    border: `1px solid ${t.button_primary_bg || "#2282fc"}`,
    color: filled ? (t.button_primary_text || "#fff") : (t.button_primary_bg || "#2282fc"),
    fontFamily: `'${t.font_body || "Manrope"}', sans-serif`,
    fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left", marginBottom: 8,
  });

  // For lookup step, auto-advance
  useEffect(() => {
    if (step.type === "lookup") {
      const timer = setTimeout(() => onAnswer(null), 300);
      return () => clearTimeout(timer);
    }
  }, [step.id]);

  if (step.type === "lookup") {
    return (
      <div style={cardStyle} className="text-center">
        <div className="text-white text-lg font-semibold mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Checking your case...</div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-[#2282fc] animate-spin" />
          <span className="text-slate-400 text-sm">Fetching state data...</span>
        </div>
      </div>
    );
  }

  const title = step.title || step.id;
  const helper = step.helper_text;

  // Get options
  let options = [];
  if (["single_select","multi_select","yes_no"].includes(step.type)) {
    const fieldObj = fields.find(f => f.key === step.save_to_field);
    if (step.inherit_options_from_field && fieldObj?.allowed_values) {
      options = fieldObj.allowed_values;
    } else {
      options = step.custom_options || [];
    }
    if (step.type === "yes_no") options = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
  }

  return (
    <div style={cardStyle}>
      {/* Title */}
      {!step.hide_title && (
        <div style={{ fontFamily: `'${t.font_display || "Bricolage Grotesque"}', sans-serif`, fontWeight: 800, fontSize: 26, color: "#fff", marginBottom: 8, lineHeight: 1.15 }}>
          {title}
        </div>
      )}
      {helper && <div className="text-slate-400 text-sm mb-5 italic">{helper}</div>}

      {/* Content HTML */}
      {step.content_html && (
        <div className="mb-5 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: step.content_html }} />
      )}

      {/* Answer options */}
      {options.length > 0 && (
        <div>
          {options.map((opt, i) => {
            const val = typeof opt === "string" ? opt : (opt.value || opt.label || String(i));
            const lbl = typeof opt === "string" ? opt : (opt.label || opt.value || String(i));
            return (
              <button key={val} onClick={() => onAnswer(val)} style={btnStyle(false)}>
                {lbl}
              </button>
            );
          })}
        </div>
      )}

      {/* Text/email/phone/number input */}
      {["text_input","email_input","phone_input","number_input","address_input"].includes(step.type) && (
        <div>
          <input
            type={step.type === "email_input" ? "email" : step.type === "phone_input" ? "tel" : step.type === "number_input" ? "number" : "text"}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={step.validation?.placeholder || ""}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Manrope', sans-serif", fontSize: 15, outline: "none", marginBottom: 12 }}
          />
          <button onClick={() => onAnswer(inputVal)} style={{ ...btnStyle(true), textAlign: "center" }}>Continue</button>
        </div>
      )}

      {/* Smart date */}
      {step.type === "smart_date" && (
        <div>
          <input
            type="date"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Manrope', sans-serif", fontSize: 15, outline: "none", marginBottom: 12, colorScheme: "dark" }}
          />
          <button onClick={() => { const band = computeBand(inputVal); onAnswer(band); }} style={{ ...btnStyle(true), textAlign: "center" }}>Continue</button>
        </div>
      )}

      {/* Results / custom page / DQ */}
      {["results","end_dq","custom_page","welcome","transition"].includes(step.type) && (
        <div>
          {step.content_html && <div className="mb-4 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: step.content_html }} />}
          <button onClick={() => onAnswer("done")} style={{ ...btnStyle(true), textAlign: "center" }}>Continue</button>
        </div>
      )}

      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mt-4 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}
    </div>
  );
}

function computeBand(dateStr) {
  if (!dateStr) return "expired";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 7) return "7d";
  if (days <= 14) return "14d";
  if (days <= 30) return "30d";
  if (days <= 90) return "3m";
  if (days <= 180) return "6m";
  if (days <= 365) return "12m";
  if (days <= 548) return "18m";
  if (days <= 730) return "24m";
  return "expired";
}

function DoneScreen({ fieldValues, tokens }) {
  const firstName = fieldValues.first_name || "there";
  return (
    <div style={{ background: tokens.container_bg || "#0d1f36", border: "1px solid #1e3a5f", borderRadius: 8, padding: 32, textAlign: "center" }}>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 28, color: "#3ab54b", marginBottom: 8 }}>You Qualify!</div>
      <p style={{ color: "#94a3b8", fontSize: 15 }}>Thanks {firstName}. An attorney will be in touch shortly.</p>
    </div>
  );
}

function FieldsPanel({ fieldValues }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden border-b border-white/10">
      <div className="px-3 py-2 flex-shrink-0 border-b border-white/10">
        <span className="text-xs font-mono font-bold" style={{ color: "#2282fc" }}>FIELDS</span>
      </div>
      <pre className="flex-1 overflow-y-auto p-3 text-xs font-mono text-green-400" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.7 }}>
        {JSON.stringify(fieldValues, null, 2)}
      </pre>
    </div>
  );
}

function EventsPanel({ events }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-3 py-2 flex-shrink-0 border-b border-white/10">
        <span className="text-xs font-mono font-bold" style={{ color: "#3ab54b" }}>EVENTS</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {events.slice().reverse().map((ev, i) => (
          <div key={i} onClick={() => setExpanded(expanded === i ? null : i)} className="rounded p-2 cursor-pointer hover:bg-white/5 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.04)", fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="flex items-center gap-2">
              <span style={{ color: "#3ab54b", fontSize: 10 }}>{ev.ts.substring(11, 19)}</span>
              <span style={{ color: "#e2e8f0", fontSize: 11 }}>{ev.name}</span>
            </div>
            {expanded === i && (
              <pre className="mt-1 text-slate-400 overflow-auto" style={{ fontSize: 10 }}>
                {JSON.stringify(ev.payload, null, 2)}
              </pre>
            )}
          </div>
        ))}
        {events.length === 0 && <div className="text-xs text-slate-600 text-center py-4">No events yet.</div>}
      </div>
    </div>
  );
}
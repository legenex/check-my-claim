/**
 * Public survey runner at /s/:slug
 * No authentication required.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// ─── Session storage helpers ─────────────────────────────────────────────────
function getSession(surveyId) {
  try { return JSON.parse(sessionStorage.getItem(`survey_${surveyId}`) || "{}"); } catch { return {}; }
}
function setSession(surveyId, data) {
  try { sessionStorage.setItem(`survey_${surveyId}`, JSON.stringify(data)); } catch {}
}

// ─── UTM capture ─────────────────────────────────────────────────────────────
function captureAttribution() {
  const p = new URLSearchParams(window.location.search);
  const keys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid"];
  const att = {};
  keys.forEach(k => { if (p.get(k)) att[k] = p.get(k); });
  return att;
}

// ─── Simple hash for PII ─────────────────────────────────────────────────────
async function hashValue(val) {
  const enc = new TextEncoder().encode(String(val));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ─── Meta pixel fire ─────────────────────────────────────────────────────────
function firePixel(pixelId, eventName, params = {}) {
  if (!pixelId || typeof window === "undefined") return;
  if (window.fbq) window.fbq("track", eventName, params);
}

// ─── Smart date band ─────────────────────────────────────────────────────────
function dateToBand(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff <= 7) return "7d";
  if (diff <= 14) return "14d";
  if (diff <= 30) return "30d";
  if (diff <= 90) return "3m";
  if (diff <= 180) return "6m";
  if (diff <= 365) return "12m";
  if (diff <= 547) return "18m";
  if (diff <= 730) return "24m";
  return "expired";
}

// ─── Theme CSS vars ───────────────────────────────────────────────────────────
function applyTheme(tokens = {}) {
  const root = document.documentElement;
  const defaults = {
    bg_0: "#050b14", bg_1: "#0a1320", bg_2: "#0f1c30",
    container_bg: "#0a1320", container_border: "rgba(255,255,255,0.12)", container_radius: "8px",
    button_primary_bg: "#2282fc", button_primary_text: "#ffffff",
    button_answer_style: "outlined", button_radius: "6px",
    progress_color: "#2282fc", progress_height: "4px",
    font_display: "'Bricolage Grotesque', sans-serif",
    font_body: "'Manrope', sans-serif",
    font_size_base: "16px",
  };
  const merged = { ...defaults, ...tokens };
  Object.entries(merged).forEach(([k, v]) => {
    root.style.setProperty(`--survey-${k.replace(/_/g, "-")}`, String(v));
  });
}

// ─── Step renderer components ─────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  const pct = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;
  return (
    <div style={{ height: "var(--survey-progress-height, 4px)", background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 24 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--survey-progress-color, #2282fc)", borderRadius: 2, transition: "width 0.4s ease" }} />
    </div>
  );
}

function SingleSelectStep({ step, fields, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const stepField = fields.find(f => f.key === step.save_to_field);
  const options = (step.inherit_options_from_field && stepField?.allowed_values?.length)
    ? stepField.allowed_values
    : (step.custom_options || []);
  const isCards = step.display_mode === "cards";

  const handleSelect = (val) => {
    setSelected(val);
    if (step.auto_advance) setTimeout(() => onSubmit(val), 150);
  };

  return (
    <div>
      {options.map(opt => {
        const val = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? (opt.label || val) : opt;
        const icon = typeof opt === "object" ? opt.icon : null;
        const isSelected = selected === val;
        return (
          <button
            key={val}
            onClick={() => handleSelect(val)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              width: "100%", padding: isCards ? "16px 20px" : "12px 16px",
              marginBottom: 10, borderRadius: "var(--survey-button-radius, 6px)",
              border: isSelected ? "2px solid var(--survey-button-primary-bg, #2282fc)" : "2px solid rgba(255,255,255,0.15)",
              background: isSelected ? "rgba(34,130,252,0.18)" : "rgba(255,255,255,0.04)",
              color: "#fff", cursor: "pointer", textAlign: "left",
              fontFamily: "var(--survey-font-body, 'Manrope', sans-serif)",
              fontSize: isCards ? 17 : 15, fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            {icon && <span style={{ fontSize: isCards ? 24 : 18 }}>{icon}</span>}
            {label}
          </button>
        );
      })}
      {!step.auto_advance && selected && (
        <button onClick={() => onSubmit(selected)} style={ctaBtn}>Continue</button>
      )}
    </div>
  );
}

function SearchableSelectStep({ step, fields, onSubmit }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const stepField = fields.find(f => f.key === step.save_to_field);
  const allOptions = (step.inherit_options_from_field && stepField?.allowed_values?.length)
    ? stepField.allowed_values : (step.custom_options || []);
  const filtered = allOptions.filter(o => {
    const label = typeof o === "object" ? o.label : o;
    return label.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div>
      <input
        type="text" value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Type to search..."
        style={{ ...inputStyle, marginBottom: 8 }}
        autoFocus
      />
      <div style={{ maxHeight: 280, overflowY: "auto", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}>
        {filtered.map(opt => {
          const val = typeof opt === "object" ? opt.value : opt;
          const label = typeof opt === "object" ? opt.label : opt;
          return (
            <button key={val} onClick={() => { setSelected(val); if (step.auto_advance) setTimeout(() => onSubmit(val), 150); }}
              style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", background: selected === val ? "rgba(34,130,252,0.18)" : "transparent", color: "#e2e8f0", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", fontFamily: "var(--survey-font-body)", fontSize: 14 }}>
              {label}
            </button>
          );
        })}
      </div>
      {!step.auto_advance && selected && (
        <button onClick={() => onSubmit(selected)} style={{ ...ctaBtn, marginTop: 12 }}>Continue</button>
      )}
    </div>
  );
}

function TextStep({ step, onSubmit, inputType = "text" }) {
  const [val, setVal] = useState("");
  return (
    <div>
      <input type={inputType} value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && val.trim() && onSubmit(val.trim())}
        placeholder={step.placeholder || ""}
        style={{ ...inputStyle, marginBottom: 16 }} autoFocus />
      <button onClick={() => val.trim() && onSubmit(val.trim())} style={ctaBtn}>Continue</button>
    </div>
  );
}

function YesNoStep({ step, onSubmit }) {
  const cfg = step.config || {};
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {[
        { label: cfg.yes_label || "Yes", value: cfg.yes_value || "true" },
        { label: cfg.no_label || "No", value: cfg.no_value || "false" }
      ].map(opt => (
        <button key={opt.value} onClick={() => onSubmit(opt.value)}
          style={{ flex: 1, padding: "14px 20px", borderRadius: "var(--survey-button-radius,6px)", border: "2px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 600, fontFamily: "var(--survey-font-body)" }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SmartDateStep({ step, onSubmit }) {
  const [dateVal, setDateVal] = useState("");
  const handleSubmit = () => {
    if (!dateVal) return;
    const band = dateToBand(dateVal);
    onSubmit(dateVal, { incident_band: band });
  };
  return (
    <div>
      <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        style={{ ...inputStyle, marginBottom: 16 }} autoFocus />
      <button onClick={handleSubmit} disabled={!dateVal} style={{ ...ctaBtn, opacity: dateVal ? 1 : 0.5 }}>Continue</button>
    </div>
  );
}

function LookupStep({ step, fieldValues, onLookupDone }) {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const lc = step.lookup_config || {};
    let url = lc.url || "";
    // Replace {fields.xxx} placeholders
    url = url.replace(/\{fields\.([^}]+)\}/g, (_, key) => encodeURIComponent(fieldValues[key] || ""));
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const mapped = {};
        (lc.field_mappings || []).forEach(m => {
          mapped[m.field] = data[m.property];
        });
        setStatus("done");
        onLookupDone(mapped);
      })
      .catch(e => { setError(e.message); setStatus("error"); onLookupDone({}); });
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      {status === "loading" && (
        <>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #2282fc", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#94a3b8", fontFamily: "var(--survey-font-body)" }}>Checking your case...</p>
        </>
      )}
      {status === "error" && <p style={{ color: "#ef4444" }}>Lookup failed: {error}. Continuing...</p>}
      {status === "done" && <p style={{ color: "#3ab54b" }}>Done. Moving forward...</p>}
    </div>
  );
}

function ResultsStep({ step, fieldValues }) {
  const html = (step.content_html || "").replace(/\{fields\.([^}]+)\}/g, (_, k) => fieldValues[k] || "");
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: "#e2e8f0", lineHeight: 1.7 }} />
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(58,181,75,0.15)", border: "1px solid rgba(58,181,75,0.4)", borderRadius: 6 }}>
          <span style={{ color: "#3ab54b", fontSize: 20 }}>✓</span>
          <span style={{ color: "#3ab54b", fontWeight: 600, fontFamily: "var(--survey-font-body)" }}>Submitted successfully</span>
        </div>
      </div>
    </div>
  );
}

function CustomPageStep({ step, fieldValues, onSubmit }) {
  const [formData, setFormData] = useState({});
  const inlineFields = step.config?.inline_form_fields || [];
  const html = (step.content_html || "").replace(/\{fields\.([^}]+)\}/g, (_, k) => fieldValues[k] || "");

  const handleSubmit = () => {
    const required = inlineFields.filter(f => f.required);
    if (required.some(f => !formData[f.field]?.trim())) return;
    onSubmit(null, formData);
  };

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: "#e2e8f0", marginBottom: 20 }} />
      {inlineFields.map(f => (
        <div key={f.field} style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4, fontFamily: "var(--survey-font-body)" }}>{f.label}{f.required && " *"}</label>
          <input type={f.type === "phone" ? "tel" : f.type === "email" ? "email" : "text"}
            value={formData[f.field] || ""}
            onChange={e => setFormData(prev => ({ ...prev, [f.field]: e.target.value }))}
            style={inputStyle} />
        </div>
      ))}
      <button onClick={handleSubmit} style={{ ...ctaBtn, marginTop: 8 }}>Continue</button>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
  color: "#fff", fontSize: 15, outline: "none",
  fontFamily: "var(--survey-font-body, 'Manrope', sans-serif)",
};
const ctaBtn = {
  width: "100%", padding: "14px 20px", borderRadius: "var(--survey-button-radius, 6px)",
  background: "var(--survey-button-primary-bg, #2282fc)",
  color: "var(--survey-button-primary-text, #fff)",
  border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16,
  fontFamily: "var(--survey-font-body, 'Manrope', sans-serif)",
  transition: "opacity 0.2s",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function SurveyPublic() {
  const { slug } = useParams();
  const [survey, setSurvey] = useState(null);
  const [steps, setSteps] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Runtime state
  const [currentStepId, setCurrentStepId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [tier, setTier] = useState("shared");
  const [sessionId, setSessionId] = useState(null);
  const [attribution] = useState(captureAttribution);
  const [started, setStarted] = useState(false);

  // Load survey
  useEffect(() => {
    const load = async () => {
      const [surveyList, allFields] = await Promise.all([
        base44.entities.Survey.filter({ slug }),
        base44.entities.SurveyField.list(null, 500),
      ]);
      const s = surveyList.find(sv => sv.status === "published");
      if (!s) { setNotFound(true); setLoading(false); return; }
      const stepList = await base44.entities.SurveyStep.filter({ survey_id: s.id });
      // Sort by step_order
      const order = s.step_order || [];
      const sorted = [...stepList].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      setSurvey(s);
      setSteps(sorted);
      setFields(allFields);
      applyTheme(s.theme_id ? {} : {}); // theme tokens applied if we have them
      setLoading(false);

      // Restore session
      const sess = getSession(s.id);
      if (sess.currentStepId && sorted.find(st => st.id === sess.currentStepId)) {
        setCurrentStepId(sess.currentStepId);
        setFieldValues(sess.fieldValues || {});
        setTier(sess.tier || "shared");
        setSessionId(sess.sessionId || null);
        setStarted(true);
      } else {
        const firstId = order[0] || sorted[0]?.id;
        setCurrentStepId(firstId);
      }
    };
    load();
  }, [slug]);

  // Apply theme tokens when survey loaded
  useEffect(() => {
    if (!survey) return;
    // We'd fetch theme here if survey.theme_id is set, but apply defaults now
    applyTheme({});
  }, [survey]);

  // Fire event helper
  const fireEvent = useCallback(async (eventName, payload = {}) => {
    if (!survey) return;
    try {
      await base44.entities.SurveyEvent.create({
        survey_id: survey.id,
        session_id: sessionId,
        event_type: eventName,
        step_id: currentStepId,
        payload: JSON.stringify({ ...payload, attribution }),
        created_at: new Date().toISOString(),
      });
    } catch (_) {}
  }, [survey, sessionId, currentStepId, attribution]);

  // Start session on first step
  useEffect(() => {
    if (!survey || !currentStepId || started) return;
    setStarted(true);
    const createSession = async () => {
      try {
        const sess = await base44.entities.SurveySession.create({
          survey_id: survey.id,
          current_step_id: currentStepId,
          field_values: {},
          tier_assigned: "shared",
          attribution: JSON.stringify(attribution),
          completed: false,
          started_at: new Date().toISOString(),
        });
        setSessionId(sess.id);
        await fireEvent("survey_start", { attribution });
        // Meta pixel
        const pixelId = survey.tracking_config?.default?.meta_pixel_id;
        if (pixelId) firePixel(pixelId, "ViewContent", { content_name: survey.name });
      } catch (_) {}
    };
    createSession();
  }, [survey, currentStepId, started]);

  // Persist session to storage
  useEffect(() => {
    if (!survey || !currentStepId) return;
    setSession(survey.id, { currentStepId, fieldValues, tier, sessionId });
  }, [survey, currentStepId, fieldValues, tier, sessionId]);

  const updateSession = useCallback(async (updates) => {
    if (!sessionId) return;
    try {
      await base44.entities.SurveySession.update(sessionId, updates);
    } catch (_) {}
  }, [sessionId]);

  const currentStep = steps.find(s => s.id === currentStepId);
  const stepIndex = (survey?.step_order || []).indexOf(currentStepId);

  // Resolve next step: check branching_rules then else_target
  const resolveNext = useCallback((step, newFieldValues, overrideTier) => {
    const rules = step.branching_rules || [];
    for (const rule of rules) {
      if (rule.condition) {
        try {
          // Simple field == value evaluation
          const match = rule.condition.match(/^(\w+)\s*==\s*"([^"]*)"$/);
          if (match) {
            const [, fieldKey, fieldVal] = match;
            if (newFieldValues[fieldKey] === fieldVal) {
              if (rule.set_tier) return { nextId: rule.target_step_id, nextTier: rule.set_tier };
              return { nextId: rule.target_step_id, nextTier: overrideTier || tier };
            }
          }
        } catch (_) {}
      }
    }
    return { nextId: step.else_target_step_id || null, nextTier: overrideTier || tier };
  }, [tier]);

  const goToStep = useCallback((stepId, newTier) => {
    setCurrentStepId(stepId);
    if (newTier) setTier(newTier);
    fireEvent("step_view", { step_id: stepId });
  }, [fireEvent]);

  const handleStepSubmit = useCallback(async (value, extraFields = {}) => {
    if (!currentStep) return;

    // Update field values
    const updates = { ...extraFields };
    if (value !== null && value !== undefined && currentStep.save_to_field) {
      updates[currentStep.save_to_field] = value;
    }
    const newFieldValues = { ...fieldValues, ...updates };
    setFieldValues(newFieldValues);

    // Fire step_submit event
    fireEvent("step_submit", { step_id: currentStep.id, field_key: currentStep.save_to_field, value });

    // PII events for phone/email
    if (currentStep.save_to_field === "phone" && value) {
      hashValue(value).then(h => fireEvent("field_value_set", { field: "phone", hashed: h }));
    }
    if (currentStep.save_to_field === "email" && value) {
      hashValue(value).then(h => fireEvent("field_value_set", { field: "email", hashed: h }));
    }

    // Update session
    updateSession({ current_step_id: currentStep.id, field_values: newFieldValues, tier_assigned: tier });

    // Handle results/dq terminal steps
    if (currentStep.type === "results") {
      const isDQ = tier === "dq" || currentStep.tier === "dq";
      fireEvent(isDQ ? "survey_dq" : "survey_complete", { fields: newFieldValues });
      updateSession({ completed: true, completed_at: new Date().toISOString() });
      const pixelId = survey.tracking_config?.default?.meta_pixel_id;
      if (pixelId) {
        if (isDQ) firePixel(pixelId, "DQ");
        else firePixel(pixelId, "Lead");
      }
      return; // stay on results step
    }

    // Resolve next
    const { nextId, nextTier } = resolveNext(currentStep, newFieldValues, null);
    if (nextId) {
      goToStep(nextId, nextTier);
    }
  }, [currentStep, fieldValues, tier, survey, fireEvent, resolveNext, goToStep, updateSession]);

  const handleLookupDone = useCallback((mappedFields) => {
    const newFieldValues = { ...fieldValues, ...mappedFields };
    setFieldValues(newFieldValues);

    // Execute the onSubmit script via simple interpreter
    const script = currentStep?.scripts?.onSubmit;
    if (!script) {
      // No script, go to else
      const nextId = currentStep?.else_target_step_id;
      if (nextId) goToStep(nextId);
      return;
    }

    // ctx API
    let gotoTarget = null;
    let newTier = tier;
    const ctx = {
      fields: {
        get: (k) => newFieldValues[k],
        set: (k, v) => { newFieldValues[k] = v; }
      },
      lookup_config: currentStep?.lookup_config || {},
      get tier() { return newTier; },
      set tier(v) { newTier = v; },
      goto: (id) => { gotoTarget = id; },
      fire: (ev, payload) => fireEvent(ev, payload),
    };
    try { new Function("ctx", script)(ctx); } catch (e) { console.warn("Lookup script error:", e); }

    setFieldValues({ ...newFieldValues });
    if (newTier !== tier) {
      setTier(newTier);
      fireEvent("tier_assigned", { tier: newTier, state: newFieldValues.accident_state });
    }
    if (gotoTarget) goToStep(gotoTarget, newTier);
    else if (currentStep?.else_target_step_id) goToStep(currentStep.else_target_step_id, newTier);
  }, [currentStep, fieldValues, tier, goToStep, fireEvent]);

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050b14" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #2282fc", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050b14", color: "#fff", fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>404</div>
        <p style={{ color: "#64748b" }}>Survey not found or not published.</p>
      </div>
    );
  }

  const totalSharedSteps = (survey?.step_order || []).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--survey-bg-0, #050b14)", fontFamily: "var(--survey-font-body, 'Manrope', sans-serif)", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 64px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 620, animation: "fadeIn 0.35s ease",
        background: "var(--survey-container-bg, #0a1320)",
        border: "1px solid var(--survey-container-border, rgba(255,255,255,0.12))",
        borderRadius: "var(--survey-container-radius, 8px)",
        padding: "32px 36px", minHeight: 300,
      }}>
        {/* Progress */}
        <ProgressBar current={stepIndex} total={totalSharedSteps} />

        {/* Content HTML */}
        {currentStep?.content_html && (
          <div dangerouslySetInnerHTML={{ __html: currentStep.content_html.replace(/\{fields\.([^}]+)\}/g, (_, k) => fieldValues[k] || "") }}
            style={{ marginBottom: 24, color: "#e2e8f0" }} />
        )}

        {/* Title (if no content_html or hide_title is false) */}
        {!currentStep?.hide_title && !currentStep?.content_html && currentStep?.title && (
          <h2 style={{ fontFamily: "var(--survey-font-display, 'Bricolage Grotesque', sans-serif)", fontWeight: 700, fontSize: 26, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
            {currentStep.title}
          </h2>
        )}

        {/* Helper text */}
        {currentStep?.helper_text && (
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>{currentStep.helper_text}</p>
        )}

        {/* Step body */}
        {currentStep && renderStep(currentStep, fields, fieldValues, handleStepSubmit, handleLookupDone)}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 24, color: "#334155", fontSize: 12, textAlign: "center" }}>
        Secure. Your information is never sold.
      </p>
    </div>
  );
}

function renderStep(step, fields, fieldValues, onSubmit, onLookupDone) {
  switch (step.type) {
    case "single_select":
      if (step.display_mode === "searchable") return <SearchableSelectStep step={step} fields={fields} onSubmit={onSubmit} />;
      return <SingleSelectStep step={step} fields={fields} onSubmit={onSubmit} />;
    case "text_input":
      return <TextStep step={step} onSubmit={onSubmit} inputType="text" />;
    case "phone_input":
      return <TextStep step={step} onSubmit={onSubmit} inputType="tel" />;
    case "email_input":
      return <TextStep step={step} onSubmit={onSubmit} inputType="email" />;
    case "yes_no":
      return <YesNoStep step={step} onSubmit={onSubmit} />;
    case "smart_date":
      return <SmartDateStep step={step} onSubmit={(val, extra) => onSubmit(val, extra)} />;
    case "lookup":
      return <LookupStep step={step} fieldValues={fieldValues} onLookupDone={onLookupDone} />;
    case "results":
    case "end_dq":
      return <ResultsStep step={step} fieldValues={fieldValues} />;
    case "custom_page":
      return <CustomPageStep step={step} fieldValues={fieldValues} onSubmit={onSubmit} />;
    default:
      return <div style={{ color: "#64748b", fontStyle: "italic" }}>Step type "{step.type}" not yet rendered.</div>;
  }
}
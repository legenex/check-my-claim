import React, { useState } from "react";
import { Copy, Star, Trash2, ChevronDown, ChevronUp, AlertTriangle, Check } from "lucide-react";
import { TIER_META, SMART_DATE_BANDS, LOOKUP_MOCK_RESPONSE, CTX_API_DOCS } from "./constants";
import RichTextEditor from "./RichTextEditor";
import OptionsConfig from "./OptionsConfig";
import VariantsSection from "./VariantsSection";
import BranchingSection from "./BranchingSection";

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none focus:border-[#2282fc] transition-colors";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };
const sel = `${inp} cursor-pointer`;

function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function SectionHeader({ title }) {
  return <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#2282fc] mb-3 px-4 pt-4">{title}</div>;
}

export default function StepEditor({ step, steps, fields, surveyId, onChange, onDelete, onDuplicate, onSetStart, isStart, onFieldCreated }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copyIdDone, setCopyIdDone] = useState(false);
  const [lookupTestResult, setLookupTestResult] = useState(null);

  if (!step) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-slate-600 text-sm">Select a step from the left rail to edit it.</p>
      </div>
    </div>
  );

  const meta = TIER_META[step.tier] || TIER_META.shared;

  const copyId = () => {
    navigator.clipboard.writeText(step.id || "").then(() => { setCopyIdDone(true); setTimeout(() => setCopyIdDone(false), 1500); });
  };

  const testLookup = () => {
    setLookupTestResult({ status: 200, data: LOOKUP_MOCK_RESPONSE, note: "Mock response. Real HTTP call comes in Phase 3." });
  };

  const isSingleOrMulti = ["single_select","multi_select"].includes(step.type);
  const isTextish = ["text_input","number_input","email_input","phone_input","date_input","address_input"].includes(step.type);
  const isShared = step.tier === "shared";
  const hasScriptHelp = step.type === "script";
  const hasLookupConfig = step.type === "lookup";
  const isDecision = step.type === "decision";
  const isSmartDate = step.type === "smart_date";
  const isYesNo = step.type === "yes_no";

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* Action strip */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 flex-wrap">
        <button
          onClick={copyId}
          className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs transition-colors"
          style={{ background: "rgba(34,130,252,0.1)", color: "#2282fc", border: "1px solid rgba(34,130,252,0.3)" }}
          title="Click to copy step ID"
        >
          {copyIdDone ? <Check className="w-3 h-3" /> : null}
          {step.id || "no id"}
        </button>

        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
          {step.type}
        </span>

        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Tier:</span>
          <select
            value={step.tier || "shared"}
            onChange={e => onChange({ tier: e.target.value })}
            className="font-mono text-xs px-2 py-0.5 rounded outline-none cursor-pointer"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
          >
            {Object.entries(TIER_META).map(([k, v]) => <option key={k} value={k} style={{ background: "#0a1320", color: v.color }}>{v.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button onClick={onDuplicate} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          <button
            onClick={onSetStart}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
            style={{ color: isStart ? "#3ab54b" : "#64748b" }}
          >
            <Star className="w-3 h-3" /> {isStart ? "START" : "Set as start"}
          </button>
          {deleteConfirm ? (
            <>
              <span className="text-xs text-red-400">Confirm delete?</span>
              <button onClick={onDelete} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30">Yes</button>
              <button onClick={() => setDeleteConfirm(false)} className="px-2 py-1 rounded text-xs bg-white/5 text-slate-400 hover:bg-white/10">No</button>
            </>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Title + Helper */}
      <div className="px-4 pt-4 pb-3 border-b border-white/07">
        <input
          value={step.title || ""}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="Step title..."
          className="w-full bg-transparent text-white outline-none mb-2"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 22, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        />
        <input
          value={step.helper_text || ""}
          onChange={e => onChange({ helper_text: e.target.value })}
          placeholder="Helper text (italic, optional)..."
          className="w-full bg-transparent text-slate-400 outline-none italic text-sm"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        />
      </div>

      {/* CONTENT */}
      <Collapsible title="Content  [rich HTML above answers]" defaultOpen>
        <div className="mb-3">
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input type="checkbox" checked={!!step.hide_title} onChange={e => onChange({ hide_title: e.target.checked })} />
            <span className="text-xs text-slate-300">Hide step title (use content below as only header)</span>
          </label>
          <RichTextEditor value={step.content_html || ""} onChange={v => onChange({ content_html: v })} />
        </div>
      </Collapsible>

      {/* CONFIG — type-specific */}
      <Collapsible title="Config" defaultOpen>
        {isDecision && (
          <p className="text-xs text-slate-500 italic">No respondent UI. Pure logic. Configure Branching below.</p>
        )}

        {isSingleOrMulti && (
          <OptionsConfig
            step={step}
            fields={fields}
            onStepChange={onChange}
            onFieldCreated={onFieldCreated}
          />
        )}

        {isTextish && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Placeholder</label>
              <input value={(step.validation?.placeholder) || ""} onChange={e => onChange({ validation: { ...(step.validation || {}), placeholder: e.target.value } })} className={inp} style={inpStyle} />
            </div>
            {step.type === "number_input" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">Min</label>
                  <input type="number" value={(step.validation?.min) || ""} onChange={e => onChange({ validation: { ...(step.validation || {}), min: e.target.value } })} className={inp} style={inpStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1 block">Max</label>
                  <input type="number" value={(step.validation?.max) || ""} onChange={e => onChange({ validation: { ...(step.validation || {}), max: e.target.value } })} className={inp} style={inpStyle} />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Validation regex</label>
              <input value={(step.validation?.regex) || ""} onChange={e => onChange({ validation: { ...(step.validation || {}), regex: e.target.value } })} className={inp} style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </div>
        )}

        {isSmartDate && (
          <div>
            <p className="text-xs text-slate-400 mb-3">Writes computed <span className="font-mono text-[#2282fc]">incident_band</span> field. Band mapping:</p>
            <div className="space-y-1.5">
              {SMART_DATE_BANDS.map(b => (
                <div key={b.band} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#2282fc] w-14">{b.band}</span>
                  <span className="text-xs text-slate-300">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isYesNo && (
          <div className="grid grid-cols-2 gap-3">
            {[["Yes label","yes_label","Yes"],["No label","no_label","No"],["Yes value","yes_value","yes"],["No value","no_value","no"]].map(([label, key, placeholder]) => (
              <div key={key}>
                <label className="text-xs font-mono text-slate-400 mb-1 block">{label}</label>
                <input
                  value={(step.validation?.[key]) || ""}
                  onChange={e => onChange({ validation: { ...(step.validation || {}), [key]: e.target.value } })}
                  placeholder={placeholder}
                  className={inp} style={inpStyle}
                />
              </div>
            ))}
          </div>
        )}

        {hasLookupConfig && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Method</label>
                <select value={(step.lookup_config?.method) || "GET"} onChange={e => onChange({ lookup_config: { ...(step.lookup_config || {}), method: e.target.value } })} className={inp + " cursor-pointer"} style={inpStyle}>
                  <option>GET</option><option>POST</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className="text-xs font-mono text-slate-400 mb-1 block">URL</label>
                <input value={(step.lookup_config?.url) || ""} onChange={e => onChange({ lookup_config: { ...(step.lookup_config || {}), url: e.target.value } })} className={inp} style={{ ...inpStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={testLookup}
                className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                style={{ background: "rgba(34,130,252,0.15)", color: "#2282fc", border: "1px solid rgba(34,130,252,0.3)" }}
              >
                Test Request (mock)
              </button>
              {lookupTestResult && (
                <span className="text-xs text-[#3ab54b] font-mono">HTTP {lookupTestResult.status} — {lookupTestResult.note}</span>
              )}
            </div>
            {lookupTestResult && (
              <pre className="text-xs font-mono text-slate-300 rounded p-3 overflow-auto max-h-40" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.08)" }}>
                {JSON.stringify(lookupTestResult.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* save_to_field for non-select types */}
        {!isSingleOrMulti && (
          <div className="mt-3">
            <label className="text-xs font-mono text-slate-400 mb-1 block">Save to field</label>
            <select
              value={step.save_to_field || ""}
              onChange={e => onChange({ save_to_field: e.target.value })}
              className={sel}
              style={inpStyle}
            >
              <option value="">— none —</option>
              {fields.map(f => <option key={f.key} value={f.key}>{f.key}</option>)}
            </select>
          </div>
        )}

        {/* Required / Auto-advance */}
        <div className="flex items-center gap-6 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!step.required} onChange={e => onChange({ required: e.target.checked })} />
            <span className="text-xs text-slate-300">Required</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!step.auto_advance} onChange={e => onChange({ auto_advance: e.target.checked })} />
            <span className="text-xs text-slate-300">Auto-advance on select</span>
          </label>
        </div>
      </Collapsible>

      {/* VARIANTS */}
      {isShared && (
        <Collapsible title="Variants  [per-tier overrides]" defaultOpen>
          <VariantsSection step={step} fields={fields} onChange={onChange} />
        </Collapsible>
      )}

      {/* BRANCHING */}
      <Collapsible title="Branching" defaultOpen>
        <BranchingSection step={step} steps={steps} onChange={onChange} />
      </Collapsible>

      {/* SCRIPTS */}
      <Collapsible title="Scripts">
        <ScriptsSection step={step} onChange={onChange} hasScriptHelp={hasScriptHelp} />
      </Collapsible>

      {/* TRACKING */}
      <Collapsible title="Tracking">
        <TrackingSection step={step} onChange={onChange} />
      </Collapsible>

      {/* ADVANCED */}
      <Collapsible title="Advanced">
        <AdvancedSection step={step} onChange={onChange} />
      </Collapsible>

      {/* Script docs for script-type steps */}
      {hasScriptHelp && (
        <Collapsible title="ctx API Reference">
          <div className="space-y-2">
            {CTX_API_DOCS.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <code className="text-xs font-mono text-[#2282fc] flex-shrink-0">{d.sig}</code>
                <span className="text-xs text-slate-400">{d.desc}</span>
              </div>
            ))}
          </div>
        </Collapsible>
      )}
    </div>
  );
}

function ScriptsSection({ step, onChange }) {
  const [activeTab, setActiveTab] = useState("onEnter");
  const scripts = step.scripts || {};
  const TABS = ["onEnter","onSubmit","onExit"];
  return (
    <div>
      <div className="flex gap-1 mb-3">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className="px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors" style={{ background: activeTab === t ? "rgba(34,130,252,0.15)" : "transparent", color: activeTab === t ? "#2282fc" : "#64748b", border: `1px solid ${activeTab === t ? "rgba(34,130,252,0.3)" : "transparent"}` }}>
            {t}
          </button>
        ))}
      </div>
      <textarea
        value={scripts[activeTab] || ""}
        onChange={e => onChange({ scripts: { ...scripts, [activeTab]: e.target.value } })}
        placeholder={`// ${activeTab} handler\n// ctx.fields.get('key'), ctx.goto('s_id'), etc.`}
        rows={8}
        className="w-full outline-none resize-none"
        style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e2e8f0", lineHeight: 1.6 }}
        spellCheck={false}
      />
    </div>
  );
}

function TrackingSection({ step, onChange }) {
  const tracking = step.tracking_overrides || {};
  const events = tracking.events_to_fire || [];
  const EVENT_OPTIONS = ["step_view","step_submit","field_value_set"];
  const toggleEvent = (e) => {
    const next = events.includes(e) ? events.filter(v => v !== e) : [...events, e];
    onChange({ tracking_overrides: { ...tracking, events_to_fire: next } });
  };
  return (
    <div className="space-y-3">
      <div className="text-xs font-mono text-slate-400 mb-2">Events to fire:</div>
      {EVENT_OPTIONS.map(ev => (
        <label key={ev} className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={events.includes(ev)} onChange={() => toggleEvent(ev)} />
          <span className="text-xs font-mono text-slate-300">{ev}</span>
        </label>
      ))}
      <div>
        <label className="text-xs font-mono text-slate-400 mb-1 block">Custom payload override (JSON)</label>
        <textarea
          value={tracking.custom_payload || ""}
          onChange={e => onChange({ tracking_overrides: { ...tracking, custom_payload: e.target.value } })}
          rows={3}
          placeholder='{"extra":"value"}'
          className="w-full outline-none resize-none"
          style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "8px 10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e2e8f0" }}
        />
      </div>
    </div>
  );
}

function AdvancedSection({ step, onChange }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!step.auto_advance} onChange={e => onChange({ auto_advance: e.target.checked })} />
        <span className="text-xs text-slate-300">Auto-advance after answer</span>
      </label>
    </div>
  );
}
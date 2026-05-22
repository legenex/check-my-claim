import React from "react";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { TIER_META } from "./constants";

export default function StepInspector({ step, steps, fields, errors, onJumpToStep }) {
  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-slate-600 text-xs text-center font-mono">Select a step to inspect.</p>
      </div>
    );
  }

  const allFieldKeys = new Set((fields || []).map(f => f.key));
  const stepById = Object.fromEntries((steps || []).map(s => [s.id, s]));
  const meta = TIER_META[step.tier] || TIER_META.shared;

  // Field usage
  const fieldUsage = [];
  if (step.save_to_field) fieldUsage.push({ key: step.save_to_field, source: "primary save_to" });
  const ofw = step.option_field_writes || {};
  const ofwFields = new Set();
  Object.values(ofw).forEach(writes => (writes || []).forEach(w => { if (w.field && !ofwFields.has(w.field)) { ofwFields.add(w.field); fieldUsage.push({ key: w.field, source: "option write" }); } }));

  // Branch targets
  const branchTargets = [];
  (step.branching_rules || []).forEach(r => {
    if (r.target_step_id) branchTargets.push({ id: r.target_step_id, label: r.condition || "", tier: r.set_tier });
  });
  if (step.else_target_step_id) branchTargets.push({ id: step.else_target_step_id, label: "else", tier: step.else_set_tier });

  // Step-level errors
  const stepErrors = (errors || []).filter(e => e.stepId === step.id);

  const Row = ({ label, value, mono }) => (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-white/5">
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      <span className={`text-xs text-right ${mono ? "font-mono text-[#2282fc]" : "text-slate-200"}`}>{value || "—"}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 px-3">{title}</div>
      <div className="px-3">{children}</div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Step header */}
      <div className="p-3 border-b border-white/10">
        <div className="font-mono text-xs px-1.5 py-0.5 rounded inline-block mb-2" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
          {step.id || "no id"}
        </div>
        <div className="text-sm font-semibold text-white leading-snug">{step.title || "Untitled"}</div>
      </div>

      <div className="pt-3">
        <Section title="Step Inspector">
          <Row label="Type" value={step.type} mono />
          <Row label="Tier" value={step.tier} />
          <Row label="Save to field" value={step.save_to_field} mono />
          <Row label="Required" value={step.required ? "Yes" : "No"} />
          <Row label="Auto-advance" value={step.auto_advance ? "Yes" : "No"} />
          <Row label="Display mode" value={step.display_mode} />
        </Section>

        <Section title="Field Usage">
          {fieldUsage.length === 0 ? (
            <p className="text-xs text-slate-600">No fields written by this step.</p>
          ) : fieldUsage.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="font-mono text-xs text-[#2282fc]">{f.key}</span>
              <span className="text-xs text-slate-500">{f.source}</span>
            </div>
          ))}
        </Section>

        <Section title="Branch Targets">
          {branchTargets.length === 0 ? (
            <p className="text-xs text-slate-600">No branching configured.</p>
          ) : branchTargets.map((t, i) => {
            const target = stepById[t.id];
            return (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-white/5">
                <span className="text-xs text-slate-500 italic flex-shrink-0 max-w-16 truncate">{t.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                <button
                  onClick={() => onJumpToStep && onJumpToStep(t.id)}
                  className="font-mono text-xs text-[#2282fc] hover:underline truncate"
                >
                  {t.id}
                </button>
                {t.tier && (
                  <span className="font-mono text-xs px-1 rounded ml-auto" style={{ background: (TIER_META[t.tier]?.bg || "rgba(255,255,255,0.05)"), color: (TIER_META[t.tier]?.color || "#fff") }}>
                    {t.tier}
                  </span>
                )}
              </div>
            );
          })}
        </Section>

        <Section title="Validation">
          {stepErrors.length === 0 ? (
            <div className="flex items-center gap-2 py-1">
              <CheckCircle className="w-3.5 h-3.5 text-[#3ab54b]" />
              <span className="text-xs text-slate-400">No errors on this step.</span>
            </div>
          ) : stepErrors.map((e, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/5">
              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-300">{e.message}</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}
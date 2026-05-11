import React from "react";

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";

export default function StepEditorStart({ step, allSteps, onUpdate }) {
  const nextStep = allSteps.find(s => s.step_id === step.default_next_step_id);

  return (
    <div className="space-y-3">
      <Field label="Label (shown to user)">
        <input value={step.label || ""} onChange={e => onUpdate({ label: e.target.value })} className={inputCls} placeholder="Welcome text" />
      </Field>
      <Field label="Title Display (admin label)">
        <input value={step.title_display || ""} onChange={e => onUpdate({ title_display: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Identifier">
        <input value={step.identifier || ""} onChange={e => onUpdate({ identifier: e.target.value })} className={inputCls} placeholder="e.g. start_page" />
      </Field>
      <Field label="Help Text">
        <input value={step.help_text || ""} onChange={e => onUpdate({ help_text: e.target.value })} className={inputCls} placeholder="Optional sub-text" />
      </Field>
      <div className="bg-[#0a1628] rounded-lg px-3 py-2 text-xs text-slate-400 border border-white/5">
        Auto-advances to: <span className="text-slate-200">{nextStep ? `${nextStep.title_display} (${nextStep.step_id})` : "none"}</span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      {children}
    </div>
  );
}
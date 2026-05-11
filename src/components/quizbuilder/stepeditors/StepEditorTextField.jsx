import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
const smallInputCls = "bg-[#0a1628] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";

export default function StepEditorTextField({ step, allSteps, onUpdate }) {
  const [customFields, setCustomFields] = useState([]);
  const assignments = step.custom_field_assignments || [];
  const rules = step.validation_rules || [];
  const otherSteps = allSteps.filter(s => s.step_id !== step.step_id);

  useEffect(() => {
    base44.entities.CustomField.filter({ scope: "global" }).then(setCustomFields).catch(() => {});
  }, []);

  const addAssignment = () => onUpdate({ custom_field_assignments: [...assignments, { custom_field_id: "", value_source: "answer_value", default_value: "", transform: "none" }] });
  const updateAssignment = (i, patch) => onUpdate({ custom_field_assignments: assignments.map((a, idx) => idx === i ? { ...a, ...patch } : a) });
  const removeAssignment = (i) => onUpdate({ custom_field_assignments: assignments.filter((_, idx) => idx !== i) });

  const addRule = () => onUpdate({ validation_rules: [...rules, { rule_type: "required", params: {}, error_message: "" }] });
  const updateRule = (i, patch) => onUpdate({ validation_rules: rules.map((r, idx) => idx === i ? { ...r, ...patch } : r) });
  const removeRule = (i) => onUpdate({ validation_rules: rules.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <Field label="Label">
        <input value={step.label || ""} onChange={e => onUpdate({ label: e.target.value })} className={inputCls} placeholder="Question text" />
      </Field>
      <Field label="Title Display">
        <input value={step.title_display || ""} onChange={e => onUpdate({ title_display: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Help Text">
        <input value={step.help_text || ""} onChange={e => onUpdate({ help_text: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Placeholder">
        <input value={step.placeholder || ""} onChange={e => onUpdate({ placeholder: e.target.value })} className={inputCls} />
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={step.required || false} onChange={e => onUpdate({ required: e.target.checked })} className="w-4 h-4 rounded" />
        <span className="text-sm text-slate-300">Required</span>
      </label>
      <Field label="Next Step">
        <select value={step.default_next_step_id || ""} onChange={e => onUpdate({ default_next_step_id: e.target.value || null })} className={inputCls}>
          <option value="">End quiz</option>
          {otherSteps.map(s => <option key={s.step_id} value={s.step_id}>{s.title_display || s.step_id}</option>)}
        </select>
      </Field>

      {/* Validation rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Validation Rules</label>
          <button onClick={addRule} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {rules.map((r, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <select value={r.rule_type} onChange={e => updateRule(i, { rule_type: e.target.value })} className={`${smallInputCls} w-28`}>
              {["required", "regex", "min_length", "max_length", "valid_email", "valid_phone", "valid_zip"].map(rt => <option key={rt}>{rt}</option>)}
            </select>
            <input value={r.error_message || ""} onChange={e => updateRule(i, { error_message: e.target.value })} className={`${smallInputCls} flex-1`} placeholder="Error message" />
            <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>

      {/* Custom field assignments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Custom Field Assignments</label>
          <button onClick={addAssignment} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {assignments.map((a, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <select value={a.custom_field_id || ""} onChange={e => updateAssignment(i, { custom_field_id: e.target.value })} className={`${smallInputCls} flex-1`}>
              <option value="">— Pick field —</option>
              {customFields.map(cf => <option key={cf.id} value={cf.id}>{cf.display_label} ({cf.field_key})</option>)}
            </select>
            <select value={a.transform || "none"} onChange={e => updateAssignment(i, { transform: e.target.value })} className={`${smallInputCls} w-20`}>
              {["none", "lowercase", "uppercase", "trim", "phone_format", "state_2letter", "date_iso"].map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={() => removeAssignment(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
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
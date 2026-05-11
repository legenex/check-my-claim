import React, { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { base44 } from "@/api/base44Client";

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
const smallInputCls = "bg-[#0a1628] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";

function toSnake(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
}

export default function StepEditorSingleSelect({ step, allSteps, onUpdate }) {
  const [customFields, setCustomFields] = useState([]);
  const options = step.answer_options || [];
  const assignments = step.custom_field_assignments || [];

  useEffect(() => {
    base44.entities.CustomField.filter({ scope: "global" }).then(setCustomFields).catch(() => {});
  }, []);

  const updateOption = (i, patch) => {
    const next = options.map((o, idx) => idx === i ? { ...o, ...patch } : o);
    onUpdate({ answer_options: next });
  };

  const addOption = () => {
    const newOpt = { id: `opt_${Math.random().toString(36).slice(2, 8)}`, label: "", value: "", score: 0, target_step_id: null, tags_to_add: [], tags_to_remove: [], is_default: false };
    onUpdate({ answer_options: [...options, newOpt] });
  };

  const removeOption = (i) => onUpdate({ answer_options: options.filter((_, idx) => idx !== i) });

  const moveOption = (i, dir) => {
    const next = [...options];
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    onUpdate({ answer_options: next });
  };

  const addAssignment = () => {
    onUpdate({ custom_field_assignments: [...assignments, { custom_field_id: "", value_source: "answer_value", default_value: "", transform: "none" }] });
  };

  const updateAssignment = (i, patch) => {
    const next = assignments.map((a, idx) => idx === i ? { ...a, ...patch } : a);
    onUpdate({ custom_field_assignments: next });
  };

  const removeAssignment = (i) => onUpdate({ custom_field_assignments: assignments.filter((_, idx) => idx !== i) });

  const otherSteps = allSteps.filter(s => s.step_id !== step.step_id);

  return (
    <div className="space-y-4">
      <Field label="Label">
        <input value={step.label || ""} onChange={e => onUpdate({ label: e.target.value })} className={inputCls} placeholder="Question text" />
      </Field>
      <Field label="Title Display">
        <input value={step.title_display || ""} onChange={e => onUpdate({ title_display: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Help Text">
        <input value={step.help_text || ""} onChange={e => onUpdate({ help_text: e.target.value })} className={inputCls} />
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={step.required || false} onChange={e => onUpdate({ required: e.target.checked })} className="w-4 h-4 rounded" />
        <span className="text-sm text-slate-300">Required</span>
      </label>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Answer Options</label>
        </div>
        <div className="text-xs text-slate-500 mb-1 flex gap-2 px-7">
          <span className="flex-1">Label</span>
          <span className="w-24">Value</span>
          <span className="w-14">Score</span>
          <span className="w-32">Next Step</span>
          <span className="w-5" />
        </div>
        {options.map((opt, i) => (
          <OptionRow key={opt.id || i} opt={opt} index={i} total={options.length}
            otherSteps={otherSteps}
            onChange={patch => updateOption(i, patch)}
            onDelete={() => removeOption(i)}
            onMove={dir => moveOption(i, dir)}
          />
        ))}
        <button onClick={addOption}
          className="w-full flex items-center justify-center gap-1 border border-dashed border-white/20 hover:border-[#1e90ff] text-slate-400 hover:text-[#1e90ff] py-2 rounded-lg text-xs font-semibold transition-all mt-1">
          <Plus className="w-3 h-3" /> Add Option
        </button>
      </div>

      {/* Custom field assignments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Custom Field Assignments</label>
          <button onClick={addAssignment} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {assignments.map((a, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <select value={a.custom_field_id || ""} onChange={e => updateAssignment(i, { custom_field_id: e.target.value })}
              className={`${smallInputCls} flex-1`}>
              <option value="">— Pick field —</option>
              {customFields.map(cf => <option key={cf.id} value={cf.id}>{cf.display_label} ({cf.field_key})</option>)}
            </select>
            <select value={a.value_source || "answer_value"} onChange={e => updateAssignment(i, { value_source: e.target.value })}
              className={`${smallInputCls} w-28`}>
              <option value="answer_value">answer_value</option>
              <option value="answer_label">answer_label</option>
              <option value="static">static</option>
            </select>
            <select value={a.transform || "none"} onChange={e => updateAssignment(i, { transform: e.target.value })}
              className={`${smallInputCls} w-20`}>
              {["none", "lowercase", "uppercase", "trim", "phone_format", "state_2letter", "date_iso"].map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={() => removeAssignment(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionRow({ opt, index, total, otherSteps, onChange, onDelete, onMove }) {
  const [expanded, setExpanded] = useState(false);
  const [valueEdited, setValueEdited] = useState(false);

  const handleLabelChange = (val) => {
    const patch = { label: val };
    if (!valueEdited && !opt.value) patch.value = toSnake(val);
    onChange(patch);
  };

  return (
    <div className="bg-[#0a1628] border border-white/5 rounded-lg mb-1 overflow-hidden">
      <div className="flex items-center gap-2 p-2">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="text-slate-600 hover:text-white disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="text-slate-600 hover:text-white disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
        </div>
        <input value={opt.label || ""} onChange={e => handleLabelChange(e.target.value)}
          className="flex-1 bg-transparent border-b border-white/10 text-sm text-white py-1 focus:outline-none focus:border-[#1e90ff]" placeholder="Option label" />
        <input value={opt.value || ""} onChange={e => { setValueEdited(true); onChange({ value: e.target.value }); }}
          className="w-24 bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#1e90ff]" placeholder="value" />
        <input type="number" value={opt.score ?? 0} onChange={e => onChange({ score: parseFloat(e.target.value) || 0 })}
          className="w-14 bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none" placeholder="0" />
        <select value={opt.target_step_id || ""} onChange={e => onChange({ target_step_id: e.target.value || null })}
          className="w-32 bg-[#0f1e35] border border-white/10 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
          <option value="">End quiz</option>
          {otherSteps.map(s => <option key={s.step_id} value={s.step_id}>{s.title_display || s.step_id}</option>)}
        </select>
        <button onClick={() => setExpanded(v => !v)} className="text-slate-500 hover:text-white">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onDelete} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/5">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Tags to Add (comma separated)</label>
            <input value={(opt.tags_to_add || []).join(", ")} onChange={e => onChange({ tags_to_add: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
              className="w-full bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Tags to Remove (comma separated)</label>
            <input value={(opt.tags_to_remove || []).join(", ")} onChange={e => onChange({ tags_to_remove: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
              className="w-full bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={opt.is_default || false} onChange={e => onChange({ is_default: e.target.checked })} className="w-3 h-3 rounded" />
            <span className="text-xs text-slate-300">Is Default</span>
          </label>
        </div>
      )}
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
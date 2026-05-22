import React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { TIER_META, OPERATORS } from "./constants";

const sel = "bg-[#050b14] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#2282fc] font-mono";

const BRANCHING_MODES = ["none","by_answer","by_variable","by_lookup_field","by_script"];

export default function BranchingSection({ step, steps, onChange }) {
  const rules = step.branching_rules || [];
  const stepOptions = steps.filter(s => s.id !== step.id);

  const updateRule = (i, patch) => {
    const next = rules.map((r, j) => j === i ? { ...r, ...patch } : r);
    onChange({ branching_rules: next });
  };

  const addRule = () => onChange({ branching_rules: [...rules, { condition: "", operator: "equals", value: "", target_step_id: "", set_tier: "" }] });
  const removeRule = (i) => onChange({ branching_rules: rules.filter((_, j) => j !== i) });

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-slate-400">Mode:</span>
        <select value={step.branching_mode || "none"} onChange={e => onChange({ branching_mode: e.target.value })} className={sel}>
          {BRANCHING_MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {step.branching_mode !== "none" && (
        <>
          <div className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">Rules (first match wins)</div>
          <div className="space-y-2 mb-3">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-1.5 flex-wrap">
                <GripVertical className="w-3 h-3 text-slate-700 cursor-grab flex-shrink-0" />
                <span className="text-xs text-slate-500">When</span>
                <input
                  value={rule.condition || ""}
                  onChange={e => updateRule(i, { condition: e.target.value })}
                  placeholder="field"
                  className={sel}
                  style={{ width: 90 }}
                />
                <select value={rule.operator || "equals"} onChange={e => updateRule(i, { operator: e.target.value })} className={sel} style={{ width: 90 }}>
                  {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <input
                  value={rule.value || ""}
                  onChange={e => updateRule(i, { value: e.target.value })}
                  placeholder="value"
                  className={sel}
                  style={{ width: 80 }}
                />
                <span className="text-xs text-slate-500">go to</span>
                <select value={rule.target_step_id || ""} onChange={e => updateRule(i, { target_step_id: e.target.value })} className={sel} style={{ maxWidth: 130 }}>
                  <option value="">— none —</option>
                  {stepOptions.map(s => <option key={s.id} value={s.id}>{s.id} {s.title ? `(${s.title.substring(0, 18)})` : ""}</option>)}
                </select>
                <span className="text-xs text-slate-500">tier</span>
                <select value={rule.set_tier || ""} onChange={e => updateRule(i, { set_tier: e.target.value })} className={sel}>
                  <option value="">—</option>
                  {Object.keys(TIER_META).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-300 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <button onClick={addRule} className="flex items-center gap-1 text-xs text-[#2282fc] mb-4">
            <Plus className="w-3 h-3" /> Add rule
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400">Else: go to</span>
            <select value={step.else_target_step_id || ""} onChange={e => onChange({ else_target_step_id: e.target.value })} className={sel} style={{ maxWidth: 150 }}>
              <option value="">— terminal —</option>
              {stepOptions.map(s => <option key={s.id} value={s.id}>{s.id} {s.title ? `(${s.title.substring(0, 18)})` : ""}</option>)}
            </select>
            <span className="text-xs text-slate-400">tier</span>
            <select value={step.else_set_tier || ""} onChange={e => onChange({ else_set_tier: e.target.value })} className={sel}>
              <option value="">—</option>
              {Object.keys(TIER_META).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </>
      )}

      {/* Else for non-branching steps */}
      {step.branching_mode === "none" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400">Default next step:</span>
          <select value={step.else_target_step_id || ""} onChange={e => onChange({ else_target_step_id: e.target.value })} className={sel} style={{ maxWidth: 180 }}>
            <option value="">— terminal —</option>
            {stepOptions.map(s => <option key={s.id} value={s.id}>{s.id} {s.title ? `(${s.title.substring(0, 18)})` : ""}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
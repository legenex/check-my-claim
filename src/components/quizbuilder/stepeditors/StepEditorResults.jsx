import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";

export default function StepEditorResults({ step, allSteps, onUpdate }) {
  const [cfKeys, setCfKeys] = useState([]);
  const [cfInput, setCfInput] = useState("");
  const config = step.config || {};
  const dynamicFields = config.dynamic_fields || [];

  useEffect(() => {
    base44.entities.CustomField.filter({ scope: "global" }).then(fs => setCfKeys(fs.map(f => f.field_key))).catch(() => {});
  }, []);

  const setConfig = (patch) => onUpdate({ config: { ...config, ...patch } });

  const addDynamicField = (key) => {
    if (key && !dynamicFields.includes(key)) setConfig({ dynamic_fields: [...dynamicFields, key] });
    setCfInput("");
  };

  const removeDynamicField = (key) => setConfig({ dynamic_fields: dynamicFields.filter(k => k !== key) });

  return (
    <div className="space-y-3">
      <Field label="Label">
        <input value={step.label || ""} onChange={e => onUpdate({ label: e.target.value })} className={inputCls} placeholder="e.g. Thanks!" />
      </Field>
      <Field label="Title Display">
        <input value={step.title_display || ""} onChange={e => onUpdate({ title_display: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Result Template (HTML, use {field_key} for interpolation)">
        <textarea
          value={config.result_template || ""}
          onChange={e => setConfig({ result_template: e.target.value })}
          rows={6}
          className={`${inputCls} resize-none font-mono text-xs`}
          placeholder="<p>Thanks {first_name}! We'll be in touch.</p>"
        />
      </Field>
      <Field label="Dynamic Fields (for interpolation)">
        <div className="flex flex-wrap gap-1 mb-1">
          {dynamicFields.map(k => (
            <span key={k} className="flex items-center gap-1 bg-[#1e3a5f] text-blue-300 text-xs px-2 py-0.5 rounded">
              {k}
              <button onClick={() => removeDynamicField(k)} className="text-blue-400 hover:text-red-400">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={cfInput}
            onChange={e => setCfInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addDynamicField(cfInput.trim()); } }}
            list="cf-keys"
            placeholder="Type a field_key and press Enter"
            className={`${inputCls} flex-1 text-xs`}
          />
          <datalist id="cf-keys">
            {cfKeys.map(k => <option key={k} value={k} />)}
          </datalist>
          <button onClick={() => addDynamicField(cfInput.trim())} className="bg-[#1e90ff] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600">Add</button>
        </div>
      </Field>
      <Field label="Qualification Tier">
        <select value={config.qualification_tier || ""} onChange={e => setConfig({ qualification_tier: e.target.value || null })} className={inputCls}>
          <option value="">None</option>
          <option value="T1">T1</option>
          <option value="T2">T2</option>
          <option value="T3">T3</option>
          <option value="DQ">DQ</option>
        </select>
      </Field>
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
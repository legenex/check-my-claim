import React, { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import InlineFieldModal from "./InlineFieldModal";

const DISPLAY_MODES = ["buttons","cards","dropdown","searchable"];
const inp = "px-2 py-1 rounded text-xs text-white outline-none font-mono";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)" };

export default function OptionsConfig({ step, fields, onStepChange, onFieldCreated }) {
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [expandedOpts, setExpandedOpts] = useState({});

  const fieldOptions = fields || [];
  const inheritedOptions = step.inherit_options_from_field
    ? (fieldOptions.find(f => f.key === step.save_to_field)?.allowed_values || [])
    : [];
  const displayOptions = step.inherit_options_from_field ? inheritedOptions : (step.custom_options || []);

  const toggleExpand = (optVal) => setExpandedOpts(e => ({ ...e, [optVal]: !e[optVal] }));

  const getOptionWrites = (optVal) => (step.option_field_writes || {})[optVal] || [];
  const setOptionWrites = (optVal, writes) => {
    onStepChange({ option_field_writes: { ...(step.option_field_writes || {}), [optVal]: writes } });
  };

  const addWrite = (optVal) => setOptionWrites(optVal, [...getOptionWrites(optVal), { field: "", value: "" }]);
  const updateWrite = (optVal, i, patch) => {
    const writes = getOptionWrites(optVal).map((w, j) => j === i ? { ...w, ...patch } : w);
    setOptionWrites(optVal, writes);
  };
  const removeWrite = (optVal, i) => setOptionWrites(optVal, getOptionWrites(optVal).filter((_, j) => j !== i));

  const existingFieldKeys = fieldOptions.map(f => f.key);
  const fieldSelectOptions = [...fieldOptions.map(f => ({ value: f.key, label: f.key })), { value: "__new__", label: "+ Create new field" }];

  return (
    <div>
      {/* Display mode */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 font-mono">Display mode:</span>
        <div className="flex items-center gap-1 p-0.5 rounded" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.1)" }}>
          {DISPLAY_MODES.map(m => (
            <button
              key={m}
              onClick={() => onStepChange({ display_mode: m })}
              className="px-2.5 py-1 rounded text-xs font-semibold capitalize transition-all"
              style={{
                background: step.display_mode === m ? "#2282fc" : "transparent",
                color: step.display_mode === m ? "#fff" : "#64748b",
              }}
            >
              {m === "searchable" ? "Searchable" : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Inherit toggle */}
      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={!!step.inherit_options_from_field}
          onChange={e => onStepChange({ inherit_options_from_field: e.target.checked })}
        />
        <span className="text-xs text-slate-300">Inherit options from field <span className="font-mono text-[#2282fc]">{step.save_to_field}</span></span>
      </label>

      {/* Save-to field */}
      <div className="mb-4">
        <label className="text-xs font-mono text-slate-400 mb-1 block">Primary save_to field</label>
        <select
          value={step.save_to_field || ""}
          onChange={e => {
            if (e.target.value === "__new__") { setShowFieldModal(true); return; }
            onStepChange({ save_to_field: e.target.value });
          }}
          className={inp + " w-full"}
          style={inpStyle}
        >
          <option value="">— select field —</option>
          {fieldOptions.map(f => <option key={f.key} value={f.key}>{f.key}</option>)}
          <option value="__new__">+ Create new field</option>
        </select>
      </div>

      {/* Options list */}
      <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
        Options ({displayOptions.length}) {step.inherit_options_from_field && <span className="text-slate-600">— read only, inherited</span>}
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {displayOptions.map((opt, i) => {
          const optVal = opt.value || opt.id;
          const writes = getOptionWrites(optVal);
          const expanded = expandedOpts[optVal];
          return (
            <div key={optVal || i} className="rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 px-2.5 py-2">
                <GripVertical className="w-3 h-3 text-slate-700" />
                <span className="font-mono text-xs text-slate-500 w-20 flex-shrink-0 truncate">{optVal}</span>
                <span className="text-xs text-slate-200 flex-1 truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>{opt.label}</span>
                {writes.length > 0 && (
                  <span className="text-xs font-mono text-[#2282fc] px-1 rounded" style={{ background: "rgba(34,130,252,0.12)" }}>{writes.length}w</span>
                )}
                <button
                  onClick={() => toggleExpand(optVal)}
                  className="text-slate-500 hover:text-white"
                >
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {expanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5">
                  <div className="text-xs text-slate-500 font-mono mb-2">Writes when selected:</div>
                  {writes.map((w, wi) => (
                    <div key={wi} className="flex items-center gap-2 mb-1.5">
                      <select
                        value={w.field || ""}
                        onChange={e => {
                          if (e.target.value === "__new__") { setShowFieldModal(true); return; }
                          updateWrite(optVal, wi, { field: e.target.value });
                        }}
                        className={inp}
                        style={{ ...inpStyle, width: 130 }}
                      >
                        <option value="">— field —</option>
                        {fieldOptions.map(f => <option key={f.key} value={f.key}>{f.key}</option>)}
                        <option value="__new__">+ Create new field</option>
                      </select>
                      <span className="text-slate-600 text-xs">=</span>
                      <input
                        value={w.value || ""}
                        onChange={e => updateWrite(optVal, wi, { value: e.target.value })}
                        placeholder="value"
                        className={inp}
                        style={{ ...inpStyle, flex: 1 }}
                      />
                      <button onClick={() => removeWrite(optVal, wi)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addWrite(optVal)} className="flex items-center gap-1 text-xs text-[#2282fc] mt-1">
                    <Plus className="w-3 h-3" /> Write field
                  </button>
                  <p className="text-xs text-slate-600 mt-2">Primary save_to holds the option value. Add writes to pre-tag the lead.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showFieldModal && (
        <InlineFieldModal
          existingKeys={existingFieldKeys}
          onCreated={(f) => { onFieldCreated(f); setShowFieldModal(false); }}
          onClose={() => setShowFieldModal(false)}
        />
      )}
    </div>
  );
}
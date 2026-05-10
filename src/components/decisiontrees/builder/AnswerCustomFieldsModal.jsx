import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FIELD_TYPES = ["string", "text", "number", "boolean", "enum", "email", "phone", "date", "datetime", "url", "json", "array_string"];
const CATEGORIES = ["Contact", "Accident Details", "Injury", "Liability", "Treatment", "Vehicle", "Insurance", "Attribution", "Custom", "Other"];
const FIELD_KEY_RE = /^[a-z][a-z0-9_]*$/;

function typePill(type) {
  const colors = {
    string: "bg-blue-900/60 text-blue-300", text: "bg-blue-900/60 text-blue-300",
    number: "bg-green-900/60 text-green-300", boolean: "bg-purple-900/60 text-purple-300",
    enum: "bg-yellow-900/60 text-yellow-300", email: "bg-pink-900/60 text-pink-300",
    phone: "bg-orange-900/60 text-orange-300", date: "bg-cyan-900/60 text-cyan-300",
  };
  return `text-xs px-1.5 py-0.5 rounded font-mono ${colors[type] || "bg-slate-700 text-slate-300"}`;
}

// ─── Sub-picker for selecting/creating Custom Fields ─────────────────────────
function FieldPickerModal({ allCustomFields, activeCfIds, quizId, matrixData, onApply, onClose }) {
  const [checked, setChecked] = useState(new Set(activeCfIds));
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("string");
  const [newCategory, setNewCategory] = useState("Custom");
  const [suggesting, setSuggesting] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [saving, setSaving] = useState(false);

  const available = allCustomFields.filter(cf =>
    cf.scope === "global" || (cf.scope === "quiz" && cf.quiz_id === quizId)
  );

  const toggle = (id) => setChecked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleApply = () => {
    // Check if removing any field that has data
    const removedIds = activeCfIds.filter(id => !checked.has(id));
    const hasData = removedIds.some(cfId => {
      return Object.values(matrixData[cfId] || {}).some(v => v && v.trim());
    });
    if (hasData && !window.confirm("Some removed fields have values. Remove them from the matrix?")) return;
    onApply([...checked]);
  };

  const handleSuggest = async () => {
    if (!newLabel.trim()) return;
    setSuggesting(true);
    try {
      const existingKeys = allCustomFields.map(cf => ({ key: cf.field_key, id: cf.id }));
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a snake_case field_key, a field_type, and a category for a custom field used in a lead qualification quiz.
Rules: field_key must be snake_case matching /^[a-z][a-z0-9_]*$/, prefer was_/has_/is_ prefix for booleans, keep under 24 chars where reasonable.
field_type must be one of: string, text, number, boolean, enum, email, phone, date, datetime, url, json, array_string.
category must be one of: Contact, Accident Details, Injury, Liability, Treatment, Vehicle, Insurance, Attribution, Custom, Other.
Examples: 'At Fault' → {field_key:at_fault, field_type:enum, category:Liability}; 'First Name' → {first_name, string, Contact}; 'Were you the driver' → {was_driver, boolean, Vehicle}; 'Did you have an attorney' → {has_attorney, boolean, Insurance}; 'Type of incident' → {incident_type, enum, Accident Details}; 'Were you injured' → {was_injured, boolean, Injury}.
If a CustomField with the suggested field_key already exists in the provided existing_keys list, return its id in an 'existing_id' property.
Input: display_label="${newLabel.trim()}", existing_keys=${JSON.stringify(existingKeys)}.
Output JSON only.`,
        response_json_schema: {
          type: "object",
          properties: {
            field_key: { type: "string" },
            field_type: { type: "string" },
            category: { type: "string" },
            existing_id: { type: "string" },
          },
        },
        model: "claude_sonnet_4_6",
      });
      if (result.existing_id) {
        // reuse existing, just add to checked
        setChecked(prev => new Set([...prev, result.existing_id]));
        setCreating(false);
        setNewLabel("");
        return;
      }
      setNewKey(result.field_key || "");
      setNewType(result.field_type || "string");
      setNewCategory(result.category || "Custom");
      setKeyError("");
    } catch (e) {
      console.error(e);
    } finally {
      setSuggesting(false);
    }
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    if (!FIELD_KEY_RE.test(newKey)) {
      setKeyError("field_key must match /^[a-z][a-z0-9_]*$/");
      return;
    }
    const exists = allCustomFields.find(cf => cf.field_key === newKey);
    if (exists) {
      setChecked(prev => new Set([...prev, exists.id]));
      setCreating(false);
      setNewLabel("");
      return;
    }
    setSaving(true);
    try {
      const created = await base44.entities.CustomField.create({
        display_label: newLabel.trim(),
        field_key: newKey,
        field_type: newType,
        category: newCategory,
        scope: "quiz",
        quiz_id: quizId,
        is_system: false,
        is_pii: false,
        is_required_in_lead: false,
        allowed_values: [],
      });
      setChecked(prev => new Set([...prev, created.id]));
      setCreating(false);
      setNewLabel("");
      setNewKey("");
      // parent allCustomFields will refresh on next open; for now it appears in the matrix
      onApply([...checked, created.id], created);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-bold text-sm">Select Custom Fields</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {available.map(cf => (
            <label key={cf.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" checked={checked.has(cf.id)} onChange={() => toggle(cf.id)} className="w-4 h-4 rounded" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white font-medium">{cf.display_label}</span>
                <span className="text-xs text-slate-500 font-mono ml-2">{cf.field_key}</span>
              </div>
              <span className={typePill(cf.field_type)}>{cf.field_type}</span>
              <span className="text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{cf.category}</span>
            </label>
          ))}
        </div>

        {/* Create new custom field */}
        <div className="border-t border-white/10 p-3">
          {!creating ? (
            <button onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 text-xs text-[#1e90ff] hover:underline">
              <Plus className="w-3.5 h-3.5" /> Create New Custom Field
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-semibold mb-1">New Custom Field</div>
              <div className="flex gap-2">
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  placeholder="Display Label *" className={`${inputCls} flex-1`} />
                <button onClick={handleSuggest} disabled={!newLabel.trim() || suggesting}
                  className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg flex-shrink-0">
                  {suggesting ? "…" : "Suggest"}
                </button>
              </div>
              {newKey && (
                <>
                  <input value={newKey} onChange={e => { setNewKey(e.target.value); setKeyError(""); }}
                    placeholder="field_key" className={`${inputCls} font-mono ${keyError ? "border-red-500" : ""}`} />
                  {keyError && <p className="text-xs text-red-400">{keyError}</p>}
                  <div className="flex gap-2">
                    <select value={newType} onChange={e => setNewType(e.target.value)} className={inputCls}>
                      {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className={inputCls}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreate} disabled={saving}
                      className="flex-1 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-1.5 rounded-lg text-xs">
                      {saving ? "Creating…" : "Create"}
                    </button>
                    <button onClick={() => setCreating(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg text-xs">Cancel</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 py-3 border-t border-white/10">
          <button onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-xl text-sm">Cancel</button>
          <button onClick={handleApply} className="flex-1 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-sm">Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function AnswerCustomFieldsModal({ node, answers, quiz, allCustomFields, onSave, onClose }) {
  // Derive initial matrix from existing answer_options[].custom_field_overrides
  const initialCfIds = useMemo(() => {
    const ids = new Set();
    answers.forEach(a => { Object.keys(a.custom_field_overrides || {}).forEach(id => ids.add(id)); });
    return [...ids];
  }, []);

  const [cfIds, setCfIds] = useState(initialCfIds);
  const [cfMap, setCfMap] = useState({}); // id -> CustomField record
  const [matrixData, setMatrixData] = useState(() => {
    // { cfId: { ansId: value, __default: value } }
    const data = {};
    initialCfIds.forEach(cfId => {
      data[cfId] = { __default: "" };
      answers.forEach(a => {
        data[cfId][a.id] = (a.custom_field_overrides || {})[cfId] || "";
      });
    });
    return data;
  });
  const [defaultValues, setDefaultValues] = useState(() => {
    // derive from node.custom_field_assignments
    const dv = {};
    (node.custom_field_assignments || []).forEach(ass => {
      if (ass.value_source === "static") dv[ass.custom_field_id] = ass.default_value || "";
    });
    return dv;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load CF records for known ids
  useEffect(() => {
    const missing = cfIds.filter(id => !cfMap[id]);
    if (!missing.length) return;
    Promise.all(missing.map(id => base44.entities.CustomField.filter({ id }).then(r => r[0]))).then(fields => {
      const next = { ...cfMap };
      fields.filter(Boolean).forEach(f => { next[f.id] = f; });
      setCfMap(next);
    });
  }, [cfIds]);

  const handleCellChange = (cfId, ansId, val) => {
    setMatrixData(prev => ({
      ...prev,
      [cfId]: { ...(prev[cfId] || {}), [ansId]: val },
    }));
  };

  const handleDefaultChange = (cfId, val) => {
    setDefaultValues(prev => ({ ...prev, [cfId]: val }));
  };

  const handlePickerApply = (newCfIds, newCfRecord) => {
    // Add new rows
    const added = newCfIds.filter(id => !cfIds.includes(id));
    const removed = cfIds.filter(id => !newCfIds.includes(id));
    setMatrixData(prev => {
      const next = { ...prev };
      added.forEach(cfId => {
        next[cfId] = { __default: "" };
        answers.forEach(a => { next[cfId][a.id] = ""; });
      });
      removed.forEach(cfId => delete next[cfId]);
      return next;
    });
    setCfIds(newCfIds);
    if (newCfRecord) {
      setCfMap(prev => ({ ...prev, [newCfRecord.id]: newCfRecord }));
    }
    setShowPicker(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Build updated answer_options with overrides
      const updatedAnswers = answers.map(a => {
        const overrides = {};
        cfIds.forEach(cfId => {
          const val = (matrixData[cfId] || {})[a.id] || "";
          if (val.trim()) overrides[cfId] = val.trim();
        });
        return { ...a, custom_field_overrides: overrides };
      });

      // Build updated custom_field_assignments
      const existing = (node.custom_field_assignments || []).filter(
        ass => !cfIds.includes(ass.custom_field_id) || ass.value_source !== "static"
      );
      const staticAssignments = cfIds.map(cfId => {
        const dv = defaultValues[cfId] || "";
        const existing = (node.custom_field_assignments || []).find(
          a => a.custom_field_id === cfId && a.value_source === "static"
        );
        return {
          ...(existing || {}),
          custom_field_id: cfId,
          value_source: "static",
          default_value: dv,
          transform: existing?.transform || "none",
        };
      }).filter(a => a.default_value); // only keep if has a value
      const updatedAssignments = [
        ...(node.custom_field_assignments || []).filter(a =>
          !(cfIds.includes(a.custom_field_id) && a.value_source === "static")
        ),
        ...staticAssignments,
      ];

      await onSave(updatedAnswers, updatedAssignments);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resolvedCfs = cfIds.map(id => cfMap[id]).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-bold">Custom Fields per Answer — {node.label}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Scrollable table */}
        <div className="flex-1 overflow-auto p-4">
          {cfIds.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-3">No custom fields in this matrix yet.</p>
              <button onClick={() => setShowPicker(true)}
                className="text-[#1e90ff] hover:underline text-sm">+ Select Custom Fields to add rows</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse min-w-full">
                <thead>
                  <tr className="bg-[#0a1628]">
                    {/* Sticky left: Custom Field column */}
                    <th className="sticky left-0 z-10 bg-[#0a1628] text-left px-3 py-2.5 text-slate-400 font-semibold border border-white/10 min-w-[200px]">
                      Custom Field
                    </th>
                    <th className="text-left px-3 py-2.5 text-slate-400 font-semibold border border-white/10 min-w-[120px]">
                      Default Answer
                    </th>
                    {answers.map((a, i) => (
                      <th key={a.id} className="text-left px-3 py-2.5 text-white font-semibold border border-white/10 min-w-[130px]">
                        <div className="truncate max-w-[120px]" title={a.label || `Answer ${i + 1}`}>
                          {a.label || `Answer ${i + 1}`}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resolvedCfs.map(cf => (
                    <tr key={cf.id} className="border-b border-white/5 hover:bg-white/5">
                      {/* Field info (sticky) */}
                      <td className="sticky left-0 z-10 bg-[#0f1e35] px-3 py-2.5 border border-white/10">
                        <div className="font-semibold text-white">{cf.display_label}</div>
                        <div className="text-slate-500 font-mono mt-0.5">{cf.field_key}</div>
                        <span className={`${typePill(cf.field_type)} mt-1 inline-block`}>{cf.field_type}</span>
                      </td>
                      {/* Default Answer cell */}
                      <td className="px-2 py-2 border border-white/10">
                        <input
                          value={defaultValues[cf.id] || ""}
                          onChange={e => handleDefaultChange(cf.id, e.target.value)}
                          className={cellInputCls}
                          placeholder="default…"
                        />
                      </td>
                      {/* Per-answer cells */}
                      {answers.map(a => (
                        <td key={a.id} className="px-2 py-2 border border-white/10">
                          <input
                            value={(matrixData[cf.id] || {})[a.id] || ""}
                            onChange={e => handleCellChange(cf.id, a.id, e.target.value)}
                            className={cellInputCls}
                            placeholder="—"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Show skeleton rows for unresolved CFs */}
                  {cfIds.filter(id => !cfMap[id]).map(id => (
                    <tr key={id} className="border-b border-white/5">
                      <td className="sticky left-0 bg-[#0f1e35] px-3 py-2.5 border border-white/10 text-slate-500">
                        Loading {id.slice(-6)}…
                      </td>
                      <td className="px-2 py-2 border border-white/10" />
                      {answers.map(a => <td key={a.id} className="px-2 py-2 border border-white/10" />)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-xs text-[#1e90ff] border border-[#1e90ff]/30 hover:border-[#1e90ff] px-3 py-2 rounded-lg hover:bg-[#1e90ff]/10 transition-all">
              <ChevronDown className="w-3.5 h-3.5" /> Select Custom Fields
            </button>
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2 rounded-xl text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl text-sm">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {showPicker && (
        <FieldPickerModal
          allCustomFields={allCustomFields}
          activeCfIds={cfIds}
          quizId={quiz?.id}
          matrixData={matrixData}
          onApply={handlePickerApply}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
const cellInputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#1e90ff]";
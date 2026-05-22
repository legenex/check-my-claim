import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FIELD_TYPES = ["text","number","enum","boolean","date","email","phone","url","json"];
const FIELD_CATS = ["demographics","event","qualify","contact","routing","computed"];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").substring(0, 50);
}

const inp = "w-full px-3 py-2 rounded text-sm text-white outline-none";
const inpStyle = { background: "#050b14", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Manrope', sans-serif" };

export default function InlineFieldModal({ onCreated, onClose, existingKeys }) {
  const [form, setForm] = useState({
    key: "", label: "", type: "text", category: "qualify",
    description: "", default_value: "", computed: false,
    allowed_values: [],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLabelChange = (v) => {
    set("label", v);
    if (!form.key) set("key", slugify(v));
  };

  const addEnumValue = () => set("allowed_values", [...form.allowed_values, { value: "", label: "", icon: "" }]);
  const updateEnumVal = (i, k, v) => {
    const arr = [...form.allowed_values];
    arr[i] = { ...arr[i], [k]: v };
    set("allowed_values", arr);
  };
  const removeEnumVal = (i) => set("allowed_values", form.allowed_values.filter((_, j) => j !== i));

  const save = async () => {
    if (!form.key) { setError("Key is required."); return; }
    if (!form.label) { setError("Label is required."); return; }
    if ((existingKeys || []).includes(form.key)) { setError(`Key "${form.key}" already exists.`); return; }
    setSaving(true);
    try {
      const created = await base44.entities.SurveyField.create({
        key: form.key,
        label: form.label,
        type: form.type,
        category: form.category,
        description: form.description,
        default_value: form.default_value,
        computed: form.computed,
        allowed_values: form.type === "enum" ? form.allowed_values : [],
      });
      onCreated(created);
      onClose();
    } catch (e) {
      setError(e.message || "Save failed.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(5,11,20,0.9)" }} onClick={onClose}>
      <div
        className="rounded-lg overflow-hidden flex flex-col"
        style={{ background: "#0a1320", border: "1px solid rgba(255,255,255,0.12)", width: 520, maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>Create New Field</span>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
        </div>
        <div className="overflow-y-auto p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-mono">Label</label>
              <input value={form.label} onChange={e => handleLabelChange(e.target.value)} className={inp} style={inpStyle} placeholder="e.g. Verify Confirmed" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-mono">Key (auto-slugified)</label>
              <input value={form.key} onChange={e => set("key", slugify(e.target.value))} className={inp} style={inpStyle} placeholder="verify_confirmed" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-mono">Type</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={inp} style={inpStyle}>
                {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block font-mono">Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={inp} style={inpStyle}>
                {FIELD_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block font-mono">Description</label>
            <input value={form.description} onChange={e => set("description", e.target.value)} className={inp} style={inpStyle} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block font-mono">Default Value</label>
            <input value={form.default_value} onChange={e => set("default_value", e.target.value)} className={inp} style={inpStyle} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.computed} onChange={e => set("computed", e.target.checked)} />
            <span className="text-xs text-slate-300 font-mono">Computed (set by a lookup/script step)</span>
          </label>

          {form.type === "enum" && (
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2">Allowed Values</div>
              {form.allowed_values.map((v, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <input value={v.value} onChange={e => updateEnumVal(i, "value", e.target.value)} className={inp} style={{ ...inpStyle, width: "30%" }} placeholder="value" />
                  <input value={v.label} onChange={e => updateEnumVal(i, "label", e.target.value)} className={inp} style={{ ...inpStyle, flex: 1 }} placeholder="Label" />
                  <input value={v.icon || ""} onChange={e => updateEnumVal(i, "icon", e.target.value)} className={inp} style={{ ...inpStyle, width: "22%" }} placeholder="Icon?" />
                  <button onClick={() => removeEnumVal(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={addEnumValue} className="flex items-center gap-1 text-xs text-[#2282fc] mt-1">
                <Plus className="w-3 h-3" /> Add value
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="px-5 py-3 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded text-sm text-slate-400 hover:text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded text-sm font-bold text-white transition-colors" style={{ background: "#2282fc", fontFamily: "'Manrope', sans-serif" }}>
            {saving ? "Creating..." : "Create Field"}
          </button>
        </div>
      </div>
    </div>
  );
}
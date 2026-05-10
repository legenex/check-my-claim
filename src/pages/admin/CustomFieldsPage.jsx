import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

const FIELD_TYPES = ["text", "email", "phone", "number", "date", "select", "checkbox", "textarea"];

export default function CustomFieldsPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ field_key: "", label: "", field_type: "text", required: false, options: "" });

  useEffect(() => { fetchFields(); }, []);

  const fetchFields = async () => {
    setLoading(true);
    const results = await base44.entities.CustomField.list("-created_date", 200);
    setFields(results);
    setLoading(false);
  };

  const saveField = async () => {
    const data = {
      ...form,
      options: form.options ? form.options.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    if (editingId) {
      await base44.entities.CustomField.update(editingId, data);
    } else {
      await base44.entities.CustomField.create(data);
    }
    setForm({ field_key: "", label: "", field_type: "text", required: false, options: "" });
    setAdding(false);
    setEditingId(null);
    fetchFields();
  };

  const startEdit = (field) => {
    setEditingId(field.id);
    setForm({ ...field, options: (field.options || []).join(", ") });
    setAdding(true);
  };

  const deleteField = async (id) => {
    await base44.entities.CustomField.delete(id);
    setFields(prev => prev.filter(f => f.id !== id));
  };

  return (
    <AdminLayout
      title="Custom Fields"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Decision Trees", href: "/admin/DecisionTrees" }, { label: "Custom Fields" }]}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Custom Fields</h2>
          <p className="text-slate-400 text-sm mt-1">Global field definitions used across decision trees</p>
        </div>
        {!adding && (
          <button onClick={() => { setAdding(true); setEditingId(null); setForm({ field_key: "", label: "", field_type: "text", required: false, options: "" }); }}
            className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
            <Plus className="w-4 h-4" /> Add Field
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">{editingId ? "Edit Field" : "New Custom Field"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Field Key (snake_case)</label>
              <input value={form.field_key} onChange={e => setForm(f => ({ ...f, field_key: e.target.value }))}
                placeholder="e.g. accident_date" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Label</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Accident Date" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Field Type</label>
              <select value={form.field_type} onChange={e => setForm(f => ({ ...f, field_type: e.target.value }))} className={inputCls}>
                {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Options (comma-separated, for select)</label>
              <input value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
                placeholder="Option A, Option B, Option C" className={inputCls} disabled={form.field_type !== "select"} />
            </div>
          </div>
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-slate-300">Required field</span>
          </label>
          <div className="flex gap-3">
            <button onClick={saveField} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => { setAdding(false); setEditingId(null); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg text-sm">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : fields.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No custom fields yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0a1628] border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-white">Key</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Label</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Required</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Options</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map(field => (
                <tr key={field.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-[#1e90ff] font-mono text-xs">{field.field_key}</td>
                  <td className="px-4 py-3 text-white">{field.label}</td>
                  <td className="px-4 py-3"><span className="bg-white/10 text-slate-300 text-xs px-2 py-0.5 rounded">{field.field_type}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{field.required ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{(field.options || []).join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => startEdit(field)} className="p-1.5 text-slate-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteField(field.id)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] disabled:opacity-40";
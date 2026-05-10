import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

const FIELD_TYPES = ["text", "email", "phone", "select", "textarea", "checkbox", "date", "number"];

const DEFAULT_FORM = {
  name: "",
  fields: [
    { key: "first_name", label: "First Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "phone", required: true },
  ],
  tcpa_enabled: true,
  tcpa_text: "By submitting, you consent to be contacted by attorneys and their partners via automated calls/texts at the number provided. Consent is not required to use our service.",
  trusted_form_enabled: false,
  webhook_url: "",
  webhook_method: "POST",
  submit_button_text: "Submit →",
  success_message: "Thank you! An attorney will be in touch shortly.",
};

export default function ContactFormEditor({ formId, onBack }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!formId);

  useEffect(() => {
    if (formId) {
      base44.entities.ContactForm.filter({ id: formId }).then(res => {
        if (res.length > 0) setForm({ ...DEFAULT_FORM, ...res[0] });
        setLoading(false);
      });
    }
  }, [formId]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addField = () => {
    setForm(f => ({ ...f, fields: [...(f.fields || []), { key: "", label: "", type: "text", required: false }] }));
  };

  const updateField = (i, field, value) => {
    setForm(f => {
      const fields = [...(f.fields || [])];
      fields[i] = { ...fields[i], [field]: value };
      return { ...f, fields };
    });
  };

  const removeField = (i) => {
    setForm(f => ({ ...f, fields: (f.fields || []).filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    setSaving(true);
    if (formId) {
      await base44.entities.ContactForm.update(formId, form);
    } else {
      await base44.entities.ContactForm.create(form);
    }
    setSaving(false);
    onBack();
  };

  if (loading) return (
    <AdminLayout title="Loading...">
      <div className="text-slate-400 text-center py-8">Loading...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout
      title={formId ? `Edit: ${form.name}` : "New Contact Form"}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Decision Trees", href: "/admin/DecisionTrees" }, { label: "Contact Forms", href: "/admin/ContactForms" }, { label: formId ? "Edit" : "New" }]}
    >
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Form"}
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Name */}
        <div className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
          <Field label="Form Name *">
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. MVA Lead Form" className={inputCls} />
          </Field>
        </div>

        {/* Fields */}
        <div className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Form Fields</h3>
            <button onClick={addField} className="flex items-center gap-1 text-xs text-[#1e90ff] hover:underline">
              <Plus className="w-3 h-3" /> Add Field
            </button>
          </div>
          <div className="space-y-3">
            {(form.fields || []).map((field, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={field.key} onChange={e => updateField(i, "key", e.target.value)}
                  placeholder="field_key" className={`${inputCls} w-32 font-mono text-xs`} />
                <input value={field.label} onChange={e => updateField(i, "label", e.target.value)}
                  placeholder="Label" className={`${inputCls} flex-1`} />
                <select value={field.type} onChange={e => updateField(i, "type", e.target.value)} className={`${inputCls} w-28`}>
                  {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <label className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap cursor-pointer">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(i, "required", e.target.checked)} className="w-3.5 h-3.5" />
                  Req
                </label>
                <button onClick={() => removeField(i)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TCPA */}
        <div className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">TCPA Compliance</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.tcpa_enabled} onChange={e => set("tcpa_enabled", e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-300">Enabled</span>
            </label>
          </div>
          {form.tcpa_enabled && (
            <Field label="TCPA Text">
              <textarea value={form.tcpa_text} onChange={e => set("tcpa_text", e.target.value)} rows={4} className={inputCls} />
            </Field>
          )}
        </div>

        {/* Webhook */}
        <div className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Webhook (optional)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Webhook URL">
                <input value={form.webhook_url} onChange={e => set("webhook_url", e.target.value)}
                  placeholder="https://..." className={inputCls} />
              </Field>
            </div>
            <Field label="Method">
              <select value={form.webhook_method} onChange={e => set("webhook_method", e.target.value)} className={inputCls}>
                <option>POST</option>
                <option>GET</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Submit */}
        <div className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Submit Behavior</h3>
          <div className="space-y-3">
            <Field label="Submit Button Text">
              <input value={form.submit_button_text} onChange={e => set("submit_button_text", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Success Message">
              <input value={form.success_message} onChange={e => set("success_message", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      </div>
    </AdminLayout>
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

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
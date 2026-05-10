import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function ContactFormRenderer({ node, fieldValues, primaryColor, onSubmit }) {
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    const contactFormId = node.config?.contact_form_id;
    if (!contactFormId) return;
    Promise.all([
      base44.entities.ContactForm.filter({ id: contactFormId }).then(r => r[0]),
      base44.entities.CustomField.filter({}),
    ]).then(([f, cfs]) => {
      setForm(f);
      setCustomFields(cfs);
      // Pre-fill with existing field values
      const prefill = {};
      (f?.fields || []).forEach(field => {
        const cf = cfs.find(c => c.id === field.custom_field_id);
        if (cf && fieldValues[cf.field_key]) prefill[cf.field_key] = fieldValues[cf.field_key];
      });
      setValues(prefill);
    }).catch(() => {});
  }, [node.config?.contact_form_id]);

  const validate = () => {
    if (!form) return true;
    const errs = {};
    (form.fields || []).forEach(field => {
      const cf = customFields.find(c => c.id === field.custom_field_id);
      if (!cf) return;
      const val = values[cf.field_key] || "";
      if ((field.is_required ?? true) && !val.trim()) {
        errs[cf.field_key] = `${field.display_label_override || cf.display_label} is required`;
      }
      if (cf.field_type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errs[cf.field_key] = "Please enter a valid email address";
      }
      if (cf.field_type === "phone" && val && !/^[\d\s\-()+]{10,}$/.test(val)) {
        errs[cf.field_key] = "Please enter a valid phone number";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // Fire submit webhook if configured
    if (form?.submit_webhook_url) {
      try {
        await fetch(form.submit_webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...fieldValues, ...values, submitted_at: new Date().toISOString() }),
        });
      } catch (_) {}
    }

    onSubmit({ ...values });
    setSubmitting(false);
  };

  if (!form) {
    // Fallback: generic contact form
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-extrabold text-white mb-2">Almost there!</h2>
        {[
          { key: "first_name", label: "First Name", type: "text" },
          { key: "last_name", label: "Last Name", type: "text" },
          { key: "email", label: "Email Address", type: "email" },
          { key: "phone", label: "Phone Number", type: "tel" },
        ].map(f => (
          <div key={f.key}>
            <label className="text-white/70 text-sm font-semibold block mb-1">{f.label}</label>
            <input type={f.type} value={values[f.key] || ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              className="w-full p-4 rounded-2xl border border-white/10 text-white text-base bg-white/5 focus:outline-none placeholder-white/30"
              required />
          </div>
        ))}
        <p className="text-white/40 text-xs leading-relaxed">By submitting, you agree to be contacted regarding your claim. No obligation.</p>
        <button type="submit" disabled={submitting} className="w-full py-4 text-white font-bold rounded-2xl transition-all text-lg"
          style={{ background: primaryColor }}>
          {submitting ? "Submitting…" : "Check My Claim →"}
        </button>
      </form>
    );
  }

  const fieldRows = form.fields || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {fieldRows.map((fieldDef, i) => {
          const cf = customFields.find(c => c.id === fieldDef.custom_field_id);
          if (!cf) return null;
          const label = fieldDef.display_label_override || cf.display_label;
          const isHalf = fieldDef.width === "half";
          const inputType = cf.field_type === "email" ? "email" : cf.field_type === "phone" ? "tel" : cf.field_type === "date" ? "date" : cf.field_type === "number" ? "number" : "text";

          return (
            <div key={i} className={isHalf ? "" : "col-span-2"}>
              <label className="text-white/70 text-sm font-semibold block mb-1">{label}{(fieldDef.is_required ?? true) ? " *" : ""}</label>
              <input
                type={inputType}
                value={values[cf.field_key] || ""}
                onChange={e => setValues(v => ({ ...v, [cf.field_key]: e.target.value }))}
                placeholder={fieldDef.placeholder || ""}
                className={`w-full p-4 rounded-2xl border text-white text-base bg-white/5 focus:outline-none placeholder-white/30 transition-colors ${errors[cf.field_key] ? "border-red-500/50" : "border-white/10 focus:border-white/30"}`}
              />
              {errors[cf.field_key] && <p className="text-red-400 text-xs mt-1">{errors[cf.field_key]}</p>}
            </div>
          );
        })}
      </div>

      {/* TCPA */}
      {form.tcpa_enabled && form.tcpa_text && (
        <div className="text-white/40 text-xs leading-relaxed border border-white/10 rounded-xl p-3"
          dangerouslySetInnerHTML={{ __html: form.tcpa_text }} />
      )}

      <button type="submit" disabled={submitting} className="w-full py-4 text-white font-bold rounded-2xl transition-all text-lg"
        style={{ background: primaryColor }}>
        {submitting ? "Submitting…" : form.submit_button_text || "Continue →"}
      </button>
    </form>
  );
}
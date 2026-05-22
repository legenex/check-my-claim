import React, { useState, useEffect, useRef } from "react";
import { shouldSkipTrustedForm } from "@/utils/geoGate";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// DEFAULT_TCPA_TEXT removed - use form.tcpa_text directly

export default function ContactFormRenderer({ formId, quizTheme, onSuccess, onError, urlParams = {} }) {
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [trustedFormCert, setTrustedFormCert] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

  useEffect(() => {
    if (form?.scripts?.some(s => s.trigger === "on_render" && s.is_enabled)) {
      const script = form.scripts.find(s => s.trigger === "on_render" && s.is_enabled);
      try { new Function(script.code)(); } catch (e) { console.error("on_render script error:", e); }
    }
  }, [form]);

  const loadForm = async () => {
    const forms = await base44.entities.ContactForm.filter({ id: formId });
    if (forms.length) setForm(forms[0]);
  };

  useEffect(() => {
    if (!form?.trustedform_enabled) return;
    if (shouldSkipTrustedForm()) return;
    const fieldId = form.trustedform_field_id || "xxTrustedFormCertUrl";
    const script = document.createElement("script");
    script.src = "https://api.trustedform.com/t.js";
    script.async = true;
    script.onload = () => {
      if (window.TF) {
        window.TF.getCertUrl((certUrl) => setTrustedFormCert(certUrl));
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [form]);

  const handleChange = (fieldKey, value) => {
    setValues(prev => ({ ...prev, [fieldKey]: value }));
  };

  const validate = () => {
    const errors = [];
    (form.fields || []).forEach(f => {
      if (f.required && !values[f.field_key]) {
        errors.push(`${f.label} is required`);
      }
    });
    return errors;
  };

  const interpolateTemplate = (template) => {
    if (!template) return "{}";
    let result = template;
    Object.entries(values).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), val || "");
    });
    Object.entries(urlParams).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{{url.${key}}}`, "g"), val || "");
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      toast.error(errors[0]);
      if (onError) onError(errors);
      const errorScript = form?.scripts?.find(s => s.trigger === "on_submit_error" && s.is_enabled);
      if (errorScript) { try { new Function(errorScript.code)(); } catch (err) { console.error(err); } }
      return;
    }

    setSubmitting(true);

    // Add TrustedForm cert if enabled
    const submitData = { ...values };
    if (trustedFormCert && form.trustedform_enabled) {
      submitData[form.trustedform_field_id || "xxTrustedFormCertUrl"] = trustedFormCert;
    }

    try {
      // Fire webhook if configured
      if (form.submit_webhook_url) {
        const body = interpolateTemplate(form.submit_webhook_body_template || JSON.stringify(submitData, null, 2));
        const headers = form.submit_webhook_headers || { "Content-Type": "application/json" };
        await fetch(form.submit_webhook_url, {
          method: "POST",
          headers,
          body,
        });
      }

      // Run success script
      const successScript = form?.scripts?.find(s => s.trigger === "on_submit_success" && s.is_enabled);
      if (successScript) { try { new Function(successScript.code)(); } catch (err) { console.error(err); } }

      toast.success("Form submitted successfully!");
      if (onSuccess) onSuccess(submitData);

      if (form.success_redirect_url) {
        window.location.href = form.success_redirect_url;
      }
    } catch (err) {
      toast.error("Submission failed. Please try again.");
      if (onError) onError([err.message]);
      const errorScript = form?.scripts?.find(s => s.trigger === "on_submit_error" && s.is_enabled);
      if (errorScript) { try { new Function(errorScript.code)(); } catch (e) { console.error(e); } }
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) return <div className="p-8 text-center text-slate-400">Loading form...</div>;

  const themeColors = quizTheme ? {
    primary: quizTheme.primary_color || "#1e90ff",
    accent: quizTheme.accent_color || "#22c55e",
    border: quizTheme.border_color || "rgba(255,255,255,0.1)",
    text: quizTheme.text_color || "#ffffff",
  } : { primary: "#1e90ff", accent: "#22c55e", border: "rgba(255,255,255,0.1)", text: "#ffffff" };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Fields */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
        {(form.fields || []).map(field => {
          const colSpan = field.width === "half" ? 6 : field.width === "third" ? 4 : 12;
          return (
            <div key={field.field_key} className="space-y-1.5" style={{ gridColumn: `span ${colSpan}` }}>
              <Label className="text-sm font-medium" style={{ color: themeColors.text }}>{field.label}</Label>
              {field.type === "select" ? (
                <Select value={values[field.field_key] || ""} onValueChange={(v) => handleChange(field.field_key, v)}>
                  <SelectTrigger className="w-full" style={{ borderColor: themeColors.border, color: themeColors.text }}>
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  value={values[field.field_key] || ""}
                  onChange={(e) => handleChange(field.field_key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full"
                  style={{ borderColor: themeColors.border, color: themeColors.text }}
                />
              ) : field.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={field.field_key}
                    checked={!!values[field.field_key]}
                    onCheckedChange={(c) => handleChange(field.field_key, c)}
                    style={{ borderColor: themeColors.border }}
                  />
                  <label htmlFor={field.field_key} className="text-sm" style={{ color: themeColors.text }}>{field.help_text || field.label}</label>
                </div>
              ) : field.type === "hidden" ? (
                <input type="hidden" name={field.field_key} value={values[field.field_key] || ""} />
              ) : (
                <Input
                  type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "number" ? "number" : "text"}
                  value={values[field.field_key] || ""}
                  onChange={(e) => handleChange(field.field_key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full"
                  style={{ borderColor: themeColors.border, color: themeColors.text }}
                />
              )}
              {field.help_text && field.type !== "checkbox" && (
                <p className="text-xs text-slate-400">{field.help_text}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full font-bold py-6 text-base"
        style={{
          background: themeColors.primary,
          borderRadius: quizTheme?.button_style === "pill" ? "999px" : quizTheme?.button_style === "square" ? "0" : "8px",
        }}
      >
        {submitting ? "Submitting..." : (form.submit_button_label || "Submit")}
      </Button>

      {/* TCPA */}
      {form.tcpa_enabled && form.tcpa_text && (
        <div
          className="text-xs leading-relaxed"
          style={{ color: "rgba(255,255,255,0.5)" }}
          dangerouslySetInnerHTML={{ __html: form.tcpa_text.replace("{label}", form.submit_button_label || "Submit") }}
        />
      )}

      {/* Disclaimer */}
      {form.disclaimer_html && (
        <div
          className="text-xs leading-relaxed"
          style={{ color: "rgba(255,255,255,0.4)" }}
          dangerouslySetInnerHTML={{ __html: form.disclaimer_html }}
        />
      )}

      {/* Personal Information Guarantee */}
      {form.show_personal_info_guarantee && (
        <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: themeColors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-medium" style={{ color: themeColors.accent }}>Your personal information is secure and will never be shared</span>
        </div>
      )}
    </form>
  );
}
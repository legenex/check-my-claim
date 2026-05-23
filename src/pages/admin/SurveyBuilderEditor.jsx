import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Save, ArrowLeft, Globe, AlertCircle, GripVertical, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

const TABS = ["Steps", "Fields", "Settings", "Integrations", "Validate"];

export default function SurveyBuilderEditor() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [steps, setSteps] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("Steps");
  const [expandedStep, setExpandedStep] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    const [s, allSteps, allFields] = await Promise.all([
      base44.entities.Survey.filter({ id }),
      base44.entities.SurveyStep.filter({ survey_id: id }, "step_order", 100),
      base44.entities.SurveyField.filter({ survey_id: id }, "field_key", 100),
    ]);
    setSurvey(s[0] || null);
    setSteps(allSteps);
    setFields(allFields);
    setLoading(false);
  };

  const saveSurvey = async (updates) => {
    setSaving(true);
    await base44.entities.Survey.update(id, updates);
    setSurvey(prev => ({ ...prev, ...updates }));
    setSaveMsg("Saved");
    setTimeout(() => setSaveMsg(null), 2000);
    setSaving(false);
  };

  const saveStep = async (stepId, updates) => {
    const step = steps.find(s => s.id === stepId);
    await base44.entities.SurveyStep.update(stepId, updates);
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, ...updates } : s));
  };

  const deleteStep = async (stepId) => {
    await base44.entities.SurveyStep.delete(stepId);
    setSteps(prev => prev.filter(s => s.id !== stepId));
    // Update step_order in survey
    const newOrder = (survey.step_order || []).filter(sid => {
      const step = steps.find(s => s.id === stepId);
      return !step || sid !== step.step_id;
    });
    await saveSurvey({ step_order: newOrder });
  };

  const publish = async () => {
    await saveSurvey({ status: "published", published_at: new Date().toISOString() });
  };

  if (loading) return (
    <AdminLayout title="Survey Editor" breadcrumbs={[{ label: "Survey Builder", href: "/admin/SurveyBuilder" }, { label: "Loading..." }]}>
      <div className="p-10 text-center text-slate-400">Loading survey...</div>
    </AdminLayout>
  );

  if (!survey) return (
    <AdminLayout title="Survey Editor" breadcrumbs={[{ label: "Survey Builder", href: "/admin/SurveyBuilder" }, { label: "Not Found" }]}>
      <div className="p-10 text-center text-red-400">Survey not found.</div>
    </AdminLayout>
  );

  const orderedSteps = survey.step_order?.length
    ? survey.step_order.map(sid => steps.find(s => s.step_id === sid)).filter(Boolean)
    : [...steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <AdminLayout
      title={survey.name}
      breadcrumbs={[{ label: "Survey Builder", href: "/admin/SurveyBuilder" }, { label: survey.name }]}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/admin/SurveyBuilder" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <input
              className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-white/30 focus:border-white/50 outline-none px-1"
              value={survey.name}
              onChange={e => setSurvey(prev => ({ ...prev, name: e.target.value }))}
              onBlur={() => saveSurvey({ name: survey.name })}
            />
            <div className="text-xs text-slate-400 px-1 mt-0.5">
              /s/{survey.slug} &nbsp;·&nbsp;
              <span className={survey.status === "published" ? "text-green-400" : "text-slate-400"}>{survey.status}</span>
              &nbsp;·&nbsp; v{survey.version}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveMsg && <span className="text-green-400 text-sm">{saveMsg}</span>}
          {survey.status === "published" && (
            <a href={`/s/${survey.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg px-3 py-2">
              <Globe className="w-4 h-4" /> Preview
            </a>
          )}
          {survey.status !== "published" && (
            <button onClick={publish} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-sm">
              Publish
            </button>
          )}
          {survey.status === "published" && (
            <button onClick={() => saveSurvey({ status: "draft" })} className="text-sm border border-white/10 text-slate-400 hover:text-white rounded-lg px-3 py-2">
              Unpublish
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${tab === t ? "bg-[#0f1e35] text-white border-b-2 border-[#1e90ff]" : "text-slate-400 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Steps Tab */}
      {tab === "Steps" && (
        <div className="space-y-2">
          {orderedSteps.length === 0 && (
            <div className="text-center text-slate-400 py-12">No steps yet. Use the Seeder or add steps manually.</div>
          )}
          {orderedSteps.map((step, idx) => (
            <div key={step.id} className="bg-[#0f1e35] border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-mono text-slate-500 w-6">{idx + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-400`}>{step.step_type}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{step.title_display || step.step_id}</div>
                  <div className="text-slate-400 text-xs truncate">{step.step_id} {step.save_to_field ? `→ ${step.save_to_field}` : ""}</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">→ {step.else_target_step_id || "end"}</span>
                  <button onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)} className="p-1.5 text-slate-400 hover:text-white ml-2">
                    {expandedStep === step.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { if (confirm(`Delete step "${step.step_id}"?`)) deleteStep(step.id); }} className="p-1.5 text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {expandedStep === step.id && (
                <div className="border-t border-white/10 px-4 py-4 space-y-3 bg-[#0a1628]">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Label" value={step.label || ""} onChange={v => saveStep(step.id, { label: v })} />
                    <Field label="Helper Text" value={step.helper_text || ""} onChange={v => saveStep(step.id, { helper_text: v })} />
                    <Field label="Save To Field" value={step.save_to_field || ""} onChange={v => saveStep(step.id, { save_to_field: v })} />
                    <Field label="Else Target Step" value={step.else_target_step_id || ""} onChange={v => saveStep(step.id, { else_target_step_id: v })} />
                  </div>

                  {/* Branching Rules */}
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-2">Branching Rules ({(step.branching_rules || []).length})</div>
                    {(step.branching_rules || []).map((rule, ri) => (
                      <div key={ri} className="flex gap-2 mb-1 items-center text-xs">
                        <input className="flex-1 bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-slate-300 font-mono" value={rule.condition || ""} placeholder="condition"
                          onChange={e => {
                            const rules = [...(step.branching_rules || [])];
                            rules[ri] = { ...rules[ri], condition: e.target.value };
                            saveStep(step.id, { branching_rules: rules });
                          }} />
                        <span className="text-slate-500">→</span>
                        <input className="w-40 bg-[#0f1e35] border border-white/10 rounded px-2 py-1 text-slate-300 font-mono" value={rule.target_step_id || ""} placeholder="target_step_id"
                          onChange={e => {
                            const rules = [...(step.branching_rules || [])];
                            rules[ri] = { ...rules[ri], target_step_id: e.target.value };
                            saveStep(step.id, { branching_rules: rules });
                          }} />
                        <button onClick={() => {
                          const rules = step.branching_rules.filter((_, i) => i !== ri);
                          saveStep(step.id, { branching_rules: rules });
                        }} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => saveStep(step.id, { branching_rules: [...(step.branching_rules || []), { condition: "", target_step_id: "", set_fields: [], label: "" }] })}
                      className="text-xs text-[#1e90ff] hover:text-blue-400 flex items-center gap-1 mt-1">
                      <Plus className="w-3 h-3" /> Add Rule
                    </button>
                  </div>

                  {/* onSubmit script */}
                  {step.onSubmit_script !== undefined && (
                    <div>
                      <div className="text-xs font-semibold text-slate-300 mb-1">onSubmit Script</div>
                      <textarea className="w-full bg-[#0f1e35] border border-white/10 rounded px-3 py-2 text-xs font-mono text-green-300 h-24 resize-none"
                        value={step.onSubmit_script || ""} onChange={e => saveStep(step.id, { onSubmit_script: e.target.value })} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fields Tab */}
      {tab === "Fields" && (
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0a1628] border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-slate-300">Key</th>
                <th className="px-4 py-3 text-left text-slate-300">Label</th>
                <th className="px-4 py-3 text-left text-slate-300">Type</th>
                <th className="px-4 py-3 text-left text-slate-300">Category</th>
                <th className="px-4 py-3 text-left text-slate-300">PII</th>
              </tr>
            </thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-2 font-mono text-xs text-blue-300">{f.field_key}</td>
                  <td className="px-4 py-2 text-white">{f.display_label}</td>
                  <td className="px-4 py-2 text-slate-400 text-xs">{f.field_type}</td>
                  <td className="px-4 py-2 text-slate-400 text-xs">{f.category}</td>
                  <td className="px-4 py-2 text-xs">{f.is_pii ? <span className="text-yellow-400">PII</span> : <span className="text-slate-600">—</span>}</td>
                </tr>
              ))}
              {fields.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No fields. Run the seeder first.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings Tab */}
      {tab === "Settings" && survey.settings && (
        <div className="max-w-lg space-y-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-bold">Survey Settings</h3>
            <Field label="Display Phone" value={survey.settings.display_phone || ""} onChange={v => saveSurvey({ settings: { ...survey.settings, display_phone: v } })} />
            <div>
              <label className="block text-xs text-slate-400 mb-1">TCPA Text</label>
              <textarea className="w-full bg-[#0a1628] border border-white/10 rounded px-3 py-2 text-sm text-white h-24 resize-none"
                value={survey.settings.tcpa_text || ""} onChange={e => setSurvey(p => ({ ...p, settings: { ...p.settings, tcpa_text: e.target.value } }))}
                onBlur={() => saveSurvey({ settings: survey.settings })} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={survey.settings.progress_bar ?? true} onChange={e => saveSurvey({ settings: { ...survey.settings, progress_bar: e.target.checked } })} className="accent-blue-500" id="pb" />
              <label htmlFor="pb" className="text-sm text-slate-300">Show progress bar</label>
            </div>
          </div>
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-bold">DQ Config</h3>
            <Field label="Qualified Redirect URL" value={survey.dq_config?.qualified_redirect_url || "/Submitted"} onChange={v => saveSurvey({ dq_config: { ...survey.dq_config, qualified_redirect_url: v } })} />
            <Field label="DQ Redirect URL" value={survey.dq_config?.dq_redirect_url || "/Thanks"} onChange={v => saveSurvey({ dq_config: { ...survey.dq_config, dq_redirect_url: v } })} />
          </div>
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-bold">Integration Endpoints</h3>
            <Field label="HLR Endpoint URL" value={survey.integrations_config?.hlr_endpoint || ""} onChange={v => saveSurvey({ integrations_config: { ...survey.integrations_config, hlr_endpoint: v } })} />
            <Field label="WC Quiz Redirect URL" value={survey.integrations_config?.wc_quiz_redirect || ""} onChange={v => saveSurvey({ integrations_config: { ...survey.integrations_config, wc_quiz_redirect: v } })} />
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {tab === "Integrations" && (
        <div className="space-y-3">
          {(survey.integrations_config?.webhooks || []).map((wh, i) => (
            <div key={i} className="bg-[#0f1e35] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={wh.active} className="accent-blue-500"
                    onChange={e => {
                      const webhooks = [...survey.integrations_config.webhooks];
                      webhooks[i] = { ...webhooks[i], active: e.target.checked };
                      saveSurvey({ integrations_config: { ...survey.integrations_config, webhooks } });
                    }} />
                  <span className="text-white font-semibold text-sm">{wh.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${wh.fire_on === "qualified_only" ? "bg-green-500/20 text-green-400" : wh.fire_on === "dq_only" ? "bg-red-500/20 text-red-400" : "bg-slate-500/20 text-slate-400"}`}>{wh.fire_on}</span>
                </div>
                <span className={`text-xs ${wh.active ? "text-green-400" : "text-slate-500"}`}>{wh.active ? "Active" : "Inactive"}</span>
              </div>
              <Field label="Endpoint URL" value={wh.url || ""}
                onChange={v => {
                  const webhooks = [...survey.integrations_config.webhooks];
                  webhooks[i] = { ...webhooks[i], url: v };
                  saveSurvey({ integrations_config: { ...survey.integrations_config, webhooks } });
                }} />
            </div>
          ))}
          {(!survey.integrations_config?.webhooks || survey.integrations_config.webhooks.length === 0) && (
            <div className="text-center text-slate-400 py-8">No webhooks configured. Use the Seeder to create the default webhook set.</div>
          )}
        </div>
      )}

      {/* Validate Tab */}
      {tab === "Validate" && (
        <ValidationPanel survey={survey} steps={steps} fields={fields} />
      )}
    </AdminLayout>
  );
}

function Field({ label, value, onChange }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        className="w-full bg-[#0a1628] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#1e90ff] outline-none"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => { if (local !== value) onChange(local); }}
      />
    </div>
  );
}

function ValidationPanel({ survey, steps, fields }) {
  const fieldKeys = new Set(fields.map(f => f.field_key));
  const stepIds = new Set(steps.map(s => s.step_id));
  const issues = [];

  steps.forEach(step => {
    if (step.else_target_step_id && !stepIds.has(step.else_target_step_id)) {
      issues.push({ type: "error", msg: `Step "${step.step_id}": else_target_step_id "${step.else_target_step_id}" not found` });
    }
    (step.branching_rules || []).forEach(rule => {
      if (rule.target_step_id && !stepIds.has(rule.target_step_id)) {
        issues.push({ type: "error", msg: `Step "${step.step_id}": branching rule target "${rule.target_step_id}" not found` });
      }
    });
    if (step.save_to_field && !fieldKeys.has(step.save_to_field)) {
      issues.push({ type: "warn", msg: `Step "${step.step_id}": save_to_field "${step.save_to_field}" not in field list` });
    }
  });

  if (!survey.start_step_id) issues.push({ type: "warn", msg: "Survey has no start_step_id set" });
  if (!survey.step_order || survey.step_order.length === 0) issues.push({ type: "warn", msg: "Survey step_order is empty" });

  return (
    <div className="max-w-2xl">
      <div className={`rounded-xl border p-5 mb-4 ${issues.length === 0 ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
        <div className={`font-bold mb-1 ${issues.length === 0 ? "text-green-400" : "text-yellow-400"}`}>
          {issues.length === 0 ? "✓ No issues found" : `${issues.length} issue(s) found`}
        </div>
        <div className="text-slate-400 text-sm">{steps.length} steps · {fields.length} fields</div>
      </div>
      {issues.map((iss, i) => (
        <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 mb-2 text-sm ${iss.type === "error" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {iss.msg}
        </div>
      ))}
    </div>
  );
}
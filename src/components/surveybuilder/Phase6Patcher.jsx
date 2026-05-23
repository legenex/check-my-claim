import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Wrench, CheckCircle, AlertTriangle } from "lucide-react";

const SURVEY_ID = "6a10ce8ab6eff7dcbb50b372";

const PHASE6_STEP_ORDER = [
  "s_accident_type","s_accident_type_2","s_state","s_date","s_lookup","s_verify",
  "s_accident_details","s_injury_check","s_injury_type","s_treatment_check",
  "s_treatment_time","s_fault","s_attorney","s_insurance","s_first_name",
  "s_last_name","s_phone","s_email","s_phone_verify","s_webhooks",
  "s_results_qualified","s_legal_funding","s_dq_tell_me_more","s_dq_results"
];

const DATE_SUBMIT_SCRIPT = `const incidentDate = new Date(ctx.fields.get('incident_date'));
const today = new Date();
const diffDays = Math.floor((today - incidentDate) / 86400000);
let band;
if (diffDays <= 7) band = 'Within 7 Days';
else if (diffDays <= 14) band = 'Within 14 Days';
else if (diffDays <= 30) band = 'Within 30 Days';
else if (diffDays <= 90) band = 'Within 3 Months';
else if (diffDays <= 180) band = 'Within 6 Months';
else if (diffDays <= 365) band = 'Within 12 Months';
else if (diffDays <= 547) band = 'Within 18 Months';
else if (diffDays <= 730) band = 'Within 24 Months';
else band = 'More Than 2 Years';
ctx.fields.set('accident_date', band);
ctx.fields.set('incident_band', band.toLowerCase().replace(/ /g, '_'));
if (['Within 18 Months', 'Within 24 Months'].includes(band)) {
  ctx.fields.set('dq_lead', 'Yes');
  const existingTags = ctx.fields.get('dq_tags') || '';
  ctx.fields.set('dq_tags', existingTags ? existingTags + ',accident_aging' : 'accident_aging');
}
if (band === 'More Than 2 Years') {
  ctx.fields.set('dq_lead', 'Yes');
  ctx.fields.set('dq_reason', 'accident_too_old');
  ctx.tier = 'dq';
  ctx.goto('s_dq_tell_me_more');
}`;

const PHONE_VERIFY_SCRIPT = `const valid = ctx.fields.get('phone_verified');
if (valid === false || valid === 'false') {
  ctx.fields.set('dq_lead', 'Yes');
  const tags = ctx.fields.get('dq_tags') || '';
  ctx.fields.set('dq_tags', tags ? tags + ',invalid_phone' : 'invalid_phone');
}
ctx.goto('s_webhooks');`;

const WEBHOOKS_ENTER_SCRIPT = `const isDQ = ctx.fields.get('dq_lead') === 'Yes';
const webhooks = ctx.integrations_config.webhooks || [];
for (const webhook of webhooks) {
  if (!webhook.active) continue;
  if (webhook.fire_on === 'dq_only' && !isDQ) continue;
  if (webhook.fire_on === 'qualified_only' && isDQ) continue;
  fetch(webhook.url, {
    method: webhook.method || 'POST',
    headers: webhook.headers || { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctx.interpolateTemplate(webhook.payload_template))
  }).catch(err => console.error('Webhook failed:', webhook.name, err));
}
if (isDQ) {
  ctx.goto('s_dq_tell_me_more');
} else {
  ctx.goto('s_results_qualified');
}`;

// Steps to CREATE if missing
const MISSING_STEP_DEFS = {
  s_accident_type_2: {
    step_id: "s_accident_type_2", step_order: 2, step_type: "single_select", tier: "shared",
    title_display: "What Type Of Incident Were You Involved In?",
    label: "What Type Of Incident Were You Involved In?",
    helper_text: "Select the type of vehicle accident you were involved in.",
    save_to_field: "accident_type_2", required: true, auto_advance: true, display_mode: "cards",
    custom_options: [
      { value: "auto", label: "Auto Accident", icon: "Car" },
      { value: "truck", label: "Truck or Semi Accident", icon: "Truck" },
      { value: "workplace", label: "Work Place Accident", icon: "HardHat" },
      { value: "discrimination", label: "Employment Discrimination Incident", icon: "AlertCircle" },
      { value: "pedestrian_rideshare", label: "Pedestrian / Rideshare Accident", icon: "Users" },
      { value: "no_injury", label: "I Wasn't Injured", icon: "X" },
    ],
    branching_rules: [
      { condition: "accident_type_2 == 'workplace'", redirect_url: "{integrations_config.wc_quiz_redirect}", label: "WC redirect" },
      { condition: "accident_type_2 == 'discrimination'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "employment_discrimination" }], target_step_id: "s_state" },
      { condition: "accident_type_2 == 'no_injury'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_injury" }], target_step_id: "s_state" },
    ],
    else_target_step_id: "s_state", variants: {},
  },
  s_accident_details: {
    step_id: "s_accident_details", step_order: 7, step_type: "text_input", tier: "shared",
    title_display: "Please Briefly Describe Your Accident & Injuries",
    label: "Please Briefly Describe Your Accident & Injuries",
    helper_text: "Provide a brief overview of the accident and the injuries you suffered to help us analyze your case and match you with the best suited attorney.",
    save_to_field: "accident_details", required: true, multiline: true,
    placeholder: "I was rear-ended at a stoplight on Main St. I have neck pain and back stiffness that started the next day...",
    validation: { minLength: 15, maxLength: 1000 },
    branching_rules: [], else_target_step_id: "s_injury_check", variants: {},
  },
  s_injury_check: {
    step_id: "s_injury_check", step_order: 8, step_type: "yes_no", tier: "shared",
    title_display: "Were You Injured In The Accident?",
    label: "Were You Injured In The Accident?",
    save_to_field: "has_injury", required: true, auto_advance: true,
    custom_options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }],
    branching_rules: [
      { condition: "has_injury == 'false'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_injury" }], target_step_id: "s_treatment_check" },
    ],
    variants: { t1: { skip_for_tier: true }, t2: { skip_for_tier: true }, t3: {}, t4: {} },
    else_target_step_id: "s_treatment_check",
  },
  s_injury_type: {
    step_id: "s_injury_type", step_order: 9, step_type: "single_select", tier: "shared",
    title_display: "What Injuries Did You Suffer In The Accident?",
    label: "What Injuries Did You Suffer In The Accident?",
    helper_text: "Select the option that best describes the injuries you sustained.",
    save_to_field: "injury_type", required: true, display_mode: "dropdown",
    custom_options: [
      { value: "fatality", label: "Fatality / Wrongful Death" },
      { value: "spinal", label: "Spinal Cord Injury / Paralysis" },
      { value: "brain", label: "Brain Injury / Memory Loss" },
      { value: "amputation", label: "Loss of Limb / Amputations" },
      { value: "fractures", label: "Fractures / Broken Bones" },
      { value: "back_neck_shoulder", label: "Back / Neck / Shoulder Injury" },
      { value: "cuts_bruises", label: "Cuts / Bruises / Lacerations / Burns" },
      { value: "whiplash", label: "Whiplash" },
      { value: "headaches", label: "Headaches / Concussion" },
      { value: "other", label: "Other" },
      { value: "none", label: "No Injury" },
    ],
    branching_rules: [
      { condition: "injury_type == 'none'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_injury" }], target_step_id: "s_treatment_check" },
    ],
    variants: { t1: {}, t2: {}, t3: { skip_for_tier: true }, t4: { skip_for_tier: true } },
    else_target_step_id: "s_treatment_check",
  },
  s_treatment_check: {
    step_id: "s_treatment_check", step_order: 10, step_type: "single_select", tier: "shared",
    title_display: "What Type Of Medical Treatment Did You Receive?",
    label: "What Type Of Medical Treatment Did You Receive?",
    helper_text: "Includes surgery, hospitalization, first aid, specialists, physicians, physical therapists, chiropractors, occupational therapists, etc.",
    save_to_field: "treatment_type", required: true, auto_advance: true, display_mode: "buttons",
    custom_options: [
      { value: "surgery", label: "I Had Surgery" },
      { value: "hospitalized", label: "I Was Hospitalized" },
      { value: "doctor", label: "I Was Treated By A Doctor" },
      { value: "none", label: "I Was Not Medically Treated" },
    ],
    branching_rules: [
      { condition: "treatment_type == 'none'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_treatment" }], target_step_id: "s_fault" },
    ],
    variants: {
      t1: {}, t2: {},
      t3: { label: "Did You Receive Medical Treatment?", custom_options: [{ value: "yes", label: "Yes, I Was Treated" }, { value: "no", label: "No, I Was Not Treated" }] },
      t4: { label: "Did You Receive Medical Treatment?", custom_options: [{ value: "yes", label: "Yes, I Was Treated" }, { value: "no", label: "No, I Was Not Treated" }] },
    },
    else_target_step_id: "s_treatment_time",
  },
  s_treatment_time: {
    step_id: "s_treatment_time", step_order: 11, step_type: "single_select", tier: "shared",
    title_display: "When Were You Treated For Your Injuries?",
    label: "When Were You Treated For Your Injuries?",
    helper_text: "Please indicate the timeframe in which you had treatment.",
    save_to_field: "treatment_timing", required: true, auto_advance: true, display_mode: "dropdown",
    custom_options: [
      { value: "ongoing", label: "I Am Still Having Treatment" },
      { value: "within_7d", label: "Within 7 Days After The Accident" },
      { value: "within_14d", label: "Within 14 Days After The Accident" },
      { value: "within_30d", label: "Within 30 Days After The Accident" },
      { value: "within_60d", label: "Within 60 Days After The Accident" },
      { value: "over_60d", label: "More Than 60 Days After The Accident" },
      { value: "never", label: "Never" },
    ],
    branching_rules: [
      { condition: "treatment_timing == 'never'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_treatment" }], target_step_id: "s_fault" },
    ],
    variants: { t1: {}, t2: {}, t3: { skip_for_tier: true }, t4: { skip_for_tier: true } },
    else_target_step_id: "s_fault",
  },
  s_insurance: {
    step_id: "s_insurance", step_order: 14, step_type: "single_select", tier: "shared",
    title_display: "Does Anyone Involved Have Vehicle Insurance?",
    label: "Does Anyone Involved Have Vehicle Insurance?",
    helper_text: "Select the option that best describes the insurance status of everyone involved.",
    save_to_field: "insurance_status", required: true, auto_advance: true, display_mode: "buttons",
    custom_options: [
      { value: "both_have", label: "Yes, Both Parties Have Insurance" },
      { value: "other_at_fault_has", label: "The Driver At Fault Has Insurance" },
      { value: "i_have", label: "I Have Insurance" },
      { value: "neither_has", label: "No One Has Insurance" },
    ],
    branching_rules: [
      { condition: "insurance_status == 'neither_has'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_insurance" }], target_step_id: "s_first_name" },
    ],
    variants: { t1: {}, t2: { skip_for_tier: true }, t3: { skip_for_tier: true }, t4: { skip_for_tier: true } },
    else_target_step_id: "s_first_name",
  },
  s_last_name: {
    step_id: "s_last_name", step_order: 16, step_type: "text_input", tier: "shared",
    title_display: "What's Your Last Name?",
    label: "What's your last name?",
    save_to_field: "last_name", required: true,
    branching_rules: [], else_target_step_id: "s_phone", variants: {},
  },
  s_phone_verify: {
    step_id: "s_phone_verify", step_order: 19, step_type: "lookup", tier: "shared",
    title_display: "Verifying your number...",
    label: "Verifying your number...",
    helper_text: "One moment.",
    config: {
      method: "POST", url: "{integrations_config.hlr_endpoint}",
      headers: [{ name: "Content-Type", value: "application/json" }],
      body_template: '{"mobile": "{fields.phone}", "first_name": "{fields.first_name}", "last_name": "{fields.last_name}"}',
      field_mappings: [
        { property: "valid", field: "phone_verified" },
        { property: "carrier", field: "phone_carrier" },
        { property: "line_type", field: "phone_line_type" },
      ],
    },
    onSubmit_script: PHONE_VERIFY_SCRIPT,
    branching_rules: [], else_target_step_id: "s_webhooks", variants: {},
  },
  s_webhooks: {
    step_id: "s_webhooks", step_order: 20, step_type: "script", tier: "shared",
    title_display: "Submitting...", label: "Submitting...", hide_title: true,
    onEnter_script: WEBHOOKS_ENTER_SCRIPT,
    branching_rules: [], else_target_step_id: "s_results_qualified", variants: {},
  },
  s_legal_funding: {
    step_id: "s_legal_funding", step_order: 22, step_type: "results", tier: "shared",
    title_display: "We may still be able to help",
    label: "We may still be able to help",
    content_html: `<div style="text-align:center;padding:20px 0;"><p style="font-size:16px;margin-bottom:12px;">Since you already have an attorney, we cannot connect you with a new one. But pre-settlement legal funding may be available while your case is pending.</p><p style="font-size:14px;opacity:0.85;">No payments until you settle. No credit check.</p></div>`,
    branching_rules: [], else_target_step_id: "s_dq_results", variants: {},
  },
};

// Updates to apply to existing steps
const STEP_UPDATES = {
  s_accident_type: {
    branching_rules: [
      { condition: "accident_type == 'work_other_none'", target_step_id: "s_accident_type_2", set_fields: [], label: "Work/Other route" },
    ],
    else_target_step_id: "s_state",
  },
  s_date: {
    config: { picker_mode: "ymd_cascading" },
    onSubmit_script: DATE_SUBMIT_SCRIPT,
    else_target_step_id: "s_lookup",
  },
  s_fault: {
    custom_options: [
      { value: "not_at_fault", label: "No, Someone Else Caused The Accident" },
      { value: "at_fault", label: "Yes, I Caused The Accident" },
      { value: "hit_run_single", label: "It Was A Hit & Run / Single-Person / Animal Accident" },
      { value: "both_unsure", label: "We Were Both At Fault / Not Sure" },
    ],
    branching_rules: [
      { condition: "fault == 'at_fault'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "self_fault" }], target_step_id: "s_attorney" },
      { condition: "fault == 'hit_run_single'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "hit_run_or_single" }], target_step_id: "s_attorney" },
      { condition: "fault == 'both_unsure'", set_tier: "t3", target_step_id: "s_attorney" },
    ],
    variants: {
      t3: { label: "Was The Accident Your Fault?", custom_options: [{ value: "not_at_fault", label: "No, I Was Not At Fault" }, { value: "at_fault", label: "Yes, I Caused The Accident" }, { value: "not_sure_both", label: "Not Sure / Both At Fault" }], branching_rules: [{ condition: "fault == 'at_fault'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "self_fault" }], target_step_id: "s_attorney" }] },
      t4: { skip_for_tier: true },
    },
    else_target_step_id: "s_attorney",
  },
  s_attorney: {
    branching_rules: [
      { condition: "attorney_status == 'currently_represented'", target_step_id: "s_legal_funding", set_tier: "dq", label: "Hard route to legal funding flow" },
      { condition: "attorney_status == 'rejected_or_settled'", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "rejected_settled" }], target_step_id: "s_insurance" },
    ],
    variants: {
      t1: { label: "Have You Ever Worked With An Attorney For This Accident Claim?", custom_options: [{ value: "never", label: "No, I Have Never Worked With An Attorney" }, { value: "worked_with", label: "Yes, I Have Worked With An Attorney" }, { value: "rejected_or_settled", label: "My Claim Was Rejected / Settled" }], else_target_step_id: "s_insurance" },
      t2: { label: "Are You Currently Working With An Attorney For This Accident Claim?", custom_options: [{ value: "no_attorney", label: "No, I Don't Have An Attorney" }, { value: "currently_represented", label: "Yes, I Am Working With An Attorney" }, { value: "rejected_or_settled", label: "My Claim Was Rejected / Settled" }, { value: "want_to_switch", label: "Yes, But I Am Looking To Change Attorneys" }], else_target_step_id: "s_first_name" },
      t3: { label: "Are You Currently Working With An Attorney For This Accident Claim?", custom_options: [{ value: "no_attorney", label: "No, I Don't Have An Attorney" }, { value: "currently_represented", label: "Yes, I Am Working With An Attorney" }, { value: "want_to_switch", label: "Yes, But I Am Looking To Change Attorneys" }], else_target_step_id: "s_first_name" },
      t4: { label: "Are You Currently Working With An Attorney For This Accident?", custom_options: [{ value: "no_attorney", label: "No, I Don't Have An Attorney" }, { value: "currently_represented", label: "Yes, I Am Working With An Attorney" }, { value: "rejected_or_settled", label: "My Claim Was Rejected / Settled" }], else_target_step_id: "s_first_name" },
    },
    else_target_step_id: "s_insurance",
  },
  s_results_qualified: {
    title_display: "GREAT NEWS!! You Qualify For A Maximum Compensation Payout!",
    label: "GREAT NEWS!! You Qualify For A Maximum Compensation Payout!",
    content_html: `<div style="text-align:center;"><h1 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:36px;color:#3ab54b;margin-bottom:16px;">GREAT NEWS!! You Qualify For A Maximum Compensation Payout!</h1><p style="font-size:16px;color:#ffffff;margin-bottom:24px;">Provide your details below to get your FREE case evaluation from an experienced attorney in <strong>{fields.state_name}</strong> that specializes in cases like yours and find out how much your claim could be worth.</p></div>`,
  },
  s_dq_tell_me_more: {
    title_display: "Tell Us More...",
    label: "Tell Us More...",
    content_html: `<div style="text-align:center;"><h1 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:32px;color:#ffffff;margin-bottom:16px;">Tell Us More...</h1><p style="font-size:16px;color:#ffffff;margin-bottom:24px;">Complete the form below so we can contact you to get started!</p><p style="font-size:14px;color:#ffffff;opacity:0.85;margin-bottom:16px;">Don't wanna wait? Call now, and fast track your claim..</p></div>`,
  },
};

const WEBHOOKS_CONFIG = {
  hlr_endpoint: "",
  wc_quiz_redirect: "",
  webhooks: [
    { name: "DQ Lead to BigQuery", url: "", method: "POST", fire_on: "dq_only", active: false, headers: [], payload_template: {} },
    { name: "Qualified Lead to LeadByte", url: "", method: "POST", fire_on: "qualified_only", active: false, headers: [], payload_template: {} },
    { name: "LeadByte Quarantine", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
    { name: "Release Quarantine", url: "", method: "POST", fire_on: "qualified_only", active: false, headers: [], payload_template: {} },
    { name: "Meta CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
    { name: "TikTok CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
    { name: "Snapchat CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
  ],
};

export default function Phase6Patcher({ onComplete }) {
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState([]);
  const [error, setError] = useState(null);

  const appendLog = (msg) => setLog(prev => [...prev, msg]);

  const patch = async () => {
    setStatus("running");
    setLog([]);
    setError(null);

    let previousStepOrder = null;
    let previousStartStepId = null;

    try {
      // Get current survey state for rollback
      appendLog("Fetching survey record...");
      const surveys = await base44.entities.Survey.filter({ id: SURVEY_ID });
      const survey = surveys[0];
      if (!survey) throw new Error("Survey not found: " + SURVEY_ID);
      previousStepOrder = survey.step_order;
      previousStartStepId = survey.start_step_id;
      appendLog(`Found survey: ${survey.name} (${survey.slug})`);

      // Get existing steps
      appendLog("Fetching existing steps...");
      const existingSteps = await base44.entities.SurveyStep.filter({ survey_id: SURVEY_ID }, "step_order", 100);
      const existingByStepId = {};
      existingSteps.forEach(s => { existingByStepId[s.step_id] = s; });
      appendLog(`Found ${existingSteps.length} existing steps: ${existingSteps.map(s => s.step_id).join(", ")}`);

      // Create missing steps
      const missingIds = PHASE6_STEP_ORDER.filter(sid => !existingByStepId[sid] && MISSING_STEP_DEFS[sid]);
      appendLog(`Missing steps to create: ${missingIds.length > 0 ? missingIds.join(", ") : "none"}`);
      for (const sid of missingIds) {
        const def = { ...MISSING_STEP_DEFS[sid], survey_id: SURVEY_ID };
        await base44.entities.SurveyStep.create(def);
        appendLog(`  Created: ${sid}`);
      }

      // Apply updates to existing steps
      appendLog("Applying updates to existing steps...");
      for (const [stepId, updates] of Object.entries(STEP_UPDATES)) {
        if (existingByStepId[stepId]) {
          await base44.entities.SurveyStep.update(existingByStepId[stepId].id, updates);
          appendLog(`  Updated: ${stepId}`);
        } else {
          appendLog(`  Skipped (not found): ${stepId}`);
        }
      }

      // Update integrations_config
      appendLog("Updating integrations_config with webhook slots...");
      await base44.entities.Survey.update(SURVEY_ID, { integrations_config: WEBHOOKS_CONFIG });

      // Update step_order and start_step_id
      appendLog("Updating Survey step_order to Phase 6...");
      await base44.entities.Survey.update(SURVEY_ID, {
        step_order: PHASE6_STEP_ORDER,
        start_step_id: "s_accident_type",
      });

      appendLog("Phase 6 patch complete!");
      setStatus("done");
      if (onComplete) onComplete();
    } catch (e) {
      setError(e.message);
      setStatus("error");
      appendLog("ERROR: " + e.message);

      // Rollback step_order
      if (previousStepOrder !== null) {
        try {
          appendLog("Rolling back step_order...");
          await base44.entities.Survey.update(SURVEY_ID, {
            step_order: previousStepOrder,
            start_step_id: previousStartStepId,
          });
          appendLog("Rollback complete.");
        } catch (rbErr) {
          appendLog("Rollback failed: " + rbErr.message);
        }
      }
    }
  };

  return (
    <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Wrench className="w-5 h-5 text-orange-400" />
        <h3 className="text-white font-bold">Phase 6 Step Patcher</h3>
        <span className="text-xs text-slate-500">Survey: {SURVEY_ID}</span>
      </div>
      <p className="text-slate-400 text-sm mb-5">
        Patches the CMC MVA Tiered Survey to Phase 6 spec: creates 10 missing steps, updates existing steps, sets 24-step order, and configures 7 webhook slots.
      </p>

      {status === "idle" && (
        <button onClick={patch} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl text-sm">
          Apply Phase 6 Patch
        </button>
      )}

      {(status === "running" || log.length > 0) && (
        <div className="mt-3">
          {status === "running" && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <span className="text-orange-400 text-sm font-semibold">Patching...</span>
            </div>
          )}
          <div className="bg-[#0a1628] rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
            {log.map((l, i) => <div key={i} className={l.startsWith("ERROR") ? "text-red-400" : l.startsWith("  ") ? "text-slate-400" : "text-green-400"}>{l}</div>)}
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center gap-2 text-green-400 font-semibold mt-3">
          <CheckCircle className="w-5 h-5" /> Phase 6 patch applied. Reload the step list to verify.
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 text-red-400 mt-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Patch failed - step_order rolled back</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * seedSurveySteps — wipes and re-seeds all 15 steps for the CMC MVA Tiered Survey.
 * POST body: { survey_id: string }
 * Admin only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STEP_ORDER = [
  "s_accident_type","s_state","s_date","s_lookup","s_verify",
  "s_fault","s_medical","s_treatment","s_attorney",
  "s_first_name","s_phone","s_email",
  "s_results_qualified","s_dq_tell_me_more","s_dq_results"
];

const LOOKUP_CONFIG = {
  url: "https://script.google.com/macros/s/AKfycbzdr-Rd9vM_D6xJTNE4UMleA5VKOmj0SM1xq3lnw4b0VLlAa0lMPVIy9_GgH03dmkQJ-A/exec?accident_state={fields.accident_state}",
  method: "GET",
  headers: [{ name: "Content-Type", value: "application/x-www-form-urlencoded" }],
  field_mappings: [
    { property: "state", field: "state_name" },
    { property: "state_code", field: "state_code" },
    { property: "manual_override", field: "manual_override" },
    { property: "active_state", field: "active_state" },
    { property: "state_leads", field: "state_leads" },
    { property: "7day_cr", field: "cr_7day" },
    { property: "14day_cr", field: "cr_14day" },
    { property: "30day_cr", field: "cr_30day" },
    { property: "3month_cr", field: "cr_3month" },
    { property: "6month_cr", field: "cr_6month" },
    { property: "12month_cr", field: "cr_12month" },
    { property: "18month_cr", field: "cr_18month" },
    { property: "24month_cr", field: "cr_24month" },
    { property: "7day_tier", field: "tier_7day" },
    { property: "14day_tier", field: "tier_14day" },
    { property: "30day_tier", field: "tier_30day" },
    { property: "3month_tier", field: "tier_3month" },
    { property: "6month_tier", field: "tier_6month" },
    { property: "12month_tier", field: "tier_12month" },
    { property: "18month_tier", field: "tier_18month" },
    { property: "24month_tier", field: "tier_24month" },
    { property: "verify", field: "verify" }
  ],
  tier_selector_map: {
    "7d": "tier_7day", "14d": "tier_14day", "30d": "tier_30day",
    "3m": "tier_3month", "6m": "tier_6month", "12m": "tier_12month",
    "18m": "tier_18month", "24m": "tier_24month"
  }
};

const LOOKUP_SCRIPT = `const band = ctx.fields.get('incident_band');
const active = ctx.fields.get('active_state');
const verify = ctx.fields.get('verify');
const crField = 'cr_' + band;
const cr = parseFloat(ctx.fields.get(crField) || 0);

if (active === 'No') { ctx.tier = 'dq'; ctx.goto('s_dq_tell_me_more'); return; }
if (verify === 'Yes') { ctx.goto('s_verify'); return; }

// Tier 4 fast-track: fresh accident under 30 days OR conversion rate over 20%
const freshBands = ['7d','14d','30d'];
if (freshBands.includes(band) || cr > 20) {
  ctx.tier = 't4';
  ctx.fields.set('final_tier', 4);
  ctx.goto('s_treatment');
  return;
}

// Standard tier from selector map
const tierField = ctx.lookup_config.tier_selector_map[band];
const tierValue = parseInt(ctx.fields.get(tierField) || 4);
ctx.tier = 't' + tierValue;
ctx.fields.set('final_tier', tierValue);
ctx.goto('s_fault');`;

function buildSteps(surveyId) {
  return [
    {
      id: "s_accident_type",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "How Were You Injured?",
      helper_text: "",
      hide_title: false,
      content_html: `<div style="text-align:center;"><p style="font-size:16px;font-weight:400;color:#ffffff;margin-bottom:8px;">Take the 30 Second Quiz to Start the Process of Seeing How Much Your Claim Could Be Worth</p><h1 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:42px;line-height:1.1;color:#ffffff;margin:16px 0 24px 0;">Get The Maximum Cash Payout For Your Accident Injury!!</h1><h2 style="font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:32px;color:#ffffff;margin-bottom:4px;">How Were You Injured?</h2><p style="font-size:14px;font-weight:400;color:#ffffff;opacity:0.85;">Select The Type Of Accident You Were Involved In:</p></div>`,
      save_to_field: "accident_type",
      inherit_options_from_field: true,
      display_mode: "cards",
      required: true,
      auto_advance: true,
      else_target_step_id: "s_state",
      branching_mode: "none",
      branching_rules: [],
    },
    {
      id: "s_state",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "Which state was the accident in?",
      helper_text: "We route you to attorneys licensed in your state.",
      save_to_field: "accident_state",
      inherit_options_from_field: true,
      display_mode: "searchable",
      required: true,
      auto_advance: true,
      else_target_step_id: "s_date",
      branching_mode: "none",
      branching_rules: [],
    },
    {
      id: "s_date",
      survey_id: surveyId,
      tier: "shared",
      type: "smart_date",
      title: "When did the accident happen?",
      helper_text: "Use the date picker.",
      save_to_field: "incident_date",
      required: true,
      else_target_step_id: "s_lookup",
      branching_mode: "none",
      branching_rules: [],
      config: {
        bands: [
          { band: "7d", label: "Within 7 days", min_days: 0, max_days: 7 },
          { band: "14d", label: "8 to 14 days", min_days: 8, max_days: 14 },
          { band: "30d", label: "15 to 30 days", min_days: 15, max_days: 30 },
          { band: "3m", label: "1 to 3 months", min_days: 31, max_days: 90 },
          { band: "6m", label: "3 to 6 months", min_days: 91, max_days: 180 },
          { band: "12m", label: "6 to 12 months", min_days: 181, max_days: 365 },
          { band: "18m", label: "12 to 18 months", min_days: 366, max_days: 547 },
          { band: "24m", label: "18 to 24 months", min_days: 548, max_days: 730 },
          { band: "expired", label: "Over 24 months", min_days: 731, max_days: 99999 }
        ],
        band_field: "incident_band"
      }
    },
    {
      id: "s_lookup",
      survey_id: surveyId,
      tier: "shared",
      type: "lookup",
      title: "Checking your case...",
      helper_text: "One moment.",
      lookup_config: LOOKUP_CONFIG,
      branching_mode: "by_script",
      scripts: { onSubmit: LOOKUP_SCRIPT },
      else_target_step_id: "s_fault",
      branching_rules: [],
    },
    {
      id: "s_verify",
      survey_id: surveyId,
      tier: "shared",
      type: "yes_no",
      title: "Just to confirm",
      helper_text: "We sometimes see duplicate submissions, so a quick verification keeps your case moving.",
      save_to_field: "verify_confirmed",
      required: false,
      branching_mode: "by_answer",
      branching_rules: [
        { condition: "verify_confirmed == \"false\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" }
      ],
      else_target_step_id: "s_fault",
      config: {
        yes_label: "Yes, this is my first time",
        yes_value: "true",
        no_label: "I've submitted before",
        no_value: "false"
      }
    },
    {
      id: "s_fault",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "Who was at fault for the accident?",
      save_to_field: "fault",
      inherit_options_from_field: true,
      display_mode: "buttons",
      required: true,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_medical",
      variants: {
        t1: { title_override: "Who was at fault for the accident?", hidden_options: [] },
        t2: { title_override: "Do you believe another driver may have caused the accident?", hidden_options: ["commercial_driver","drunk_driver","distracted_driver","passenger","unsure","single_vehicle","both"] },
        t3: { title_override: "Were you at fault?", custom_options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }], inherit_options_from_field: false },
        t4: { skip_for_tier: true }
      }
    },
    {
      id: "s_medical",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "What medical treatment have you received?",
      save_to_field: "medical_treatment",
      inherit_options_from_field: true,
      display_mode: "buttons",
      required: false,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_treatment",
      variants: {
        t1: { title_override: "What medical treatment have you received?", hidden_options: [] },
        t2: { title_override: "Did you receive any medical treatment after the accident?", hidden_options: ["ambulance","specialist","surgery_rec"] },
        t3: { title_override: "Did you receive medical treatment?", custom_options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], inherit_options_from_field: false },
        t4: { skip_for_tier: true }
      }
    },
    {
      id: "s_treatment",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "When did you first receive treatment after the accident?",
      save_to_field: "treatment_timing",
      inherit_options_from_field: true,
      display_mode: "buttons",
      required: true,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_attorney",
      variants: {
        t1: { title_override: "When did you first receive treatment after the accident?", hidden_options: [] },
        t2: { title_override: "How soon after the accident did you get treatment or schedule treatment?", hidden_options: ["within_3d"] },
        t3: { title_override: "Have you had treatment since the accident?", custom_options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], inherit_options_from_field: false },
        t4: { title_override: "Have you had treatment since the accident?", custom_options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], inherit_options_from_field: false }
      }
    },
    {
      id: "s_attorney",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "Are you currently working with an attorney for this accident?",
      save_to_field: "attorney_status",
      inherit_options_from_field: true,
      display_mode: "buttons",
      required: true,
      branching_mode: "by_answer",
      branching_rules: [
        { condition: "attorney_status == \"signed\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" }
      ],
      else_target_step_id: "s_first_name",
      variants: {
        t1: { title_override: "Are you currently working with an attorney for this accident?", hidden_options: [] },
        t2: { title_override: "Have you spoken with an attorney about this accident?", hidden_options: [] },
        t3: { title_override: "Do you already have an attorney for this accident?", custom_options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }], inherit_options_from_field: false },
        t4: { title_override: "Do you already have an attorney?", custom_options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }], inherit_options_from_field: false }
      }
    },
    {
      id: "s_first_name",
      survey_id: surveyId,
      tier: "shared",
      type: "text_input",
      title: "What's your first name?",
      save_to_field: "first_name",
      required: true,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_phone",
    },
    {
      id: "s_phone",
      survey_id: surveyId,
      tier: "shared",
      type: "phone_input",
      title: "What's the best number to reach you?",
      save_to_field: "phone",
      required: true,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_email",
    },
    {
      id: "s_email",
      survey_id: surveyId,
      tier: "shared",
      type: "email_input",
      title: "And your email?",
      save_to_field: "email",
      required: true,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_results_qualified",
    },
    {
      id: "s_results_qualified",
      survey_id: surveyId,
      tier: "shared",
      type: "results",
      title: "You qualify",
      content_html: `<p style="font-size:18px;text-align:center;">Thanks {fields.first_name}. An attorney will be in touch shortly.</p>`,
      branching_mode: "none",
      branching_rules: [],
    },
    {
      id: "s_dq_tell_me_more",
      survey_id: surveyId,
      tier: "dq",
      type: "custom_page",
      title: "Tell us more about your case",
      helper_text: "Help us route you correctly.",
      content_html: `<p>Even if you are already represented or your case does not fit our standard criteria, your details help us suggest alternatives.</p>`,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_dq_results",
      config: {
        inline_form_fields: [
          { field: "first_name", type: "text", label: "First Name", required: true },
          { field: "phone", type: "phone", label: "Phone", required: true },
          { field: "email", type: "email", label: "Email", required: true }
        ]
      }
    },
    {
      id: "s_dq_results",
      survey_id: surveyId,
      tier: "dq",
      type: "results",
      title: "Thanks for sharing",
      content_html: `<p>We will follow up with options that may fit your situation.</p>`,
      branching_mode: "none",
      branching_rules: [],
    },
  ];
}

// Fields needed for lookup CR values
const CR_FIELDS = [
  { key: "cr_7day",  label: "CR 7 Day",   type: "number", category: "routing", computed: true },
  { key: "cr_14day", label: "CR 14 Day",  type: "number", category: "routing", computed: true },
  { key: "cr_30day", label: "CR 30 Day",  type: "number", category: "routing", computed: true },
  { key: "cr_3month",label: "CR 3 Month", type: "number", category: "routing", computed: true },
  { key: "cr_6month",label: "CR 6 Month", type: "number", category: "routing", computed: true },
  { key: "cr_12month",label:"CR 12 Month",type: "number", category: "routing", computed: true },
  { key: "cr_18month",label:"CR 18 Month",type: "number", category: "routing", computed: true },
  { key: "cr_24month",label:"CR 24 Month",type: "number", category: "routing", computed: true },
  { key: "verify_confirmed", label: "Verify Confirmed", type: "boolean", category: "qualify", computed: false },
  { key: "incident_band",    label: "Incident Band",    type: "text",    category: "routing", computed: true },
  { key: "final_tier",       label: "Final Tier",       type: "number",  category: "routing", computed: true },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { survey_id } = body;
    if (!survey_id) return Response.json({ error: 'survey_id required' }, { status: 400 });

    // 1. Ensure required SurveyFields exist
    const existingFields = await base44.asServiceRole.entities.SurveyField.list(null, 500);
    const existingKeys = new Set(existingFields.map(f => f.key));
    const fieldsToCreate = CR_FIELDS.filter(f => !existingKeys.has(f.key));
    for (const f of fieldsToCreate) {
      await base44.asServiceRole.entities.SurveyField.create(f);
    }

    // 2. Fetch existing steps for this survey
    const existingSteps = await base44.asServiceRole.entities.SurveyStep.filter({ survey_id });

    // 3. Build all 15 new steps IN MEMORY first
    const newSteps = buildSteps(survey_id);

    // 4. Attempt creation of all steps (rollback on any failure)
    const created = [];
    try {
      for (const step of newSteps) {
        const c = await base44.asServiceRole.entities.SurveyStep.create(step);
        created.push(c);
      }
    } catch (err) {
      // Rollback: delete whatever was created
      for (const c of created) {
        try { await base44.asServiceRole.entities.SurveyStep.delete(c.id); } catch (_) {}
      }
      return Response.json({ error: `Step creation failed: ${err.message}. Rolled back.` }, { status: 500 });
    }

    // 5. All created successfully. Now delete old steps.
    for (const s of existingSteps) {
      try { await base44.asServiceRole.entities.SurveyStep.delete(s.id); } catch (_) {}
    }

    // 6. Update Survey record
    await base44.asServiceRole.entities.Survey.update(survey_id, {
      start_step_id: "s_accident_type",
      step_order: STEP_ORDER,
    });

    return Response.json({
      success: true,
      steps_created: created.length,
      steps_deleted: existingSteps.length,
      step_order: STEP_ORDER,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
/**
 * seedSurveySteps — wipes and re-seeds all 19 steps for the CMC MVA Tiered Survey (Phase 5).
 * POST body: { survey_id: string }
 * Admin only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STEP_ORDER = [
  "s_accident_type",
  "s_state",
  "s_date",
  "s_lookup",
  "s_verify",
  "s_injury_check",
  "s_fault",
  "s_medical",
  "s_treatment",
  "s_attorney",
  "s_insurance",
  "s_accident_description",
  "s_first_name",
  "s_phone",
  "s_email",
  "s_results_qualified",
  "s_legal_funding",
  "s_dq_tell_me_more",
  "s_dq_results"
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

// Phase 5: BQ-primary with age-fallback tier resolution. All tiers go through s_injury_check.
const LOOKUP_SCRIPT = `const band = ctx.fields.get('incident_band');
const active = ctx.fields.get('active_state');
const verify = ctx.fields.get('verify');
const stateLeads = parseInt(ctx.fields.get('state_leads') || 0);
const crField = 'cr_' + band;
const cr = parseFloat(ctx.fields.get(crField) || 0);

if (active === 'No') {
  ctx.tier = 'dq';
  ctx.fields.set('tier_source', 'inactive_state');
  ctx.goto('s_dq_tell_me_more');
  return;
}

if (verify === 'Yes') {
  ctx.goto('s_verify');
  return;
}

const ageTierMap = {
  '7d': 4, '14d': 4, '30d': 4,
  '3m': 3,
  '6m': 2, '12m': 2,
  '18m': 1, '24m': 1,
  'expired': 0
};
const ageTier = ageTierMap[band] || 1;

if (ageTier === 0) {
  ctx.tier = 'dq';
  ctx.fields.set('final_tier', 0);
  ctx.fields.set('tier_source', 'age_expired');
  ctx.goto('s_dq_tell_me_more');
  return;
}

const tierField = ctx.lookup_config.tier_selector_map[band];
const bqTier = parseInt(ctx.fields.get(tierField) || 0);
const BQ_MIN_LEADS = 5;

let finalTier;
let tierSource;

if (stateLeads >= BQ_MIN_LEADS && bqTier > 0 && bqTier <= 4) {
  finalTier = bqTier;
  tierSource = 'bq_lookup';
} else {
  finalTier = ageTier;
  tierSource = 'age_fallback';
}

ctx.fields.set('final_tier', finalTier);
ctx.fields.set('tier_source', tierSource);
ctx.tier = 't' + finalTier;

ctx.goto('s_injury_check');`;

function buildSteps(surveyId) {
  return [
    // 1. Accident type
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
    // 2. State
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
    // 3. Date
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
    // 4. Lookup
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
      else_target_step_id: "s_injury_check",
      branching_rules: [],
    },
    // 5. Verify
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
      else_target_step_id: "s_injury_check",
      config: {
        yes_label: "Yes, this is my first time",
        yes_value: "true",
        no_label: "I've submitted before",
        no_value: "false"
      }
    },
    // 6. Injury check (NEW - shared, position 6)
    {
      id: "s_injury_check",
      survey_id: surveyId,
      tier: "shared",
      type: "yes_no",
      title: "Were you injured in the accident?",
      helper_text: "Even minor pain or soreness counts.",
      save_to_field: "has_injury",
      required: true,
      branching_mode: "by_answer",
      branching_rules: [
        { condition: "has_injury == \"false\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" }
      ],
      // T4 skips fault, goes direct to attorney. T1/T2/T3 go to fault.
      else_target_step_id: "s_fault",
      config: {
        yes_label: "Yes",
        yes_value: "true",
        no_label: "No",
        no_value: "false"
      },
      variants: {
        t4: { branching_override: { else_target_step_id: "s_attorney" } }
      }
    },
    // 7. Fault (Phase 5: per-tier multi-DQ rules via variants)
    {
      id: "s_fault",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "Who was at fault for the accident?",
      save_to_field: "fault",
      inherit_options_from_field: false,
      display_mode: "buttons",
      required: true,
      branching_mode: "by_answer",
      branching_rules: [
        { condition: "fault == \"self_fault\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
        { condition: "fault == \"single_vehicle\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
        { condition: "fault == \"animal_object\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
        { condition: "fault == \"hit_and_run\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
        { condition: "fault == \"both\"", target_step_id: "s_fault", set_tier: "t3" },
        { condition: "fault == \"unsure\"", target_step_id: "s_fault", set_tier: "t3" }
      ],
      else_target_step_id: "s_medical",
      custom_options: [
        { value: "another_driver", label: "Another driver was at fault" },
        { value: "rear_ended", label: "I was rear-ended" },
        { value: "self_fault", label: "I was at fault" },
        { value: "both", label: "We were both at fault" },
        { value: "hit_and_run", label: "Hit and run" },
        { value: "single_vehicle", label: "Single vehicle accident" },
        { value: "animal_object", label: "Animal or object caused the accident" },
        { value: "unsure", label: "I am not sure" }
      ],
      variants: {
        t1: {
          title_override: "Who was at fault for the accident?",
          inherit_options_from_field: false,
          custom_options: [
            { value: "another_driver", label: "Another driver was at fault" },
            { value: "rear_ended", label: "I was rear-ended" },
            { value: "self_fault", label: "I was at fault" },
            { value: "both", label: "We were both at fault" },
            { value: "hit_and_run", label: "Hit and run" },
            { value: "single_vehicle", label: "Single vehicle accident" },
            { value: "animal_object", label: "Animal or object caused the accident" },
            { value: "unsure", label: "I am not sure" }
          ],
          branching_override: {
            branching_rules: [
              { condition: "fault == \"self_fault\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
              { condition: "fault == \"single_vehicle\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
              { condition: "fault == \"animal_object\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
              { condition: "fault == \"hit_and_run\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
              { condition: "fault == \"both\"", target_step_id: "s_fault", set_tier: "t3" },
              { condition: "fault == \"unsure\"", target_step_id: "s_fault", set_tier: "t3" }
            ],
            else_target_step_id: "s_medical"
          }
        },
        t2: {
          title_override: "Who was at fault?",
          inherit_options_from_field: false,
          custom_options: [
            { value: "another_driver", label: "Another driver" },
            { value: "self_fault", label: "I was at fault" },
            { value: "both", label: "Both at fault" },
            { value: "unsure", label: "I am not sure" }
          ],
          branching_override: {
            branching_rules: [
              { condition: "fault == \"self_fault\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" },
              { condition: "fault == \"both\"", target_step_id: "s_fault", set_tier: "t3" },
              { condition: "fault == \"unsure\"", target_step_id: "s_fault", set_tier: "t3" }
            ],
            else_target_step_id: "s_medical"
          }
        },
        t3: {
          title_override: "Were you at fault?",
          inherit_options_from_field: false,
          custom_options: [
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" }
          ],
          branching_override: {
            branching_rules: [
              { condition: "fault == \"yes\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" }
            ],
            else_target_step_id: "s_medical"
          }
        },
        t4: { skip_for_tier: true }
      }
    },
    // 8. Medical treatment
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
      option_field_writes: {
        er: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "ER" }, { field: "treatment_time", value: "Past" }],
        urgent_care: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "UrgentCare" }, { field: "treatment_time", value: "Past" }],
        doctor: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "Doctor" }, { field: "treatment_time", value: "Past" }],
        chiro: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "Chiropractor" }, { field: "treatment_time", value: "Past" }],
        pt: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "PhysicalTherapy" }, { field: "treatment_time", value: "Past" }],
        ongoing: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "Ongoing" }, { field: "treatment_time", value: "Past" }],
        surgery_rec: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "SurgeryRecommended" }, { field: "treatment_time", value: "Past" }],
        mri_xray: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "Imaging" }, { field: "treatment_time", value: "Past" }],
        specialist: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "Specialist" }, { field: "treatment_time", value: "Past" }],
        ambulance: [{ field: "treatment", value: "Yes" }, { field: "treatment_type", value: "Ambulance" }, { field: "treatment_time", value: "Past" }],
        scheduled: [{ field: "treatment", value: "Pending" }, { field: "treatment_type", value: "None" }, { field: "treatment_time", value: "Future" }],
        none: [{ field: "treatment", value: "No" }, { field: "treatment_type", value: "None" }, { field: "treatment_time", value: "None" }]
      },
      variants: {
        t1: { title_override: "What medical treatment have you received?", hidden_options: [] },
        t2: { title_override: "Did you receive any medical treatment after the accident?", hidden_options: ["ambulance","specialist","surgery_rec"] },
        t3: { title_override: "Did you receive medical treatment?", custom_options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], inherit_options_from_field: false },
        t4: { skip_for_tier: true }
      }
    },
    // 9. Treatment timing
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
        t4: { skip_for_tier: true }
      }
    },
    // 10. Attorney (Phase 5 overhaul: 5 options, legal_funding route)
    {
      id: "s_attorney",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "Have you ever worked with an attorney for this accident claim?",
      save_to_field: "attorney_status",
      inherit_options_from_field: false,
      display_mode: "buttons",
      required: true,
      branching_mode: "by_answer",
      branching_rules: [
        { condition: "attorney_status == \"currently_represented\"", target_step_id: "s_legal_funding", set_tier: "dq" },
        { condition: "attorney_status == \"settled\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" }
      ],
      else_target_step_id: "s_insurance",
      custom_options: [
        { value: "never", label: "No, I have never worked with an attorney" },
        { value: "currently_represented", label: "Yes, I am currently represented" },
        { value: "want_to_switch", label: "Yes, but I want to change attorneys" },
        { value: "rejected", label: "My case was rejected by a previous attorney" },
        { value: "settled", label: "My case was already settled" }
      ],
      option_field_writes: {
        never: [{ field: "has_attorney", value: "No" }, { field: "attorney_disposition", value: "none" }],
        currently_represented: [{ field: "has_attorney", value: "Yes" }, { field: "attorney_disposition", value: "current" }],
        want_to_switch: [{ field: "has_attorney", value: "Yes" }, { field: "attorney_disposition", value: "switch" }],
        rejected: [{ field: "has_attorney", value: "No" }, { field: "attorney_disposition", value: "rejected" }],
        settled: [{ field: "has_attorney", value: "Yes" }, { field: "attorney_disposition", value: "settled" }]
      },
      variants: {
        t1: {
          title_override: "Have you ever worked with an attorney for this accident claim?",
          inherit_options_from_field: false,
          custom_options: [
            { value: "never", label: "No, I have never worked with an attorney" },
            { value: "currently_represented", label: "Yes, I am currently represented" },
            { value: "want_to_switch", label: "Yes, but I want to change attorneys" },
            { value: "rejected", label: "My case was rejected by a previous attorney" },
            { value: "settled", label: "My case was already settled" }
          ],
          branching_override: {
            branching_rules: [
              { condition: "attorney_status == \"currently_represented\"", target_step_id: "s_legal_funding", set_tier: "dq" },
              { condition: "attorney_status == \"settled\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" }
            ],
            else_target_step_id: "s_insurance"
          }
        },
        t2: {
          title_override: "Are you currently working with an attorney?",
          inherit_options_from_field: false,
          custom_options: [
            { value: "never", label: "No, I have never worked with an attorney" },
            { value: "currently_represented", label: "Yes, I am currently represented" },
            { value: "want_to_switch", label: "Yes, but I want to change attorneys" },
            { value: "settled", label: "My case was already settled" }
          ],
          branching_override: {
            branching_rules: [
              { condition: "attorney_status == \"currently_represented\"", target_step_id: "s_legal_funding", set_tier: "dq" },
              { condition: "attorney_status == \"settled\"", target_step_id: "s_dq_tell_me_more", set_tier: "dq" }
            ],
            else_target_step_id: "s_first_name"
          }
        },
        t3: {
          title_override: "Do you currently have an attorney?",
          inherit_options_from_field: false,
          custom_options: [
            { value: "never", label: "No" },
            { value: "currently_represented", label: "Yes" },
            { value: "want_to_switch", label: "Yes, but I want to switch" }
          ],
          branching_override: {
            branching_rules: [
              { condition: "attorney_status == \"currently_represented\"", target_step_id: "s_legal_funding", set_tier: "dq" }
            ],
            else_target_step_id: "s_first_name"
          }
        },
        t4: {
          title_override: "Do you currently have an attorney?",
          inherit_options_from_field: false,
          custom_options: [
            { value: "never", label: "No" },
            { value: "currently_represented", label: "Yes" },
            { value: "want_to_switch", label: "Yes, but I want to switch" }
          ],
          branching_override: {
            branching_rules: [
              { condition: "attorney_status == \"currently_represented\"", target_step_id: "s_legal_funding", set_tier: "dq" }
            ],
            else_target_step_id: "s_first_name"
          }
        }
      }
    },
    // 11. Insurance (NEW - T1 required, T2 optional, T3/T4 skip)
    {
      id: "s_insurance",
      survey_id: surveyId,
      tier: "shared",
      type: "single_select",
      title: "Does anyone involved have vehicle insurance?",
      helper_text: "",
      save_to_field: "insurance_status",
      inherit_options_from_field: false,
      display_mode: "buttons",
      required: true,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_accident_description",
      custom_options: [
        { value: "i_have", label: "Yes, I have insurance" },
        { value: "other_driver_has", label: "Yes, the other driver has insurance" },
        { value: "both_have", label: "Yes, both have insurance" },
        { value: "neither_has", label: "No one has insurance" },
        { value: "unsure", label: "I am not sure" }
      ],
      variants: {
        t1: { required: true },
        t2: {
          title_override: "Does anyone involved have insurance?",
          required: false,
          else_target_step_id: "s_first_name"
        },
        t3: { skip_for_tier: true },
        t4: { skip_for_tier: true }
      }
    },
    // 12. Accident description (NEW - T1 required, T2 optional, T3/T4 skip)
    {
      id: "s_accident_description",
      survey_id: surveyId,
      tier: "shared",
      type: "text_input",
      title: "Briefly describe your accident and injuries",
      helper_text: "A few sentences is fine. Specific details help your case.",
      save_to_field: "accident_description",
      required: true,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_first_name",
      validation: { minLength: 20, maxLength: 1000 },
      config: {
        multiline: true,
        rows: 5,
        placeholder: "I was rear-ended at a stop sign and now have neck pain and back stiffness..."
      },
      variants: {
        t1: { required: true, validation: { minLength: 20, maxLength: 1000 } },
        t2: { title_override: "Briefly describe what happened", required: false, validation: { minLength: 10 } },
        t3: { skip_for_tier: true },
        t4: { skip_for_tier: true }
      }
    },
    // 13. First name
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
    // 14. Phone
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
    // 15. Email
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
    // 16. Results qualified
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
    // 17. Legal funding (NEW - DQ tier, for currently_represented attorney route)
    {
      id: "s_legal_funding",
      survey_id: surveyId,
      tier: "dq",
      type: "custom_page",
      title: "We may still be able to help",
      helper_text: "",
      content_html: `<div style="text-align:center;padding:20px 0;"><p style="font-size:16px;margin-bottom:12px;">Since you already have an attorney, we cannot connect you with a new one. But pre-settlement legal funding may be available while your case is pending.</p><p style="font-size:14px;opacity:0.85;">No payments until you settle. No credit check.</p></div>`,
      branching_mode: "none",
      branching_rules: [],
      else_target_step_id: "s_dq_results",
      config: {
        inline_form_fields: [
          { field: "first_name", type: "text", label: "First Name", required: true },
          { field: "phone", type: "phone", label: "Phone", required: true },
          { field: "email", type: "email", label: "Email", required: true },
          { field: "case_description", type: "textarea", label: "Briefly describe your case", required: false }
        ],
        submit_event: "legal_funding_lead",
        // Configure your legal funding partner endpoint here
        submit_webhook_url: ""
      }
    },
    // 18. DQ tell me more
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
    // 19. DQ results
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

// All fields required for Phase 5
const ALL_FIELDS = [
  // Lookup / routing computed fields
  { key: "cr_7day",      label: "CR 7 Day",     type: "number",  category: "routing",  computed: true },
  { key: "cr_14day",     label: "CR 14 Day",    type: "number",  category: "routing",  computed: true },
  { key: "cr_30day",     label: "CR 30 Day",    type: "number",  category: "routing",  computed: true },
  { key: "cr_3month",    label: "CR 3 Month",   type: "number",  category: "routing",  computed: true },
  { key: "cr_6month",    label: "CR 6 Month",   type: "number",  category: "routing",  computed: true },
  { key: "cr_12month",   label: "CR 12 Month",  type: "number",  category: "routing",  computed: true },
  { key: "cr_18month",   label: "CR 18 Month",  type: "number",  category: "routing",  computed: true },
  { key: "cr_24month",   label: "CR 24 Month",  type: "number",  category: "routing",  computed: true },
  { key: "verify_confirmed", label: "Verify Confirmed", type: "boolean", category: "qualify",  computed: false },
  { key: "incident_band",    label: "Incident Band",    type: "text",    category: "routing",  computed: true },
  { key: "final_tier",       label: "Final Tier",       type: "number",  category: "routing",  computed: true },
  // Phase 5 new fields
  { key: "tier_source",      label: "Tier Source",      type: "text",    category: "routing",  computed: true,
    description: "How the tier was assigned: bq_lookup, age_fallback, age_expired, inactive_state" },
  { key: "has_injury",       label: "Has Injury",       type: "boolean", category: "qualify",  computed: false },
  { key: "attorney_disposition", label: "Attorney Disposition", type: "enum", category: "qualify", computed: false,
    allowed_values: [
      { value: "current", label: "Currently Represented" },
      { value: "switch", label: "Wants to Switch" },
      { value: "rejected", label: "Case Rejected" },
      { value: "settled", label: "Case Settled" },
      { value: "none", label: "No Attorney" }
    ]
  },
  { key: "has_attorney",     label: "Has Attorney",     type: "boolean", category: "qualify",  computed: false },
  { key: "insurance_status", label: "Insurance Status", type: "enum",    category: "qualify",  computed: false,
    allowed_values: [
      { value: "i_have", label: "I have insurance" },
      { value: "other_driver_has", label: "Other driver has insurance" },
      { value: "both_have", label: "Both have insurance" },
      { value: "neither_has", label: "No one has insurance" },
      { value: "unsure", label: "Unsure" }
    ]
  },
  { key: "accident_description", label: "Accident Description", type: "text", category: "event", computed: false },
  { key: "treatment",        label: "Treatment",        type: "enum",    category: "qualify",  computed: true,
    allowed_values: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
      { value: "Pending", label: "Pending" }
    ]
  },
  { key: "treatment_type",   label: "Treatment Type",   type: "enum",    category: "qualify",  computed: true,
    allowed_values: [
      { value: "ER", label: "Emergency Room" },
      { value: "UrgentCare", label: "Urgent Care" },
      { value: "Doctor", label: "Doctor" },
      { value: "Chiropractor", label: "Chiropractor" },
      { value: "PhysicalTherapy", label: "Physical Therapy" },
      { value: "Imaging", label: "MRI / X-Ray" },
      { value: "Specialist", label: "Specialist" },
      { value: "SurgeryRecommended", label: "Surgery Recommended" },
      { value: "Ongoing", label: "Ongoing Treatment" },
      { value: "Ambulance", label: "Ambulance" },
      { value: "None", label: "None" }
    ]
  },
  { key: "treatment_time",   label: "Treatment Time",   type: "enum",    category: "qualify",  computed: true,
    allowed_values: [
      { value: "Past", label: "Past" },
      { value: "Future", label: "Future / Scheduled" },
      { value: "None", label: "None" }
    ]
  },
  // Update attorney_status field with Phase 5 options
  { key: "attorney_status",  label: "Attorney Status",  type: "enum",    category: "qualify",  computed: false,
    allowed_values: [
      { value: "never", label: "No, I have never worked with an attorney" },
      { value: "currently_represented", label: "Yes, I am currently represented" },
      { value: "want_to_switch", label: "Yes, but I want to change attorneys" },
      { value: "rejected", label: "My case was rejected by a previous attorney" },
      { value: "settled", label: "My case was already settled" }
    ]
  },
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

    // 1. Upsert required SurveyFields
    const existingFields = await base44.asServiceRole.entities.SurveyField.list(null, 500);
    const existingKeyMap = {};
    existingFields.forEach(f => { existingKeyMap[f.key] = f; });

    for (const f of ALL_FIELDS) {
      if (existingKeyMap[f.key]) {
        // Update allowed_values if the field already exists (to keep them fresh)
        if (f.allowed_values) {
          await base44.asServiceRole.entities.SurveyField.update(existingKeyMap[f.key].id, {
            allowed_values: f.allowed_values,
            description: f.description || existingKeyMap[f.key].description
          });
        }
      } else {
        await base44.asServiceRole.entities.SurveyField.create(f);
      }
    }

    // 2. Fetch existing steps for this survey
    const existingSteps = await base44.asServiceRole.entities.SurveyStep.filter({ survey_id });

    // 3. Build all 19 new steps in memory
    const newSteps = buildSteps(survey_id);

    // 4. Attempt creation of all steps (rollback on any failure)
    const created = [];
    try {
      for (const step of newSteps) {
        const c = await base44.asServiceRole.entities.SurveyStep.create(step);
        created.push(c);
      }
    } catch (err) {
      for (const c of created) {
        try { await base44.asServiceRole.entities.SurveyStep.delete(c.id); } catch (_) {}
      }
      return Response.json({ error: `Step creation failed: ${err.message}. Rolled back.` }, { status: 500 });
    }

    // 5. All created. Delete old steps.
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
      phase: 5,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

/**
 * One-click seeder: creates the Phase 6 MVA survey with all 24 steps
 * and all required SurveyField records.
 */

const FIELDS = [
  // Routing / computed
  { field_key: "dq_lead", display_label: "DQ Lead", field_type: "string", category: "routing", computed: true },
  { field_key: "dq_reason", display_label: "DQ Reason", field_type: "text", category: "routing", computed: true },
  { field_key: "dq_tags", display_label: "DQ Tags", field_type: "text", category: "routing", computed: true },
  // Event fields
  { field_key: "accident_type", display_label: "Accident Type", field_type: "enum", category: "event", allowed_values: ["auto","motorcycle","commercial","rideshare_passenger","pedestrian","work_other_none"] },
  { field_key: "accident_type_2", display_label: "Accident Type (Secondary)", field_type: "enum", category: "event", allowed_values: ["auto","truck","workplace","discrimination","pedestrian_rideshare","no_injury"] },
  { field_key: "accident_state", display_label: "State of Accident", field_type: "string", category: "event" },
  { field_key: "incident_date", display_label: "Incident Date", field_type: "date", category: "event" },
  { field_key: "accident_date", display_label: "Accident Date Band", field_type: "string", category: "event", computed: true },
  { field_key: "incident_band", display_label: "Incident Band", field_type: "string", category: "event", computed: true },
  { field_key: "accident_details", display_label: "Accident Description", field_type: "text", category: "event" },
  { field_key: "has_injury", display_label: "Has Injury", field_type: "string", category: "event" },
  { field_key: "injury_type", display_label: "Injury Type", field_type: "enum", category: "event", allowed_values: ["fatality","spinal","brain","amputation","fractures","back_neck_shoulder","cuts_bruises","whiplash","headaches","other","none"] },
  { field_key: "treatment_type", display_label: "Treatment Type", field_type: "enum", category: "event", allowed_values: ["surgery","hospitalized","doctor","none","yes","no"] },
  { field_key: "treatment_timing", display_label: "Treatment Timing", field_type: "enum", category: "event", allowed_values: ["ongoing","within_7d","within_14d","within_30d","within_60d","over_60d","never"] },
  { field_key: "fault", display_label: "Fault", field_type: "enum", category: "event", allowed_values: ["not_at_fault","at_fault","hit_run_single","both_unsure","not_sure_both"] },
  { field_key: "attorney_status", display_label: "Attorney Status", field_type: "enum", category: "event", allowed_values: ["never","worked_with","no_attorney","currently_represented","rejected_or_settled","want_to_switch"] },
  { field_key: "insurance_status", display_label: "Insurance Status", field_type: "enum", category: "event", allowed_values: ["both_have","other_at_fault_has","i_have","neither_has"] },
  // Contact
  { field_key: "first_name", display_label: "First Name", field_type: "string", category: "contact", is_pii: true },
  { field_key: "last_name", display_label: "Last Name", field_type: "string", category: "contact", is_pii: true },
  { field_key: "phone", display_label: "Phone", field_type: "phone", category: "contact", is_pii: true },
  { field_key: "email", display_label: "Email", field_type: "email", category: "contact", is_pii: true },
  { field_key: "zip", display_label: "Zip Code", field_type: "string", category: "contact", is_pii: true, validation_pattern: "^\\d{5}$" },
  // Computed contact
  { field_key: "phone_verified", display_label: "Phone Verified", field_type: "boolean", category: "computed", computed: true },
  { field_key: "phone_carrier", display_label: "Phone Carrier", field_type: "string", category: "computed", computed: true },
  { field_key: "phone_line_type", display_label: "Phone Line Type", field_type: "string", category: "computed", computed: true },
  // Lookup tier
  { field_key: "final_tier", display_label: "Final Tier", field_type: "string", category: "routing", computed: true },
  { field_key: "bq_region", display_label: "BQ Region", field_type: "string", category: "routing", computed: true },
];

const DATE_SUBMIT_SCRIPT = `
const incidentDate = new Date(ctx.fields.get('incident_date'));
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

if (band === 'Within 18 Months' || band === 'Within 24 Months') {
  ctx.fields.set('dq_lead', 'Yes');
  const existingTags = ctx.fields.get('dq_tags') || '';
  ctx.fields.set('dq_tags', existingTags ? existingTags + ',accident_aging' : 'accident_aging');
}

if (band === 'More Than 2 Years') {
  ctx.fields.set('dq_lead', 'Yes');
  ctx.fields.set('dq_reason', 'accident_too_old');
  ctx.goto('s_dq_tell_me_more');
}
`.trim();

const PHONE_VERIFY_SCRIPT = `
const valid = ctx.fields.get('phone_verified');
if (valid === false || valid === 'false') {
  ctx.fields.set('dq_lead', 'Yes');
  const tags = ctx.fields.get('dq_tags') || '';
  ctx.fields.set('dq_tags', tags ? tags + ',invalid_phone' : 'invalid_phone');
}
ctx.goto('s_webhooks');
`.trim();

const WEBHOOKS_ENTER_SCRIPT = `
const isDQ = ctx.fields.get('dq_lead') === 'Yes';
if (isDQ) {
  ctx.goto('s_dq_tell_me_more');
} else {
  ctx.goto('s_results_qualified');
}
`.trim();

const STEPS = [
  {
    step_id: "s_accident_type", step_order: 0, step_type: "single_select", tier: "shared",
    title_display: "1. Accident Type", label: "How Were You Injured?",
    helper_text: "Select The Type Of Accident You Were Involved In:",
    save_to_field: "accident_type", required: true, auto_advance: true, display_mode: "cards",
    custom_options: [
      { value: "auto", label: "Auto / Motorcycle Accident", icon: "Car" },
      { value: "commercial", label: "Commercial / Semi Accident", icon: "Truck" },
      { value: "rideshare_passenger", label: "Passenger / Rideshare / Pedestrian Accident", icon: "Users" },
      { value: "work_other_none", label: "At Work / Other / I Wasn't Injured", icon: "HardHat" },
    ],
    branching_rules: [
      { condition: "accident_type == 'work_other_none'", target_step_id: "s_accident_type_2", set_fields: [], label: "Work/Other route" },
    ],
    else_target_step_id: "s_state", variants: {},
  },
  {
    step_id: "s_accident_type_2", step_order: 1, step_type: "single_select", tier: "shared",
    title_display: "2. Accident Type (Secondary)", label: "What Type Of Incident Were You Involved In?",
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
      { condition: "accident_type_2 == 'discrimination'", target_step_id: "s_state", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "employment_discrimination" }], label: "DQ: discrimination" },
      { condition: "accident_type_2 == 'no_injury'", target_step_id: "s_state", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_injury" }], label: "DQ: no injury" },
    ],
    else_target_step_id: "s_state", variants: {},
  },
  {
    step_id: "s_state", step_order: 2, step_type: "single_select", tier: "shared",
    title_display: "3. State", label: "What State Did The Accident Occur In?",
    helper_text: "Select the state where the accident happened.",
    save_to_field: "accident_state", required: true, auto_advance: true, display_mode: "dropdown",
    custom_options: [
      { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
      { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
      { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "FL", label: "Florida" },
      { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
      { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
      { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
      { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
      { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
      { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
      { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
      { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
      { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
      { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
      { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
      { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
      { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
      { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
    ],
    branching_rules: [], else_target_step_id: "s_date", variants: {},
  },
  {
    step_id: "s_date", step_order: 3, step_type: "smart_date", tier: "shared",
    title_display: "4. Incident Date", label: "When Did The Accident Happen?",
    helper_text: "We use this to calculate your statute of limitations urgency.",
    save_to_field: "incident_date", required: true, config: { picker_mode: "ymd_cascading" },
    onSubmit_script: DATE_SUBMIT_SCRIPT,
    branching_rules: [], else_target_step_id: "s_lookup", variants: {},
  },
  {
    step_id: "s_lookup", step_order: 4, step_type: "lookup", tier: "shared",
    title_display: "5. BQ Tier Lookup", label: "Looking up your region...", hide_title: true,
    save_to_field: "final_tier", config: { url: "", method: "POST", body_template: '{"state":"{fields.accident_state}","incident_band":"{fields.incident_band}"}', field_mappings: [{ property: "tier", field: "final_tier" }, { property: "region", field: "bq_region" }] },
    branching_rules: [], else_target_step_id: "s_verify", variants: {},
  },
  {
    step_id: "s_verify", step_order: 5, step_type: "single_select", tier: "shared",
    title_display: "6. Active State Check", label: "Is This Your First Time Seeking Legal Help For This Accident?",
    helper_text: "Select the option that best describes your current situation.",
    save_to_field: "active_state", required: true, auto_advance: true, display_mode: "buttons",
    custom_options: [
      { value: "Yes", label: "Yes, This Is My First Time" },
      { value: "No", label: "No, I Have Sought Help Before" },
    ],
    branching_rules: [
      { condition: "active_state == 'No'", target_step_id: "s_dq_tell_me_more", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "inactive_state" }], label: "Hard DQ: inactive" },
    ],
    else_target_step_id: "s_accident_details", variants: {},
  },
  {
    step_id: "s_accident_details", step_order: 6, step_type: "text_input", tier: "shared",
    title_display: "7. Accident Details", label: "Please Briefly Describe Your Accident & Injuries",
    helper_text: "Provide a brief overview of the accident and the injuries you suffered to help us analyze your case.",
    save_to_field: "accident_details", required: true, multiline: true,
    placeholder: "I was rear-ended at a stoplight on Main St. I have neck pain and back stiffness that started the next day...",
    validation: { minLength: 15, maxLength: 1000 },
    branching_rules: [], else_target_step_id: "s_injury_check", variants: {},
  },
  {
    step_id: "s_injury_check", step_order: 7, step_type: "yes_no", tier: "shared",
    title_display: "8. Injury Check", label: "Were You Injured In The Accident?",
    save_to_field: "has_injury", required: true, auto_advance: true,
    custom_options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }],
    branching_rules: [
      { condition: "has_injury == 'false'", target_step_id: "s_treatment_check", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_injury" }], label: "DQ: no injury" },
    ],
    else_target_step_id: "s_treatment_check",
    variants: { t1: { skip_for_tier: true }, t2: { skip_for_tier: true } },
  },
  {
    step_id: "s_injury_type", step_order: 8, step_type: "single_select", tier: "shared",
    title_display: "9. Injury Type (T1/T2)", label: "What Injuries Did You Suffer In The Accident?",
    helper_text: "Select the option that best describes the injuries you sustained.",
    save_to_field: "injury_type", required: true, auto_advance: true, display_mode: "dropdown",
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
      { condition: "injury_type == 'none'", target_step_id: "s_treatment_check", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_injury" }], label: "DQ: no injury" },
    ],
    else_target_step_id: "s_treatment_check",
    variants: { t3: { skip_for_tier: true }, t4: { skip_for_tier: true } },
  },
  {
    step_id: "s_treatment_check", step_order: 9, step_type: "single_select", tier: "shared",
    title_display: "10. Treatment Type", label: "What Type Of Medical Treatment Did You Receive?",
    helper_text: "Includes surgery, hospitalization, first aid, specialists, physicians, physical therapists, chiropractors, etc.",
    save_to_field: "treatment_type", required: true, auto_advance: true, display_mode: "buttons",
    custom_options: [
      { value: "surgery", label: "I Had Surgery" },
      { value: "hospitalized", label: "I Was Hospitalized" },
      { value: "doctor", label: "I Was Treated By A Doctor" },
      { value: "none", label: "I Was Not Medically Treated" },
    ],
    branching_rules: [
      { condition: "treatment_type == 'none'", target_step_id: "s_fault", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_treatment" }], label: "DQ: no treatment" },
    ],
    else_target_step_id: "s_treatment_time",
    variants: {
      t3: { label: "Did You Receive Medical Treatment?", custom_options: [{ value: "yes", label: "Yes, I Was Treated" }, { value: "no", label: "No, I Was Not Treated" }], else_target_step_id: "s_fault" },
      t4: { label: "Did You Receive Medical Treatment?", custom_options: [{ value: "yes", label: "Yes, I Was Treated" }, { value: "no", label: "No, I Was Not Treated" }], else_target_step_id: "s_attorney" },
    },
  },
  {
    step_id: "s_treatment_time", step_order: 10, step_type: "single_select", tier: "shared",
    title_display: "11. Treatment Timing (T1/T2)", label: "When Were You Treated For Your Injuries?",
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
      { condition: "treatment_timing == 'never'", target_step_id: "s_fault", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_treatment" }], label: "DQ: never treated" },
    ],
    else_target_step_id: "s_fault",
    variants: { t3: { skip_for_tier: true }, t4: { skip_for_tier: true } },
  },
  {
    step_id: "s_fault", step_order: 11, step_type: "single_select", tier: "shared",
    title_display: "12. Fault", label: "Were You At Fault For This Accident?",
    helper_text: "Select the option that best describes your involvement in the accident.",
    save_to_field: "fault", required: true, auto_advance: true, display_mode: "buttons",
    custom_options: [
      { value: "not_at_fault", label: "No, Someone Else Caused The Accident" },
      { value: "at_fault", label: "Yes, I Caused The Accident" },
      { value: "hit_run_single", label: "It Was A Hit & Run / Single-Person / Animal Accident" },
      { value: "both_unsure", label: "We Were Both At Fault / Not Sure" },
    ],
    branching_rules: [
      { condition: "fault == 'at_fault'", target_step_id: "s_attorney", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "self_fault" }], label: "DQ: self fault" },
      { condition: "fault == 'hit_run_single'", target_step_id: "s_attorney", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "hit_run_or_single" }], label: "DQ: hit & run" },
    ],
    else_target_step_id: "s_attorney",
    variants: {
      t3: { label: "Was The Accident Your Fault?", custom_options: [{ value: "not_at_fault", label: "No, I Was Not At Fault" }, { value: "at_fault", label: "Yes, I Caused The Accident" }, { value: "not_sure_both", label: "Not Sure / Both At Fault" }] },
      t4: { skip_for_tier: true },
    },
  },
  {
    step_id: "s_attorney", step_order: 12, step_type: "single_select", tier: "shared",
    title_display: "13. Attorney Status", label: "Have You Ever Worked With An Attorney For This Accident Claim?",
    helper_text: "Indicate if you have ever engaged with a law firm to help you with this case.",
    save_to_field: "attorney_status", required: true, auto_advance: true, display_mode: "buttons",
    custom_options: [
      { value: "never", label: "No, I Have Never Worked With An Attorney" },
      { value: "worked_with", label: "Yes, I Have Worked With An Attorney" },
      { value: "rejected_or_settled", label: "My Claim Was Rejected / Settled" },
    ],
    branching_rules: [
      { condition: "attorney_status == 'currently_represented'", target_step_id: "s_legal_funding", set_tier: "dq", set_fields: [], label: "Hard route: currently represented" },
      { condition: "attorney_status == 'rejected_or_settled'", target_step_id: "s_insurance", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "rejected_settled" }], label: "DQ: rejected/settled" },
    ],
    else_target_step_id: "s_insurance",
    variants: {
      t2: { label: "Are You Currently Working With An Attorney For This Accident Claim?", custom_options: [{ value: "no_attorney", label: "No, I Don't Have An Attorney" }, { value: "currently_represented", label: "Yes, I Am Working With An Attorney" }, { value: "rejected_or_settled", label: "My Claim Was Rejected / Settled" }, { value: "want_to_switch", label: "Yes, But I Am Looking To Change Attorneys" }], else_target_step_id: "s_first_name" },
      t3: { label: "Are You Currently Working With An Attorney For This Accident Claim?", custom_options: [{ value: "no_attorney", label: "No, I Don't Have An Attorney" }, { value: "currently_represented", label: "Yes, I Am Working With An Attorney" }, { value: "want_to_switch", label: "Yes, But I Am Looking To Change Attorneys" }], else_target_step_id: "s_first_name" },
      t4: { label: "Are You Currently Working With An Attorney For This Accident?", custom_options: [{ value: "no_attorney", label: "No, I Don't Have An Attorney" }, { value: "currently_represented", label: "Yes, I Am Working With An Attorney" }, { value: "rejected_or_settled", label: "My Claim Was Rejected / Settled" }], else_target_step_id: "s_first_name" },
    },
  },
  {
    step_id: "s_insurance", step_order: 13, step_type: "single_select", tier: "shared",
    title_display: "14. Insurance (T1 only)", label: "Does Anyone Involved Have Vehicle Insurance?",
    helper_text: "Select the option that best describes the insurance status of everyone involved.",
    save_to_field: "insurance_status", required: true, auto_advance: true, display_mode: "buttons",
    custom_options: [
      { value: "both_have", label: "Yes, Both Parties Have Insurance" },
      { value: "other_at_fault_has", label: "The Driver At Fault Has Insurance" },
      { value: "i_have", label: "I Have Insurance" },
      { value: "neither_has", label: "No One Has Insurance" },
    ],
    branching_rules: [
      { condition: "insurance_status == 'neither_has'", target_step_id: "s_first_name", set_fields: [{ field: "dq_lead", value: "Yes" }, { field: "dq_reason", value: "no_insurance" }], label: "Soft DQ: no insurance" },
    ],
    else_target_step_id: "s_first_name",
    variants: { t2: { skip_for_tier: true }, t3: { skip_for_tier: true }, t4: { skip_for_tier: true } },
  },
  {
    step_id: "s_first_name", step_order: 14, step_type: "text_input", tier: "shared",
    title_display: "15. First Name", label: "What's your first name?",
    save_to_field: "first_name", required: true, branching_rules: [], else_target_step_id: "s_last_name", variants: {},
  },
  {
    step_id: "s_last_name", step_order: 15, step_type: "text_input", tier: "shared",
    title_display: "16. Last Name", label: "What's your last name?",
    save_to_field: "last_name", required: true, branching_rules: [], else_target_step_id: "s_phone", variants: {},
  },
  {
    step_id: "s_phone", step_order: 16, step_type: "text_input", tier: "shared",
    title_display: "17. Phone", label: "What's your cell phone number?",
    helper_text: "US mobile only.",
    save_to_field: "phone", required: true, placeholder: "(555) 000-0000", branching_rules: [], else_target_step_id: "s_email", variants: {},
  },
  {
    step_id: "s_email", step_order: 17, step_type: "text_input", tier: "shared",
    title_display: "18. Email", label: "What's your email address?",
    save_to_field: "email", required: true, placeholder: "you@example.com", branching_rules: [], else_target_step_id: "s_phone_verify", variants: {},
  },
  {
    step_id: "s_phone_verify", step_order: 18, step_type: "lookup", tier: "shared",
    title_display: "19. Phone Verification", label: "Verifying your number...", hide_title: true,
    config: { url: "", method: "POST", body_template: '{"mobile":"{fields.phone}","first_name":"{fields.first_name}","last_name":"{fields.last_name}"}', field_mappings: [{ property: "valid", field: "phone_verified" }, { property: "carrier", field: "phone_carrier" }, { property: "line_type", field: "phone_line_type" }] },
    onSubmit_script: PHONE_VERIFY_SCRIPT,
    branching_rules: [], else_target_step_id: "s_webhooks", variants: {},
  },
  {
    step_id: "s_webhooks", step_order: 19, step_type: "script", tier: "shared",
    title_display: "20. Webhook Fan-Out", label: "Submitting...", hide_title: true,
    onEnter_script: WEBHOOKS_ENTER_SCRIPT,
    branching_rules: [], else_target_step_id: "s_results_qualified", variants: {},
  },
  {
    step_id: "s_results_qualified", step_order: 20, step_type: "results", tier: "shared",
    title_display: "21. Qualified Results",
    label: "GREAT NEWS!! You Qualify For A Maximum Compensation Payout!",
    content_html: `<div style="text-align:center;"><h1 style="font-family:sans-serif;font-weight:800;font-size:28px;color:#3ab54b;margin-bottom:12px;">GREAT NEWS!! You Qualify For A Maximum Compensation Payout!</h1><p style="font-size:16px;color:#595E64;margin-bottom:20px;">Provide your details below to get your FREE case evaluation from an experienced attorney that specializes in cases like yours.</p></div>`,
    branching_rules: [], else_target_step_id: null, variants: {},
  },
  {
    step_id: "s_legal_funding", step_order: 21, step_type: "legal_funding", tier: "dq",
    title_display: "22. Legal Funding (Currently Represented)", label: "You Are Currently Represented",
    content_html: `<div style="text-align:center;"><h1 style="font-weight:800;font-size:28px;color:#fff;margin-bottom:12px;">You Are Currently Represented</h1><p style="font-size:16px;color:#ccc;margin-bottom:20px;">Since you are currently working with an attorney, we can help connect you with legal funding options for your ongoing case.</p></div>`,
    branching_rules: [], else_target_step_id: null, variants: {},
  },
  {
    step_id: "s_dq_tell_me_more", step_order: 22, step_type: "results", tier: "dq",
    title_display: "23. DQ Results",
    label: "Tell Us More...",
    content_html: `<div style="text-align:center;"><h1 style="font-weight:800;font-size:28px;color:#fff;margin-bottom:12px;">Tell Us More...</h1><p style="font-size:16px;color:#ccc;margin-bottom:12px;">Complete the form below so we can contact you to get started!</p><p style="font-size:14px;color:#aaa;margin-bottom:16px;">Don't wanna wait? Call now, and fast track your claim.</p></div>`,
    branching_rules: [], else_target_step_id: null, variants: {},
  },
  {
    step_id: "s_dq_results", step_order: 23, step_type: "redirect", tier: "dq",
    title_display: "24. DQ Redirect", label: "Redirecting...", hide_title: true,
    config: { url: "/Thanks" }, branching_rules: [], else_target_step_id: null, variants: {},
  },
];

const STEP_ORDER = STEPS.map(s => s.step_id);

export default function SurveySeeder({ onComplete }) {
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState([]);
  const [error, setError] = useState(null);

  const appendLog = (msg) => setLog(prev => [...prev, msg]);

  const seed = async () => {
    setStatus("running");
    setLog([]);
    setError(null);

    try {
      // 1. Create survey
      appendLog("Creating MVA Phase 6 survey...");
      const survey = await base44.entities.Survey.create({
        name: "MVA Survey v6",
        slug: "mva",
        status: "draft",
        version: 6,
        step_order: STEP_ORDER,
        start_step_id: "s_accident_type",
        settings: {
          auto_advance_ms: 300,
          progress_bar: true,
          show_back_button: true,
          display_phone: "(844) 840-6905",
          tcpa_text: "By submitting this form, I expressly consent to be contacted by Check My Claim and its attorney partners via phone, text, and email at the number and address I provided, even if I am on a Do Not Call registry. Consent is not a condition of purchase. Msg & data rates may apply. I agree to the Privacy Policy and Terms of Service."
        },
        integrations_config: {
          hlr_endpoint: "",
          wc_quiz_redirect: "",
          webhooks: [
            { name: "DQ Lead to BigQuery", url: "", method: "POST", fire_on: "dq_only", active: false, headers: [], payload_template: { lead_data: "{fields}", dq_reason: "{fields.dq_reason}", dq_tags: "{fields.dq_tags}" } },
            { name: "Qualified Lead to LeadByte", url: "", method: "POST", fire_on: "qualified_only", active: false, headers: [], payload_template: { first_name: "{fields.first_name}", last_name: "{fields.last_name}", mobile: "{fields.phone}", email: "{fields.email}", zip: "{fields.zip}" } },
            { name: "LeadByte Quarantine", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
            { name: "Release Quarantine", url: "", method: "POST", fire_on: "qualified_only", active: false, headers: [], payload_template: {} },
            { name: "Meta CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
            { name: "TikTok CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
            { name: "Snapchat CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
          ]
        },
        dq_config: { qualified_redirect_url: "/Submitted", dq_redirect_url: "/Thanks" },
      });
      appendLog(`Survey created: ${survey.id}`);

      // 2. Create fields
      appendLog(`Creating ${FIELDS.length} survey fields...`);
      for (const f of FIELDS) {
        await base44.entities.SurveyField.create({ ...f, survey_id: survey.id });
      }
      appendLog("All fields created.");

      // 3. Create steps
      appendLog(`Creating ${STEPS.length} survey steps...`);
      for (const step of STEPS) {
        await base44.entities.SurveyStep.create({ ...step, survey_id: survey.id });
        appendLog(`  Step created: ${step.step_id}`);
      }

      appendLog("Seeding complete. Survey is in DRAFT status.");
      setStatus("done");
      if (onComplete) onComplete(survey.id);
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-[#1e90ff]" />
        <h3 className="text-white font-bold">Seed Phase 6 MVA Survey</h3>
      </div>
      <p className="text-slate-400 text-sm mb-5">
        Creates a complete MVA Survey with all 24 Phase 6 steps, 27 field definitions, and the webhook fan-out config.
        The survey is created in DRAFT status. Publish it when ready.
      </p>

      {status === "idle" && (
        <button onClick={seed} className="bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm">
          Seed Phase 6 Survey Now
        </button>
      )}

      {status === "running" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 border-2 border-[#1e90ff]/30 border-t-[#1e90ff] rounded-full animate-spin" />
            <span className="text-[#1e90ff] text-sm font-semibold">Creating survey...</span>
          </div>
          <div className="bg-[#0a1628] rounded-lg p-3 h-40 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center gap-2 text-green-400 font-semibold">
          <CheckCircle className="w-5 h-5" /> Survey seeded successfully. Go to Survey Builder to review and publish.
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Seeding failed</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {log.length > 0 && status !== "running" && (
        <div className="mt-3 bg-[#0a1628] rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
// Tier colors and metadata for the survey builder
export const TIER_META = {
  shared: { label: "Shared", short: "SH", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.35)" },
  t1:     { label: "T1",     short: "T1", color: "#ef4d4d", bg: "rgba(239,77,77,0.12)",   border: "rgba(239,77,77,0.35)" },
  t2:     { label: "T2",     short: "T2", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)" },
  t3:     { label: "T3",     short: "T3", color: "#2282fc", bg: "rgba(34,130,252,0.12)",  border: "rgba(34,130,252,0.35)" },
  t4:     { label: "T4",     short: "T4", color: "#3ab54b", bg: "rgba(58,181,75,0.12)",   border: "rgba(58,181,75,0.35)" },
  dq:     { label: "DQ",     short: "DQ", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)" },
};

export const ALL_TIERS = ["shared","t1","t2","t3","t4","dq"];

export const STEP_TYPES = [
  { type: "single_select",  label: "Single Select",    category: "CAPTURE",              desc: "One answer from a list of options." },
  { type: "multi_select",   label: "Multi Select",     category: "CAPTURE",              desc: "Multiple answers allowed." },
  { type: "text_input",     label: "Text Input",       category: "CAPTURE",              desc: "Free-form short text." },
  { type: "number_input",   label: "Number Input",     category: "CAPTURE",              desc: "Numeric value with optional range." },
  { type: "email_input",    label: "Email Input",      category: "CAPTURE",              desc: "Email address with format validation." },
  { type: "phone_input",    label: "Phone Input",      category: "CAPTURE",              desc: "US phone number." },
  { type: "date_input",     label: "Date Input",       category: "CAPTURE",              desc: "Date picker." },
  { type: "smart_date",     label: "Smart Date",       category: "CAPTURE",              desc: "Date picker that auto-bands into incident windows." },
  { type: "address_input",  label: "Address Input",    category: "CAPTURE",              desc: "Street address with optional autocomplete." },
  { type: "yes_no",         label: "Yes / No",         category: "CAPTURE",              desc: "Binary yes or no question." },
  { type: "welcome",        label: "Welcome / Splash", category: "FLOW & PRESENTATION",  desc: "Intro screen shown before questions." },
  { type: "custom_page",    label: "Custom Page",      category: "FLOW & PRESENTATION",  desc: "Freeform HTML content only." },
  { type: "transition",     label: "Info / Transition",category: "FLOW & PRESENTATION",  desc: "Interstitial message between steps." },
  { type: "script",         label: "Script Node",      category: "LOGIC",                desc: "Run arbitrary JS via the ctx API." },
  { type: "decision",       label: "Decision Node",    category: "LOGIC",                desc: "Pure branching logic, no respondent UI." },
  { type: "lookup",         label: "Lookup (HTTP)",    category: "LOGIC",                desc: "HTTP GET/POST, map response to fields." },
  { type: "webhook_send",   label: "Webhook / API Send",category: "DELIVERY",            desc: "POST lead data to an external endpoint." },
  { type: "results",        label: "Results (Qualified)",category: "OUTCOMES",           desc: "Terminal qualified step." },
  { type: "end_dq",         label: "DQ / Tell Me More",category: "OUTCOMES",            desc: "Terminal disqualified step." },
];

export const STEP_CATEGORY_ORDER = ["CAPTURE","FLOW & PRESENTATION","LOGIC","DELIVERY","OUTCOMES"];

export const OPERATORS = ["equals","not_equals","in","not_in","gt","gte","lt","lte","between","contains","is_empty","is_not_empty","regex_match"];

export const SMART_DATE_BANDS = [
  { band: "7d",      label: "Within 7 days" },
  { band: "14d",     label: "8 to 14 days" },
  { band: "30d",     label: "15 to 30 days" },
  { band: "3m",      label: "1 to 3 months" },
  { band: "6m",      label: "3 to 6 months" },
  { band: "12m",     label: "6 to 12 months" },
  { band: "18m",     label: "12 to 18 months" },
  { band: "24m",     label: "18 to 24 months" },
  { band: "expired", label: "Over 24 months" },
];

export const LOOKUP_MOCK_RESPONSE = {
  state: "Arizona", state_code: "AZ", manual_override: "", active_state: "Yes",
  state_leads: 142, "7day_tier": 1, "14day_tier": 1, "30day_tier": 2,
  "3month_tier": 2, "6month_tier": 3, "12month_tier": 4, "18month_tier": 4, "24month_tier": 5,
  verify: "No",
};

export const CTX_API_DOCS = [
  { sig: "ctx.fields.get('key')", desc: "Read current field value." },
  { sig: "ctx.fields.set('key', val)", desc: "Write a field value." },
  { sig: "ctx.tier", desc: "Current tier string (shared, t1 .. t4, dq)." },
  { sig: "ctx.step", desc: "Current step ID string." },
  { sig: "ctx.fire('event', payload)", desc: "Emit a tracking event." },
  { sig: "ctx.goto('s_step_id')", desc: "Jump to a specific step." },
];
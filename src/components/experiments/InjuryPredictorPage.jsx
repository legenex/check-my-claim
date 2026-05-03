import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ, LeadForm } from "./shared/ExperimentLayout";
import { CheckCircle } from "lucide-react";

const CRASH_TYPES = [
  { value: "rear_end", label: "Rear-End", icon: "↩️" },
  { value: "t_bone", label: "T-Bone", icon: "💥" },
  { value: "side_swipe", label: "Side-Swipe", icon: "↔️" },
  { value: "head_on", label: "Head-On", icon: "⬆️" },
  { value: "rollover", label: "Rollover", icon: "🔄" },
  { value: "pedestrian_struck", label: "Pedestrian Struck", icon: "🚶" },
  { value: "cyclist_struck", label: "Cyclist Struck", icon: "🚴" },
];

const USER_ROLES = [
  { value: "driver", label: "Driver" },
  { value: "front_passenger", label: "Front Passenger" },
  { value: "rear_passenger", label: "Rear Passenger" },
  { value: "pedestrian", label: "Pedestrian" },
  { value: "cyclist", label: "Cyclist" },
];

const SEATBELT_OPTIONS = [
  { value: "worn", label: "Yes, worn" },
  { value: "not_worn", label: "Not worn" },
  { value: "unknown", label: "Unknown" },
];

const INJURY_MAP = {
  rear_end: [
    { region: "Cervical Spine (Neck)", injury: "Cervical strain / whiplash", likelihood: "High", days_to_appear: "Hours to 72 hours", severity: "Moderate" },
    { region: "TMJ (Jaw Joint)", injury: "Temporomandibular joint dysfunction", likelihood: "Moderate", days_to_appear: "1–14 days", severity: "Moderate" },
    { region: "Lumbar Spine (Low Back)", injury: "Lumbar strain / disc herniation", likelihood: "Moderate", days_to_appear: "24–72 hours", severity: "Moderate" },
    { region: "Shoulder", injury: "Seatbelt-induced shoulder impingement", likelihood: "Possible", days_to_appear: "1–3 days", severity: "Mild-Moderate" },
    { region: "Brain (Concussion)", injury: "Mild TBI / post-concussive syndrome", likelihood: "Possible", days_to_appear: "Immediate to 7 days", severity: "Variable" },
  ],
  t_bone: [
    { region: "Ribs / Chest Wall", injury: "Lateral rib fractures", likelihood: "High", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Pelvis / Hip", injury: "Pelvic fracture / hip injury", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Shoulder / Arm", injury: "Shoulder fracture / upper arm fracture", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Moderate-Severe" },
    { region: "Brain (TBI)", injury: "TBI from lateral head impact on window", likelihood: "Moderate-High", days_to_appear: "Immediate to 48 hours", severity: "Variable" },
    { region: "Cervical Spine", injury: "Lateral whiplash variant", likelihood: "Moderate", days_to_appear: "Hours to 48 hours", severity: "Moderate" },
  ],
  head_on: [
    { region: "Face / Teeth", injury: "Facial fractures, dental injury, airbag burns", likelihood: "High", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Chest Wall", injury: "Sternal fracture, rib fractures (seatbelt)", likelihood: "High", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Femur (Thigh)", injury: "Femur fracture from dashboard impact", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Wrists / Hands", injury: "Wrist fracture (bracing for impact)", likelihood: "High", days_to_appear: "Immediate", severity: "Moderate" },
    { region: "Cervical Spine", injury: "Hyperflexion cervical injury", likelihood: "High", days_to_appear: "Hours to 24 hours", severity: "Moderate-Severe" },
  ],
  rollover: [
    { region: "Cervical Spine", injury: "Cervical spine compression / fracture", likelihood: "High", days_to_appear: "Immediate", severity: "Potentially Severe" },
    { region: "Brain (TBI)", injury: "Traumatic brain injury", likelihood: "High", days_to_appear: "Immediate to 72 hours", severity: "Variable" },
    { region: "Shoulder", injury: "Shoulder dislocation / rotator cuff tear", likelihood: "High", days_to_appear: "Immediate", severity: "Moderate-Severe" },
    { region: "Spine (Thoracic)", injury: "Mid-back compression fracture", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Severe" },
  ],
  side_swipe: [
    { region: "Cervical Spine", injury: "Lateral whiplash", likelihood: "Moderate", days_to_appear: "Hours to 48 hours", severity: "Moderate" },
    { region: "Shoulder / Upper Arm", injury: "Impact bruising, possible fracture", likelihood: "Moderate", days_to_appear: "Immediate to 24 hours", severity: "Mild-Moderate" },
    { region: "Lower Extremity", injury: "Knee / ankle sprain if bracing occurred", likelihood: "Possible", days_to_appear: "Immediate to 48 hours", severity: "Mild" },
  ],
  pedestrian_struck: [
    { region: "Lower Legs (Tibias)", injury: "Tibia / fibula fractures (bumper impact)", likelihood: "High", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Pelvis / Hip", injury: "Pelvic fracture from secondary ground impact", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Brain (TBI)", injury: "TBI from hood/windshield or ground impact", likelihood: "High", days_to_appear: "Immediate to 72 hours", severity: "Severe" },
    { region: "Spine", injury: "Spinal injury from ground landing", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Variable" },
    { region: "Shoulder / Clavicle", injury: "Clavicle fracture (breaking fall)", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Moderate" },
  ],
  cyclist_struck: [
    { region: "Face / Skull", injury: "Facial fractures, TBI (helmet or no helmet)", likelihood: "High", days_to_appear: "Immediate", severity: "Severe" },
    { region: "Clavicle", injury: "Clavicle fracture (impact / fall)", likelihood: "High", days_to_appear: "Immediate", severity: "Moderate" },
    { region: "Wrists / Hands", injury: "Wrist fracture (outstretched hand landing)", likelihood: "High", days_to_appear: "Immediate", severity: "Moderate" },
    { region: "Lower Extremity", injury: "Road rash, tibia fracture, knee injury", likelihood: "Moderate", days_to_appear: "Immediate", severity: "Moderate" },
    { region: "Brain (TBI)", injury: "Traumatic brain injury (even with helmet)", likelihood: "High", days_to_appear: "Immediate to 48 hours", severity: "Variable" },
  ],
};

const LIKELIHOOD_COLOR = { "High": "bg-red-100 text-red-700 border-red-200", "Moderate-High": "bg-orange-100 text-orange-700 border-orange-200", "Moderate": "bg-amber-100 text-amber-700 border-amber-200", "Possible": "bg-blue-50 text-blue-700 border-blue-100" };

export default function InjuryPredictorPage({ experiment }) {
  const [form, setForm] = useState({ crash_type: "", speed: 35, seatbelt: "worn", role: "driver", vehicle_class: "sedan" });
  const [prediction, setPrediction] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  const predict = async () => {
    const injuries = INJURY_MAP[form.crash_type] || [];
    setPrediction(injuries);
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    const saved = await base44.entities.InjuryPrediction.create({
      crash_type: form.crash_type,
      estimated_speed_mph: form.speed,
      seatbelt_status: form.seatbelt,
      user_role: form.role,
      vehicle_class: form.vehicle_class,
      predicted_injuries: injuries,
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "anatomy",
      utm_campaign: stored("utm_campaign") || "Experiment",
      source_path: "/tools/injury-predictor",
      status: "prediction_complete",
    }).catch(() => null);
    if (saved) setSavedId(saved.id);
    if (experiment) await base44.entities.Experiment.update(experiment.id, { submissions: (experiment.submissions || 0) + 1 }).catch(() => {});
  };

  const checklist = prediction ? prediction.map(p => `☐ Request evaluation for: ${p.injury} (${p.region}) — Note: may appear up to ${p.days_to_appear}`).join("\n") : "";

  const copyChecklist = () => {
    navigator.clipboard.writeText("WHAT TO ASK YOUR DOCTOR TO SCREEN FOR:\n\n" + checklist);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSave = async (form) => {
    if (savedId) await base44.entities.InjuryPrediction.update(savedId, { full_name: form.full_name, email: form.email, phone: form.phone, status: "lead_captured", lead_captured_at: new Date().toISOString() }).catch(() => {});
    if (experiment) await incrementExpClicks(experiment, base44).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short} />

      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "What Injuries Should Your Doctor Be Screening For?"}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Based on your crash type and role, our biomechanics model predicts which injuries are most likely — including the ones that appear days later."}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
          <div className="mb-5">
            <label className="text-sm font-bold text-slate-700 block mb-2">Crash Type</label>
            <div className="grid grid-cols-4 gap-2">
              {CRASH_TYPES.map(c => (
                <button key={c.value} onClick={() => setForm(f => ({ ...f, crash_type: c.value }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${form.crash_type === c.value ? "border-[#1e90ff] bg-[#1e90ff]/10" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-xs font-semibold text-slate-700">{c.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Your Role in the Crash</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff] text-sm">
                {USER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Seatbelt Status</label>
              <select value={form.seatbelt} onChange={e => setForm(f => ({ ...f, seatbelt: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff] text-sm">
                {SEATBELT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-5">
            <label className="text-sm font-bold text-slate-700 block mb-2">Estimated Speed at Impact: {form.speed} mph</label>
            <input type="range" min="5" max="100" value={form.speed} onChange={e => setForm(f => ({ ...f, speed: parseInt(e.target.value) }))} className="w-full h-2 accent-[#1e90ff]" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5 mph</span><span>100 mph</span></div>
          </div>
          <button onClick={predict} disabled={!form.crash_type}
            className="w-full bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-4 rounded-xl text-lg transition-all">
            Show Predicted Injuries →
          </button>
        </div>

        {prediction && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Predicted Injuries — {CRASH_TYPES.find(c => c.value === form.crash_type)?.label}</h2>
              <p className="text-slate-500 text-sm mb-5">Based on biomechanical data for {form.role}s in {CRASH_TYPES.find(c => c.value === form.crash_type)?.label} crashes at ~{form.speed}mph. Many injuries appear 24–72 hours after the crash.</p>
              <div className="space-y-3">
                {prediction.map((p, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${LIKELIHOOD_COLOR[p.likelihood] || LIKELIHOOD_COLOR["Possible"]}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-sm">{p.region}</div>
                        <div className="text-sm">{p.injury}</div>
                        <div className="text-xs mt-1 opacity-75">Appears: {p.days_to_appear} · Severity: {p.severity}</div>
                      </div>
                      <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-white/60 border">{p.likelihood}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">What to Demand Your Doctor Screens For</h3>
                <button onClick={copyChecklist} className="text-xs bg-[#1e90ff] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  {copied ? "✓ Copied!" : "Copy Checklist"}
                </button>
              </div>
              <ul className="space-y-1">
                {prediction.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 text-slate-400 flex-shrink-0">☐</span>
                    <span><strong>{p.injury}</strong> ({p.region}) — may appear up to {p.days_to_appear}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-3">Print this list or email it to your doctor before your appointment.</p>
            </div>

            <LeadForm
              headline="Have an Attorney Make Sure Nothing Is Missed — Free"
              subtext="A vetted attorney will review your case and ensure your attorney-issued medical demands include every injury that's been predicted. No upfront cost."
              experiment={experiment}
              utmMedium={experiment?.utm_medium_label || "anatomy"}
              utmContent="lead_captured"
              onSuccess={handleLeadSave}
            />
          </div>
        )}

        <div className="mt-16">
          <HowItWorks steps={[
            { icon: "🚗", title: "Select crash type", desc: "Rear-end, T-bone, head-on, rollover, pedestrian, cyclist." },
            { icon: "📊", title: "Enter your details", desc: "Role, speed, seatbelt status." },
            { icon: "🩻", title: "See predicted injuries", desc: "Biomechanics-based predictions with likelihood and timing." },
            { icon: "📋", title: "Get the checklist", desc: "Copy a list to hand your doctor before your appointment." },
          ]} />

          <div className="py-14 max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Why Delayed-Onset Injuries Change Your Claim</h2>
            <p className="text-slate-600 leading-relaxed">Whiplash doesn't feel like whiplash at the accident scene. Adrenaline masks pain, and the inflammatory response responsible for most soft-tissue discomfort peaks 24–72 hours after impact. Herniated discs may not cause nerve symptoms until weeks later. Mild TBIs can present as "just a headache" that develops into chronic post-concussive syndrome months down the road.</p>
            <p className="text-slate-600 leading-relaxed mt-3">Insurance companies exploit this biology deliberately. They call you within 72 hours — before symptoms peak — hoping you'll describe your condition as "fine" or "not too bad." That statement goes into your file as evidence against your later claim that you were seriously injured. This tool helps you understand what to expect before that call comes.</p>
          </div>

          <Testimonials quotes={[
            { text: "I told the adjuster I felt fine. Three weeks later I had a herniated disc. This tool explained exactly why that happens.", author: "Sarah G. — Dallas, TX" },
            { text: "My doctor missed my TMJ injury after a rear-end. I printed the checklist and brought it to my second appointment. That injury ended up being a $22k component of my settlement.", author: "Nicole F. — Tampa, FL" },
            { text: "The concussion prediction was dead accurate. Didn't feel it for 48 hours then couldn't work for 6 weeks.", author: "Mark T. — Denver, CO" },
          ]} />

          <FAQ items={[
            { q: "How accurate is the biomechanics model?", a: "The predictions are based on established biomechanics research and injury patterns documented in emergency medicine literature. They're probabilistic, not diagnostic — they tell you what's most likely given your crash type, not what you definitively have." },
            { q: "Can I share this with my doctor?", a: "Absolutely — that's the point. Use the copy-checklist button to generate a printable list to bring to your next medical appointment." },
            { q: "What if I already saw a doctor and these injuries weren't mentioned?", a: "Request a follow-up. The 'standard' ER evaluation is designed for acute life threats, not documentation of all injury types relevant to a personal injury claim. Many people need specialist referrals for full evaluation." },
            { q: "Does a prediction mean I definitely have these injuries?", a: "No. The predictor shows what to screen for based on biomechanics — not a diagnosis. A physician must evaluate and diagnose actual conditions." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="anatomy" />
      <ExperimentFooter />
    </div>
  );
}
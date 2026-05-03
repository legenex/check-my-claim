import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ } from "./shared/ExperimentLayout";
import { Clock, CheckCircle } from "lucide-react";

const US_STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];

function useTick() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

const DAY_MILESTONES = [30, 90, 180, 365];

export default function CrashClockPage({ experiment }) {
  const [crashDate, setCrashDate] = useState("");
  const [state, setState] = useState("TX");
  const [stateData, setStateData] = useState(null);
  const [result, setResult] = useState(null);
  const [notifyForm, setNotifyForm] = useState({ email: "", phone: "" });
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const now = useTick();

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  useEffect(() => {
    if (state) base44.entities.StateMultiplier.filter({ state_code: state }).then(res => { if (res.length > 0) setStateData(res[0]); });
  }, [state]);

  const compute = () => {
    const crash = new Date(crashDate);
    const solYears = stateData?.statute_of_limitations_years || 2;
    const deadline = new Date(crash.getFullYear() + solYears, crash.getMonth(), crash.getDate());
    const daysSince = Math.floor((new Date() - crash) / (1000 * 60 * 60 * 24));

    const milestones = [...DAY_MILESTONES, solYears * 365 - 180, solYears * 365 - 30, solYears * 365].map(d => ({
      day: d,
      label: d === solYears * 365 - 180 ? "SOL − 6 months" : d === solYears * 365 - 30 ? "SOL − 30 days" : d === solYears * 365 ? "SOL DEADLINE" : `Day ${d}`,
      date: new Date(crash.getTime() + d * 24 * 60 * 60 * 1000),
      passed: daysSince >= d,
      critical: d >= solYears * 365 - 180,
    }));

    setResult({ crash, deadline, daysSince, solYears, stateName: stateData?.state_name || state, milestones });
  };

  const daysRemaining = result ? Math.max(0, Math.floor((result.deadline - now) / (1000 * 60 * 60 * 24))) : 0;
  const hoursRemaining = result ? Math.floor(((result.deadline - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : 0;
  const minsRemaining = result ? Math.floor(((result.deadline - now) % (1000 * 60 * 60)) / (1000 * 60)) : 0;
  const isUrgent = daysRemaining < 90;
  const isExpired = result && daysRemaining === 0;

  const handleNotify = async (e) => {
    e.preventDefault();
    if (!notifyForm.email) return;
    setNotifySubmitting(true);
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    await base44.entities.CrashClockSubscription.create({
      crash_date: crashDate,
      state,
      sol_deadline: result?.deadline?.toISOString(),
      email: notifyForm.email,
      phone: notifyForm.phone,
      milestones: result?.milestones?.filter(m => !m.passed).map(m => ({ day: m.day, label: m.label, date: m.date.toISOString() })),
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "clock",
      utm_campaign: stored("utm_campaign") || "Experiment",
      status: "active",
    }).catch(() => {});
    if (experiment) await base44.entities.Experiment.update(experiment.id, { submissions: (experiment.submissions || 0) + 1 }).catch(() => {});
    setNotifySubmitted(true);
    setNotifySubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short} />

      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "How Many Days Do You Have Left?"}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Enter your crash date and state. We'll show you your exact statute of limitations deadline — and the key milestones you can't afford to miss."}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Tool */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Crash Date</label>
              <input type="date" value={crashDate} onChange={e => setCrashDate(e.target.value)} max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">State</label>
              <select value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#1e90ff]">
                {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </div>
          </div>
          <button onClick={compute} disabled={!crashDate || !state}
            className="w-full bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-4 rounded-xl text-lg transition-all">
            Show My SOL Countdown →
          </button>
        </div>

        {result && (
          <>
            {/* Countdown */}
            <div className={`rounded-2xl p-8 text-center mb-8 ${isExpired ? "bg-red-900" : isUrgent ? "bg-red-50 border-2 border-red-300" : "bg-slate-900"}`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className={`w-6 h-6 ${isExpired || !isUrgent ? "text-white" : "text-red-500"}`} />
                <span className={`font-bold text-lg ${isExpired || !isUrgent ? "text-white" : "text-red-700"}`}>
                  {isExpired ? "STATUTE OF LIMITATIONS EXPIRED" : `${result.stateName} SOL Deadline: ${result.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                </span>
              </div>
              {!isExpired && (
                <div className="flex justify-center gap-6">
                  {[{ val: daysRemaining, label: "Days" }, { val: hoursRemaining, label: "Hours" }, { val: minsRemaining, label: "Minutes" }].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <div className={`text-5xl font-black tabular-nums ${isUrgent ? "text-red-500" : "text-white"}`}>{String(val).padStart(2, "0")}</div>
                      <div className={`text-xs font-semibold mt-1 ${isUrgent ? "text-red-400" : "text-slate-400"}`}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className={`text-sm mt-4 ${isExpired || !isUrgent ? "text-slate-300" : "text-red-600 font-semibold"}`}>
                {isExpired ? "You cannot file a lawsuit. Consult an attorney immediately — there may be exceptions." :
                  isUrgent ? "⚠ URGENT — Less than 90 days remain. Contact an attorney today." :
                  `${result.solYears}-year SOL in ${result.stateName}. ${result.daysSince} days have passed since your crash.`}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 overflow-x-auto">
              <h3 className="font-bold text-slate-900 mb-5">Your Claims Timeline</h3>
              <div className="relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 rounded-full" />
                <div className="flex justify-between relative">
                  {result.milestones.map((m, i) => (
                    <div key={i} className="text-center flex flex-col items-center min-w-0 flex-1 px-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 mb-2 flex-shrink-0 ${m.passed ? "bg-slate-400 border-slate-400" : m.critical ? "bg-red-500 border-red-500 animate-pulse" : "bg-[#1e90ff] border-[#1e90ff]"}`}>
                        {m.passed ? <span className="text-white text-xs">✓</span> : <span className="text-white text-xs font-bold">{i + 1}</span>}
                      </div>
                      <div className={`text-xs font-bold ${m.passed ? "text-slate-400" : m.critical ? "text-red-600" : "text-slate-700"}`}>{m.label}</div>
                      <div className="text-xs text-slate-400">{m.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notify form */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-slate-900 mb-2">Get Reminders at the Next 5 Milestones</h3>
              <p className="text-slate-500 text-sm mb-4">We'll email you at Day 90, Day 180, Day 365, SOL−6 months, and SOL−30 days. You shouldn't need to track this yourself.</p>
              {notifySubmitted ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold"><CheckCircle className="w-5 h-5" /> You're set! We'll remind you at each milestone.</div>
              ) : (
                <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
                  <input type="email" value={notifyForm.email} onChange={e => setNotifyForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email address" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1e90ff] text-sm" />
                  <input type="tel" value={notifyForm.phone} onChange={e => setNotifyForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone (optional)" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1e90ff] text-sm" />
                  <button type="submit" disabled={notifySubmitting}
                    className="bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap">
                    Set Reminders →
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        <div className="mt-10">
          <HowItWorks steps={[
            { icon: "📅", title: "Enter crash date & state", desc: "Date determines your SOL deadline. State determines the length." },
            { icon: "⏱️", title: "Live countdown", desc: "Exact days, hours, minutes remaining until your legal deadline." },
            { icon: "📍", title: "Key milestones", desc: "See which deadlines have passed and which are coming up." },
            { icon: "🔔", title: "Set reminders", desc: "Email notifications at critical milestones." },
          ]} />

          <div className="py-14 max-w-4xl mx-auto px-4 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Why Each Milestone Matters Even If You Don't Plan to Sue</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { day: "Day 30", color: "blue", text: "Memory sharpens claims. Statements, photos, and details documented within 30 days are dramatically more credible than those recalled months later." },
                { day: "Day 90", color: "blue", text: "The 90-day mark is when many insurers expect final medical records. Before then, offers are preliminary. After, they may treat your claim as 'stale.'" },
                { day: "Day 365", color: "amber", text: "One year out, witnesses' memories degrade, surveillance footage may be overwritten, and employer records may be purged. Evidence gets harder to obtain." },
                { day: "SOL", color: "red", text: "The statute of limitations is absolute. Miss it and you lose the right to sue — permanently. No extensions, no exceptions (with very rare statutory carve-outs for minors and discovery rules)." },
              ].map(({ day, color, text }) => (
                <div key={day} className={`p-5 rounded-xl border ${color === "red" ? "bg-red-50 border-red-200" : color === "amber" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-100"}`}>
                  <div className={`font-bold mb-2 ${color === "red" ? "text-red-700" : color === "amber" ? "text-amber-700" : "text-blue-700"}`}>{day}</div>
                  <p className="text-sm text-slate-700">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <Testimonials quotes={[
            { text: "I had 47 days left on my SOL and didn't know it. The clock showed me. Called an attorney the same day.", author: "David R. — Orlando, FL" },
            { text: "My insurer kept saying 'there's no rush.' There was. I was 60 days from the deadline when I checked this tool.", author: "Patricia H. — Nashville, TN" },
            { text: "Set reminders on this and forgot about it. Got an email 30 days before my SOL deadline. That email changed everything.", author: "Angelo M. — Las Vegas, NV" },
          ]} />

          <FAQ items={[
            { q: "Can the statute of limitations be extended?", a: "In limited circumstances. Most states allow 'tolling' (pausing the clock) for minors, people declared legally incapacitated, and in some states for late discovery of injuries. Military service can also toll the SOL. An attorney can tell you if any exceptions apply." },
            { q: "Does the SOL apply even if the other driver was clearly at fault?", a: "Yes. The SOL is a procedural deadline, not a judgment about fault. Even with clear-cut liability, missing the SOL typically means your case is dismissed without any recovery." },
            { q: "What happens if I'm in a no-fault state?", a: "No-fault states have their own SOL rules — and in some cases, shorter windows for specific claim types. The calculator uses state-specific data." },
            { q: "If I already settled, does the SOL matter?", a: "If you've signed a release, the SOL is largely irrelevant — the settlement resolves the claim. If you haven't settled and your SOL is approaching, that's urgent." },
            { q: "Does the SOL apply to property damage claims?", a: "Property damage typically has a separate SOL, often different from the personal injury SOL. The calculator shows the personal injury SOL." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="clock" />
      <ExperimentFooter />
    </div>
  );
}
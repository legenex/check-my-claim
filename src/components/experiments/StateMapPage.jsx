import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams, incrementExpViews, incrementExpClicks, buildSurveyUrl } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ, LeadForm } from "./shared/ExperimentLayout";
import SettlementTickerMini from "./shared/SettlementTickerMini";

// Simple SVG US map data (abbreviated state positions)
const STATE_POSITIONS = {
  AL:{x:520,y:310},AK:{x:120,y:400},AZ:{x:170,y:270},AR:{x:480,y:290},CA:{x:100,y:230},
  CO:{x:240,y:230},CT:{x:650,y:150},DE:{x:640,y:180},DC:{x:635,y:190},FL:{x:560,y:360},
  GA:{x:545,y:310},HI:{x:220,y:420},ID:{x:175,y:160},IL:{x:500,y:210},IN:{x:525,y:210},
  IA:{x:460,y:200},KS:{x:390,y:250},KY:{x:530,y:240},LA:{x:470,y:330},ME:{x:680,y:110},
  MD:{x:635,y:185},MA:{x:665,y:140},MI:{x:530,y:170},MN:{x:440,y:155},MS:{x:500,y:320},
  MO:{x:460,y:245},MT:{x:215,y:140},NE:{x:380,y:215},NV:{x:135,y:210},NH:{x:665,y:130},
  NJ:{x:645,y:175},NM:{x:220,y:290},NY:{x:630,y:155},NC:{x:585,y:255},ND:{x:370,y:145},
  OH:{x:555,y:205},OK:{x:390,y:280},OR:{x:115,y:160},PA:{x:610,y:175},RI:{x:665,y:150},
  SC:{x:575,y:275},SD:{x:370,y:175},TN:{x:530,y:265},TX:{x:360,y:330},UT:{x:185,y:220},
  VT:{x:655,y:130},VA:{x:600,y:215},WA:{x:120,y:130},WV:{x:580,y:215},WI:{x:490,y:165},WY:{x:245,y:185}
};

const NEG_RULE_LABELS = {
  pure_comparative: "Pure Comparative",
  modified_50: "Modified 50%",
  modified_51: "Modified 51%",
  contributory_negligence: "Contributory (Harsh)",
};

const NEG_RULE_COLOR = {
  pure_comparative: "#22c55e",
  modified_50: "#3b82f6",
  modified_51: "#f59e0b",
  contributory_negligence: "#ef4444",
};

export default function StateMapPage({ experiment }) {
  const [states, setStates] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [stateDetails, setStateDetails] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [casePosts, setCasePosts] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
    base44.entities.StateMultiplier.list("state_code", 60).then(setStates).catch(() => {});
  }, []);

  // Check URL for /tools/state-map/XX pattern
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length === 2 && lastPart !== "state-map" && lastPart !== "map") {
      handleStateClick(lastPart.toUpperCase());
    }
  }, [states]);

  const handleStateClick = async (code) => {
    setSelected(code);
    setLoadingDetail(true);
    const stateRec = states.find(s => s.state_code === code);
    setStateDetails(stateRec || null);
    const [sett, cases] = await Promise.all([
      base44.entities.SettlementTickerEntry.filter({ state_code: code, is_active: true }, "-display_order", 8).catch(() => []),
      base44.entities.CaseIndexPost.filter({ state_code: code, moderation_status: "approved" }, "-created_date", 5).catch(() => []),
    ]);
    setSettlements(sett);
    setCasePosts(cases);
    setLoadingDetail(false);
    window.history.pushState(null, "", `/tools/state-map/${code}`);
  };

  const backToMap = () => {
    setSelected(null);
    setStateDetails(null);
    window.history.pushState(null, "", `/tools/state-map`);
  };

  const stateMap = {};
  states.forEach(s => { stateMap[s.state_code] = s; });
  const fmt = (n) => "$" + Math.round(n || 0).toLocaleString();

  const handleCTA = async (stateCode) => {
    if (experiment) await incrementExpClicks(experiment, base44).catch(() => {});
    window.open(buildSurveyUrl({ linkId: "link_cta_section", utmMedium: `state-${stateCode}`, utmCampaign: "Experiment" }), "_blank");
  };

  if (selected && stateDetails) {
    return (
      <div className="min-h-screen bg-white">
        <ExperimentHeader experiment={experiment} />
        <DisclaimerStrip text={experiment?.disclaimer_short} />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <button onClick={backToMap} className="flex items-center gap-2 text-[#1e90ff] hover:underline mb-6 text-sm font-semibold">
            ← Back to All States
          </button>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{stateDetails.state_name} Car Accident Claim Rules</h1>
          <p className="text-slate-500 mb-8">State-specific laws that directly affect your settlement value.</p>

          {/* Hero stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Statute of Limitations", val: `${stateDetails.statute_of_limitations_years} year${stateDetails.statute_of_limitations_years !== 1 ? "s" : ""}` },
              { label: "Negligence Rule", val: NEG_RULE_LABELS[stateDetails.comparative_negligence_rule] || stateDetails.comparative_negligence_rule },
              { label: "Non-Economic Cap", val: stateDetails.non_economic_damage_cap ? fmt(stateDetails.non_economic_damage_cap) : "No cap" },
              { label: "Min BI Coverage", val: stateDetails.bodily_injury_minimum ? fmt(stateDetails.bodily_injury_minimum) : "Varies" },
            ].map(({ label, val }) => (
              <div key={label} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-lg font-black text-slate-900">{val}</div>
              </div>
            ))}
          </div>

          {/* Explanation copy */}
          <div className="prose prose-slate max-w-none mb-8">
            <h2>What This Means in Practice for {stateDetails.state_name}</h2>
            <p>With a {stateDetails.statute_of_limitations_years}-year statute of limitations, you have {stateDetails.statute_of_limitations_years === 1 ? "only one year" : `${stateDetails.statute_of_limitations_years} years`} from the date of your accident to file a lawsuit. Missing this deadline permanently eliminates your ability to pursue compensation — no exceptions except in narrow circumstances like minors or late-discovered injuries.</p>
            <p>{stateDetails.comparative_negligence_rule === "contributory_negligence" ? `${stateDetails.state_name} is one of only four states (plus DC) that uses contributory negligence — one of the harshest rules in the country. If you're found even 1% at fault, you receive nothing. This makes attorney representation in ${stateDetails.state_name} especially critical.` :
               stateDetails.comparative_negligence_rule === "pure_comparative" ? `${stateDetails.state_name} uses pure comparative negligence, meaning your recovery is reduced proportionally to your fault percentage. Even if you're 60% at fault, you can still recover 40% of damages. This is relatively favorable for plaintiffs.` :
               `${stateDetails.state_name} uses modified comparative negligence. You can recover damages if you're less than ${stateDetails.comparative_negligence_rule === "modified_50" ? "50" : "51"}% at fault. At the threshold or above, you receive nothing — so fault allocation arguments are especially important here.`}
            </p>
            {stateDetails.non_economic_damage_cap && <p><strong>Important:</strong> {stateDetails.state_name} caps non-economic damages at {fmt(stateDetails.non_economic_damage_cap)}. This directly limits pain and suffering recoveries in your case — a factor that significantly affects settlement math.</p>}
          </div>

          {/* Recent settlements */}
          {settlements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Settlements in {stateDetails.state_name}</h2>
              <div className="space-y-3">
                {settlements.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{s.injury_summary || s.accident_type}</div>
                      <div className="text-xs text-slate-500">{s.accident_type} · {s.months_to_settle} months to settle</div>
                    </div>
                    <div className="text-xl font-black text-green-600">{fmt(s.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case posts */}
          {casePosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{stateDetails.state_name} Community Case Posts</h2>
              <div className="space-y-3">
                {casePosts.map((p, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-sm font-semibold text-slate-800 mb-1">{p.accident_type} · {p.injury_severity_tier}</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{p.story_summary?.slice(0, 200)}{p.story_summary?.length > 200 ? "..." : ""}</p>
                    <div className="flex gap-3 mt-2 text-xs text-slate-500">
                      <span>First offer: {fmt(p.first_offer)}</span>
                      <span>Accepted: {fmt(p.accepted_amount)}</span>
                      <span>{p.had_attorney ? "Had attorney ✓" : "Unrepresented"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-b from-[#dbeafe] to-[#bfdbfe] py-10 px-6 text-center rounded-2xl">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Connect with a Vetted Attorney in {stateDetails.state_name} — Free</h2>
            <p className="text-slate-600 mb-5">They know {stateDetails.state_name}'s rules, caps, and negligence calculations. Free 20-minute review.</p>
            <button onClick={() => handleCTA(selected)} className="bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all">Start Free Review →</button>
          </div>
        </div>
        <ExperimentFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short} />

      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "Your State's Claim Rules — Decoded."}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Hover any state for a quick summary. Click to see full rules, recent settlements, and what it means for your case."}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {Object.entries(NEG_RULE_LABELS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs font-semibold">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NEG_RULE_COLOR[k] }} />
              {v}
            </div>
          ))}
        </div>

        {/* SVG Map */}
        <div className="relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-4" style={{ height: "480px" }}>
          <svg viewBox="80 100 620 360" className="w-full h-full">
            {Object.entries(STATE_POSITIONS).map(([code, pos]) => {
              const stateRec = stateMap[code];
              const color = stateRec ? (NEG_RULE_COLOR[stateRec.comparative_negligence_rule] || "#94a3b8") : "#e2e8f0";
              const isHovered = hovered === code;
              return (
                <g key={code}
                  onMouseEnter={() => setHovered(code)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleStateClick(code)}
                  className="cursor-pointer">
                  <circle cx={pos.x} cy={pos.y} r={isHovered ? 14 : 11}
                    fill={color} fillOpacity={isHovered ? 1 : 0.75}
                    stroke={isHovered ? "#1e293b" : "#fff"} strokeWidth={isHovered ? 2 : 1}
                    style={{ transition: "all 0.15s" }} />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="6" fill="white" fontWeight="bold" pointerEvents="none">{code}</text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hovered && stateMap[hovered] && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-48 pointer-events-none z-10">
              <div className="font-bold text-slate-900">{stateMap[hovered].state_name}</div>
              <div className="text-xs text-slate-500 mt-1">SOL: {stateMap[hovered].statute_of_limitations_years} year{stateMap[hovered].statute_of_limitations_years !== 1 ? "s" : ""}</div>
              <div className="text-xs text-slate-500">{NEG_RULE_LABELS[stateMap[hovered].comparative_negligence_rule]}</div>
              {stateMap[hovered].non_economic_damage_cap && <div className="text-xs text-amber-600">Cap: ${stateMap[hovered].non_economic_damage_cap.toLocaleString()}</div>}
              <div className="text-xs text-[#1e90ff] mt-1 font-semibold">Click for full details →</div>
            </div>
          )}
        </div>

        {/* State cards list */}
        <div className="grid md:grid-cols-3 gap-3 mb-12">
          {states.slice(0, 12).map(s => (
            <button key={s.state_code} onClick={() => handleStateClick(s.state_code)}
              className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-[#1e90ff] hover:shadow transition-all group">
              <div className="font-bold text-slate-900 group-hover:text-[#1e90ff]">{s.state_name}</div>
              <div className="text-xs text-slate-500 mt-1">SOL: {s.statute_of_limitations_years}yr · {NEG_RULE_LABELS[s.comparative_negligence_rule]}</div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <HowItWorks steps={[
            { icon: "🗺️", title: "Hover any state", desc: "See SOL, negligence rule, and caps at a glance." },
            { icon: "🖱️", title: "Click for details", desc: "Full breakdown of what each rule means for your claim." },
            { icon: "📊", title: "See local settlements", desc: "Real settlement data filtered by state." },
            { icon: "⚖️", title: "Connect locally", desc: "Vetted attorneys who know your state's rules." },
          ]} />

          <Testimonials quotes={[
            { text: "I didn't know Maryland was a contributory state. One 'sorry' at the scene and I had zero claim. This map would have changed everything.", author: "Denise W. — Baltimore, MD" },
            { text: "Clicked my state and saw the 2-year SOL. I was at 22 months. Called an attorney that afternoon.", author: "Kevin T. — Boston, MA" },
            { text: "The Florida modified comparative rule was key. The adjuster kept saying I was 20% at fault. I now know that still means I get 80% of damages.", author: "Carmen R. — Miami, FL" },
          ]} />

          <FAQ items={[
            { q: "What is contributory negligence?", a: "In contributory negligence states (MD, VA, NC, AL, DC), if you are found even 1% at fault for the accident, you may be barred from recovering any damages. It's the harshest system and makes attorney representation especially critical." },
            { q: "What is modified comparative negligence?", a: "In modified comparative negligence states, you can recover damages only if you're less than 50% or 51% at fault (depending on the state). Your recovery is reduced by your percentage of fault." },
            { q: "What is pure comparative negligence?", a: "In pure comparative negligence states, you can recover damages regardless of your percentage of fault. Even if you're 90% at fault, you can recover 10% of damages." },
            { q: "What does the non-economic cap mean?", a: "Some states cap how much you can receive for pain and suffering, emotional distress, and loss of enjoyment of life. The cap doesn't apply to economic damages (medical bills, lost wages). This significantly affects settlement math for serious injuries." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="state-map" />
      <ExperimentFooter />
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl, captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ, LeadForm } from "./shared/ExperimentLayout";
import { Send } from "lucide-react";

const SCENARIOS = [
  { id: "rear_end_tx", label: "Rear-end with Whiplash", state: "TX", icon: "🚗", desc: "Brad from State Farm calls 3 days after your rear-end collision. You have whiplash and missed a week of work.", adjuster: "Brad from State Farm Claims", offer_start: 4500, fair_value: 35000 },
  { id: "t_bone_fl", label: "T-Bone with Fracture", state: "FL", icon: "💥", desc: "Lisa from Geico calls after your T-bone. You broke your collarbone. Surgery scheduled next week.", adjuster: "Lisa from Geico Claims", offer_start: 12000, fair_value: 85000 },
  { id: "rideshare_ca", label: "Rideshare Passenger", state: "CA", icon: "🚕", desc: "Mike from Lyft's TPA calls. You were a passenger during an Uber ride when the driver ran a red light.", adjuster: "Mike from Lyft Claims (Third Party)", offer_start: 7500, fair_value: 55000 },
  { id: "pedestrian_ny", label: "Pedestrian Hit", state: "NY", icon: "🚶", desc: "Sandra from Allstate calls about the crosswalk accident. Your leg fracture required surgery.", adjuster: "Sandra from Allstate Claims", offer_start: 22000, fair_value: 145000 },
];

const INITIAL_MESSAGES = {
  rear_end_tx: "Hi there, this is Brad calling from State Farm Claims. How are you feeling today? I'm reaching out about the accident on Route 35 last Tuesday. I just wanted to check in and let you know we're here to help get this resolved quickly for you.",
  t_bone_fl: "Hi, this is Lisa from Geico Claims. I hope you're doing okay — I saw in the file that you've had a tough few weeks. I'm actually calling because I want to help get this wrapped up for you so you can focus on your recovery. Do you have a few minutes?",
  rideshare_ca: "Hello, this is Mike calling from the TPA handling Lyft's insurance matters. I understand you were involved in an incident last month. I want to make sure you're taken care of. Can you tell me how you're doing right now?",
  pedestrian_ny: "Good afternoon, this is Sandra from Allstate. I'm the adjuster assigned to your claim. I just want to say — we take these situations very seriously and we want to resolve this fairly. How have you been since the accident?",
};

const MISTAKE_SIGNALS = ["i'm fine", "i feel okay", "not too bad", "doing alright", "yes you can record", "i accept", "sounds fair", "i just want this over", "i agree", "that works"];

export default function AdjusterSimulatorPage({ experiment }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [totalMoneyLost, setTotalMoneyLost] = useState(0);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [sessionId] = useState(() => "sim_" + Math.random().toString(36).substr(2, 12));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startScenario = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentOffer(scenario.offer_start);
    setMessages([{ role: "adjuster", content: INITIAL_MESSAGES[scenario.id] }]);
    setTurnCount(0);
    setTotalMoneyLost(0);
    setMistakes([]);
    setGameOver(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    // Detect mistakes
    const lowerInput = input.toLowerCase();
    const detectedMistake = MISTAKE_SIGNALS.find(s => lowerInput.includes(s));

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${selectedScenario.adjuster}, an insurance claims adjuster handling a personal injury claim. Your current settlement offer is $${currentOffer.toLocaleString()}. The fair case value is $${selectedScenario.fair_value.toLocaleString()} but you'll never admit that.

Your tactics:
- Start with false warmth and rapport
- Ask how they're feeling (hoping for "I'm fine" which damages their claim)
- Try to get a recorded statement early
- Use time pressure ("I have to close this file by Friday")
- Anchor low and act like you're being generous
- Never be aggressive — be charming, professional, sympathetic
- Reference paperwork, policy limits, or comparative negligence to justify low offers

The claimant just said: "${userMsg.content}"

Respond in character as the adjuster (2-3 sentences max). Then on a new line add:
SCORE_NOTE: [explain in ONE sentence what strategic impact this response had, positive or negative, e.g. "Saying you're 'fine' signals low injury severity to adjusters — this costs you leverage."]
MONEY_IMPACT: [integer, negative if user made a mistake, e.g. -8200 or 0 or +500 if they pushed back well]`,
        model: "claude_sonnet_4_6",
      });

      const fullReply = typeof res === "string" ? res : (res?.text || res?.content || JSON.stringify(res));
      const [adjReply, ...rest] = fullReply.split("\nSCORE_NOTE:");
      const scoreNote = rest.join("").split("\nMONEY_IMPACT:")[0]?.trim() || "";
      const moneyImpactStr = fullReply.match(/MONEY_IMPACT:\s*(-?\d+)/)?.[1] || "0";
      const moneyImpact = parseInt(moneyImpactStr, 10) || 0;

      setMessages(prev => [...prev, { role: "adjuster", content: adjReply.trim(), scoreNote, moneyImpact }]);
      if (moneyImpact < 0) {
        setTotalMoneyLost(m => m + Math.abs(moneyImpact));
        setMistakes(prev => [...prev, { turn: newTurn, text: userMsg.content.slice(0, 60), impact: moneyImpact, note: scoreNote }]);
      }
      if (moneyImpact > 0) setCurrentOffer(o => Math.min(o + moneyImpact, selectedScenario.fair_value));

      if (newTurn >= 7) setTimeout(() => setGameOver(true), 1000);
    } catch {
      setMessages(prev => [...prev, { role: "adjuster", content: "I need to step away briefly — I'll call you right back.", scoreNote: "", moneyImpact: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSave = async (form) => {
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    await base44.entities.AdjusterSimulationSession.create({
      session_id: sessionId,
      scenario_id: selectedScenario?.id,
      adjuster_name: selectedScenario?.adjuster,
      transcript: messages.map(m => `${m.role}: ${m.content}`).join("\n\n"),
      mistakes_made: mistakes,
      total_money_lost: totalMoneyLost,
      final_offer: currentOffer,
      estimated_fair_value: selectedScenario?.fair_value,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "simulator",
      utm_campaign: stored("utm_campaign") || "Experiment",
      status: "completed",
    }).catch(() => {});
    if (experiment) await base44.entities.Experiment.update(experiment.id, { submissions: (experiment.submissions || 0) + 1 }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short || "Simulation only — not legal advice. AI adjuster personas are fictional."} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "Could You Beat the Adjuster?"}
          </h1>
          <p className="text-slate-300 text-xl mb-8">{experiment?.hero_subheadline || "Step into a live simulation with a real insurance adjuster persona. See exactly how they minimize your claim — turn by turn."}</p>
        </div>
      </div>

      {/* Tool */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {!selectedScenario ? (
          <>
            <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Pick Your Scenario</h2>
            <p className="text-slate-500 text-center mb-8">Each scenario is based on real adjuster call patterns. Choose your situation.</p>
            <div className="grid md:grid-cols-2 gap-5">
              {SCENARIOS.map(s => (
                <button key={s.id} onClick={() => startScenario(s)}
                  className="text-left p-6 rounded-2xl border-2 border-slate-200 hover:border-[#1e90ff] hover:shadow-lg transition-all bg-white group">
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <div className="font-bold text-slate-900 text-lg mb-1 group-hover:text-[#1e90ff]">{s.label}</div>
                  <div className="text-sm text-slate-500 mb-3">{s.desc}</div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{s.state}</span>
                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">Opens at {("$" + s.offer_start.toLocaleString())}</span>
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Fair value {("$" + s.fair_value.toLocaleString())}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : gameOver ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 rounded-2xl p-8 text-center mb-6">
              <div className="text-5xl mb-3">📋</div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Simulation Complete</h2>
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Adjuster's Final Offer</div>
                  <div className="text-3xl font-black text-orange-400">${currentOffer.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Estimated Fair Value</div>
                  <div className="text-3xl font-black text-green-400">${selectedScenario.fair_value.toLocaleString()}</div>
                </div>
              </div>
              {totalMoneyLost > 0 && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-4 text-left">
                  <div className="text-red-400 font-bold mb-2">You lost ${totalMoneyLost.toLocaleString()} through these moves:</div>
                  {mistakes.map((m, i) => (
                    <div key={i} className="text-xs text-slate-300 mb-1">• "{m.text}..." — {m.note}</div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => startScenario(selectedScenario)} className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20">Replay</button>
                <button onClick={() => setSelectedScenario(null)} className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20">Try Another Scenario</button>
              </div>
            </div>
            <LeadForm
              headline="Want a Real Attorney to Handle the Actual Call — Free?"
              subtext="A vetted attorney will negotiate on your behalf. They know every tactic in this simulation and they don't flinch."
              experiment={experiment}
              utmMedium={experiment?.utm_medium_label || "simulator"}
              utmContent="lead_captured"
              onSuccess={handleLeadSave}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Chat */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {selectedScenario.adjuster[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedScenario.adjuster}</div>
                  <div className="text-xs text-green-600 font-semibold">● On the call</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 h-80 overflow-y-auto space-y-3 mb-3">
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-[#1e90ff] text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
                        {msg.content}
                      </div>
                    </div>
                    {msg.scoreNote && (
                      <div className={`mt-1 px-3 py-1.5 rounded-xl text-xs ${msg.moneyImpact < 0 ? "bg-red-50 text-red-600" : msg.moneyImpact > 0 ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                        {msg.moneyImpact < 0 ? `⚠ Cost you ~$${Math.abs(msg.moneyImpact).toLocaleString()}: ` : msg.moneyImpact > 0 ? `✓ Good move +$${msg.moneyImpact.toLocaleString()}: ` : ""}
                        {msg.scoreNote}
                      </div>
                    )}
                  </div>
                ))}
                {loading && <div className="flex gap-1 p-3"><span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" /><span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} /></div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="What do you say to the adjuster?" disabled={loading}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1e90ff] text-sm" />
                <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-3 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Turn {turnCount} of 7 — simulation ends after turn 7.</p>
            </div>
            {/* Score panel */}
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5">
                <div className="text-xs text-slate-400 mb-1">Current Offer</div>
                <div className="text-3xl font-black text-orange-400">${currentOffer.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">Started at ${selectedScenario.offer_start.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 text-white rounded-2xl p-5">
                <div className="text-xs text-slate-400 mb-1">Fair Value</div>
                <div className="text-3xl font-black text-green-400">${selectedScenario.fair_value.toLocaleString()}</div>
              </div>
              {totalMoneyLost > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <div className="text-xs text-red-600 mb-1 font-bold">Leverage Lost So Far</div>
                  <div className="text-2xl font-black text-red-600">${totalMoneyLost.toLocaleString()}</div>
                  <div className="text-xs text-red-400 mt-1">{mistakes.length} mistake{mistakes.length !== 1 ? "s" : ""} flagged</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content below tool */}
        <div className="mt-16">
          <HowItWorks steps={[
            { icon: "🎭", title: "Pick a scenario", desc: "4 real-world adjuster call situations to choose from." },
            { icon: "💬", title: "Have the conversation", desc: "Type what you'd actually say to a claims adjuster." },
            { icon: "📊", title: "See the score", desc: "Each response is scored for leverage gained or lost." },
            { icon: "🎓", title: "Learn the tactics", desc: "Understand how adjusters use every word against you." },
          ]} />

          <div className="py-14 bg-white max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Why This Simulation Is Realistic</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">The "How Are You Feeling?" Trap</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Adjusters open almost every call by asking how you're doing. When you say "fine" or "okay," that goes into the file as evidence that your injuries are minor. It doesn't matter that you said it out of politeness. Never describe your health status on a recorded call.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">The Recorded Statement Gambit</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Insurers have a legal right to record calls in many states, but they often ask as if your permission is required — and they use that request to make you feel obligated. What they really want is you on record saying something inconsistent with your medical records.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">The Anchoring Strategy</h3>
                <p className="text-slate-600 text-sm leading-relaxed">The first number out of an adjuster's mouth becomes the psychological anchor for the entire negotiation. A $4,500 opening offer on a $35,000 case sounds insulting — but if you negotiate from $4,500 instead of $35,000, you've already lost.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Time Pressure Is a Fabrication</h3>
                <p className="text-slate-600 text-sm leading-relaxed">"I need to close this by Friday" is almost never true. File close deadlines are internal administrative targets, not legal requirements. Never let artificial urgency push you into a settlement you haven't fully evaluated.</p>
              </div>
            </div>
          </div>

          <Testimonials quotes={[
            { text: "I said 'I'm doing okay' in my first call. This simulator taught me why that was a $15,000 mistake. Got an attorney. Different outcome entirely.", author: "Jennifer K. — Austin, TX" },
            { text: "The adjuster in this sim used EXACTLY the same line my real adjuster used. Word for word. This is not a game — this is real.", author: "Carlos V. — Miami, FL" },
            { text: "Played the pedestrian scenario three times before I stopped making mistakes. By the third run I finally understood what they were doing.", author: "Rachel M. — New York, NY" },
          ]} />

          <FAQ items={[
            { q: "Is this how real adjusters actually talk?", a: "Yes. The personas are trained on documented adjuster tactics from consumer advocacy research, deposition transcripts, and public insurance training materials. The warmth and charm are intentional — aggressive adjusters are a myth designed to make you lower your guard." },
            { q: "What does 'leverage' mean in this context?", a: "Leverage is your ability to credibly threaten to sue or reject a settlement. Every admission you make about your health, your desire to settle quickly, or your uncertainty about fault reduces that leverage — and adjusters are trained to reduce it." },
            { q: "Should I talk to the insurance company at all?", a: "Briefly, to report the claim — yes. For any substantive discussion about your injuries, your version of events, or settlement numbers — no. That's what your attorney is for." },
            { q: "Is this free?", a: "Yes. The simulation is completely free. Connecting with an attorney is also free — they work on contingency, so there's no upfront cost." },
            { q: "Does the AI save my conversation?", a: "We store aggregate simulation data to improve the tool. No conversation is linked to your identity unless you choose to submit your information to connect with an attorney." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="simulator" />
      <ExperimentFooter />
    </div>
  );
}
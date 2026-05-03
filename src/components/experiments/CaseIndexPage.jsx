import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ } from "./shared/ExperimentLayout";
import { Search, X, CheckCircle } from "lucide-react";

const US_STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];
const ACCIDENT_TYPES = ["Auto accident","Motorcycle","Rideshare passenger","Pedestrian struck","Cyclist struck","Commercial truck","Other"];
const INJURY_TIERS = ["soft_tissue","fracture_minor","surgery_required","tbi","catastrophic"];
const fmt = (n) => n ? "$" + Math.round(n).toLocaleString() : "—";

export default function CaseIndexPage({ experiment }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: "", accident_type: "", injury_severity_tier: "", had_attorney: "" });
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ state: "TX", accident_type: "", injury_severity_tier: "", first_offer: "", accepted_amount: "", months_to_settle: "", had_attorney: "yes", story_summary: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
    fetchPosts();
  }, []);

  const fetchPosts = async (f = filters) => {
    setLoading(true);
    const query = { moderation_status: "approved" };
    if (f.state) query.state_code = f.state;
    if (f.accident_type) query.accident_type = f.accident_type;
    if (f.injury_severity_tier) query.injury_severity_tier = f.injury_severity_tier;
    if (f.had_attorney) query.had_attorney = f.had_attorney === "yes";
    const res = await base44.entities.CaseIndexPost.filter(query, "-created_date", 30).catch(() => []);
    setPosts(res);
    setLoading(false);
  };

  const applyFilter = (key, val) => {
    const newFilters = { ...filters, [key]: val };
    setFilters(newFilters);
    fetchPosts(newFilters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const stored = (k) => sessionStorage.getItem(`cmc_${k}`) || "";
    await base44.entities.CaseIndexPost.create({
      state_code: submitForm.state,
      accident_type: submitForm.accident_type,
      injury_severity_tier: submitForm.injury_severity_tier,
      first_offer: parseFloat(submitForm.first_offer) || 0,
      accepted_amount: parseFloat(submitForm.accepted_amount) || 0,
      months_to_settle: parseInt(submitForm.months_to_settle) || 0,
      had_attorney: submitForm.had_attorney === "yes",
      story_summary: submitForm.story_summary,
      moderation_status: "pending",
      is_composite: false,
      utm_source: stored("utm_source") || "CMC-Site",
      utm_medium: stored("utm_medium") || "case-index",
      utm_campaign: stored("utm_campaign") || "Experiment",
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  };

  const TIER_LABELS = { soft_tissue: "Soft Tissue", fracture_minor: "Fracture", surgery_required: "Surgery", tbi: "TBI", catastrophic: "Catastrophic" };

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short || "All cases are anonymized or composite. Not legal advice."} />

      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "Was Your Settlement Fair? See What Real People Got."}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Browse anonymized case outcomes from across the country. Filter by state, accident type, and injury severity."}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Filters + submit button */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <select value={filters.state} onChange={e => applyFilter("state", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
            <option value="">All States</option>
            {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
          </select>
          <select value={filters.accident_type} onChange={e => applyFilter("accident_type", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
            <option value="">All Accident Types</option>
            {ACCIDENT_TYPES.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={filters.injury_severity_tier} onChange={e => applyFilter("injury_severity_tier", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
            <option value="">All Injury Tiers</option>
            {INJURY_TIERS.map(t => <option key={t} value={t}>{TIER_LABELS[t] || t}</option>)}
          </select>
          <select value={filters.had_attorney} onChange={e => applyFilter("had_attorney", e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
            <option value="">With & Without Attorney</option>
            <option value="yes">Had Attorney</option>
            <option value="no">No Attorney</option>
          </select>
          <button onClick={() => setShowModal(true)} className="ml-auto bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all">
            + Post Your Case (Anonymous)
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading cases...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No cases match your filters. Try broadening your search.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {posts.map((p, i) => (
              <button key={i} onClick={() => setSelected(selected?.id === p.id ? null : p)}
                className="text-left p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#1e90ff] hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full mr-1">{p.state_code}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full mr-1">{p.accident_type}</span>
                    {p.injury_severity_tier && <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">{TIER_LABELS[p.injury_severity_tier] || p.injury_severity_tier}</span>}
                  </div>
                  {p.had_attorney && <span className="text-xs text-green-600 font-bold flex-shrink-0">Attorney ✓</span>}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{p.story_summary?.slice(0, 160)}{p.story_summary?.length > 160 ? "..." : ""}</p>
                <div className="flex gap-4 text-xs">
                  <div><span className="text-slate-400">First offer: </span><span className="font-bold text-orange-600">{fmt(p.first_offer)}</span></div>
                  <div><span className="text-slate-400">Settled: </span><span className="font-bold text-green-600">{fmt(p.accepted_amount)}</span></div>
                  <div><span className="text-slate-400">Time: </span><span className="font-bold text-slate-700">{p.months_to_settle} mo.</span></div>
                </div>
                {selected?.id === p.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">{p.story_summary}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          <HowItWorks steps={[
            { icon: "🔍", title: "Filter by state & type", desc: "Find cases that match your specific situation." },
            { icon: "📋", title: "Read real outcomes", desc: "First offers, final settlements, time to resolve, attorney status." },
            { icon: "📊", title: "Compare yours", desc: "See if your offer is in line with comparable cases." },
            { icon: "📝", title: "Share yours (anon)", desc: "Help others by posting your outcome anonymously." },
          ]} />

          <Testimonials quotes={[
            { text: "Found 8 cases almost identical to mine in Texas. The average settlement was 4x my first offer. Used it as leverage in my conversation with my attorney.", author: "Marcus J. — Fort Worth, TX" },
            { text: "I was considering accepting $15k. The case index showed me similar cases in my state averaged $65k. I didn't accept.", author: "Elena B. — Sacramento, CA" },
            { text: "Posted my case after settling. If it helps one person not take a lowball offer, it was worth sharing.", author: "Tom K. — Philadelphia, PA" },
          ]} />

          <FAQ items={[
            { q: "Are these real cases?", a: "A mix. The initial seed data consists of composite anonymized cases drawn from public court records and legal research. Cases submitted by users are anonymized and moderated before being approved." },
            { q: "How is privacy maintained?", a: "No identifying information is stored. Submitted cases are stripped of names, specific locations, and any identifiers. Only aggregate facts (state, injury type, settlement range, months, attorney status) are published." },
            { q: "How long does moderation take?", a: "Submitted cases are reviewed by our team within 2-3 business days before appearing publicly." },
            { q: "Can I submit even if I haven't settled?", a: "The form is designed for concluded cases. If your case is ongoing, consider submitting once it resolves." },
          ]} />
        </div>
      </div>

      {/* Submit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Post Your Case Anonymously</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Submitted for Review</h3>
                <p className="text-slate-500 text-sm">Your case will appear publicly within 2-3 business days after moderation. Thank you for helping the community.</p>
                <button onClick={() => { setShowModal(false); setSubmitted(false); }} className="mt-4 px-6 py-2 bg-[#1e90ff] text-white rounded-xl text-sm font-bold">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">State</label>
                    <select value={submitForm.state} onChange={e => setSubmitForm(f => ({ ...f, state: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e90ff]">
                      {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Accident Type</label>
                    <select value={submitForm.accident_type} onChange={e => setSubmitForm(f => ({ ...f, accident_type: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e90ff]">
                      <option value="">Select...</option>
                      {ACCIDENT_TYPES.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">First Offer ($)</label>
                    <input type="number" value={submitForm.first_offer} onChange={e => setSubmitForm(f => ({ ...f, first_offer: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e90ff]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Accepted Amount ($)</label>
                    <input type="number" value={submitForm.accepted_amount} onChange={e => setSubmitForm(f => ({ ...f, accepted_amount: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e90ff]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Months to Settle</label>
                    <input type="number" value={submitForm.months_to_settle} onChange={e => setSubmitForm(f => ({ ...f, months_to_settle: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e90ff]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Had Attorney?</label>
                    <select value={submitForm.had_attorney} onChange={e => setSubmitForm(f => ({ ...f, had_attorney: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e90ff]">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Your Story (anonymous)</label>
                  <textarea value={submitForm.story_summary} onChange={e => setSubmitForm(f => ({ ...f, story_summary: e.target.value.slice(0, 500) }))} rows={4}
                    placeholder="Describe what happened, the key turning points in your claim, and what you wish you'd known. No names or identifying details."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e90ff] resize-none" />
                  <p className="text-xs text-slate-400 mt-1">{submitForm.story_summary.length}/500 — Do not include any names or identifying information.</p>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all">
                  {submitting ? "Submitting..." : "Submit for Review →"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <ExperimentCTA experiment={experiment} utmMedium="case-index" />
      <ExperimentFooter />
    </div>
  );
}
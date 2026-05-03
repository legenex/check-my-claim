import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams, incrementExpViews, incrementExpClicks } from "@/lib/surveyUrl";
import { ExperimentHeader, DisclaimerStrip, ExperimentCTA, ExperimentFooter, HowItWorks, Testimonials, FAQ } from "./shared/ExperimentLayout";
import { Copy, CheckCircle } from "lucide-react";

const US_STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];
const ACCIDENT_TYPES = ["Auto accident","Motorcycle","Rideshare passenger","Pedestrian struck","Cyclist struck","Commercial truck","Other"];

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString();

function ScrollingTicker({ entries }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.5;
    const animate = () => {
      pos += speed;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [entries]);

  const doubled = [...entries, ...entries];

  return (
    <div className="bg-[#0a1628] py-4 overflow-hidden border-y border-white/10">
      <div ref={ref} className="flex gap-4 overflow-hidden whitespace-nowrap" style={{ scrollBehavior: "auto" }}>
        {doubled.map((e, i) => (
          <div key={i} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl px-5 py-3 inline-flex items-center gap-4 min-w-64">
            <div className="text-2xl font-black text-green-400">{fmt(e.amount)}</div>
            <div>
              <div className="text-xs font-bold text-white">{e.state_code} · {e.accident_type}</div>
              <div className="text-xs text-slate-400">{e.injury_summary}</div>
              <div className="text-xs text-slate-500">{e.months_to_settle} mo. to settle</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettlementTickerPage({ experiment }) {
  const [allEntries, setAllEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ state: "", accident_type: "", injury_severity_tier: "" });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const PER_PAGE = 12;

  useEffect(() => {
    captureIncomingParams();
    if (experiment) incrementExpViews(experiment, base44);
    base44.entities.SettlementTickerEntry.filter({ is_active: true }, "display_order", 100).then(entries => {
      setAllEntries(entries);
      setFiltered(entries);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    let res = allEntries;
    if (newFilters.state) res = res.filter(e => e.state_code === newFilters.state);
    if (newFilters.accident_type) res = res.filter(e => e.accident_type === newFilters.accident_type);
    if (newFilters.injury_severity_tier) res = res.filter(e => e.injury_severity_tier === newFilters.injury_severity_tier);
    setFiltered(res);
    setPage(0);
  };

  const totalAmount = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const avgAmount = filtered.length ? Math.round(totalAmount / filtered.length) : 0;
  const avgMonths = filtered.length ? Math.round(filtered.reduce((s, e) => s + (e.months_to_settle || 0), 0) / filtered.length) : 0;

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const embedCode = `<script src="https://checkmyclaim.co/embed/ticker.js" data-widget="settlement-ticker" data-count="10"></script>`;
  const copyEmbed = () => { navigator.clipboard.writeText(embedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-white">
      <ExperimentHeader experiment={experiment} />
      <DisclaimerStrip text={experiment?.disclaimer_short || "All settlements are anonymized or composite. Past results do not predict future outcomes."} />

      <div className="bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {experiment?.hero_headline || "The Recent Wins Index"}
          </h1>
          <p className="text-slate-300 text-xl">{experiment?.hero_subheadline || "Real settlement outcomes from accident victims across the country. Anonymized, verified, and updated regularly."}</p>
        </div>
      </div>

      {/* Live ticker */}
      {allEntries.length > 0 && <ScrollingTicker entries={allEntries.slice(0, 20)} />}

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Aggregate stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Shown", val: fmt(totalAmount) },
            { label: "Average Settlement", val: fmt(avgAmount) },
            { label: "Avg. Months to Settle", val: `${avgMonths} mo.` },
            { label: "Cases in Index", val: filtered.length.toLocaleString() },
          ].map(({ label, val }) => (
            <div key={label} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{label}</div>
              <div className="text-2xl font-black text-slate-900">{val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filters.state} onChange={e => applyFilters({ ...filters, state: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
            <option value="">All States</option>
            {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
          </select>
          <select value={filters.accident_type} onChange={e => applyFilters({ ...filters, accident_type: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
            <option value="">All Accident Types</option>
            {ACCIDENT_TYPES.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={filters.injury_severity_tier} onChange={e => applyFilters({ ...filters, injury_severity_tier: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#1e90ff]">
            <option value="">All Injury Types</option>
            {["soft_tissue","fracture_minor","surgery_required","tbi","catastrophic"].map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          {(filters.state || filters.accident_type || filters.injury_severity_tier) && (
            <button onClick={() => applyFilters({ state: "", accident_type: "", injury_severity_tier: "" })}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2 border border-slate-200 rounded-xl">Clear filters</button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading settlements...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {paginated.map((e, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="text-3xl font-black text-green-600 mb-2">{fmt(e.amount)}</div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">{e.state_code}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">{e.accident_type}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-2">{e.injury_summary}</p>
                  <div className="text-xs text-slate-400">{e.months_to_settle} months to resolve</div>
                </div>
              ))}
            </div>

            {filtered.length > PER_PAGE && (
              <div className="flex justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40 hover:border-[#1e90ff] transition-colors">← Prev</button>
                <span className="px-4 py-2 text-sm text-slate-500">Page {page + 1} of {Math.ceil(filtered.length / PER_PAGE)}</span>
                <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PER_PAGE) - 1, p + 1))} disabled={page >= Math.ceil(filtered.length / PER_PAGE) - 1}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40 hover:border-[#1e90ff] transition-colors">Next →</button>
              </div>
            )}
          </>
        )}

        {/* Embed widget */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-2">Embed the Live Ticker on Your Site</h3>
          <p className="text-slate-500 text-sm mb-3">Add the scrolling wins ticker to any website with one line of code.</p>
          <div className="flex gap-2">
            <code className="flex-1 bg-slate-800 text-green-400 text-xs px-4 py-3 rounded-xl font-mono overflow-x-auto">{embedCode}</code>
            <button onClick={copyEmbed} className="flex-shrink-0 flex items-center gap-1.5 bg-[#1e90ff] text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="mt-16">
          <HowItWorks steps={[
            { icon: "📡", title: "Live-feeling ticker", desc: "Scrolling display of recent settlement outcomes." },
            { icon: "🔍", title: "Filter by case type", desc: "Find settlements that match your specific situation." },
            { icon: "📊", title: "See aggregate stats", desc: "Average settlement, months to resolve, total recovered." },
            { icon: "🔗", title: "Embed anywhere", desc: "Add the ticker to your site with one line of code." },
          ]} />

          <div className="py-14 max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Methodology and Disclosure</h2>
            <p className="text-slate-600 leading-relaxed">All settlement data displayed in the Recent Wins Index is either composite (aggregated from public court records and legal industry data, anonymized to remove all individual identifiers) or submitted by users who have chosen to share their anonymized outcomes. No settlement amount is linked to any identifiable individual.</p>
            <p className="text-slate-600 leading-relaxed mt-3">Past settlement outcomes do not predict or guarantee future results. Settlement values are affected by hundreds of case-specific variables including insurance coverage limits, jurisdiction, comparative negligence determination, quality of medical documentation, and many others. The data shown is provided for educational and comparative purposes only.</p>
          </div>

          <Testimonials quotes={[
            { text: "Saw that similar cases in my state averaged $180k. My adjuster was offering $40k. The context changed everything.", author: "Rachel T. — Houston, TX" },
            { text: "Used the ticker to show my husband why we needed an attorney. The numbers speak for themselves.", author: "Diana M. — Portland, OR" },
            { text: "Embedded this on my firm's website. Clients find it immediately and it sets realistic expectations before their first consultation.", author: "James A. — Miami, FL" },
          ]} />

          <FAQ items={[
            { q: "How often is the data updated?", a: "New composite entries are added monthly. User-submitted cases are added within 2-3 business days of moderation approval." },
            { q: "Are these real settlement amounts?", a: "The data is either composite (real data aggregated and anonymized from public sources) or user-submitted. All personally identifiable information is removed before publication." },
            { q: "Why do amounts vary so much?", a: "Settlement values depend on dozens of variables: severity of injuries, insurance policy limits, state laws, quality of documentation, and whether the claimant had attorney representation. The index lets you filter for cases most similar to yours." },
            { q: "Can I submit my own settlement?", a: "Yes — visit the Case Index (/community/case-index) to submit your outcome anonymously. It helps other claimants benchmark their situations." },
          ]} />
        </div>
      </div>

      <ExperimentCTA experiment={experiment} utmMedium="recent-wins" />
      <ExperimentFooter />
    </div>
  );
}
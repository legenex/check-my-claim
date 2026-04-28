import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ComplianceBanner from "@/components/signals/ComplianceBanner";
import { ArrowLeft, Download, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function SignalDetail({ id }) {
  const [signal, setSignal] = useState(null);
  const [rawSignal, setRawSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSignal();
  }, [id]);

  const fetchSignal = async () => {
    try {
      // In real implementation: fetch by ID
      // const scored = await base44.entities.ScoredSignal.get(id);
      // const raw = await base44.entities.RawSignal.get(scored.raw_signal_id);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching signal:', err);
      setLoading(false);
    }
  };

  const generateBrief = async () => {
    setGenerating(true);
    try {
      // Call generateSignalBrief function
      // const brief = await base44.functions.invoke('generateSignalBrief', { signal_id: id });
      // Redirect to brief detail
    } catch (err) {
      console.error('Error generating brief:', err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadTargetingCSV = () => {
    // Generate Meta Ads CSV format: country, postal_code, state
    const csv = 'country,postal_code,state\n' +
      (signal?.recommended_geo_targeting || [])
        .map(zip => `US,${zip},${signal.recommended_demographic_targeting?.state || 'US'}`)
        .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signal-${id}-meta-targeting.csv`;
    a.click();
  };

  if (loading) return <AdminLayout title="Loading..."><ComplianceBanner /><div className="text-center py-8 text-slate-400">Loading signal...</div></AdminLayout>;
  if (!signal) return <AdminLayout title="Not Found"><ComplianceBanner /><div className="text-center py-8 text-slate-400">Signal not found.</div></AdminLayout>;

  return (
    <AdminLayout title="Signal Detail" breadcrumbs={[
      { label: "Admin", href: "/admin" },
      { label: "Signal Engine", href: "/admin/signals" },
      { label: "Detail" }
    ]}>
      <ComplianceBanner />

      <Link to="/admin/signals" className="flex items-center gap-2 text-[#1e90ff] hover:underline mb-6 text-sm font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Back to Signals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Overview */}
          <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">{signal?.brief_summary}</h2>
            <p className="text-slate-300 mb-4">{rawSignal?.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#0a1628] p-3 rounded-lg">
                <div className="text-slate-400 text-xs mb-1">Event Type</div>
                <div className="text-white font-semibold">{rawSignal?.event_type}</div>
              </div>
              <div className="bg-[#0a1628] p-3 rounded-lg">
                <div className="text-slate-400 text-xs mb-1">Affected States</div>
                <div className="text-white font-semibold">{rawSignal?.affected_states?.join(', ')}</div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Score Breakdown</h3>
            <ScoreRow label="Severity" score={signal?.severity_score} explanation="Multi-fatality crashes and major recalls score 9-10" />
            <ScoreRow label="Volume" score={signal?.volume_score} explanation="Recurring events in same area increase opportunity window" />
            <ScoreRow label="Wealth" score={signal?.wealth_score} explanation="Median household income drives lead value" />
            <ScoreRow label="Urgency" score={signal?.urgency_score} explanation="Time-sensitive opportunity windows vary by event type" />
            <ScoreRow label="Competition" score={signal?.competition_score} explanation="Underserved geographies have lower competition" />
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">Composite Score</span>
                <div className="text-4xl font-bold text-[#1e90ff]">{signal?.composite_score}</div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${signal?.composite_score >= 80 ? 'bg-red-500' : signal?.composite_score >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${signal?.composite_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recommended Targeting */}
          <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Recommended Targeting</h3>
            
            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Geographic Targeting</label>
              <div className="bg-[#0a1628] p-3 rounded-lg text-sm text-slate-300">
                {(signal?.recommended_geo_targeting || []).join(', ') || 'Multiple ZIPs'}
              </div>
              <button
                onClick={downloadTargetingCSV}
                className="mt-2 flex items-center gap-2 bg-[#1e90ff]/20 text-[#1e90ff] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e90ff]/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Meta CSV
              </button>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Demographic Targeting</label>
              <div className="bg-[#0a1628] p-3 rounded-lg text-sm text-slate-300">
                {signal?.recommended_demographic_targeting?.age_range || 'General audience'} •{' '}
                {signal?.recommended_demographic_targeting?.income_bracket || 'Mixed income'}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Creative Angles</label>
              <ul className="space-y-2">
                {(signal?.recommended_creative_angles || []).map((angle, i) => (
                  <li key={i} className="bg-[#0a1628] p-3 rounded-lg text-sm text-slate-300">"{angle}"</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget */}
          <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Recommended Budget</h3>
            <div className="text-3xl font-bold text-[#1e90ff]">
              ${signal?.recommended_daily_budget_low}-{signal?.recommended_daily_budget_high}/day
            </div>
            <p className="text-xs text-slate-400 mt-2">Based on score and opportunity window</p>
          </div>

          {/* Campaigns */}
          <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Recommended Campaigns</h3>
            <div className="space-y-2">
              {(signal?.recommended_campaigns || []).map(campaign => (
                <div key={campaign} className="bg-[#0a1628] px-3 py-2 rounded-lg text-sm text-[#1e90ff] font-semibold">
                  {campaign}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Brief */}
          <button
            onClick={generateBrief}
            disabled={generating || signal?.status === 'brief_generated'}
            className="w-full bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Campaign Brief'}
          </button>

          {/* Status */}
          <select
            value={signal?.status}
            onChange={e => {
              // Update signal status
            }}
            className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-[#1e90ff]"
          >
            <option value="new">Mark as New</option>
            <option value="reviewed">Mark as Reviewed</option>
            <option value="dismissed">Mark as Dismissed</option>
            <option value="brief_generated">Brief Generated</option>
          </select>
        </div>
      </div>
    </AdminLayout>
  );
}

function ScoreRow({ label, score, explanation }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-300">{label}</span>
        <span className="text-sm font-bold text-white">{score}/10</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#1e90ff]" style={{ width: `${(score / 10) * 100}%` }} />
      </div>
      <p className="text-xs text-slate-500 mt-1">{explanation}</p>
    </div>
  );
}
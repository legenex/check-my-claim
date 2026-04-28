import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ComplianceBanner from "@/components/signals/ComplianceBanner";
import { Radar, AlertCircle, TrendingUp, CheckCircle, Zap, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSignals();
  }, [filters]);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const query = {};
      if (filters.status !== 'all') query.status = filters.status;
      if (filters.startDate) {
        query.created_date = { $gte: new Date(filters.startDate).toISOString() };
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (!query.created_date) query.created_date = {};
        query.created_date.$lte = endOfDay.toISOString();
      }
      
      const results = await base44.entities.ScoredSignal.filter(query, '-composite_score', 500);
      setSignals(results);
    } catch (err) {
      console.error('Error fetching signals:', err);
    } finally {
      setLoading(false);
    }
  };

  const seedTestData = async () => {
    setSeeding(true);
    try {
      const testSignals = [
        {
          raw_signal_id: 'raw_1',
          severity_score: 8,
          volume_score: 7,
          wealth_score: 6,
          urgency_score: 8,
          competition_score: 5,
          composite_score: 78,
          recommended_campaigns: ['general_auto_accident', 'wrongful_death'],
          recommended_geo_targeting: ['90210', '90211', '90212'],
          recommended_demographic_targeting: { age_range: '25-65', vehicle_ownership: 'high' },
          recommended_creative_angles: ['Injured in fatal crash? Free case review', 'Lost a loved one? Know your rights'],
          recommended_buyer_types: ['accident_victims', 'families'],
          recommended_daily_budget_low: 2500,
          recommended_daily_budget_high: 8000,
          brief_summary: 'Multi-vehicle fatal collision on I-405 near LAX, 3 deaths reported',
          status: 'new',
        },
        {
          raw_signal_id: 'raw_2',
          severity_score: 9,
          volume_score: 8,
          wealth_score: 7,
          urgency_score: 9,
          competition_score: 4,
          composite_score: 85,
          recommended_campaigns: ['general_auto_accident'],
          recommended_geo_targeting: ['77001', '77002', '77003'],
          recommended_demographic_targeting: { age_range: '30-70', vehicle_ownership: 'high', income: '60k-150k' },
          recommended_creative_angles: ['Hit by commercial truck? Get immediate legal help'],
          recommended_buyer_types: ['truck_accident_victims'],
          recommended_daily_budget_low: 5000,
          recommended_daily_budget_high: 15000,
          brief_summary: 'Commercial truck crash on I-45 Houston, multiple injured',
          status: 'new',
        },
        {
          raw_signal_id: 'raw_3',
          severity_score: 8,
          volume_score: 6,
          wealth_score: 8,
          urgency_score: 7,
          competition_score: 6,
          composite_score: 72,
          recommended_campaigns: ['product_liability_auto'],
          recommended_geo_targeting: ['10001', '10002', '10003'],
          recommended_demographic_targeting: { age_range: '18-60', vehicle_ownership: 'medium' },
          recommended_creative_angles: ['Vehicle recall? Know your legal options', 'Defective car caused injury? Get help'],
          recommended_buyer_types: ['recall_victims'],
          recommended_daily_budget_low: 1500,
          recommended_daily_budget_high: 5000,
          brief_summary: 'Major vehicle recall affecting 500K+ units - brake failure',
          status: 'new',
        },
        {
          raw_signal_id: 'raw_4',
          severity_score: 7,
          volume_score: 5,
          wealth_score: 6,
          urgency_score: 6,
          competition_score: 5,
          composite_score: 65,
          recommended_campaigns: ['general_personal_injury'],
          recommended_geo_targeting: ['60601', '60602', '60603'],
          recommended_demographic_targeting: { age_range: '25-55', vehicle_ownership: 'medium' },
          recommended_creative_angles: ['Injured? Free case evaluation'],
          recommended_buyer_types: ['injury_victims'],
          recommended_daily_budget_low: 1000,
          recommended_daily_budget_high: 3000,
          brief_summary: 'Multi-car pile-up Chicago expressway, 8 vehicles involved',
          status: 'reviewed',
        },
      ];

      await base44.entities.ScoredSignal.bulkCreate(testSignals);
      await fetchSignals();
    } catch (err) {
      console.error('Error seeding test data:', err);
    } finally {
      setSeeding(false);
    }
  };

  const exportAsCSV = () => {
    const headers = ['Event Summary', 'Score', 'Status', 'Campaigns', 'Geo Targeting', 'Budget Range', 'Created Date'];
    const rows = signals.map(s => [
      s.brief_summary,
      s.composite_score,
      s.status,
      s.recommended_campaigns?.join('; ') || '',
      s.recommended_geo_targeting?.join('; ') || '',
      `$${s.recommended_daily_budget_low}-$${s.recommended_daily_budget_high}`,
      new Date(s.created_date).toLocaleDateString(),
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signals_${filters.startDate}_to_${filters.endDate}.csv`;
    a.click();
  };

  const activeSignals = signals.filter(s => ['new', 'reviewed'].includes(s.status)).length;
  const urgentSignals = signals.filter(s => s.composite_score >= 80).length;

  return (
    <AdminLayout title="Signal Engine" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Signal Engine" }]}>
      <ComplianceBanner />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Radar} label="Active Signals" value={activeSignals} />
        <StatCard icon={Zap} label="Urgent (80+)" value={urgentSignals} color="text-red-600" />
        <StatCard icon={CheckCircle} label="Briefs Generated" value={0} />
        <StatCard icon={TrendingUp} label="Campaigns Launched" value={0} />
      </div>

      {/* Filters & Controls */}
      <div className="bg-[#0f1e35] rounded-xl p-4 mb-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
          >
            <option value="new">New Signals</option>
            <option value="reviewed">Reviewed</option>
            <option value="all">All Statuses</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
          />
          <span className="text-slate-400 text-sm">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
          />
          <button
            onClick={exportAsCSV}
            disabled={signals.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={seedTestData}
            disabled={seeding}
            className="bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            {seeding ? 'Seeding...' : '+ Seed Test Data'}
          </button>
        </div>
      </div>

      {/* Signals Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading signals...</div>
        ) : signals.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No signals found. Polling sources or create test signal.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-white">Event</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Score</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signals.map(signal => (
                  <tr key={signal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <a href={`/admin/signals/${signal.id}`} className="text-[#1e90ff] hover:underline">
                        {signal.brief_summary?.substring(0, 50)}...
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{signal.recommended_campaigns?.[0] || 'general'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full ${signal.composite_score >= 80 ? 'bg-red-500' : signal.composite_score >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className="text-white font-semibold">{signal.composite_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        signal.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                        signal.status === 'reviewed' ? 'bg-slate-500/20 text-slate-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {signal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/admin/signals/${signal.id}`} className="text-[#1e90ff] hover:underline text-xs font-semibold">
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color = "text-[#1e90ff]" }) {
  return (
    <div className="bg-[#0f1e35] rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs mb-1">{label}</div>
          <div className="text-3xl font-bold text-white">{value}</div>
        </div>
        <Icon className={`w-8 h-8 ${color} opacity-50`} />
      </div>
    </div>
  );
}
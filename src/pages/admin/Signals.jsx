import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ComplianceBanner from "@/components/signals/ComplianceBanner";
import { Radar, AlertCircle, TrendingUp, CheckCircle, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'new',
    scoreRange: [60, 100],
  });

  useEffect(() => {
    fetchSignals();
  }, [filters]);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const query = {};
      if (filters.status !== 'all') query.status = filters.status;
      
      const results = await base44.entities.ScoredSignal.filter(query, '-composite_score', 100);
      setSignals(results);
    } catch (err) {
      console.error('Error fetching signals:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="bg-[#0f1e35] rounded-xl p-4 mb-6 border border-white/10">
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
          <button className="bg-[#1e90ff] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            + New Signal (Test)
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
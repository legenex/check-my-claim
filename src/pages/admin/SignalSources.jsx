import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ComplianceBanner from "@/components/signals/ComplianceBanner";
import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULT_SOURCES = [
  { name: 'NHTSA FARS', source_type: 'nhtsa_fars', api_endpoint: 'https://www.nhtsa.gov/api', poll_interval_minutes: 10080 },
  { name: 'NHTSA Recall Feed', source_type: 'nhtsa_recall', api_endpoint: 'https://api.nhtsa.gov/recalls', poll_interval_minutes: 360 },
  { name: 'TxDOT CRIS', source_type: 'state_dot_crash', api_endpoint: 'https://cris.dot.state.tx.us/api', poll_interval_minutes: 360 },
  { name: 'FMCSA Crash Database', source_type: 'fmcsa_crash', api_endpoint: 'https://safer.fmcsa.dot.gov/api', poll_interval_minutes: 720 },
  { name: 'NTSB', source_type: 'ntsb', api_endpoint: 'https://www.ntsb.gov/api', poll_interval_minutes: 1440 },
  { name: 'OSHA Fatalities', source_type: 'osha_fatality', api_endpoint: 'https://www.osha.gov/api', poll_interval_minutes: 1440 },
  { name: 'FDA Recall Feed', source_type: 'fda_recall', api_endpoint: 'https://api.fda.gov/drug/enforcement.json', poll_interval_minutes: 360 },
  { name: 'FDA MAUDE Database', source_type: 'fda_maude', api_endpoint: 'https://www.accessdata.fda.gov/api', poll_interval_minutes: 1440 },
  { name: 'CDC Outbreak Tracker', source_type: 'cdc_outbreak', api_endpoint: 'https://www.cdc.gov/api', poll_interval_minutes: 1440 },
  { name: 'PACER / Court Filings', source_type: 'court_filings', api_endpoint: 'https://pacer.uscourts.gov/api', poll_interval_minutes: 1440 },
  { name: 'Google News API', source_type: 'google_news', api_endpoint: 'https://newsapi.org', poll_interval_minutes: 120 },
];

export default function SignalSources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const results = await base44.entities.SignalSource.list();
      
      // If no sources exist, seed them
      if (results.length === 0) {
        for (const source of DEFAULT_SOURCES) {
          await base44.entities.SignalSource.create(source);
        }
        const seeded = await base44.entities.SignalSource.list();
        setSources(seeded);
      } else {
        setSources(results);
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (source) => {
    try {
      await base44.entities.SignalSource.update(source.id, { is_enabled: !source.is_enabled });
      setSources(sources.map(s => s.id === source.id ? { ...s, is_enabled: !s.is_enabled } : s));
    } catch (err) {
      console.error('Error toggling source:', err);
    }
  };

  const resetCircuitBreaker = async (source) => {
    try {
      await base44.entities.SignalSource.update(source.id, { 
        circuit_breaker_open: false, 
        consecutive_failures: 0 
      });
      setSources(sources.map(s => s.id === source.id ? { ...s, circuit_breaker_open: false, consecutive_failures: 0 } : s));
    } catch (err) {
      console.error('Error resetting circuit breaker:', err);
    }
  };

  return (
    <AdminLayout title="Signal Sources" breadcrumbs={[
      { label: "Admin", href: "/admin" },
      { label: "Signal Engine", href: "/admin/signals" },
      { label: "Sources" }
    ]}>
      <ComplianceBanner />

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading sources...</div>
      ) : (
        <div className="space-y-4">
          {sources.map(source => (
            <div key={source.id} className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{source.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{source.api_endpoint}</p>
                </div>
                <div className="flex items-center gap-2">
                  {source.circuit_breaker_open && (
                    <div className="flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-semibold text-red-400">Circuit Open</span>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.is_enabled}
                      onChange={() => toggleEnabled(source)}
                      className="w-5 h-5 rounded border-white/20"
                    />
                    <span className="text-sm font-semibold text-slate-300">Enabled</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <InfoBox label="Poll Interval" value={`${source.poll_interval_minutes} min`} />
                <InfoBox 
                  label="Last Polled" 
                  value={source.last_polled_at ? new Date(source.last_polled_at).toLocaleDateString() : 'Never'} 
                />
                <InfoBox 
                  label="Failures" 
                  value={source.consecutive_failures} 
                  color={source.consecutive_failures > 3 ? 'text-red-400' : 'text-white'}
                />
                <InfoBox 
                  label="Status" 
                  value={source.circuit_breaker_open ? 'Error' : source.last_success_at ? 'OK' : 'Pending'}
                  color={source.circuit_breaker_open ? 'text-red-400' : 'text-green-400'}
                />
              </div>

              {source.last_error_message && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-400">{source.last_error_message}</p>
                </div>
              )}

              <div className="flex gap-2">
                {source.circuit_breaker_open && (
                  <button
                    onClick={() => resetCircuitBreaker(source)}
                    className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Circuit Breaker
                  </button>
                )}
                <button className="flex items-center gap-2 bg-[#1e90ff]/20 hover:bg-[#1e90ff]/30 text-[#1e90ff] px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                  <RefreshCw className="w-4 h-4" />
                  Test Connection
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function InfoBox({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-[#0a1628] p-3 rounded-lg">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`font-semibold text-sm ${color}`}>{value}</div>
    </div>
  );
}
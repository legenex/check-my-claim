import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString();

export default function SettlementTickerMini({ stateCode, injuryTier, accidentType, limit = 5 }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const query = { is_active: true };
    if (stateCode) query.state_code = stateCode;
    base44.entities.SettlementTickerEntry.filter(query, "-display_order", limit * 3)
      .then(results => {
        let filtered = results;
        if (injuryTier) filtered = filtered.filter(e => e.injury_severity_tier === injuryTier || e.accident_type === accidentType).slice(0, limit);
        if (!filtered.length) filtered = results.slice(0, limit);
        setEntries(filtered);
      }).catch(() => {});
  }, [stateCode, injuryTier, accidentType]);

  if (!entries.length) return null;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
      <h3 className="font-bold text-slate-900 mb-4 text-lg">Recent Settlements{stateCode ? ` in ${stateCode}` : ""}</h3>
      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div>
              <div className="text-sm font-semibold text-slate-800">{e.injury_summary || e.accident_type}</div>
              <div className="text-xs text-slate-500">{e.state_code} · {e.accident_type} · {e.months_to_settle} mo. to settle</div>
            </div>
            <div className="text-lg font-black text-green-600 ml-4 flex-shrink-0">{fmt(e.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
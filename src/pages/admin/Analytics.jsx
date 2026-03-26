import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, TrendingUp, Clock, MousePointerClick, Monitor, Smartphone, Tablet } from "lucide-react";

const visitorsData = [
  { date: "Mar 20", visitors: 980, sessions: 1200 },
  { date: "Mar 21", visitors: 1100, sessions: 1350 },
  { date: "Mar 22", visitors: 850, sessions: 1050 },
  { date: "Mar 23", visitors: 1240, sessions: 1500 },
  { date: "Mar 24", visitors: 1380, sessions: 1680 },
  { date: "Mar 25", visitors: 1190, sessions: 1440 },
  { date: "Mar 26", visitors: 1284, sessions: 1520 },
];

const trafficSources = [
  { name: "Organic", value: 45, color: "#1e90ff" },
  { name: "Direct", value: 22, color: "#22c55e" },
  { name: "Paid", value: 18, color: "#f59e0b" },
  { name: "Social", value: 10, color: "#a855f7" },
  { name: "Referral", value: 5, color: "#ec4899" },
];

const topPages = [
  { page: "/", visits: 4820, avgTime: "3m 12s", bounce: "38%" },
  { page: "/Survey", visits: 2341, avgTime: "4m 55s", bounce: "24%" },
  { page: "/Submitted", visits: 981, avgTime: "2m 01s", bounce: "12%" },
  { page: "/Thanks", visits: 634, avgTime: "1m 48s", bounce: "15%" },
  { page: "/Sorry", visits: 289, avgTime: "0m 52s", bounce: "72%" },
];

const funnelData = [
  { stage: "Landing Page", users: 4820, pct: 100 },
  { stage: "Survey Started", users: 2341, pct: 49 },
  { stage: "Survey Completed", users: 1270, pct: 26 },
  { stage: "Submitted / Thanks", users: 981, pct: 20 },
];

const devices = [
  { name: "Mobile", value: 62, icon: Smartphone, color: "#1e90ff" },
  { name: "Desktop", value: 31, icon: Monitor, color: "#22c55e" },
  { name: "Tablet", value: 7, icon: Tablet, color: "#f59e0b" },
];

const ranges = ["Today", "7 Days", "30 Days", "Custom"];

export default function Analytics() {
  const [range, setRange] = useState("7 Days");

  return (
    <AdminLayout title="Analytics" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Analytics" }]}>
      {/* Range picker */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {ranges.map(r => (
          <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === r ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{r}</button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="font-semibold">42</span> real-time visitors
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Visitors", value: "8,492", icon: Users, change: "+7%" },
          { label: "Total Sessions", value: "10,340", icon: TrendingUp, change: "+5%" },
          { label: "Avg. Time on Page", value: "2m 34s", icon: Clock, change: "+3%" },
          { label: "CTA Clicks", value: "1,284", icon: MousePointerClick, change: "+12%" },
        ].map(m => (
          <div key={m.label} className="bg-[#0f1e35] rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">{m.label}</span>
              <m.icon className="w-4 h-4 text-[#1e90ff]" />
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-green-400 text-xs mt-0.5">{m.change} vs prev. period</div>
          </div>
        ))}
      </div>

      {/* Visitors Chart */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Visitors Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={visitorsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0f1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
            <Line type="monotone" dataKey="visitors" stroke="#1e90ff" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sessions" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Traffic Sources */}
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {trafficSources.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {trafficSources.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span className="text-slate-300">{s.name}</span></div>
                <span className="text-white font-semibold">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {devices.map(d => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2 text-slate-300"><d.icon className="w-4 h-4" />{d.name}</div>
                  <span className="text-white font-semibold">{d.value}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((f, i) => (
              <div key={f.stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">{f.stage}</span>
                  <span className="text-white font-semibold">{f.users.toLocaleString()} <span className="text-slate-400">({f.pct}%)</span></span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#1e90ff] to-blue-600" style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Top Pages by Visits</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-slate-400">
              <th className="pb-2 text-left font-medium">Page</th>
              <th className="pb-2 text-right font-medium">Visits</th>
              <th className="pb-2 text-right font-medium hidden sm:table-cell">Avg Time</th>
              <th className="pb-2 text-right font-medium hidden md:table-cell">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map(p => (
              <tr key={p.page} className="border-b border-white/5">
                <td className="py-2.5 font-mono text-xs text-[#1e90ff]">{p.page}</td>
                <td className="py-2.5 text-right text-white font-semibold">{p.visits.toLocaleString()}</td>
                <td className="py-2.5 text-right text-slate-300 hidden sm:table-cell">{p.avgTime}</td>
                <td className="py-2.5 text-right text-slate-300 hidden md:table-cell">{p.bounce}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
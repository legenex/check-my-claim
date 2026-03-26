import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, TrendingUp, Clock, Target, FileText, BookOpen, Zap, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const metrics = [
  { label: "Total Visitors Today", value: "1,284", change: "+12%", icon: Users, color: "from-blue-500 to-blue-700" },
  { label: "This Week", value: "8,492", change: "+7%", icon: TrendingUp, color: "from-purple-500 to-purple-700" },
  { label: "Avg. Time on Page", value: "2m 34s", change: "+5%", icon: Clock, color: "from-green-500 to-green-700" },
  { label: "Conversions", value: "342", change: "+18%", icon: Target, color: "from-orange-500 to-orange-700" },
];

const integrations = [
  { name: "Google Analytics", connected: true },
  { name: "Google Search Console", connected: true },
  { name: "Facebook CAPI", connected: true },
  { name: "Slack", connected: false },
];

const recentActivity = [
  { action: "Homepage updated", user: "Admin", time: "2 min ago", icon: FileText },
  { action: "New blog post published", user: "Editor", time: "1 hr ago", icon: BookOpen },
  { action: "SEO settings updated", user: "Admin", time: "3 hrs ago", icon: Zap },
  { action: "New user registered", user: "System", time: "5 hrs ago", icon: Users },
  { action: "Privacy Policy edited", user: "Admin", time: "Yesterday", icon: FileText },
];

const topPages = [
  { page: "/", visits: 4820, bounce: "38%", avgTime: "3m 12s" },
  { page: "/Survey", visits: 2341, bounce: "24%", avgTime: "4m 55s" },
  { page: "/Submitted", visits: 981, bounce: "12%", avgTime: "2m 01s" },
  { page: "/Thanks", visits: 634, bounce: "15%", avgTime: "1m 48s" },
  { page: "/PrivacyPolicy", visits: 210, bounce: "65%", avgTime: "1m 02s" },
];

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard" breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}>
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{m.label}</span>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                <m.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-green-400 text-xs mt-1">{m.change} vs last period</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Top Pages */}
        <div className="xl:col-span-2 bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Top Pages</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="text-left pb-2 font-medium">Page</th>
                <th className="text-right pb-2 font-medium">Visits</th>
                <th className="text-right pb-2 font-medium hidden sm:table-cell">Bounce</th>
                <th className="text-right pb-2 font-medium hidden sm:table-cell">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.page} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-2.5 text-[#1e90ff] font-mono text-xs">{p.page}</td>
                  <td className="py-2.5 text-right text-white font-semibold">{p.visits.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-slate-300 hidden sm:table-cell">{p.bounce}</td>
                  <td className="py-2.5 text-right text-slate-300 hidden sm:table-cell">{p.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Integration Status */}
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Integration Status</h2>
          <div className="space-y-3">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-300 text-sm">{i.name}</span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${i.connected ? "text-green-400" : "text-red-400"}`}>
                  <div className={`w-2 h-2 rounded-full ${i.connected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                  {i.connected ? "Connected" : "Disconnected"}
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/integrations" className="mt-4 block text-center text-xs text-[#1e90ff] hover:underline">
            Manage Integrations →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#1e90ff]/10 flex items-center justify-center flex-shrink-0">
                  <a.icon className="w-4 h-4 text-[#1e90ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{a.action}</div>
                  <div className="text-xs text-slate-400">by {a.user}</div>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/blog?new=1" className="flex items-center gap-3 p-3 rounded-lg bg-[#1e90ff]/10 hover:bg-[#1e90ff]/20 border border-[#1e90ff]/20 transition-all">
              <BookOpen className="w-4 h-4 text-[#1e90ff]" />
              <span className="text-sm text-white font-medium">New Blog Post</span>
            </Link>
            <Link to="/admin/pages" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <FileText className="w-4 h-4 text-slate-300" />
              <span className="text-sm text-white font-medium">Edit Pages</span>
            </Link>
            <Link to="/admin/analytics" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <Eye className="w-4 h-4 text-slate-300" />
              <span className="text-sm text-white font-medium">View Analytics</span>
            </Link>
            <Link to="/admin/seo" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <Zap className="w-4 h-4 text-slate-300" />
              <span className="text-sm text-white font-medium">SEO Manager</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
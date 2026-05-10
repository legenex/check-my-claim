import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, BarChart2, Users, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

export default function DecisionTreeAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [runs, setRuns] = useState([]);
  const [nodeAnalytics, setNodeAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [quizList, runList, analytics] = await Promise.all([
      base44.entities.Quiz.filter({ id }),
      base44.entities.DecisionTreeRun.filter({ quiz_id: id }, "-created_date", 500),
      base44.entities.DecisionTreeNodeAnalytics.filter({ quiz_id: id }),
    ]);
    setQuiz(quizList[0] || null);
    setRuns(runList);
    setNodeAnalytics(analytics);
    setLoading(false);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-[#1e90ff] rounded-full animate-spin" />
    </div>
  );

  if (!quiz) return (
    <AdminLayout title="Not Found">
      <p className="text-slate-400">Decision tree not found.</p>
    </AdminLayout>
  );

  const totalStarts = runs.length;
  const completed = runs.filter(r => r.completed).length;
  const qualified = runs.filter(r => r.outcome === "qualified").length;
  const disqualified = runs.filter(r => r.outcome === "disqualified").length;
  const cr = totalStarts ? ((completed / totalStarts) * 100).toFixed(1) : "0";
  const qualRate = completed ? ((qualified / completed) * 100).toFixed(1) : "0";

  // Daily starts chart
  const dailyMap = {};
  runs.forEach(r => {
    const day = r.created_date?.split("T")[0];
    if (day) dailyMap[day] = (dailyMap[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap).sort().slice(-30).map(([date, count]) => ({ date: date.slice(5), count }));

  // Node funnel
  const funnelData = nodeAnalytics
    .sort((a, b) => (b.total_entries || 0) - (a.total_entries || 0))
    .slice(0, 10)
    .map(n => ({ name: n.node_label?.substring(0, 20) || n.node_id?.substring(0, 12), entries: n.total_entries || 0, exits: n.total_exits || 0 }));

  return (
    <AdminLayout
      title={`Analytics: ${quiz.title}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Decision Trees", href: "/admin/DecisionTrees" },
        { label: quiz.title, href: `/admin/DecisionTrees/${id}/builder` },
        { label: "Analytics" },
      ]}
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/admin/DecisionTrees/${id}/builder`)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Builder
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Users} label="Total Starts" value={totalStarts.toLocaleString()} />
        <StatCard icon={CheckCircle} label="Completed" value={completed.toLocaleString()} color="text-green-400" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${cr}%`} color="text-[#1e90ff]" />
        <StatCard icon={CheckCircle} label="Qualified" value={qualified.toLocaleString()} color="text-emerald-400" />
        <StatCard icon={XCircle} label="Disqualified" value={disqualified.toLocaleString()} color="text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily starts */}
        <div className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Daily Starts (last 30 days)</h3>
          {dailyData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f1e35", border: "1px solid #ffffff20", borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#1e90ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Node funnel */}
        <div className="bg-[#0f1e35] rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Top Node Entries</h3>
          {funnelData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No node data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: "#0f1e35", border: "1px solid #ffffff20", borderRadius: 8 }} />
                <Bar dataKey="entries" fill="#1e90ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent runs */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Recent Sessions ({runs.length})</h3>
        </div>
        {runs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No sessions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628]">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Session</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Outcome</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Steps</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Brand</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">UTM Source</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 100).map(run => (
                  <tr key={run.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{run.session_id?.substring(0, 12)}...</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        run.outcome === "qualified" ? "bg-green-500/20 text-green-400" :
                        run.outcome === "disqualified" ? "bg-red-500/20 text-red-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>{run.outcome || "in_progress"}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{run.path_taken?.length || 0}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{run.brand_id || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{run.utm_source || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{run.created_date ? new Date(run.created_date).toLocaleDateString() : "—"}</td>
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

function StatCard({ icon: Icon, label, value, color = "text-white" }) {
  return (
    <div className="bg-[#0f1e35] rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-xs mb-1">{label}</div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
        <Icon className={`w-7 h-7 ${color} opacity-40`} />
      </div>
    </div>
  );
}
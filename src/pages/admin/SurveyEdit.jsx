import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Layers, Database, Eye, Zap, AlertTriangle } from "lucide-react";

const TIER_COLORS = {
  shared: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30" },
  t1:     { bg: "bg-green-500/20",  text: "text-green-400",  border: "border-green-500/30" },
  t2:     { bg: "bg-blue-500/20",   text: "text-blue-400",   border: "border-blue-500/30" },
  t3:     { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  t4:     { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  dq:     { bg: "bg-red-500/20",    text: "text-red-400",    border: "border-red-500/30" },
};

const TIER_DESCRIPTIONS = {
  shared: "Steps shown to all leads regardless of tier assignment",
  t1:     "Top-priority: highest value leads, premium routing",
  t2:     "Second tier: strong cases, standard premium routing",
  t3:     "Third tier: moderate cases, volume routing",
  t4:     "Fourth tier: lower-value leads, budget routing",
  dq:     "Disqualified: routed to DQ form or redirect",
};

export default function SurveyEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const [survey, setSurvey] = useState(null);
  const [theme, setTheme] = useState(null);
  const [fields, setFields] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [allFields, allThemes] = await Promise.all([
        base44.entities.SurveyField.list(null, 200),
        base44.entities.SurveyTheme.list(),
      ]);
      setFields(allFields);

      if (id) {
        const [surveyRes, stepsRes] = await Promise.all([
          base44.entities.Survey.filter({ id }),
          base44.entities.SurveyStep.filter({ survey_id: id }),
        ]);
        if (surveyRes.length > 0) {
          const s = surveyRes[0];
          setSurvey(s);
          const t = allThemes.find(t => t.id === s.theme_id);
          setTheme(t || null);
        }
        setSteps(stepsRes);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Survey" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Surveys", href: "/admin/Surveys" }, { label: "Edit" }]}>
        <div className="text-slate-400 text-center py-8">Loading...</div>
      </AdminLayout>
    );
  }

  if (!survey && id) {
    return (
      <AdminLayout title="Survey not found" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Surveys", href: "/admin/Surveys" }, { label: "Not Found" }]}>
        <div className="text-slate-400 text-center py-8">Survey not found.</div>
      </AdminLayout>
    );
  }

  const lookupUrl = survey?.lookup_config?.url || "";
  const lookupEndpoint = lookupUrl ? new URL(lookupUrl).origin + new URL(lookupUrl).pathname : "—";

  return (
    <AdminLayout
      title={survey ? survey.name : "New Survey"}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Surveys", href: "/admin/Surveys" }, { label: survey?.name || "New" }]}
    >
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/Surveys" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Surveys
        </Link>
      </div>

      {/* Phase 2 banner */}
      <div className="bg-[#0a1320] border border-[#2282fc]/40 rounded-lg p-5 mb-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-[#2282fc]/10 border border-[#2282fc]/30 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-[#2282fc]" />
        </div>
        <div>
          <div className="text-white font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Phase 2: Builder UI coming next
          </div>
          <div className="text-slate-400 text-sm mt-1">
            The visual step editor, tier flow canvas, and branching logic UI will be built in Phase 2. Below is a read-only summary of this survey's current configuration.
          </div>
        </div>
      </div>

      {survey && (
        <div className="space-y-5 max-w-4xl">
          {/* Identity */}
          <div className="bg-[#0a1320] border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-[#2282fc] uppercase tracking-wider mb-4">Survey Identity</div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Name", survey.name],
                ["Slug", survey.slug],
                ["Vertical", survey.vertical || "mva"],
                ["Status", survey.status],
                ["Theme", theme?.name || survey.theme_id || "—"],
                ["Steps Configured", steps.length || "0"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-0.5">{label}</div>
                  <div className="text-white text-sm font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tiers */}
          <div className="bg-[#0a1320] border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-[#2282fc] uppercase tracking-wider mb-4">Active Tiers</div>
            <div className="grid grid-cols-2 gap-3">
              {(survey.tiers_active || []).map(tier => {
                const colors = TIER_COLORS[tier] || TIER_COLORS.shared;
                const tierSteps = steps.filter(s => s.tier === tier);
                return (
                  <div key={tier} className={`rounded-md border p-3 ${colors.bg} ${colors.border}`}>
                    <div className={`font-mono font-bold text-sm uppercase tracking-wider ${colors.text}`}>{tier}</div>
                    <div className="text-slate-400 text-xs mt-1">{TIER_DESCRIPTIONS[tier] || ""}</div>
                    {tierSteps.length > 0 && (
                      <div className="text-xs text-slate-500 mt-1.5">{tierSteps.length} step{tierSteps.length !== 1 ? "s" : ""} configured</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lookup */}
          <div className="bg-[#0a1320] border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-[#2282fc] uppercase tracking-wider mb-4">Lookup Endpoint</div>
            {survey.lookup_config?.url ? (
              <>
                <div className="font-mono text-sm text-white bg-[#050b14] rounded px-3 py-2 mb-3 break-all">
                  {survey.lookup_config.url}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-0.5">Method</div>
                    <div className="text-white text-sm font-semibold">{survey.lookup_config.method || "GET"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-0.5">Field Mappings</div>
                    <div className="text-white text-sm font-semibold">{(survey.lookup_config.field_mappings || []).length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-0.5">Tier Keys</div>
                    <div className="text-white text-sm font-semibold">{Object.keys(survey.lookup_config.tier_selector_map || {}).length}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> No lookup endpoint configured.
              </div>
            )}
          </div>

          {/* Field library */}
          <div className="bg-[#0a1320] border border-white/10 rounded-lg p-5">
            <div className="text-xs font-mono text-[#2282fc] uppercase tracking-wider mb-4">Global Field Library</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{fields.length}</div>
                <div className="text-xs text-slate-400">total fields seeded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {fields.find(f => f.key === "accident_state")?.allowed_values?.length || 0}
                </div>
                <div className="text-xs text-slate-400">accident_state enum values</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 text-left text-slate-400 font-mono uppercase tracking-wider">Key</th>
                    <th className="py-2 text-left text-slate-400 font-mono uppercase tracking-wider">Type</th>
                    <th className="py-2 text-left text-slate-400 font-mono uppercase tracking-wider">Category</th>
                    <th className="py-2 text-left text-slate-400 font-mono uppercase tracking-wider">Computed</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(field => (
                    <tr key={field.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 pr-3 font-mono text-[#2282fc]">{field.key}</td>
                      <td className="py-2 pr-3 text-slate-300">{field.type}</td>
                      <td className="py-2 pr-3 text-slate-400">{field.category}</td>
                      <td className="py-2">{field.computed ? <span className="text-yellow-400">computed</span> : <span className="text-slate-600">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!survey && !id && (
        <div className="bg-[#0a1320] border border-white/10 rounded-lg p-8 text-center max-w-lg mx-auto">
          <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <div className="text-white font-semibold mb-2">New Survey</div>
          <div className="text-slate-400 text-sm">The full editor UI ships in Phase 2.</div>
          <Link to="/admin/Surveys" className="inline-block mt-4 text-[#2282fc] text-sm hover:underline">← Back to list</Link>
        </div>
      )}
    </AdminLayout>
  );
}
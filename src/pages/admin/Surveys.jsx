import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Copy, Eye, Archive, ChevronDown, Layers } from "lucide-react";

const STATUS_COLORS = {
  published: "bg-green-500/20 text-green-400",
  draft: "bg-slate-500/20 text-slate-400",
  archived: "bg-red-500/20 text-red-400",
};

const LOOKUP_CONFIG = {
  url: "https://script.google.com/macros/s/AKfycbzdr-Rd9vM_D6xJTNE4UMleA5VKOmj0SM1xq3lnw4b0VLlAa0lMPVIy9_GgH03dmkQJ-A/exec?accident_state={fields.accident_state}",
  method: "GET",
  headers: [{ name: "Content-Type", value: "application/x-www-form-urlencoded" }],
  field_mappings: [
    { property: "state", field: "state_name" },
    { property: "state_code", field: "state_code" },
    { property: "manual_override", field: "manual_override" },
    { property: "active_state", field: "active_state" },
    { property: "state_leads", field: "state_leads" },
    { property: "7day_tier", field: "tier_7day" },
    { property: "14day_tier", field: "tier_14day" },
    { property: "30day_tier", field: "tier_30day" },
    { property: "3month_tier", field: "tier_3month" },
    { property: "6month_tier", field: "tier_6month" },
    { property: "12month_tier", field: "tier_12month" },
    { property: "18month_tier", field: "tier_18month" },
    { property: "24month_tier", field: "tier_24month" },
    { property: "verify", field: "verify" }
  ],
  tier_selector_map: {
    "7d": "tier_7day", "14d": "tier_14day", "30d": "tier_30day",
    "3m": "tier_3month", "6m": "tier_6month", "12m": "tier_12month",
    "18m": "tier_18month", "24m": "tier_24month"
  }
};

export default function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [fields, setFields] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Survey.list("-updated_date", 100),
      base44.entities.SurveyField.list(null, 200),
      base44.entities.SurveyTheme.list(),
    ]).then(([s, f, t]) => {
      setSurveys(s);
      setFields(f);
      setThemes(t);
      setLoading(false);
    });
  }, []);

  const archiveSurvey = async (survey) => {
    await base44.entities.Survey.update(survey.id, { status: "archived" });
    setSurveys(prev => prev.map(s => s.id === survey.id ? { ...s, status: "archived" } : s));
  };

  const cloneSurvey = async (survey) => {
    const copy = {
      ...survey,
      name: `${survey.name} (Copy)`,
      slug: `${survey.slug}-copy-${Date.now().toString(36)}`,
      status: "draft",
    };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    const created = await base44.entities.Survey.create(copy);
    setSurveys(prev => [created, ...prev]);
  };

  const createFromMvaTemplate = async () => {
    setCreating(true);
    setShowTemplateMenu(false);
    const darkTheme = themes.find(t => t.name === "CMC Dark");
    const draft = {
      name: "CMC MVA Tiered Survey",
      slug: `mva-tiered-${Date.now().toString(36)}`,
      status: "draft",
      vertical: "mva",
      tiers_active: ["shared", "t1", "t2", "t3", "t4", "dq"],
      theme_id: darkTheme?.id || "",
      lookup_config: LOOKUP_CONFIG,
    };
    const created = await base44.entities.Survey.create(draft);
    setSurveys(prev => [created, ...prev]);
    setCreating(false);
  };

  return (
    <AdminLayout title="Surveys" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Surveys" }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Surveys</h2>
          <p className="text-slate-400 text-sm mt-1">
            {surveys.filter(s => s.status === "published").length} published · {surveys.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowTemplateMenu(v => !v)}
              className="flex items-center gap-2 bg-[#0f1c30] border border-white/10 hover:border-[#2282fc] text-white font-semibold px-4 py-2.5 rounded-md text-sm transition-all"
            >
              Load Template <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showTemplateMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#0a1320] border border-white/10 rounded-md shadow-xl z-20 min-w-[180px]">
                <button
                  onClick={createFromMvaTemplate}
                  disabled={creating}
                  className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-[#2282fc]" />
                  MVA Tiered
                </button>
              </div>
            )}
          </div>
          <Link
            to="/admin/Surveys/Edit"
            className="flex items-center gap-2 bg-[#2282fc] hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-md text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Survey
          </Link>
        </div>
      </div>

      <div className="bg-[#0a1320] rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading surveys...</div>
        ) : surveys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#0f1c30] border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm mb-4">No surveys yet. Load a template or create one from scratch.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={createFromMvaTemplate}
                disabled={creating}
                className="bg-[#0f1c30] border border-white/10 hover:border-[#2282fc] text-white text-sm font-semibold px-4 py-2 rounded-md"
              >
                {creating ? "Creating..." : "Load MVA Tiered Template"}
              </button>
              <Link to="/admin/Surveys/Edit" className="bg-[#2282fc] hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-md">
                + New Survey
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#050b14] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-white">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Tiers Active</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(survey => (
                  <tr key={survey.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-semibold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{survey.name}</div>
                      {survey.vertical && (
                        <div className="text-slate-500 text-xs mt-0.5 font-mono">{survey.vertical}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">{survey.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[survey.status] || STATUS_COLORS.draft}`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(survey.tiers_active || []).map(tier => (
                          <span key={tier} className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#0f1c30] text-[#2282fc] border border-[#2282fc]/30">
                            {tier}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {survey.updated_date ? new Date(survey.updated_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/admin/Surveys/Edit?id=${survey.id}`} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => cloneSurvey(survey)} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Clone">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <Link to={`/admin/Surveys/Edit?id=${survey.id}&preview=1`} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Preview">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => archiveSurvey(survey)} className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors" title="Archive">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Field library summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Fields", value: fields.length, sub: "in global library" },
          { label: "Survey Themes", value: themes.length, sub: "preset & custom" },
          { label: "Field Categories", value: [...new Set(fields.map(f => f.category))].length, sub: "unique categories" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0a1320] border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{stat.value}</div>
            <div className="text-sm font-semibold text-slate-300 mt-0.5">{stat.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
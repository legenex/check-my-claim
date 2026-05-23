import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Globe, Copy, Trash2, Eye, Sparkles, Wrench } from "lucide-react";
import SurveySeeder from "@/components/surveybuilder/SurveySeeder";
import Phase6Patcher from "@/components/surveybuilder/Phase6Patcher";

const STATUS_COLORS = {
  published: "bg-green-500/20 text-green-400",
  draft: "bg-slate-500/20 text-slate-400",
  archived: "bg-red-500/20 text-red-400",
};

export default function SurveyBuilder() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSeeder, setShowSeeder] = useState(false);
  const [showPatcher, setShowPatcher] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const res = await base44.entities.Survey.list("-updated_date", 50);
    setSurveys(res);
    setLoading(false);
  };

  const createNew = async () => {
    const s = await base44.entities.Survey.create({
      name: "New MVA Survey",
      slug: "mva-" + Date.now(),
      status: "draft",
      version: 1,
      step_order: [],
      settings: {
        auto_advance_ms: 300,
        progress_bar: true,
        show_back_button: true,
        display_phone: "(844) 840-6905",
        tcpa_text: "By submitting this form, I expressly consent to be contacted by Check My Claim and its attorney partners via phone, text, and email at the number and address I provided, even if I am on a Do Not Call registry. Consent is not a condition of purchase. Msg & data rates may apply. I have read and agree to the Privacy Policy and Terms of Service."
      },
      integrations_config: {
        hlr_endpoint: "",
        wc_quiz_redirect: "",
        webhooks: [
          { name: "DQ Lead to BigQuery", url: "", method: "POST", fire_on: "dq_only", active: false, headers: [], payload_template: { lead_data: "{fields}", dq_reason: "{fields.dq_reason}", dq_tags: "{fields.dq_tags}" } },
          { name: "Qualified Lead to LeadByte", url: "", method: "POST", fire_on: "qualified_only", active: false, headers: [], payload_template: { first_name: "{fields.first_name}", last_name: "{fields.last_name}", mobile: "{fields.phone}", email: "{fields.email}", zip: "{fields.zip}", tier: "{fields.final_tier}", state: "{fields.accident_state}", incident_date: "{fields.incident_date}" } },
          { name: "LeadByte Quarantine", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
          { name: "Release Quarantine", url: "", method: "POST", fire_on: "qualified_only", active: false, headers: [], payload_template: {} },
          { name: "Meta CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
          { name: "TikTok CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} },
          { name: "Snapchat CAPI", url: "", method: "POST", fire_on: "always", active: false, headers: [], payload_template: {} }
        ]
      },
      dq_config: { qualified_redirect_url: "/Submitted", dq_redirect_url: "/Thanks" }
    });
    window.location.href = `/admin/SurveyBuilder/${s.id}`;
  };

  const deleteSurvey = async (id) => {
    await base44.entities.Survey.delete(id);
    setSurveys(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  const duplicate = async (survey) => {
    const copy = { ...survey, name: survey.name + " (Copy)", slug: survey.slug + "-copy-" + Date.now(), status: "draft" };
    delete copy.id; delete copy.created_date; delete copy.updated_date;
    const created = await base44.entities.Survey.create(copy);
    window.location.href = `/admin/SurveyBuilder/${created.id}`;
  };

  return (
    <AdminLayout title="Survey Builder" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Survey Builder" }]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Survey Builder</h2>
          <p className="text-slate-400 text-sm mt-1">MVA funnel surveys with tier routing, DQ-at-end, and webhook fan-out.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPatcher(v => !v)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all">
            <Wrench className="w-4 h-4" /> Patch Phase 6
          </button>
          <button onClick={() => setShowSeeder(v => !v)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all">
            <Sparkles className="w-4 h-4" /> Seed Phase 6
          </button>
          <button onClick={createNew} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all">
            <Plus className="w-4 h-4" /> New Survey
          </button>
        </div>
      </div>

      {showPatcher && (
        <div className="mb-6">
          <Phase6Patcher onComplete={() => { setShowPatcher(false); setTimeout(load, 500); }} />
        </div>
      )}

      {showSeeder && (
        <div className="mb-6">
          <SurveySeeder onComplete={(id) => { setShowSeeder(false); setTimeout(load, 500); }} />
        </div>
      )}

      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading surveys...</div>
        ) : surveys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-lg font-semibold text-white mb-1">No surveys yet</div>
            <div className="text-sm text-slate-400 mb-6">Create your first MVA survey funnel.</div>
            <button onClick={createNew} className="bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl">Create Survey</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0a1628] border-b border-white/10">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-white">Name</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400">Slug</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400">Steps</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-400">Version</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-3 text-white font-semibold">{s.name}</td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">/s/{s.slug}</td>
                  <td className="px-5 py-3 text-slate-300">{(s.step_order || []).length}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || STATUS_COLORS.draft}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">v{s.version || 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {s.status === "published" && (
                        <a href={`/s/${s.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-[#2BB6F6]"><Eye className="w-3.5 h-3.5" /></a>
                      )}
                      <Link to={`/admin/SurveyBuilder/${s.id}`} className="p-1.5 text-slate-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => duplicate(s)} className="p-1.5 text-slate-400 hover:text-white"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold mb-2">Delete Survey?</h3>
            <p className="text-slate-400 text-sm mb-4">This will delete the survey record but not associated steps or leads. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteSurvey(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
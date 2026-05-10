import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, GitBranch, Sparkles } from "lucide-react";

const CAMPAIGN_TYPES = ["MVA", "Mass Tort", "Workers Comp", "Slip and Fall", "Medical Malpractice", "Custom"];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 60);
}

export default function NewDecisionTreeModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [campaignType, setCampaignType] = useState("MVA");
  const [mode, setMode] = useState("basic");
  const [creating, setCreating] = useState(false);

  const handleTitleChange = (val) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const create = async () => {
    if (!title || !slug) return;
    setCreating(true);
    const quiz = await base44.entities.Quiz.create({
      title,
      slug,
      campaign_type: campaignType,
      builder_mode: mode,
      status: "Draft",
      version: 1,
      total_starts: 0,
      total_completes: 0,
      total_qualified: 0,
      total_disqualified: 0,
      total_nodes: 0,
    });
    // Create a default start node
    await base44.entities.Question.create({
      quiz_id: quiz.id,
      node_id: `node_start_${Date.now()}`,
      node_type: "start",
      label: "Welcome",
      position_x: 100,
      position_y: 100,
      config: { cta_text: "Get Started →" },
    });
    setCreating(false);
    onCreated(quiz.id);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#1e90ff]" /> New Decision Tree
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Title *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. MVA Lead Qualifier" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Slug (URL)</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">/q/</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="mva-qualifier" className={`${inputCls} flex-1`} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)} className={inputCls}>
              {CAMPAIGN_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Builder Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ val: "basic", label: "Basic", desc: "Linear step-by-step" }, { val: "advanced", label: "Advanced", desc: "Visual flow canvas" }].map(m => (
                <button key={m.val} onClick={() => setMode(m.val)}
                  className={`p-3 rounded-xl border text-left transition-all ${mode === m.val ? "border-[#1e90ff] bg-[#1e90ff]/10" : "border-white/10 hover:border-white/30"}`}>
                  <div className="text-sm font-semibold text-white">{m.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
          <button onClick={create} disabled={!title || !slug || creating}
            className="flex-1 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm">
            {creating ? "Creating..." : "Create Tree →"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
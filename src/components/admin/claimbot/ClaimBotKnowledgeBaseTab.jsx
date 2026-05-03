import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, Sparkles, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] transition-colors";

const CATEGORIES = [
  "About Check My Claim", "Eligibility & Qualifying", "Claims Process",
  "Settlements & Payouts", "Lawyers & Fees", "Insurance & Adjusters",
  "Statutes & Deadlines", "Rideshare", "Pedestrian & Cyclist", "Commercial / Truck",
  "Workplace", "Common Objections", "Compliance & Disclaimers", "Off-topic / Refusal", "Other"
];

const EMPTY_ENTRY = { title: "", content: "", category: "About Check My Claim", tags: [], trigger_keywords: [], priority: 50, is_active: true, notes: "" };

export default function ClaimBotKnowledgeBaseTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [filterActive, setFilterActive] = useState("All");
  const [modal, setModal] = useState(null); // null | "new" | entry object
  const [form, setForm] = useState(EMPTY_ENTRY);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [kwInput, setKwInput] = useState("");

  const fetch = async () => {
    setLoading(true);
    const res = await base44.entities.ClaimBotKnowledgeBase.list("-priority", 200);
    setEntries(res);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const filtered = entries.filter(e => {
    const catOk = filterCat === "All" || e.category === filterCat;
    const actOk = filterActive === "All" || (filterActive === "Active" ? e.is_active : !e.is_active);
    return catOk && actOk;
  });

  const openNew = () => { setForm(EMPTY_ENTRY); setTagInput(""); setKwInput(""); setModal("new"); };
  const openEdit = (entry) => { setForm({ ...EMPTY_ENTRY, ...entry }); setTagInput(""); setKwInput(""); setModal(entry); };

  const saveEntry = async () => {
    setSaving(true);
    const data = { ...form };
    if (modal === "new") {
      await base44.entities.ClaimBotKnowledgeBase.create(data);
    } else {
      await base44.entities.ClaimBotKnowledgeBase.update(modal.id, data);
    }
    await fetch();
    setModal(null);
    setSaving(false);
  };

  const deleteEntry = async (id) => {
    await base44.entities.ClaimBotKnowledgeBase.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const toggleActive = async (entry) => {
    await base44.entities.ClaimBotKnowledgeBase.update(entry.id, { is_active: !entry.is_active });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, is_active: !e.is_active } : e));
  };

  const bulkAction = async (action) => {
    for (const id of selected) {
      if (action === "activate") await base44.entities.ClaimBotKnowledgeBase.update(id, { is_active: true });
      else if (action === "deactivate") await base44.entities.ClaimBotKnowledgeBase.update(id, { is_active: false });
      else if (action === "delete") await base44.entities.ClaimBotKnowledgeBase.delete(id);
    }
    setSelected([]);
    fetch();
  };

  const generateWithAI = async () => {
    setAiGenerating(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a ClaimBot knowledge base entry for this topic: "${aiPrompt}"\n\nContext: ClaimBot is an AI assistant for Check My Claim, helping car accident victims understand their rights and claim value.\n\nReturn JSON with: title (short, descriptive), content (clear factual answer, 100-250 words, markdown ok), category (one of: ${CATEGORIES.join(", ")}), trigger_keywords (array of 5-10 lowercase phrases that would prompt this entry).`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          category: { type: "string" },
          trigger_keywords: { type: "array", items: { type: "string" } },
        }
      },
      model: "claude_sonnet_4_6"
    });
    setForm(f => ({
      ...f,
      title: res.title || f.title,
      content: res.content || f.content,
      category: res.category || f.category,
      trigger_keywords: res.trigger_keywords || f.trigger_keywords,
    }));
    setAiGenerating(false);
    setAiModal(false);
    setModal("new");
  };

  const addTag = (field, input, setInput) => {
    if (!input.trim()) return;
    const val = input.trim().toLowerCase();
    setForm(f => ({ ...f, [field]: [...(f[field] || []), val] }));
    setInput("");
  };

  const removeTag = (field, idx) => setForm(f => ({ ...f, [field]: (f[field] || []).filter((_, i) => i !== idx) }));

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          <option value="All">All Status</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>

        {selected.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => bulkAction("activate")} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-semibold">Activate {selected.length}</button>
            <button onClick={() => bulkAction("deactivate")} className="bg-slate-600 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded-lg font-semibold">Deactivate {selected.length}</button>
            <button onClick={() => bulkAction("delete")} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg font-semibold">Delete {selected.length}</button>
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={() => setAiModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
            <Sparkles className="w-4 h-4" /> Generate with AI
          </button>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-[#0a1628] border-b border-white/10">
              <tr>
                <th className="w-10 px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(x => x.id) : [])} /></th>
                <th className="px-4 py-3 text-left text-white font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-slate-400 font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-slate-400 font-semibold">Priority</th>
                <th className="px-4 py-3 text-left text-slate-400 font-semibold">Active</th>
                <th className="px-4 py-3 text-left text-slate-400 font-semibold">Uses</th>
                <th className="px-4 py-3 text-left text-slate-400 font-semibold">Last Used</th>
                <th className="px-4 py-3 text-right text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openEdit(entry)}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(entry.id)} onChange={e => { e.stopPropagation(); setSelected(prev => e.target.checked ? [...prev, entry.id] : prev.filter(id => id !== entry.id)); }} />
                  </td>
                  <td className="px-4 py-3 text-white font-medium max-w-xs truncate">{entry.title}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded">{entry.category}</span></td>
                  <td className="px-4 py-3 text-slate-400">{entry.priority}</td>
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleActive(entry); }}>
                    {entry.is_active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{entry.use_count || 0}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{entry.last_used_at ? new Date(entry.last_used_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <button onClick={() => deleteEntry(entry.id)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Entry Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">{modal === "new" ? "New KB Entry" : "Edit KB Entry"}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs text-slate-400 mb-1 block">Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-slate-400 mb-1 block">Priority (0-100)</label>
                  <input type="number" min="0" max="100" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 50 }))} className={inputCls} />
                </div>
              </div>
              <div><label className="text-xs text-slate-400 mb-1 block">Content (the answer — Markdown supported)</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className={`${inputCls} font-mono text-xs`} /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Trigger Keywords (press Enter to add)</label>
                <div className="flex flex-wrap gap-1 mb-2">{(form.trigger_keywords || []).map((kw, i) => <span key={i} className="flex items-center gap-1 bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-full">{kw}<button onClick={() => removeTag("trigger_keywords", i)} className="text-blue-400 hover:text-red-400">×</button></span>)}</div>
                <input value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag("trigger_keywords", kwInput, setKwInput)} placeholder="Type keyword + Enter" className={inputCls} />
              </div>
              <div><label className="text-xs text-slate-400 mb-1 block">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">{(form.tags || []).map((t, i) => <span key={i} className="flex items-center gap-1 bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{t}<button onClick={() => removeTag("tags", i)} className="hover:text-red-400">×</button></span>)}</div>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag("tags", tagInput, setTagInput)} placeholder="Type tag + Enter" className={inputCls} />
              </div>
              <div><label className="text-xs text-slate-400 mb-1 block">Internal Notes (not shown to bot)</label>
                <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /><span className="text-sm text-slate-300">Active (included in bot context)</span></label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEntry} disabled={saving} className="flex-1 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm">{saving ? "Saving..." : "Save Entry"}</button>
              <button onClick={() => setModal(null)} className="px-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {aiModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Generate KB Entry</h3>
              <button onClick={() => setAiModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs text-slate-400 mb-1 block">Describe the entry topic</label>
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4} placeholder="e.g. How long does it take to settle a car accident claim in California?" className={inputCls} />
              </div>
              <button onClick={generateWithAI} disabled={aiGenerating || !aiPrompt}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {aiGenerating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Entry</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
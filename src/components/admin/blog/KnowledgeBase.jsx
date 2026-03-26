import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BookOpen, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DOC_TYPES = ["Brand Voice", "Legal Guidelines", "Audience Persona", "Competitor Research", "Style Guide", "Product/Service Info", "Internal Policy", "Other"];

const TYPE_COLORS = {
  "Brand Voice": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Legal Guidelines": "bg-red-500/10 text-red-400 border-red-500/20",
  "Audience Persona": "bg-green-500/10 text-green-400 border-green-500/20",
  "Competitor Research": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Style Guide": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Product/Service Info": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Internal Policy": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Other": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const STARTER_DOCS = [
  { title: "Brand Voice & Tone Guide", docType: "Brand Voice", content: "" },
  { title: "Legal Disclaimer Templates", docType: "Legal Guidelines", content: "" },
  { title: "Target Audience Personas — Accident Victims & Unsure Claimants", docType: "Audience Persona", content: "" },
  { title: "Services & Process Description — How Check My Claim Works", docType: "Product/Service Info", content: "" },
  { title: "Competitor Positioning Notes", docType: "Competitor Research", content: "" },
  { title: "SEO & AEO Content Strategy Guidelines", docType: "Style Guide", content: "" },
  { title: "Internal Compliance Rules — What AI Must Never Say", docType: "Internal Policy", content: "" },
  { title: "Example High-Performing Articles — Style Reference", docType: "Other", content: "" },
];

function DocEditor({ doc, onSave, onClose }) {
  const [form, setForm] = useState({ title: "", docType: "Brand Voice", content: "", notes: "", isActive: true, ...doc });
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-[#0a1628] border border-white/10 rounded-2xl w-full max-w-3xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{doc?.id ? "Edit Document" : "Add Document"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Document Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" placeholder="Internal document name…" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Content</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} placeholder="Paste or write the document content here. This will be injected as context into the AI article generator…" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none font-mono leading-relaxed" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Internal Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional internal notes about this document…" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`w-10 h-6 rounded-full relative transition-all ${form.isActive ? "bg-[#1e90ff]" : "bg-white/10"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${form.isActive ? "right-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-sm text-slate-300">Active (available in AI generator context)</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={() => onSave(form)} disabled={!form.title} className="flex-1 bg-[#1e90ff] hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all">Save Document</button>
          <button onClick={onClose} className="px-5 bg-white/5 hover:bg-white/10 text-white text-sm py-2.5 rounded-xl transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    base44.entities.KnowledgeBaseDoc.list("-updated_date", 100)
      .then(setDocs).catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (form) => {
    if (form.id) {
      const updated = await base44.entities.KnowledgeBaseDoc.update(form.id, form);
      setDocs(ds => ds.map(d => d.id === form.id ? updated : d));
    } else {
      const created = await base44.entities.KnowledgeBaseDoc.create(form);
      setDocs(ds => [created, ...ds]);
    }
    setShowEditor(false);
    setEditing(null);
  };

  const handleToggle = async (doc) => {
    const updated = await base44.entities.KnowledgeBaseDoc.update(doc.id, { isActive: !doc.isActive });
    setDocs(ds => ds.map(d => d.id === doc.id ? updated : d));
  };

  const handleDelete = async (id) => {
    await base44.entities.KnowledgeBaseDoc.delete(id);
    setDocs(ds => ds.filter(d => d.id !== id));
  };

  const createStarter = async (starter) => {
    const created = await base44.entities.KnowledgeBaseDoc.create({ ...starter, isActive: true });
    setDocs(ds => [created, ...ds]);
  };

  return (
    <div>
      {showEditor && <DocEditor doc={editing} onSave={handleSave} onClose={() => { setShowEditor(false); setEditing(null); }} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white">Knowledge Base</h3>
          <p className="text-xs text-slate-400 mt-0.5">Documents injected as AI context to keep content on-brand, compliant, and strategically aligned.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowEditor(true); }} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Starter Templates */}
      {docs.length === 0 && !loading && (
        <div className="mb-6">
          <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">✦ Suggested Starter Documents</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {STARTER_DOCS.map((starter, i) => (
              <div key={i} className="bg-[#0f1e35] border border-white/10 rounded-xl p-4 hover:border-[#1e90ff]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-[#1e90ff] flex-shrink-0" />
                  <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[starter.docType]}`}>{starter.docType}</span>
                </div>
                <div className="text-sm font-medium text-white mb-3 leading-snug">{starter.title}</div>
                <button onClick={() => createStarter(starter)} className="text-xs text-[#1e90ff] hover:underline">Create empty template →</button>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-6 mb-1" />
        </div>
      )}

      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Document</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden md:table-cell">Type</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden lg:table-cell">Last Updated</th>
              <th className="px-4 py-3 text-center text-slate-400 font-medium">Active</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>)
            ) : docs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">No documents yet. Add your first document above.</td></tr>
            ) : docs.map(doc => (
              <tr key={doc.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{doc.title}</div>
                  {doc.content && <div className="text-xs text-slate-500 mt-0.5">{doc.content.substring(0, 60)}…</div>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[doc.docType] || TYPE_COLORS.Other}`}>{doc.docType}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                  {doc.updated_date ? new Date(doc.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleToggle(doc)} className={`w-9 h-5 rounded-full relative transition-all mx-auto block ${doc.isActive ? "bg-[#1e90ff]" : "bg-white/10"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${doc.isActive ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setEditing(doc); setShowEditor(true); }} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
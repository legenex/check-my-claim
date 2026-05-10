import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import ContactFormEditor from "@/components/decisiontrees/ContactFormEditor";

export default function ContactFormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, "new" = new, id = edit
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    setLoading(true);
    const results = await base44.entities.ContactForm.list("-created_date", 100);
    setForms(results);
    setLoading(false);
  };

  const deleteForm = async (id) => {
    await base44.entities.ContactForm.delete(id);
    setForms(prev => prev.filter(f => f.id !== id));
    setDeleteConfirm(null);
  };

  const duplicateForm = async (form) => {
    const copy = { ...form, id: undefined, created_date: undefined, updated_date: undefined, name: `${form.name} (Copy)` };
    await base44.entities.ContactForm.create(copy);
    fetchForms();
  };

  if (editing !== null) {
    return (
      <ContactFormEditor
        formId={editing === "new" ? null : editing}
        onBack={() => { setEditing(null); fetchForms(); }}
      />
    );
  }

  return (
    <AdminLayout
      title="Contact Forms"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Decision Trees", href: "/admin/DecisionTrees" }, { label: "Contact Forms" }]}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Forms</h2>
          <p className="text-slate-400 text-sm mt-1">{forms.length} forms</p>
        </div>
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
          <Plus className="w-4 h-4" /> New Form
        </button>
      </div>

      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : forms.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No contact forms yet. <button onClick={() => setEditing("new")} className="text-[#1e90ff] hover:underline">Create one →</button></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0a1628] border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-white">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Fields</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">TCPA</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Webhook</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(form => (
                <tr key={form.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-semibold">{form.name}</td>
                  <td className="px-4 py-3 text-slate-400">{form.fields?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${form.tcpa_enabled ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
                      {form.tcpa_enabled ? "On" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[200px]">{form.webhook_url || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditing(form.id)} className="p-1.5 text-slate-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => duplicateForm(form)} className="p-1.5 text-slate-400 hover:text-white"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(form.id)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <h3 className="text-white font-bold mb-2">Delete Form?</h3>
            <p className="text-slate-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteForm(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
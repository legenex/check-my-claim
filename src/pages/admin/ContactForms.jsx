import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Edit, Trash2, Copy, ToggleLeft, ToggleRight, Archive, ClipboardList, X } from "lucide-react";

const FORM_TYPE_COLORS = {
  qualified: "bg-green-500/20 text-green-400 border border-green-500/30",
  disqualified: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  callback: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  generic: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};

export default function ContactForms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const fs = await base44.entities.ContactForm.list("-updated_date", 200);
    setForms(fs);
    setLoading(false);
  };

  const filtered = forms.filter(f => {
    const matchSearch = !search || f.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || f.form_type === typeFilter;
    return matchSearch && matchType;
  });

  const deleteForm = async (id) => {
    await base44.entities.ContactForm.delete(id);
    setForms(prev => prev.filter(f => f.id !== id));
    setDeleteConfirm(null);
  };

  const duplicateForm = async (form) => {
    const copy = {
      ...form,
      id: undefined, created_date: undefined, updated_date: undefined,
      title: `${form.title} (Copy)`,
    };
    await base44.entities.ContactForm.create(copy);
    fetchData();
  };

  const toggleTcpa = async (form) => {
    await base44.entities.ContactForm.update(form.id, { tcpa_enabled: !form.tcpa_enabled });
    setForms(prev => prev.map(f => f.id === form.id ? { ...f, tcpa_enabled: !f.tcpa_enabled } : f));
  };

  const toggleTrustedForm = async (form) => {
    await base44.entities.ContactForm.update(form.id, { trustedform_enabled: !form.trustedform_enabled });
    setForms(prev => prev.map(f => f.id === form.id ? { ...f, trustedform_enabled: !f.trustedform_enabled } : f));
  };

  return (
    <AdminLayout
      title="Contact Forms"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Contact Forms" }]}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Forms</h2>
          <p className="text-slate-400 text-sm mt-1">
            {forms.filter(f => f.form_type === "qualified").length} qualified · {forms.length} total
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Contact Form
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1e35] rounded-xl p-4 mb-6 border border-white/10 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title..."
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          {["All", "qualified", "disqualified", "callback", "generic"].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading contact forms...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">No contact forms yet.</p>
            <button onClick={() => setShowNewModal(true)} className="text-[#1e90ff] hover:underline text-sm">Create your first one →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-white">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Form Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Fields</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">TCPA</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">TrustedForm</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(form => (
                  <tr key={form.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/ContactForms/${form.id}/edit`} className="text-white font-semibold hover:text-[#1e90ff] transition-colors">
                        {form.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORM_TYPE_COLORS[form.form_type] || FORM_TYPE_COLORS.generic}`}>
                        {form.form_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{form.fields?.length || 0} fields</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleTcpa(form)} className="text-slate-400 hover:text-white transition-colors">
                        {form.tcpa_enabled ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleTrustedForm(form)} className="text-slate-400 hover:text-white transition-colors">
                        {form.trustedform_enabled ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/admin/ContactForms/${form.id}/edit`} title="Edit" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => duplicateForm(form)} title="Duplicate" className="p-1.5 text-slate-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(form.id)} title="Delete" className="p-1.5 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold mb-2">Delete Contact Form?</h3>
            <p className="text-slate-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteForm(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <NewContactFormModal
          onClose={() => setShowNewModal(false)}
          onCreated={(id) => navigate(`/admin/ContactForms/${id}/edit`)}
        />
      )}
    </AdminLayout>
  );
}

function NewContactFormModal({ onClose, onCreated }) {
  const [creating, setCreating] = useState(false);

  const createForm = async (type) => {
    setCreating(true);
    const templates = {
      qualified: {
        title: "Qualified Lead Form",
        form_type: "qualified",
        fields: [
          { field_key: "first_name", label: "First Name", type: "string", required: true, placeholder: "Your first name" },
          { field_key: "last_name", label: "Last Name", type: "string", required: true, placeholder: "Your last name" },
          { field_key: "email", label: "Email", type: "email", required: true, placeholder: "your@email.com" },
          { field_key: "phone", label: "Phone", type: "phone", required: true, placeholder: "(555) 000-0000" },
          { field_key: "zip_code", label: "ZIP Code", type: "string", required: false, placeholder: "90210" },
        ],
        tcpa_enabled: true,
        trustedform_enabled: true,
        submit_button_label: "Submit My Free Case Review",
      },
      disqualified: {
        title: "Disqualified Lead Form (Nurture)",
        form_type: "disqualified",
        fields: [
          { field_key: "email", label: "Email", type: "email", required: true, placeholder: "your@email.com" },
        ],
        tcpa_enabled: false,
        trustedform_enabled: false,
        submit_button_label: "Send Me Free Resources",
      },
      callback: {
        title: "Callback Request Form",
        form_type: "callback",
        fields: [
          { field_key: "first_name", label: "First Name", type: "string", required: true, placeholder: "Your first name" },
          { field_key: "phone", label: "Phone", type: "phone", required: true, placeholder: "(555) 000-0000" },
          { field_key: "best_time_to_call", label: "Best Time to Call", type: "string", required: false, placeholder: "e.g. mornings" },
        ],
        tcpa_enabled: true,
        trustedform_enabled: false,
        submit_button_label: "Request My Callback",
      },
    };

    const created = await base44.entities.ContactForm.create(templates[type]);
    setCreating(false);
    onCreated(created.id);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">New Contact Form</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <button onClick={() => createForm("qualified")} disabled={creating}
            className="w-full p-4 rounded-xl border border-white/10 hover:border-green-500 text-left transition-all group disabled:opacity-50">
            <div className="text-sm font-semibold text-white">Qualified Lead Form</div>
            <div className="text-xs text-slate-400 mt-0.5">Full lead capture with TCPA + TrustedForm</div>
          </button>
          <button onClick={() => createForm("disqualified")} disabled={creating}
            className="w-full p-4 rounded-xl border border-white/10 hover:border-slate-500 text-left transition-all group disabled:opacity-50">
            <div className="text-sm font-semibold text-white">Disqualified Lead Form</div>
            <div className="text-xs text-slate-400 mt-0.5">Email-only nurture form</div>
          </button>
          <button onClick={() => createForm("callback")} disabled={creating}
            className="w-full p-4 rounded-xl border border-white/10 hover:border-blue-500 text-left transition-all group disabled:opacity-50">
            <div className="text-sm font-semibold text-white">Callback Request Form</div>
            <div className="text-xs text-slate-400 mt-0.5">Simple callback request</div>
          </button>
        </div>
      </div>
    </div>
  );
}
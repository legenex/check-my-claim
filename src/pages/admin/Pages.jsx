import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Eye, Edit, Copy, Trash2, Search, Plus, ExternalLink, MoreHorizontal, Globe } from "lucide-react";

const allPages = [
  { name: "Home", slug: "/", status: "Published", modified: "2 hrs ago", seo: 92 },
  { name: "Survey", slug: "/Survey", status: "Published", modified: "1 day ago", seo: 85 },
  { name: "Submitted", slug: "/Submitted", status: "Published", modified: "3 hrs ago", seo: 78 },
  { name: "Thanks", slug: "/Thanks", status: "Published", modified: "1 day ago", seo: 75 },
  { name: "Sorry", slug: "/Sorry", status: "Published", modified: "2 days ago", seo: 70 },
  { name: "Privacy Policy", slug: "/PrivacyPolicy", status: "Published", modified: "1 week ago", seo: 88 },
  { name: "Terms of Service", slug: "/TermsOfService", status: "Published", modified: "1 week ago", seo: 86 },
  { name: "Advertising Disclosure", slug: "/AdvertisingDisclosure", status: "Published", modified: "1 week ago", seo: 82 },
  { name: "Partner List", slug: "/PartnerList", status: "Hidden", modified: "2 weeks ago", seo: 55 },
  { name: "SB-37 List", slug: "/sb-37-list", status: "Hidden", modified: "2 weeks ago", seo: 50 },
  { name: "Blog", slug: "/Blog", status: "Draft", modified: "—", seo: 0 },
];

const statusColors = {
  Published: "bg-green-500/10 text-green-400 border border-green-500/20",
  Draft: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  Hidden: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

function SeoBar({ score }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full w-16">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-6">{score}</span>
    </div>
  );
}

export default function Pages() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editModal, setEditModal] = useState(null);

  const filtered = allPages.filter(p =>
    (statusFilter === "All" || p.status === statusFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (slug) => setSelected(s => s.includes(slug) ? s.filter(x => x !== slug) : [...s, slug]);

  return (
    <AdminLayout title="Pages Manager" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Pages" }]}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pages..."
              className="bg-[#0f1e35] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 w-56 focus:outline-none focus:border-[#1e90ff]"
            />
          </div>
          {["All", "Published", "Draft", "Hidden"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" />
          Add New Page
        </button>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#1e90ff]/10 border border-[#1e90ff]/20 rounded-lg px-4 py-2.5 mb-4 text-sm">
          <span className="text-[#1e90ff] font-medium">{selected.length} selected</span>
          <button className="text-slate-300 hover:text-white">Publish</button>
          <button className="text-slate-300 hover:text-white">Hide</button>
          <button className="text-red-400 hover:text-red-300">Delete</button>
          <button onClick={() => setSelected([])} className="ml-auto text-slate-400 hover:text-white">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/2">
              <th className="px-4 py-3 text-left">
                <input type="checkbox" className="rounded" onChange={e => setSelected(e.target.checked ? allPages.map(p => p.slug) : [])} />
              </th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Page Name</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden md:table-cell">Slug</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden lg:table-cell">Last Modified</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden xl:table-cell">SEO Score</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((page) => (
              <tr key={page.slug} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(page.slug)} onChange={() => toggleSelect(page.slug)} className="rounded" />
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-white">{page.name}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="font-mono text-xs text-[#1e90ff] bg-[#1e90ff]/10 px-2 py-0.5 rounded">{page.slug}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{page.modified}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[page.status]}`}>{page.status}</span>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <SeoBar score={page.seo} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <a href={page.slug} target="_blank" rel="noreferrer" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Preview">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => setEditModal(page)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Edit SEO">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Duplicate">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEO Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Edit SEO — {editModal.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">SEO Title <span className="text-slate-500">(60 chars)</span></label>
                <input defaultValue={`${editModal.name} | Check My Claim`} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Meta Description <span className="text-slate-500">(160 chars)</span></label>
                <textarea rows={3} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff] resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Canonical URL</label>
                <input defaultValue={`https://checkmyclaim.co${editModal.slug}`} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Index this page</label>
                <div className="w-10 h-5 bg-[#1e90ff] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg transition-all">Save Changes</button>
              <button onClick={() => setEditModal(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2 rounded-lg transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
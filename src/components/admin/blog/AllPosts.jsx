import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Copy, Trash2, Eye, Cpu, Filter, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUS_COLORS = {
  Published: "bg-green-500/10 text-green-400 border border-green-500/20",
  Draft: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  Scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Hidden: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

function SeoBar({ score }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/10 rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-6">{score}</span>
    </div>
  );
}

export default function AllPosts({ onEdit, onNew }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    base44.entities.BlogPost.list("-publishedAt", 100)
      .then(data => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id));

  const handleDelete = async (id) => {
    await base44.entities.BlogPost.delete(id);
    setPosts(ps => ps.filter(p => p.id !== id));
  };

  const handleDuplicate = async (post) => {
    const { id, created_date, updated_date, ...rest } = post;
    const dup = await base44.entities.BlogPost.create({ ...rest, title: `${rest.title} (Copy)`, slug: `${rest.slug}-copy`, status: "Draft" });
    setPosts(ps => [dup, ...ps]);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts by title, tag, keyword…" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#1e90ff]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Published", "Draft", "Scheduled", "Hidden"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{s}</button>
          ))}
          <button onClick={onNew} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all ml-1">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#1e90ff]/10 border border-[#1e90ff]/20 rounded-lg px-4 py-2.5 mb-4 text-sm flex-wrap">
          <span className="text-[#1e90ff] font-medium">{selected.length} selected</span>
          <button className="text-slate-300 hover:text-white">Publish</button>
          <button className="text-slate-300 hover:text-white">Hide</button>
          <button className="text-red-400 hover:text-red-300">Delete</button>
          <button className="text-slate-300 hover:text-white">Export</button>
          <button onClick={() => setSelected([])} className="ml-auto text-slate-400 hover:text-white">Clear</button>
        </div>
      )}

      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left w-8">
                <input type="checkbox" checked={allSelected} onChange={e => setSelected(e.target.checked ? filtered.map(p => p.id) : [])} className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Title</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden lg:table-cell">Published</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden xl:table-cell">Words</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden xl:table-cell">SEO</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-white/5 animate-pulse">
                  <td className="px-4 py-3" colSpan={8}><div className="h-4 bg-white/5 rounded w-full" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No posts found</td></tr>
            ) : filtered.map(post => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggleSelect(post.id)} className="rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{post.title}</span>
                    {post.isAIGenerated && <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-1.5 py-0.5 rounded"><Cpu className="w-3 h-3" />AI</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">{post.slug}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded">{post.category || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[post.status] || STATUS_COLORS.Draft}`}>{post.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">
                  {post.body ? Math.round(post.body.replace(/<[^>]+>/g, "").split(/\s+/).length).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <SeoBar score={post.seoTitle && post.metaDescription ? 82 : 45} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(post)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Preview"><Eye className="w-3.5 h-3.5" /></a>
                    <button onClick={() => handleDuplicate(post)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
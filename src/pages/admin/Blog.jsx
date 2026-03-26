import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit, Copy, Trash2, Eye, Cpu, ChevronDown, X, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";

const mockPosts = [
  { id: 1, title: "How to File a Car Accident Claim in 2024", author: "Admin", category: "Car Accidents", status: "Published", date: "Mar 20, 2024", seo: 88, words: 1450, ai: true },
  { id: 2, title: "What to Do After a Slip and Fall Accident", author: "Editor", category: "Slip & Fall", status: "Published", date: "Mar 18, 2024", seo: 82, words: 1200, ai: false },
  { id: 3, title: "Understanding No Win No Fee Legal Services", author: "Admin", category: "Legal Advice", status: "Draft", date: "Mar 15, 2024", seo: 60, words: 800, ai: true },
  { id: 4, title: "Top 10 Personal Injury Claims Mistakes to Avoid", author: "Editor", category: "Legal Advice", status: "Scheduled", date: "Mar 28, 2024", seo: 91, words: 2100, ai: false },
];

const statusColors = {
  Published: "bg-green-500/10 text-green-400 border border-green-500/20",
  Draft: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  Scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Hidden: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

function BlogEditor({ onClose }) {
  const [mode, setMode] = useState("manual");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState("");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("Informative");
  const [wordCount, setWordCount] = useState("1200");

  const handleGenerate = async () => {
    if (!topic) return;
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a high-quality, SEO-optimized blog post about: "${topic}". 
Primary keyword: "${keyword}". 
Tone: ${tone}. 
Target word count: ${wordCount} words.
Write for accident victims in the US looking for legal help.
Include an introduction, main sections with H2 headings, and a conclusion.
Format with proper markdown.`,
      });
      setAiGenerated(res);
      setMode("manual");
    } catch (e) {
      console.error(e);
    }
    setAiLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-[#0a1628] border border-white/10 rounded-2xl w-full max-w-5xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">New Blog Post</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 py-4 border-b border-white/10 flex gap-3">
          <button onClick={() => setMode("manual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "manual" ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>
            ✍️ Manual Write
          </button>
          <button onClick={() => setMode("ai")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === "ai" ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>
            <Cpu className="w-4 h-4" /> AI Generate
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main Editor */}
          <div className="flex-1 p-6">
            {mode === "ai" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Topic / Title Idea</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. car accident claims in California" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Primary Keyword</label>
                    <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="car accident claim" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Content Tone</label>
                    <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
                      {["Informative", "How-To Guide", "Listicle", "FAQ", "News", "Comparison"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Target Word Count</label>
                  <div className="flex gap-2">
                    {["500", "800", "1200", "2000+"].map(w => (
                      <button key={w} onClick={() => setWordCount(w)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${wordCount === w ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{w}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked /> Include FAQ Section
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked /> Schema Markup
                  </label>
                </div>
                <button onClick={handleGenerate} disabled={aiLoading || !topic} className="w-full bg-gradient-to-r from-[#1e90ff] to-blue-600 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {aiLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <><Cpu className="w-4 h-4" /> Generate Article</>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input placeholder="Post Title..." defaultValue={aiGenerated ? topic : ""} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-4 py-3 text-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
                <textarea
                  rows={16}
                  defaultValue={aiGenerated}
                  placeholder="Start writing your article here..."
                  className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] resize-none font-mono"
                />
              </div>
            )}
          </div>

          {/* SEO Sidebar */}
          <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">SEO Settings</h3>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">SEO Title <span className="text-slate-500">0/60</span></label>
              <input className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Meta Description <span className="text-slate-500">0/160</span></label>
              <textarea rows={3} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff] resize-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Focus Keyword</label>
              <input className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Publish Settings</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Status</label>
                  <select className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <select className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]">
                    <option>Car Accidents</option>
                    <option>Slip & Fall</option>
                    <option>Legal Advice</option>
                    <option>Medical Malpractice</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="w-full bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Blog() {
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = mockPosts.filter(p =>
    (statusFilter === "All" || p.status === statusFilter) &&
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Blog Manager" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Blog" }]}>
      {showEditor && <BlogEditor onClose={() => setShowEditor(false)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="bg-[#0f1e35] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 w-52 focus:outline-none focus:border-[#1e90ff]" />
          </div>
          {["All", "Published", "Draft", "Scheduled", "Hidden"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{s}</button>
          ))}
        </div>
        <button onClick={() => setShowEditor(true)} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Title</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden lg:table-cell">Date</th>
              <th className="px-4 py-3 text-left text-slate-400 font-medium hidden xl:table-cell">Words</th>
              <th className="px-4 py-3 text-right text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(post => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{post.title}</span>
                    {post.ai && <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-1.5 py-0.5 rounded"><Cpu className="w-3 h-3" />AI</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">by {post.author}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded">{post.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[post.status]}`}>{post.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{post.date}</td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden xl:table-cell">{post.words.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setShowEditor(true)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
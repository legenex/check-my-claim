import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Tag } from "lucide-react";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Car Accidents", slug: "car-accidents", description: "Claims and legal guidance for motor vehicle accident victims.", postCount: 12, seoTitle: "Car Accident Claims | Check My Claim", metaDescription: "Expert guides on car accident claims, compensation, and attorney matching." },
  { id: 2, name: "Personal Injury", slug: "personal-injury", description: "All personal injury claim types and legal processes.", postCount: 8, seoTitle: "", metaDescription: "" },
  { id: 3, name: "Legal Process", slug: "legal-process", description: "Understanding how the legal claims process works.", postCount: 6, seoTitle: "", metaDescription: "" },
  { id: 4, name: "Settlement Tips", slug: "settlement-tips", description: "How to maximise your settlement and avoid common mistakes.", postCount: 5, seoTitle: "", metaDescription: "" },
  { id: 5, name: "Slip & Fall", slug: "slip-fall", description: "Premises liability and slip and fall accident claims.", postCount: 4, seoTitle: "", metaDescription: "" },
  { id: 6, name: "Legal Advice", slug: "legal-advice", description: "General legal guidance for accident victims.", postCount: 9, seoTitle: "", metaDescription: "" },
  { id: 7, name: "Medical Malpractice", slug: "medical-malpractice", description: "Medical negligence and malpractice claim guides.", postCount: 3, seoTitle: "", metaDescription: "" },
];

const DEFAULT_TAGS = [
  { id: 1, name: "no win no fee", slug: "no-win-no-fee", postCount: 14 },
  { id: 2, name: "car accident", slug: "car-accident", postCount: 22 },
  { id: 3, name: "personal injury", slug: "personal-injury", postCount: 18 },
  { id: 4, name: "settlement", slug: "settlement", postCount: 11 },
  { id: 5, name: "attorney", slug: "attorney", postCount: 9 },
  { id: 6, name: "compensation", slug: "compensation", postCount: 16 },
  { id: 7, name: "claim process", slug: "claim-process", postCount: 7 },
];

function autoSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-");
}

export default function CategoriesTags() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [editCat, setEditCat] = useState(null);
  const [editTag, setEditTag] = useState(null);
  const [newTag, setNewTag] = useState("");

  const saveCat = (cat) => {
    if (cat.id) {
      setCategories(cs => cs.map(c => c.id === cat.id ? cat : c));
    } else {
      setCategories(cs => [...cs, { ...cat, id: Date.now(), postCount: 0 }]);
    }
    setEditCat(null);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setTags(ts => [...ts, { id: Date.now(), name: newTag.trim(), slug: autoSlug(newTag), postCount: 0 }]);
    setNewTag("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Categories</h3>
          <button onClick={() => setEditCat({ name: "", slug: "", description: "", seoTitle: "", metaDescription: "" })} className="flex items-center gap-1.5 bg-[#1e90ff] hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>

        {editCat && (
          <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-5 mb-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">{editCat.id ? "Edit Category" : "New Category"}</span>
              <button onClick={() => setEditCat(null)}><X className="w-4 h-4 text-slate-400 hover:text-white" /></button>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Name</label>
              <input value={editCat.name} onChange={e => setEditCat(c => ({ ...c, name: e.target.value, slug: c.slug || autoSlug(e.target.value) }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Slug</label>
              <input value={editCat.slug} onChange={e => setEditCat(c => ({ ...c, slug: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#1e90ff] font-mono focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <input value={editCat.description} onChange={e => setEditCat(c => ({ ...c, description: e.target.value }))} className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="text-xs font-semibold text-slate-400 mb-2">Archive Page SEO</div>
              <div className="space-y-2">
                <input value={editCat.seoTitle} onChange={e => setEditCat(c => ({ ...c, seoTitle: e.target.value }))} placeholder="SEO Title (60 chars)" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff]" />
                <textarea value={editCat.metaDescription} onChange={e => setEditCat(c => ({ ...c, metaDescription: e.target.value }))} rows={2} placeholder="Meta Description (160 chars)" className="w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1e90ff] resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveCat(editCat)} className="flex-1 bg-[#1e90ff] hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition-all">Save</button>
              <button onClick={() => setEditCat(null)} className="px-4 bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg transition-all">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-2.5 text-left text-slate-400 font-medium text-xs">Name</th>
                <th className="px-4 py-2.5 text-left text-slate-400 font-medium text-xs hidden sm:table-cell">Slug</th>
                <th className="px-4 py-2.5 text-center text-slate-400 font-medium text-xs">Posts</th>
                <th className="px-4 py-2.5 text-right text-slate-400 font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white text-sm">{cat.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{cat.description?.substring(0, 40)}{cat.description?.length > 40 ? "…" : ""}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="font-mono text-xs text-[#1e90ff]">{cat.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-white font-semibold text-xs">{cat.postCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditCat(cat)} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => setCategories(cs => cs.filter(c => c.id !== cat.id))} className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Tags</h3>
          <span className="text-xs text-slate-400">{tags.length} tags</span>
        </div>

        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-4 mb-4">
          <label className="text-xs text-slate-400 mb-2 block">Add New Tag</label>
          <div className="flex gap-2">
            <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="Tag name…" className="flex-1 bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
            <button onClick={addTag} className="flex items-center gap-1.5 bg-[#1e90ff] hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-1.5 bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-1.5 group hover:border-white/20 transition-all">
              <Tag className="w-3 h-3 text-[#1e90ff]" />
              <span className="text-sm text-slate-200">{tag.name}</span>
              <span className="text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">{tag.postCount}</span>
              <button onClick={() => setTags(ts => ts.filter(t => t.id !== tag.id))} className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
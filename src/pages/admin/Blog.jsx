import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { List, PenSquare, Tag, BookOpen, Megaphone, Settings2 } from "lucide-react";
import AllPosts from "@/components/admin/blog/AllPosts";
import CreatePost from "@/components/admin/blog/CreatePost";
import CategoriesTags from "@/components/admin/blog/CategoriesTags";
import KnowledgeBase from "@/components/admin/blog/KnowledgeBase";
import CTATemplates from "@/components/admin/blog/CTATemplates";
import BaseInstructions from "@/components/admin/blog/BaseInstructions";

const TABS = [
  { id: "posts", label: "All Posts", icon: List },
  { id: "create", label: "Create Post", icon: PenSquare },
  { id: "categories", label: "Categories & Tags", icon: Tag },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { id: "base", label: "Base Instructions", icon: Settings2 },
  { id: "cta", label: "CTA Templates", icon: Megaphone },
];

export default function Blog() {
  const [activeTab, setActiveTab] = useState("posts");
  const [editPost, setEditPost] = useState(null);

  const handleEdit = (post) => {
    setEditPost(post);
    setActiveTab("create");
  };
  const handleNew = () => {
    setEditPost(null);
    setActiveTab("create");
  };

  return (
    <AdminLayout title="Blog Manager" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Blog Manager" }]}>
      {/* Sub-nav */}
      <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? "border-[#1e90ff] text-[#1e90ff]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" && <AllPosts onEdit={handleEdit} onNew={handleNew} />}
      {activeTab === "create" && <CreatePost initialPost={editPost} onSaved={() => setActiveTab("posts")} />}
      {activeTab === "categories" && <CategoriesTags />}
      {activeTab === "knowledge" && <KnowledgeBase />}
      {activeTab === "base" && <BaseInstructions />}
      {activeTab === "cta" && <CTATemplates />}
    </AdminLayout>
  );
}
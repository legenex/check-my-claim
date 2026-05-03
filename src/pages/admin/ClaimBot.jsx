import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ClaimBotSettingsTab from "@/components/admin/claimbot/ClaimBotSettingsTab";
import ClaimBotKnowledgeBaseTab from "@/components/admin/claimbot/ClaimBotKnowledgeBaseTab";
import ClaimBotConversationsTab from "@/components/admin/claimbot/ClaimBotConversationsTab";
import { Bot } from "lucide-react";

const TABS = ["Settings", "Knowledge Base", "Conversations"];

export default function ClaimBotAdminPage() {
  const [tab, setTab] = useState("Settings");

  return (
    <AdminLayout
      title="ClaimBot"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "ClaimBot" }]}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#1e90ff]/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-[#1e90ff]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">ClaimBot Manager</h2>
          <p className="text-slate-400 text-sm">Configure your AI chat assistant, manage its knowledge base, and review conversations.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? "text-white border-[#1e90ff]" : "text-slate-400 hover:text-white border-transparent"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Settings" && <ClaimBotSettingsTab />}
      {tab === "Knowledge Base" && <ClaimBotKnowledgeBaseTab />}
      {tab === "Conversations" && <ClaimBotConversationsTab />}
    </AdminLayout>
  );
}
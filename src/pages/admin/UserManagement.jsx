import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit, Trash2, Shield, Clock, MoreHorizontal, X } from "lucide-react";

const mockUsers = [
  { id: 1, name: "John Smith", email: "john@checkmyclaim.co", role: "Owner", lastActive: "Just now", status: "Active" },
  { id: 2, name: "Sarah Johnson", email: "sarah@checkmyclaim.co", role: "Admin", lastActive: "1 hr ago", status: "Active" },
  { id: 3, name: "Mike Davis", email: "mike@checkmyclaim.co", role: "Editor", lastActive: "3 hrs ago", status: "Active" },
  { id: 4, name: "Emma Wilson", email: "emma@checkmyclaim.co", role: "Viewer", lastActive: "Yesterday", status: "Active" },
  { id: 5, name: "Tom Brown", email: "tom@checkmyclaim.co", role: "Editor", lastActive: "1 week ago", status: "Suspended" },
];

const auditLog = [
  { user: "John Smith", action: "Updated Homepage SEO", time: "2 min ago" },
  { user: "Sarah Johnson", action: "Published blog post: 'Car Accident Claims 2024'", time: "1 hr ago" },
  { user: "Mike Davis", action: "Created draft blog post", time: "3 hrs ago" },
  { user: "John Smith", action: "Modified Robots.txt", time: "5 hrs ago" },
  { user: "Sarah Johnson", action: "Invited Emma Wilson as Viewer", time: "Yesterday" },
  { user: "John Smith", action: "Connected Google Analytics", time: "2 days ago" },
];

const roleColors = {
  Owner: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Admin: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Editor: "bg-green-500/10 text-green-400 border border-green-500/20",
  Viewer: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

const rolePermissions = {
  Owner: "Full access including billing and owner settings",
  Admin: "All access except billing and deleting owner",
  Editor: "Blog posts and pages only",
  Viewer: "Read-only analytics access",
};

function InviteModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Invite New User</h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email Address</label>
            <input placeholder="user@checkmyclaim.co" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Role</label>
            <select className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="bg-[#0a1628] rounded-lg p-3 border border-white/5">
            <div className="text-xs font-semibold text-slate-400 mb-2">Role Permissions:</div>
            {Object.entries(rolePermissions).map(([role, perm]) => (
              <div key={role} className="flex items-start gap-2 text-xs text-slate-400 mb-1">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${roleColors[role]}`}>{role}</span>
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="flex-1 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all">Send Invite</button>
          <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2.5 rounded-lg transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState("Users");

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="User Management" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      <div className="flex gap-1 mb-6 border-b border-white/10">
        {["Users", "Audit Log"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === tab ? "border-[#1e90ff] text-[#1e90ff]" : "border-transparent text-slate-400 hover:text-white"}`}>{tab}</button>
        ))}
      </div>

      {activeTab === "Users" && (
        <>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-[#0f1e35] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 w-52 focus:outline-none focus:border-[#1e90ff]" />
            </div>
            <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
              <Plus className="w-4 h-4" /> Invite User
            </button>
          </div>

          <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-slate-400 font-medium text-xs">Name</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium text-xs hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium text-xs">Role</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium text-xs hidden lg:table-cell">Last Active</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium text-xs">Status</th>
                  <th className="px-4 py-3 text-right text-slate-400 font-medium text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e90ff] to-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {user.lastActive}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${user.status === "Active" ? "text-green-400" : "text-red-400"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                        {user.role !== "Owner" && (
                          <button className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "Audit Log" && (
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Audit Log</h3>
          <div className="space-y-0">
            {auditLog.map((log, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e90ff] to-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {log.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium text-sm">{log.user}</span>
                  <span className="text-slate-400 text-sm"> — {log.action}</span>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
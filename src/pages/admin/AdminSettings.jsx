import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, AlertTriangle, Eye, EyeOff, RefreshCw } from "lucide-react";

const tabs = ["General", "Notifications", "API Keys", "Billing", "Danger Zone"];

function Section({ title, children }) {
  return (
    <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5 mb-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("General");
  const [showKey, setShowKey] = useState(false);

  return (
    <AdminLayout title="Settings" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}>
      <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${activeTab === tab ? "border-[#1e90ff] text-[#1e90ff]" : "border-transparent text-slate-400 hover:text-white"} ${tab === "Danger Zone" ? "text-red-400 hover:text-red-300 border-transparent" : ""}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="space-y-5 max-w-2xl">
          <Section title="Site Details">
            <div className="space-y-4">
              <Field label="Site Name"><input defaultValue="Check My Claim" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" /></Field>
              <Field label="Site URL"><input defaultValue="https://checkmyclaim.co" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" /></Field>
              <Field label="Default Language">
                <select className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                </select>
              </Field>
              <Field label="Timezone">
                <select className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
                  <option>America/New_York (EST)</option>
                  <option>America/Chicago (CST)</option>
                  <option>America/Denver (MST)</option>
                  <option>America/Los_Angeles (PST)</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Branding">
            <div className="space-y-4">
              <Field label="Site Logo">
                <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center text-slate-400 text-sm hover:border-[#1e90ff]/50 cursor-pointer transition-all">
                  <div className="mb-1">Drag & drop or click to upload</div>
                  <div className="text-xs text-slate-500">PNG, SVG recommended</div>
                </div>
              </Field>
              <Field label="Favicon">
                <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center text-slate-400 text-sm hover:border-[#1e90ff]/50 cursor-pointer transition-all">
                  <div className="mb-1">Upload favicon (.ico, .png)</div>
                  <div className="text-xs text-slate-500">32×32px recommended</div>
                </div>
              </Field>
            </div>
          </Section>

          <button className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="max-w-2xl">
          <Section title="Email Notifications">
            <div className="space-y-3">
              {[
                "New lead submitted",
                "New user registered",
                "Integration error detected",
                "Blog post published",
                "Site downtime alert",
              ].map(notif => (
                <div key={notif} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-slate-300">{notif}</span>
                  <div className="w-9 h-5 bg-[#1e90ff] rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <div className="max-w-2xl">
            <Field label="Notification Email">
              <input defaultValue="admin@checkmyclaim.co" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff] mt-1" />
            </Field>
            <button className="mt-4 flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all">
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        </div>
      )}

      {activeTab === "API Keys" && (
        <div className="max-w-2xl">
          <Section title="Internal API Keys">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Public API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type={showKey ? "text" : "password"} defaultValue="cmc_pub_a1b2c3d4e5f6g7h8i9j0" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff] font-mono" readOnly />
                  </div>
                  <button onClick={() => setShowKey(!showKey)} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-400">
                ⚠️ Never share your API keys publicly. Regenerating keys will invalidate existing ones.
              </div>
            </div>
          </Section>
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="max-w-2xl">
          <Section title="Current Plan">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1e90ff]/10 to-blue-800/10 rounded-xl border border-[#1e90ff]/20 mb-4">
              <div>
                <div className="text-lg font-bold text-white">Pro Plan</div>
                <div className="text-sm text-slate-400">Unlimited pages, blogs, and users</div>
              </div>
              <span className="bg-[#1e90ff]/20 text-[#1e90ff] border border-[#1e90ff]/30 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="text-sm text-slate-400">Next billing date: <span className="text-white font-medium">April 26, 2026</span></div>
            <button className="mt-4 text-sm text-[#1e90ff] hover:underline">Manage Billing →</button>
          </Section>
        </div>
      )}

      {activeTab === "Danger Zone" && (
        <div className="max-w-2xl">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Reset All Settings", desc: "Revert all settings to factory defaults. This cannot be undone.", btn: "Reset Settings" },
                { label: "Export All Data", desc: "Download a full export of all your data in JSON format.", btn: "Export Data" },
                { label: "Delete All Blog Posts", desc: "Permanently delete all blog posts and drafts.", btn: "Delete All Posts" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-red-500/10">
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                  <button className="ml-4 flex-shrink-0 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold rounded-lg transition-all">
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
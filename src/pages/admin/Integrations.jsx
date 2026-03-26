import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { CheckCircle, XCircle, Settings, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const integrations = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    description: "Track visitor behavior, conversions, and site performance.",
    connected: true,
    lastSync: "2 min ago",
    fields: [{ label: "Measurement ID", placeholder: "G-XXXXXXXXXX", val: "G-ZSBE52R6SL" }],
  },
  {
    id: "gsc",
    name: "Google Search Console",
    description: "Monitor search performance, indexing, and SEO data.",
    connected: true,
    lastSync: "1 hr ago",
    fields: [{ label: "Property URL", placeholder: "https://checkmyclaim.co", val: "https://checkmyclaim.co" }],
  },
  {
    id: "gtm",
    name: "Google Tag Manager",
    description: "Manage tracking scripts and tags without code changes.",
    connected: false,
    lastSync: "—",
    fields: [{ label: "Container ID", placeholder: "GTM-XXXXXXX", val: "" }],
  },
  {
    id: "fb",
    name: "Facebook CAPI",
    description: "Send server-side conversion events to Facebook Pixel.",
    connected: true,
    lastSync: "5 min ago",
    fields: [
      { label: "Pixel ID", placeholder: "892894053744200", val: "892894053744200" },
      { label: "Access Token", placeholder: "EAAG...", val: "••••••••••••••••" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get real-time notifications for new leads and system alerts.",
    connected: false,
    lastSync: "—",
    fields: [{ label: "Webhook URL", placeholder: "https://hooks.slack.com/...", val: "" }],
  },
  {
    id: "smtp",
    name: "Email SMTP",
    description: "Send transactional emails via your own SMTP server.",
    connected: false,
    lastSync: "—",
    fields: [
      { label: "SMTP Host", placeholder: "smtp.yourdomain.com", val: "" },
      { label: "Port", placeholder: "587", val: "" },
      { label: "Username", placeholder: "noreply@checkmyclaim.co", val: "" },
      { label: "Password", placeholder: "••••••••", val: "" },
    ],
  },
  {
    id: "webhook",
    name: "Custom Webhook",
    description: "Send event data to any external URL endpoint.",
    connected: false,
    lastSync: "—",
    fields: [{ label: "Webhook URL", placeholder: "https://your-endpoint.com/webhook", val: "" }],
  },
];

function IntegrationCard({ integration }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(integration.connected);

  return (
    <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          <div>
            <div className="text-sm font-semibold text-white">{integration.name}</div>
            <div className="text-xs text-slate-400">{integration.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${connected ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
            {connected ? "Connected" : "Not Connected"}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 px-5 py-4 space-y-4">
          {integration.lastSync !== "—" && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Last synced: {integration.lastSync}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {integration.fields.map(f => (
              <div key={f.label}>
                <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                <input defaultValue={f.val} placeholder={f.placeholder} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#1e90ff]" />
              </div>
            ))}
          </div>

          {integration.id === "fb" && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2">Event Mapping</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["PageView", "Lead", "CompleteRegistration", "InitiateCheckout"].map(e => (
                  <label key={e} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked /> {e}
                  </label>
                ))}
              </div>
            </div>
          )}

          {integration.id === "slack" && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2">Notification Triggers</div>
              <div className="grid grid-cols-2 gap-2">
                {["New lead submitted", "New blog post published", "New user registered", "Integration errors"].map(t => (
                  <label key={t} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked /> {t}
                  </label>
                ))}
              </div>
            </div>
          )}

          {integration.id === "webhook" && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2">Trigger Events</div>
              <div className="grid grid-cols-2 gap-2">
                {["Form Submitted", "Lead Created", "Page View", "Error Occurred"].map(t => (
                  <label key={t} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" className="rounded" /> {t}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => setConnected(!connected)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${connected ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "bg-[#1e90ff] text-white hover:bg-blue-500"}`}>
              {connected ? "Disconnect" : "Connect"}
            </button>
            {connected && (
              <button className="px-4 py-2 rounded-lg text-sm text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                Save Settings
              </button>
            )}
            {integration.id === "webhook" && (
              <button className="ml-auto px-4 py-2 rounded-lg text-sm text-[#1e90ff] bg-[#1e90ff]/10 hover:bg-[#1e90ff]/20 border border-[#1e90ff]/20 transition-all">
                Test Webhook
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Integrations() {
  return (
    <AdminLayout title="Integrations" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Integrations" }]}>
      <p className="text-slate-400 text-sm mb-6">Connect your marketing, analytics and communication tools. Click any integration to configure it.</p>
      <div className="space-y-3">
        {integrations.map(i => <IntegrationCard key={i.id} integration={i} />)}
      </div>
    </AdminLayout>
  );
}
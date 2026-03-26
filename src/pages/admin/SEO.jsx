import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Globe, Search, FileText, ArrowRight, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const pages = [
  { name: "Home", slug: "/", inSitemap: true, indexed: true },
  { name: "Survey", slug: "/Survey", inSitemap: true, indexed: true },
  { name: "Submitted", slug: "/Submitted", inSitemap: false, indexed: false },
  { name: "Thanks", slug: "/Thanks", inSitemap: false, indexed: false },
  { name: "Sorry", slug: "/Sorry", inSitemap: false, indexed: false },
  { name: "Privacy Policy", slug: "/PrivacyPolicy", inSitemap: true, indexed: true },
  { name: "Terms of Service", slug: "/TermsOfService", inSitemap: true, indexed: true },
  { name: "Advertising Disclosure", slug: "/AdvertisingDisclosure", inSitemap: true, indexed: true },
];

const gscData = [
  { query: "car accident claims", clicks: 842, impressions: 12400, position: 4.2 },
  { query: "how to claim compensation", clicks: 631, impressions: 9800, position: 5.8 },
  { query: "no win no fee lawyer", clicks: 510, impressions: 7200, position: 3.1 },
  { query: "check my claim", clicks: 428, impressions: 5100, position: 1.4 },
  { query: "accident compensation calculator", clicks: 302, impressions: 6400, position: 8.2 },
];

const redirects = [
  { from: "/old-survey", to: "/Survey", type: "301" },
  { from: "/contact", to: "/#contact", type: "302" },
];

const tabs = ["Overview", "Search Console", "Sitemap", "Robots.txt", "Redirects", "Structured Data"];

export default function SEO() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://checkmyclaim.co/sitemap.xml`);
  const [redirectList, setRedirectList] = useState(redirects);
  const [sitemapPages, setSitemapPages] = useState(pages);

  return (
    <AdminLayout title="SEO Manager" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "SEO Manager" }]}>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${activeTab === tab ? "border-[#1e90ff] text-[#1e90ff]" : "border-transparent text-slate-400 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Site-Wide SEO Defaults</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Default Title Template</label>
                <input defaultValue="%page_title% | Check My Claim — Free Accident Compensation Check" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Default Meta Description</label>
                <textarea rows={3} defaultValue="Check My Claim connects accident victims with top-rated attorneys. Get a free claim check today — no win, no fee." className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff] resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Default OG Image URL</label>
                <input defaultValue="https://checkmyclaim.co/og-image.jpg" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
              </div>
              <button className="bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all">Save Defaults</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Search Console" && (
        <div className="space-y-5">
          <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Google Search Console</h3>
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Connected
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[["Total Clicks", "2,713"], ["Total Impressions", "41,000"], ["Avg CTR", "6.6%"], ["Avg Position", "4.5"]].map(([l, v]) => (
                <div key={l} className="bg-[#0a1628] rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-slate-400">{l}</div>
                  <div className="text-xl font-bold text-white mt-1">{v}</div>
                </div>
              ))}
            </div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Queries</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 text-xs">
                  <th className="pb-2 text-left font-medium">Query</th>
                  <th className="pb-2 text-right font-medium">Clicks</th>
                  <th className="pb-2 text-right font-medium hidden sm:table-cell">Impressions</th>
                  <th className="pb-2 text-right font-medium hidden md:table-cell">Position</th>
                </tr>
              </thead>
              <tbody>
                {gscData.map(d => (
                  <tr key={d.query} className="border-b border-white/5">
                    <td className="py-2 text-white">{d.query}</td>
                    <td className="py-2 text-right text-[#1e90ff] font-semibold">{d.clicks}</td>
                    <td className="py-2 text-right text-slate-300 hidden sm:table-cell">{d.impressions.toLocaleString()}</td>
                    <td className="py-2 text-right text-slate-300 hidden md:table-cell">{d.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Sitemap" && (
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Sitemap Manager</h3>
            <button className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400">
                <th className="pb-2 text-left font-medium">Page</th>
                <th className="pb-2 text-left font-medium">Slug</th>
                <th className="pb-2 text-center font-medium">In Sitemap</th>
                <th className="pb-2 text-center font-medium">Submit to Index</th>
              </tr>
            </thead>
            <tbody>
              {sitemapPages.map((p, i) => (
                <tr key={p.slug} className="border-b border-white/5">
                  <td className="py-3 text-white font-medium">{p.name}</td>
                  <td className="py-3 font-mono text-xs text-[#1e90ff]">{p.slug}</td>
                  <td className="py-3 text-center">
                    <button onClick={() => setSitemapPages(ps => ps.map((x, j) => j === i ? { ...x, inSitemap: !x.inSitemap } : x))} className={`w-9 h-5 rounded-full relative transition-all ${p.inSitemap ? "bg-[#1e90ff]" : "bg-white/10"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${p.inSitemap ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <button className="text-xs text-[#1e90ff] hover:underline">Request Indexing</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Robots.txt" && (
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Robots.txt Editor</h3>
            <button className="bg-[#1e90ff] hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Save</button>
          </div>
          <textarea value={robotsTxt} onChange={e => setRobotsTxt(e.target.value)} rows={10} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-green-400 font-mono focus:outline-none focus:border-[#1e90ff] resize-none" />
        </div>
      )}

      {activeTab === "Redirects" && (
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Redirect Manager</h3>
            <button className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
              <Plus className="w-3.5 h-3.5" /> Add Redirect
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400">
                <th className="pb-2 text-left font-medium">From</th>
                <th className="pb-2 text-center font-medium"></th>
                <th className="pb-2 text-left font-medium">To</th>
                <th className="pb-2 text-center font-medium">Type</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirectList.map((r, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-3 font-mono text-xs text-slate-300">{r.from}</td>
                  <td className="py-3 text-center"><ArrowRight className="w-3.5 h-3.5 text-slate-500 mx-auto" /></td>
                  <td className="py-3 font-mono text-xs text-[#1e90ff]">{r.to}</td>
                  <td className="py-3 text-center"><span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2 py-0.5 rounded">{r.type}</span></td>
                  <td className="py-3 text-right">
                    <button onClick={() => setRedirectList(l => l.filter((_, j) => j !== i))} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Structured Data" && (
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Site-Level Schema</h3>
          <div className="space-y-4 max-w-2xl">
            {[
              { label: "Organization Name", val: "Check My Claim" },
              { label: "Website URL", val: "https://checkmyclaim.co" },
              { label: "Logo URL", val: "https://checkmyclaim.co/logo.png" },
              { label: "Contact Phone", val: "(844) 738 1035" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                <input defaultValue={f.val} className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]" />
              </div>
            ))}
            <button className="bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all">Save Schema</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
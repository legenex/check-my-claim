import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, RefreshCw, Copy, Check } from "lucide-react";

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] transition-colors";
const labelCls = "block text-xs font-semibold text-slate-400 mb-1";

const DEFAULT = {
  bot_name: "ClaimBot",
  bot_tagline: "Your free claim assistant",
  greeting_message: "Hi 👋 I'm ClaimBot. I can help you understand whether you may have a claim, what it could be worth, and how the free 30-second check works. What happened?",
  input_placeholder: "Ask anything about your claim...",
  system_prompt: "You are ClaimBot, a friendly and knowledgeable AI assistant for Check My Claim. Your role is to help accident victims understand their rights, what their case might be worth, and guide them to start a free claim check at https://qualify.checkmyclaim.co/s/mva. Be empathetic, clear, and non-legal-advice-giving. Always encourage users to start the free 30-second check for a real assessment.",
  cta_label: "Start My Free Claim Check",
  cta_url: "https://qualify.checkmyclaim.co/s/mva",
  phone_number: "(844) 840-6905",
  phone_cta_label: "Prefer to talk to someone?",
  is_enabled: true,
  show_on_landing_pages: true,
  show_on_advertorials: true,
  show_on_admin: false,
  primary_color: "#1e90ff",
  accent_color: "#22c55e",
  background_color: "#0b1220",
  text_color: "#ffffff",
  position: "bottom-right",
  launcher_label: "Chat with ClaimBot",
  auto_open_after_seconds: 0,
  escalation_after_n_turns: 6,
  max_messages_per_session: 30,
  compliance_disclaimer_short: "ClaimBot provides general information only. It is not a lawyer and does not provide legal advice. Check My Claim is not a law firm or referral service.",
  compliance_disclaimer_long: "",
  fallback_response: "I'm not sure I have a great answer for that. Would you like to start a free 30-second claim check, or speak with someone directly?",
  off_topic_response: "I can only help with questions about car accident claims, injuries, settlements, and the Check My Claim process. Want to start a free check?",
  embed_token: "",
  embed_allowed_origins: [],
  ai_model: "claude-sonnet-4-20250514",
  ai_temperature: 0.4,
  ai_max_tokens: 600,
  log_full_transcripts: true,
};

function Field({ label, children }) {
  return <div className="mb-4"><label className={labelCls}>{label}</label>{children}</div>;
}
function Section({ title, children }) {
  return (
    <div className="bg-[#0f1e35] border border-white/10 rounded-xl p-5 mb-5">
      <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ClaimBotSettingsTab() {
  const [form, setForm] = useState(DEFAULT);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newOrigin, setNewOrigin] = useState("");

  useEffect(() => {
    base44.entities.ClaimBotSettings.list().then(list => {
      if (list.length > 0) {
        setForm({ ...DEFAULT, ...list[0] });
        setSettingsId(list[0].id);
      }
    }).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (settingsId) {
      await base44.entities.ClaimBotSettings.update(settingsId, form);
    } else {
      const created = await base44.entities.ClaimBotSettings.create(form);
      setSettingsId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const rotateToken = () => {
    const token = "cbt_" + Math.random().toString(36).substr(2, 24);
    set("embed_token", token);
  };

  const addOrigin = () => {
    if (!newOrigin.trim()) return;
    set("embed_allowed_origins", [...(form.embed_allowed_origins || []), newOrigin.trim()]);
    setNewOrigin("");
  };

  const removeOrigin = (i) => {
    set("embed_allowed_origins", (form.embed_allowed_origins || []).filter((_, idx) => idx !== i));
  };

  const embedCode = `<!-- ClaimBot embed -->
<script src="${window.location.origin}/claimbot.js" data-token="${form.embed_token || "YOUR_TOKEN"}" async></script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-0">
      <Section title="General">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bot Name"><input value={form.bot_name} onChange={e => set("bot_name", e.target.value)} className={inputCls} /></Field>
          <Field label="Bot Tagline"><input value={form.bot_tagline} onChange={e => set("bot_tagline", e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Avatar URL (64×64 PNG recommended)"><input value={form.bot_avatar_url || ""} onChange={e => set("bot_avatar_url", e.target.value)} placeholder="https://..." className={inputCls} /></Field>
        <Field label="Greeting Message">
          <textarea value={form.greeting_message} onChange={e => set("greeting_message", e.target.value)} rows={3} className={inputCls} />
        </Field>
        <Field label="Input Placeholder"><input value={form.input_placeholder} onChange={e => set("input_placeholder", e.target.value)} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Position">
            <select value={form.position} onChange={e => set("position", e.target.value)} className={inputCls}>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </Field>
          <Field label="Launcher Label"><input value={form.launcher_label} onChange={e => set("launcher_label", e.target.value)} className={inputCls} /></Field>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_enabled} onChange={e => set("is_enabled", e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm text-white font-semibold">Master Enable (show bot across all pages)</span>
        </label>
      </Section>

      <Section title="Where It Shows">
        {[
          { key: "show_on_landing_pages", label: "Show on Landing Pages" },
          { key: "show_on_advertorials", label: "Show on Advertorial Pages" },
          { key: "show_on_admin", label: "Show on Admin Pages" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer mb-3">
            <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-slate-300">{label}</span>
          </label>
        ))}
      </Section>

      <Section title="Appearance">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "primary_color", label: "Primary Color (header, user bubbles, launcher)" },
            { key: "accent_color", label: "Accent Color (CTA button)" },
            { key: "background_color", label: "Background Color" },
            { key: "text_color", label: "Text Color" },
          ].map(({ key, label }) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2">
                <input type="color" value={form[key] || "#000000"} onChange={e => set(key, e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-white/10 bg-transparent" />
                <input value={form[key] || ""} onChange={e => set(key, e.target.value)} className={`${inputCls} flex-1`} placeholder="#000000" />
              </div>
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Behavior">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Auto-open After (seconds, 0=never)">
            <input type="number" min="0" value={form.auto_open_after_seconds} onChange={e => set("auto_open_after_seconds", parseInt(e.target.value) || 0)} className={inputCls} />
          </Field>
          <Field label="Escalate After (N user turns)">
            <input type="number" min="1" value={form.escalation_after_n_turns} onChange={e => set("escalation_after_n_turns", parseInt(e.target.value) || 6)} className={inputCls} />
          </Field>
          <Field label="Max Messages Per Session">
            <input type="number" min="5" value={form.max_messages_per_session} onChange={e => set("max_messages_per_session", parseInt(e.target.value) || 30)} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.log_full_transcripts} onChange={e => set("log_full_transcripts", e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm text-slate-300">Log full transcripts (required for KB improvement)</span>
        </label>
      </Section>

      <Section title="CTAs">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Survey CTA Label"><input value={form.cta_label} onChange={e => set("cta_label", e.target.value)} className={inputCls} /></Field>
          <Field label="Survey CTA URL"><input value={form.cta_url} onChange={e => set("cta_url", e.target.value)} className={inputCls} /></Field>
          <Field label="Phone CTA Label"><input value={form.phone_cta_label} onChange={e => set("phone_cta_label", e.target.value)} className={inputCls} /></Field>
          <Field label="Phone Number"><input value={form.phone_number} onChange={e => set("phone_number", e.target.value)} className={inputCls} /></Field>
        </div>
      </Section>

      <Section title="AI Model">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Model">
            <select value={form.ai_model} onChange={e => set("ai_model", e.target.value)} className={inputCls}>
              <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (recommended)</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5 (faster, cheaper)</option>
              <option value="claude-opus-4-6">Claude Opus 4.6 (highest quality)</option>
            </select>
          </Field>
          <Field label={`Temperature: ${form.ai_temperature}`}>
            <input type="range" min="0" max="1" step="0.05" value={form.ai_temperature} onChange={e => set("ai_temperature", parseFloat(e.target.value))} className="w-full mt-2" />
          </Field>
          <Field label="Max Tokens">
            <input type="number" min="100" max="2000" value={form.ai_max_tokens} onChange={e => set("ai_max_tokens", parseInt(e.target.value))} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="System Prompt">
        <Field label="Full system instructions sent to the AI on every message">
          <textarea value={form.system_prompt} onChange={e => set("system_prompt", e.target.value)} rows={10} className={`${inputCls} font-mono text-xs`} placeholder="You are ClaimBot..." />
        </Field>
      </Section>

      <Section title="Compliance & Fallback Responses">
        <Field label="Short Compliance Disclaimer (shown under input)">
          <textarea value={form.compliance_disclaimer_short} onChange={e => set("compliance_disclaimer_short", e.target.value)} rows={2} className={inputCls} />
        </Field>
        <Field label="Long Compliance Disclaimer (shown when user clicks ⓘ)">
          <textarea value={form.compliance_disclaimer_long || ""} onChange={e => set("compliance_disclaimer_long", e.target.value)} rows={4} className={inputCls} placeholder="Full legal disclaimer shown on request..." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fallback Response (when bot is uncertain)">
            <textarea value={form.fallback_response} onChange={e => set("fallback_response", e.target.value)} rows={3} className={inputCls} />
          </Field>
          <Field label="Off-Topic Response">
            <textarea value={form.off_topic_response || ""} onChange={e => set("off_topic_response", e.target.value)} rows={3} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Embed / External Widget">
        <div className="mb-4">
          <label className={labelCls}>Embed Token</label>
          <div className="flex gap-2">
            <input value={form.embed_token || ""} readOnly className={`${inputCls} font-mono flex-1`} placeholder="Click rotate to generate" />
            <button onClick={rotateToken} className="p-2.5 bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white" title="Generate new token">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-amber-400 mt-1">⚠ Rotating invalidates existing embeds immediately.</p>
        </div>

        <Field label="Allowed Origins (domains that can embed the bot)">
          <div className="flex flex-wrap gap-2 mb-2">
            {(form.embed_allowed_origins || []).map((o, i) => (
              <span key={i} className="flex items-center gap-1 bg-[#0a1628] border border-white/10 text-sm text-slate-300 px-3 py-1 rounded-full">
                {o}
                <button onClick={() => removeOrigin(i)} className="text-red-400 hover:text-red-300 ml-1 text-xs">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newOrigin} onChange={e => setNewOrigin(e.target.value)} onKeyDown={e => e.key === "Enter" && addOrigin()} placeholder="https://example.com" className={`${inputCls} flex-1`} />
            <button onClick={addOrigin} className="px-4 py-2 bg-[#1e90ff] hover:bg-blue-600 text-white text-sm font-semibold rounded-lg">Add</button>
          </div>
        </Field>

        <Field label="Embed Code">
          <div className="relative">
            <pre className="bg-[#0a1628] border border-white/10 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">{embedCode}</pre>
            <button onClick={copyEmbed} className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-slate-400 hover:text-white transition-all">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Paste this into any external webpage. The bot loads from your app domain and verifies the token + origin before rendering.</p>
        </Field>
      </Section>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all">
        {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : saved ? <><Check className="w-4 h-4 text-green-400" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
      </button>
    </div>
  );
}
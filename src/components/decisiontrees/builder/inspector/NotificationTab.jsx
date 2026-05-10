import React from "react";
import { Field, inputCls } from "../NodeInspector";

export default function NotificationTab({ node, onUpdate }) {
  const cfg = node.config || {};
  const set = (k, v) => onUpdate({ config: { ...cfg, [k]: v } });

  const channelFromType = {
    notification_sms: "SMS (Twilio)",
    notification_email: "Email (SendGrid)",
    notification_whatsapp: "WhatsApp (Twilio)",
    notification_messenger: "Messenger (Webhook)",
    notification_telegram: "Telegram (Webhook)",
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-400 bg-white/5 rounded-xl p-3">
        Channel: <strong className="text-white">{channelFromType[node.node_type] || "Unknown"}</strong>
      </div>
      <Field label="Recipient Template (use {email} or {phone})">
        <input value={cfg.recipient_template || ""} onChange={e => set("recipient_template", e.target.value)}
          className={inputCls} placeholder="{email}" />
      </Field>
      <Field label="Subject / Template ID">
        <input value={cfg.template_id || ""} onChange={e => set("template_id", e.target.value)}
          className={inputCls} placeholder="Template ID or subject line" />
      </Field>
      <Field label="Body Template (use {field_key} for interpolation)">
        <textarea value={cfg.body_template || ""} onChange={e => set("body_template", e.target.value)} rows={4}
          className={inputCls + " resize-none"} placeholder="Hi {first_name}, your case has been received..." />
      </Field>
      <Field label="Delay (seconds, 0 = immediate)">
        <input type="number" value={cfg.delay_seconds ?? 0} onChange={e => set("delay_seconds", parseInt(e.target.value))} className={inputCls} />
      </Field>
    </div>
  );
}
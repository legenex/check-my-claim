import React from "react";
import { Field, inputCls } from "../NodeInspector";

export default function PhoneVerificationTab({ node, onUpdate }) {
  const cfg = node.config || {};
  const set = (k, v) => onUpdate({ config: { ...cfg, [k]: v } });

  return (
    <div className="space-y-3">
      <Field label="Provider">
        <select value={cfg.provider || "twilio_verify"} onChange={e => set("provider", e.target.value)} className={inputCls}>
          <option value="twilio_verify">Twilio Verify</option>
          <option value="custom">Custom</option>
        </select>
      </Field>
      <Field label="Phone Field Key">
        <input value={cfg.phone_field || "phone"} onChange={e => set("phone_field", e.target.value)}
          className={inputCls + " font-mono"} placeholder="phone" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Max Attempts">
          <input type="number" value={cfg.max_attempts ?? 3} onChange={e => set("max_attempts", parseInt(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Code Length">
          <input type="number" value={cfg.code_length ?? 6} onChange={e => set("code_length", parseInt(e.target.value))} className={inputCls} />
        </Field>
      </div>
    </div>
  );
}
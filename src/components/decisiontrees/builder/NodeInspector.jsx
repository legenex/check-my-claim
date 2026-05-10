import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { getNodeLabel } from "./nodeConfig";

export default function NodeInspector({ node, edges, allNodes, onUpdate, onClose, onDeleteNode }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (node) setForm({ ...node, config: node.config || {} });
  }, [node?.node_id]);

  if (!node) return null;

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setConfig = (field, value) => setForm(f => ({ ...f, config: { ...f.config, [field]: value } }));

  const save = () => onUpdate(form);

  const outEdges = edges.filter(e => e.source_node_id === node.node_id);

  return (
    <div className="w-72 bg-[#0a1628] border-l border-white/10 flex flex-col h-full flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">{getNodeLabel(node.node_type)}</div>
          <div className="text-sm font-semibold text-white truncate">{node.label || "Node"}</div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <Field label="Label">
          <input value={form.label || ""} onChange={e => set("label", e.target.value)}
            onBlur={save} className={inputCls} placeholder="Node label shown to user" />
        </Field>

        {/* Description */}
        <Field label="Description / Sub-text">
          <textarea value={form.config?.description || ""} onChange={e => setConfig("description", e.target.value)}
            onBlur={save} rows={3} className={inputCls} placeholder="Optional helper text under the label" />
        </Field>

        {/* Field key */}
        {["text_input", "email_input", "phone_input", "date_input", "number_input", "question", "yes_no", "multiple_choice"].includes(node.node_type) && (
          <Field label="Field Key (snake_case)">
            <input value={form.field_key || ""} onChange={e => set("field_key", e.target.value)}
              onBlur={save} className={inputCls} placeholder="e.g. accident_state" />
          </Field>
        )}

        {/* Options for multiple choice */}
        {["multiple_choice", "yes_no", "question"].includes(node.node_type) && (
          <Field label="Answer Options">
            <OptionsEditor
              options={form.config?.options || []}
              onChange={opts => { setConfig("options", opts); }}
              onBlur={save}
            />
          </Field>
        )}

        {/* CTA text for start/info */}
        {["start", "info", "statement"].includes(node.node_type) && (
          <Field label="Button / CTA Text">
            <input value={form.config?.cta_text || ""} onChange={e => setConfig("cta_text", e.target.value)}
              onBlur={save} className={inputCls} placeholder="e.g. Get Started →" />
          </Field>
        )}

        {/* Redirect URL */}
        {node.node_type === "redirect" && (
          <Field label="Redirect URL">
            <input value={form.config?.redirect_url || ""} onChange={e => setConfig("redirect_url", e.target.value)}
              onBlur={save} className={inputCls} placeholder="https://..." />
          </Field>
        )}

        {/* Outcome config */}
        {["qualified", "disqualified", "outcome"].includes(node.node_type) && (
          <>
            <Field label="Heading">
              <input value={form.config?.heading || ""} onChange={e => setConfig("heading", e.target.value)}
                onBlur={save} className={inputCls} placeholder="e.g. You May Qualify!" />
            </Field>
            <Field label="Message">
              <textarea value={form.config?.message || ""} onChange={e => setConfig("message", e.target.value)}
                onBlur={save} rows={3} className={inputCls} />
            </Field>
            <Field label="CTA URL">
              <input value={form.config?.cta_url || ""} onChange={e => setConfig("cta_url", e.target.value)}
                onBlur={save} className={inputCls} placeholder="https://..." />
            </Field>
            <Field label="CTA Text">
              <input value={form.config?.cta_text || ""} onChange={e => setConfig("cta_text", e.target.value)}
                onBlur={save} className={inputCls} placeholder="Connect With an Attorney →" />
            </Field>
          </>
        )}

        {/* Outgoing edges */}
        {outEdges.length > 0 && (
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Outgoing Edges ({outEdges.length})</div>
            <div className="space-y-1">
              {outEdges.map(e => (
                <div key={e.id} className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-2 py-1.5 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e90ff]" />
                  <span className="truncate">{e.label || e.condition_value || "→"}</span>
                  <span className="text-slate-500 truncate">{allNodes.find(n => n.node_id === e.target_node_id)?.label || e.target_node_id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete */}
        <button onClick={() => onDeleteNode(node.node_id)}
          className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 py-2 rounded-lg text-xs font-semibold transition-all mt-4">
          <Trash2 className="w-3.5 h-3.5" /> Delete Node
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function OptionsEditor({ options, onChange, onBlur }) {
  const add = () => onChange([...options, { label: "", value: "" }]);
  const update = (i, field, val) => {
    const next = [...options];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const remove = (i) => onChange(options.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input value={opt.label} onChange={e => update(i, "label", e.target.value)} onBlur={onBlur}
            placeholder="Label" className={`${inputCls} flex-1`} />
          <input value={opt.value} onChange={e => update(i, "value", e.target.value)} onBlur={onBlur}
            placeholder="Value" className={`${inputCls} w-24`} />
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-[#1e90ff] hover:underline mt-1">
        <Plus className="w-3 h-3" /> Add option
      </button>
    </div>
  );
}

const inputCls = "w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
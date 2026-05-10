import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X, Trash2, ChevronDown, ChevronUp, GripVertical, Plus, Upload } from "lucide-react";
import { getNodeLabel } from "./nodeConfig";
import { base44 } from "@/api/base44Client";
import AnswerCustomFieldsModal from "./AnswerCustomFieldsModal";

// Node types that get the Answers tab
const QA_TYPES = ["single_select", "multiple_choice", "checkbox_multi_select", "dropdown"];

function toSnakeCase(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
}

// ─── Tag chip input ───────────────────────────────────────────────────────────
function TagChipInput({ tags, onChange, allTags, placeholder }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = allTags.filter(t => t.startsWith(input) && !tags.includes(t) && input.length > 0);

  const add = (tag) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
    setShowSuggestions(false);
  };

  const remove = (t) => onChange(tags.filter(x => x !== t));

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 p-1.5 bg-[#0f1e35] border border-white/10 rounded-lg min-h-[32px]">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 bg-[#1e3a5f] text-blue-300 text-xs px-2 py-0.5 rounded">
            {t}
            <button onClick={() => remove(t)} className="text-blue-400 hover:text-red-400">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); if (input.trim()) add(input); } }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="bg-transparent text-xs text-white outline-none flex-1 min-w-[80px] px-1"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f1e35] border border-white/10 rounded-lg z-20 shadow-xl max-h-32 overflow-y-auto">
          {suggestions.map(s => (
            <button key={s} onMouseDown={() => add(s)} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Visible-If editor ────────────────────────────────────────────────────────
const OPERATORS = ["equals", "not_equals", "includes", "not_includes", "in", "not_in", "greater_than", "less_than"];
const OP_SYMBOLS = { equals: "==", not_equals: "!=", includes: "includes", not_includes: "!includes", in: "in", not_in: "not in", greater_than: ">", less_than: "<" };

function parseVisibleIf(expr) {
  if (!expr) return null;
  const m = expr.match(/^fields\.([a-z0-9_]+)\s*(==|!=|includes|!includes|in|not in|>|<)\s*"(.+)"$/);
  if (!m) return null;
  const opRev = Object.entries(OP_SYMBOLS).find(([, v]) => v === m[2]);
  return opRev ? { field: m[1], op: opRev[0], value: m[3] } : null;
}

function serializeVisibleIf({ field, op, value }) {
  return `fields.${field} ${OP_SYMBOLS[op] || op} "${value}"`;
}

function VisibleIfEditor({ value, onChange, customFields }) {
  const [useRaw, setUseRaw] = useState(false);
  const parsed = parseVisibleIf(value);
  const [builder, setBuilder] = useState(parsed || { field: "", op: "equals", value: "" });
  const unparseable = value && !parsed;

  useEffect(() => {
    if (unparseable) setUseRaw(true);
  }, []);

  const handleBuilderChange = (patch) => {
    const next = { ...builder, ...patch };
    setBuilder(next);
    if (next.field && next.op && next.value) onChange(serializeVisibleIf(next));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-400">Visible If</span>
        <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
          <input type="checkbox" checked={useRaw} onChange={e => { if (!e.target.checked && unparseable) return; setUseRaw(e.target.checked); }} className="w-3 h-3" />
          Raw
        </label>
      </div>
      {useRaw ? (
        <div>
          <input value={value || ""} onChange={e => onChange(e.target.value)} className={inputCls} placeholder="fields.state == &quot;TX&quot;" />
          {unparseable && <p className="text-xs text-amber-400 mt-0.5">Unparseable — edit as raw expression</p>}
        </div>
      ) : (
        <div className="flex gap-1">
          <select value={builder.field} onChange={e => handleBuilderChange({ field: e.target.value })} className={`${inputCls} flex-1`}>
            <option value="">Field…</option>
            {customFields.map(cf => (
              <option key={cf.id} value={cf.field_key}>{cf.display_label} ({cf.field_key})</option>
            ))}
          </select>
          <select value={builder.op} onChange={e => handleBuilderChange({ op: e.target.value })} className={`${inputCls} w-28`}>
            {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          <input value={builder.value} onChange={e => handleBuilderChange({ value: e.target.value })} className={`${inputCls} w-24`} placeholder="value" />
        </div>
      )}
    </div>
  );
}

// ─── Single Answer Row ────────────────────────────────────────────────────────
function AnswerRow({ answer, index, total, onChange, onDelete, onMove, allTags, customFields, quizId }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [valueEdited, setValueEdited] = useState(false);
  const [valueDupError, setValueDupError] = useState(false);
  const debounceRef = useRef(null);
  // We pass sibling values up for dup check via onBlurCheck
  const allValues = []; // passed from parent via answer._siblingValues

  const update = (field, val) => {
    const next = { ...answer, [field]: val };
    onChange(index, next);
  };

  const debouncedUpdate = (field, val) => {
    const next = { ...answer, [field]: val };
    onChange(index, next, true); // true = debounce
  };

  const handleLabelChange = (val) => {
    const next = { ...answer, label: val };
    if (!valueEdited && !answer.value) {
      next.value = toSnakeCase(val);
    }
    onChange(index, next, true);
  };

  const handleValueChange = (val) => {
    setValueEdited(true);
    debouncedUpdate("value", val);
  };

  const handleValueBlur = (val, siblings) => {
    const dups = siblings.filter((v, i) => i !== index && v === val);
    setValueDupError(dups.length > 0);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("image_url", file_url);
  };

  return (
    <div className="bg-[#0f1e35] border border-white/10 rounded-xl mb-2 overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-2 p-2.5">
        {/* drag handle */}
        <div className="flex flex-col gap-0.5 cursor-grab text-slate-600 flex-shrink-0">
          <div className="flex gap-0.5">
            <button onClick={() => onMove(index, -1)} disabled={index === 0} className="text-slate-600 hover:text-white disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
            <button onClick={() => onMove(index, 1)} disabled={index === total - 1} className="text-slate-600 hover:text-white disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
          </div>
        </div>

        {/* Label */}
        <input
          value={answer.label || ""}
          onChange={e => handleLabelChange(e.target.value)}
          className={`${inputCls} flex-1 min-w-0`}
          placeholder="Answer label"
        />

        {/* Value */}
        <div className="flex-shrink-0 w-28">
          <input
            value={answer.value || ""}
            onChange={e => handleValueChange(e.target.value)}
            onBlur={e => handleValueBlur(e.target.value, answer._siblingValues || [])}
            className={`${inputCls} w-full ${valueDupError ? "border-red-500" : ""}`}
            placeholder="value"
          />
          {valueDupError && <p className="text-xs text-red-400 mt-0.5">Duplicate value</p>}
        </div>

        {/* Score */}
        <input
          type="number"
          value={answer.score ?? 0}
          onChange={e => update("score", parseFloat(e.target.value) || 0)}
          className={`${inputCls} w-16 flex-shrink-0`}
          placeholder="0"
        />

        {/* Tags preview (inline chips for tags_to_add) */}
        {(answer.tags_to_add || []).length > 0 && (
          <div className="flex flex-wrap gap-0.5 flex-shrink-0 max-w-[100px]">
            {(answer.tags_to_add || []).map(t => (
              <span key={t} className="text-xs bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded truncate max-w-[96px]">{t}</span>
            ))}
          </div>
        )}

        {/* Expand */}
        <button onClick={() => setExpanded(v => !v)} className="text-slate-500 hover:text-white flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
          {/* Image URL */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Image URL</label>
            <div className="flex gap-2">
              <input value={answer.image_url || ""} onChange={e => update("image_url", e.target.value)} className={`${inputCls} flex-1`} placeholder="https://..." />
              <label className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg cursor-pointer flex-shrink-0">
                <Upload className="w-3 h-3" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
            {answer.image_url && <img src={answer.image_url} alt="" className="mt-1.5 h-14 rounded-lg object-cover" />}
          </div>

          {/* Tags to Add */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tags to Add</label>
            <TagChipInput
              tags={answer.tags_to_add || []}
              onChange={v => update("tags_to_add", v)}
              allTags={allTags}
              placeholder="Add tags…"
            />
          </div>

          {/* Tags to Remove */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tags to Remove</label>
            <TagChipInput
              tags={answer.tags_to_remove || []}
              onChange={v => update("tags_to_remove", v)}
              allTags={allTags}
              placeholder="Remove tags…"
            />
          </div>

          {/* Is Default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => update("is_default", !answer.is_default)}
              className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${answer.is_default ? "bg-[#1e90ff]" : "bg-slate-700"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${answer.is_default ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <span className="text-xs text-slate-300">Is Default</span>
          </label>

          {/* Visible If */}
          <VisibleIfEditor
            value={answer.visible_if || ""}
            onChange={v => update("visible_if", v)}
            customFields={customFields}
          />

          {/* Delete */}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 mt-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete answer
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-red-400">Delete this answer?</span>
              <button onClick={() => { onDelete(index); setConfirmDelete(false); }} className="text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg">No</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Answers Tab ─────────────────────────────────────────────────────────────
function AnswersTab({ node, allNodes, allEdges, quiz, onUpdate }) {
  const [answers, setAnswers] = useState(node.answer_options || []);
  const [showCFModal, setShowCFModal] = useState(false);
  const [allCustomFields, setAllCustomFields] = useState([]);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    setAnswers(node.answer_options || []);
  }, [node.node_id]);

  useEffect(() => {
    // Load all custom fields for visible-if picker and tag autocomplete
    base44.entities.CustomField.list().then(setAllCustomFields).catch(() => {});
  }, []);

  // Build allTags from across the quiz
  const allTags = React.useMemo(() => {
    const tags = new Set();
    allNodes.forEach(n => {
      (n.tags_to_add || []).forEach(t => tags.add(t));
      (n.tags_to_remove || []).forEach(t => tags.add(t));
      (n.answer_options || []).forEach(a => {
        (a.tags_to_add || []).forEach(t => tags.add(t));
        (a.tags_to_remove || []).forEach(t => tags.add(t));
      });
    });
    allEdges.forEach(e => {
      const expr = e.condition_expression || "";
      const matches = [...expr.matchAll(/tags(?:\.includes)?\(['"]([^'"]+)['"]\)/g)];
      matches.forEach(m => tags.add(m[1]));
    });
    return [...tags].sort();
  }, [allNodes, allEdges]);

  // quiz-scoped + global custom fields for visible-if picker
  const relevantCFs = allCustomFields.filter(cf =>
    cf.scope === "global" || (cf.scope === "quiz" && cf.quiz_id === quiz?.id)
  );

  const persist = useCallback((updated) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await base44.entities.Question.update(node.id, { answer_options: updated });
      onUpdate({ ...node, answer_options: updated });
    }, 500);
  }, [node]);

  const persistImmediate = useCallback(async (updated) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await base44.entities.Question.update(node.id, { answer_options: updated });
    onUpdate({ ...node, answer_options: updated });
  }, [node]);

  const handleChange = (index, updated, debounce = false) => {
    const next = answers.map((a, i) => i === index ? updated : a);
    setAnswers(next);
    if (debounce) persist(next);
    else persistImmediate(next);
  };

  const handleDelete = (index) => {
    const next = answers.filter((_, i) => i !== index);
    setAnswers(next);
    persistImmediate(next);
  };

  const handleMove = (index, dir) => {
    const next = [...answers];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    setAnswers(next);
    persistImmediate(next);
  };

  const addAnswer = () => {
    const newAns = {
      id: `ans_${Math.random().toString(36).slice(2, 10)}`,
      label: "",
      value: "",
      score: 0,
      tags_to_add: [],
      tags_to_remove: [],
      is_default: false,
      image_url: null,
      visible_if: "",
      custom_field_overrides: {},
    };
    const next = [...answers, newAns];
    setAnswers(next);
    persistImmediate(next);
  };

  // Annotate answers with sibling values for dup check
  const siblingValues = answers.map(a => a.value);
  const annotated = answers.map(a => ({ ...a, _siblingValues: siblingValues }));

  const handleCFModalSave = async (updatedAnswers, updatedAssignments) => {
    setAnswers(updatedAnswers);
    await base44.entities.Question.update(node.id, {
      answer_options: updatedAnswers,
      custom_field_assignments: updatedAssignments,
    });
    onUpdate({ ...node, answer_options: updatedAnswers, custom_field_assignments: updatedAssignments });
    setShowCFModal(false);
  };

  return (
    <div className="p-3">
      {/* Custom Fields button */}
      <button
        onClick={() => setShowCFModal(true)}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#1e90ff] border border-[#1e90ff]/30 hover:border-[#1e90ff] hover:bg-[#1e90ff]/10 rounded-xl py-2.5 mb-4 transition-all"
      >
        <Plus className="w-3.5 h-3.5" /> Custom Fields per Answer
      </button>

      {/* Column headers */}
      <div className="flex items-center gap-2 px-2.5 mb-1 text-xs text-slate-500">
        <div className="w-7 flex-shrink-0" />
        <div className="flex-1">Label</div>
        <div className="w-28 flex-shrink-0">Value</div>
        <div className="w-16 flex-shrink-0">Score</div>
        <div className="w-5 flex-shrink-0" />
      </div>

      {/* Answer rows */}
      {annotated.map((answer, i) => (
        <AnswerRow
          key={answer.id || i}
          answer={answer}
          index={i}
          total={answers.length}
          onChange={handleChange}
          onDelete={handleDelete}
          onMove={handleMove}
          allTags={allTags}
          customFields={relevantCFs}
          quizId={quiz?.id}
        />
      ))}

      <button onClick={addAnswer}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-[#1e90ff] text-slate-400 hover:text-[#1e90ff] py-2.5 rounded-xl text-xs font-semibold transition-all mt-2">
        <Plus className="w-3.5 h-3.5" /> Add Answer
      </button>

      {showCFModal && (
        <AnswerCustomFieldsModal
          node={node}
          answers={answers}
          quiz={quiz}
          allCustomFields={allCustomFields}
          onSave={handleCFModalSave}
          onClose={() => setShowCFModal(false)}
        />
      )}
    </div>
  );
}

// ─── Main NodeInspector ───────────────────────────────────────────────────────
export default function NodeInspector({ node, edges, allNodes, allEdges, quiz, onUpdate, onClose, onDeleteNode }) {
  const isQA = QA_TYPES.includes(node?.node_type);
  const [activeTab, setActiveTab] = useState(isQA ? "answers" : "properties");
  const [form, setForm] = useState({});

  useEffect(() => {
    if (node) {
      setForm({ ...node, config: node.config || {} });
      setActiveTab(QA_TYPES.includes(node.node_type) ? "answers" : "properties");
    }
  }, [node?.node_id]);

  if (!node) return null;

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setConfig = (field, value) => setForm(f => ({ ...f, config: { ...f.config, [field]: value } }));
  const save = () => onUpdate(form);

  const outEdges = (allEdges || edges || []).filter(e => e.source_node_id === node.node_id);

  const tabs = [
    { id: "properties", label: "Properties" },
    ...(isQA ? [{ id: "answers", label: "Answers" }] : []),
    { id: "edges", label: `Edges (${outEdges.length})` },
  ];

  return (
    <div className="w-80 bg-[#0a1628] border-l border-white/10 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="min-w-0">
          <div className="text-xs text-slate-400 uppercase tracking-wider">{getNodeLabel(node.node_type)}</div>
          <div className="text-sm font-semibold text-white truncate">{node.label || "Node"}</div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeTab === tab.id ? "text-white border-b-2 border-[#1e90ff]" : "text-slate-400 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* PROPERTIES TAB */}
        {activeTab === "properties" && (
          <div className="p-4 space-y-4">
            <Field label="Label">
              <input value={form.label || ""} onChange={e => set("label", e.target.value)}
                onBlur={save} className={inputCls} placeholder="Node label shown to user" />
            </Field>
            <Field label="Description / Sub-text">
              <textarea value={form.config?.description || ""} onChange={e => setConfig("description", e.target.value)}
                onBlur={save} rows={3} className={inputCls} placeholder="Optional helper text under the label" />
            </Field>
            {["text_field", "email_input", "phone_input", "date_picker", "text_input", "email", "phone"].includes(node.node_type) && (
              <Field label="Field Key (snake_case)">
                <input value={form.field_key || ""} onChange={e => set("field_key", e.target.value)}
                  onBlur={save} className={inputCls} placeholder="e.g. accident_state" />
              </Field>
            )}
            {["start", "info", "statement", "start_page", "information"].includes(node.node_type) && (
              <Field label="Button / CTA Text">
                <input value={form.config?.cta_text || ""} onChange={e => setConfig("cta_text", e.target.value)}
                  onBlur={save} className={inputCls} placeholder="e.g. Get Started →" />
              </Field>
            )}
            {node.node_type === "redirect" && (
              <Field label="Redirect URL">
                <input value={form.config?.redirect_url || ""} onChange={e => setConfig("redirect_url", e.target.value)}
                  onBlur={save} className={inputCls} placeholder="https://..." />
              </Field>
            )}
            {["qualified", "disqualified", "outcome", "results_page"].includes(node.node_type) && (
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
            <button onClick={() => onDeleteNode(node.node_id)}
              className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 py-2 rounded-lg text-xs font-semibold transition-all mt-4">
              <Trash2 className="w-3.5 h-3.5" /> Delete Node
            </button>
          </div>
        )}

        {/* ANSWERS TAB */}
        {activeTab === "answers" && isQA && (
          <AnswersTab
            node={node}
            allNodes={allNodes}
            allEdges={allEdges || edges || []}
            quiz={quiz}
            onUpdate={onUpdate}
          />
        )}

        {/* EDGES TAB */}
        {activeTab === "edges" && (
          <div className="p-4 space-y-2">
            {outEdges.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No outgoing edges from this node.</p>
            ) : (
              outEdges.map(e => (
                <div key={e.id} className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e90ff] flex-shrink-0" />
                  <span className="truncate">{e.label || e.condition_value || "→"}</span>
                  <span className="text-slate-500 truncate ml-auto">
                    {allNodes.find(n => n.node_id === e.target_node_id)?.label || e.target_node_id}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
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

const inputCls = "w-full bg-[#0f1e35] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
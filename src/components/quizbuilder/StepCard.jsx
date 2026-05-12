import React, { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, GripVertical } from "lucide-react";
import StepEditorStart from "./stepeditors/StepEditorStart";
import StepEditorSingleSelect from "./stepeditors/StepEditorSingleSelect";
import StepEditorTextField from "./stepeditors/StepEditorTextField";
import StepEditorResults from "./stepeditors/StepEditorResults";

const STEP_TYPE_COLORS = {
  start: "#22c55e",
  single_select: "#1e90ff",
  multi_choice: "#3b82f6",
  dropdown: "#6366f1",
  yes_no: "#8b5cf6",
  text_field: "#f59e0b",
  email_input: "#f97316",
  phone_input: "#ef4444",
  number_input: "#06b6d4",
  date_picker: "#14b8a6",
  slider: "#84cc16",
  address: "#a78bfa",
  decision: "#fbbf24",
  webhook: "#f43f5e",
  form: "#64748b",
  notification: "#0ea5e9",
  script: "#475569",
  redirect: "#94a3b8",
  results: "#22c55e",
};

const PHASE1_TYPES = ["start", "single_select", "text_field", "results"];

export default function StepCard({ step, index, totalSteps, allSteps, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const color = STEP_TYPE_COLORS[step.step_type] || "#64748b";
  const isPhase1 = PHASE1_TYPES.includes(step.step_type);

  return (
    <div style={{ background: "var(--theme-surface-glass, rgba(20,18,40,0.6))", border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))", borderLeft: `3px solid ${color}`, borderRadius: "var(--theme-radius-card, 16px)" }} className="overflow-hidden">
      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-3">
        <div className="cursor-grab text-slate-600 flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{step.step_type}</span>
            <span className="text-xs text-slate-500">#{index + 1}</span>
          </div>
          <div className="text-sm font-semibold text-white truncate">{step.title_display || step.step_id}</div>
          {step.label && <div className="text-xs text-slate-400 truncate">{step.label}</div>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!confirmDelete ? (
            <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
              className="p-1 text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button onClick={() => onDelete()} className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">Del</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs bg-white/10 text-white px-2 py-0.5 rounded">No</button>
            </div>
          )}
          <button onClick={() => setExpanded(v => !v)} className="p-1 text-slate-400 hover:text-white">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="p-4" style={{ borderTop: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.05))" }}>
          {!isPhase1 ? (
            <div className="rounded-lg p-4" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--theme-primary, #8b5cf6)" }}>Available in Phase 2 or Phase 3</p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>step_id: <span className="text-slate-300 font-mono">{step.step_id}</span></div>
                <div>step_type: <span className="text-slate-300">{step.step_type}</span></div>
                <div>step_order: <span className="text-slate-300">{step.step_order}</span></div>
                <div>label: <span className="text-slate-300">{step.label || "—"}</span></div>
              </div>
            </div>
          ) : step.step_type === "start" ? (
            <StepEditorStart step={step} allSteps={allSteps} onUpdate={onUpdate} />
          ) : step.step_type === "single_select" ? (
            <StepEditorSingleSelect step={step} allSteps={allSteps} onUpdate={onUpdate} />
          ) : step.step_type === "text_field" ? (
            <StepEditorTextField step={step} allSteps={allSteps} onUpdate={onUpdate} />
          ) : step.step_type === "results" ? (
            <StepEditorResults step={step} allSteps={allSteps} onUpdate={onUpdate} />
          ) : null}
        </div>
      )}
    </div>
  );
}
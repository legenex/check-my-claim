/**
 * FlowStepModal — in-place step editor opened when clicking a node in Flow tab.
 * Does NOT switch to the Editor tab. Save & close persists and returns to Flow.
 */
import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import StepEditor from "./StepEditor";

export default function FlowStepModal({ step, steps, fields, surveyId, isStart, onSave, onClose, onFieldCreated }) {
  const [localStep, setLocalStep] = useState(step);

  // Sync if step prop changes (shouldn't in practice)
  useEffect(() => { setLocalStep(step); }, [step?.id]);

  // Intercept escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = useCallback((patch) => {
    setLocalStep(prev => ({ ...prev, ...patch }));
  }, []);

  const handleSave = () => {
    onSave(localStep);
    onClose();
  };

  if (!step) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(5,11,20,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "80vw", maxWidth: 1200, maxHeight: "90vh",
        background: "#0a1320", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Flow Editor</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{localStep?.title || localStep?.id}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>({localStep?.id})</span>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editor body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <StepEditor
            step={localStep}
            steps={steps}
            fields={fields}
            surveyId={surveyId}
            onChange={handleChange}
            onDelete={null}
            onDuplicate={null}
            onSetStart={null}
            isStart={isStart}
            onFieldCreated={onFieldCreated}
            readOnlyToolbar
          />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 20px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{ padding: "8px 20px", borderRadius: 5, border: "none", background: "#2282fc", color: "#fff", cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 700 }}
          >
            Save & close
          </button>
        </div>
      </div>
    </div>
  );
}
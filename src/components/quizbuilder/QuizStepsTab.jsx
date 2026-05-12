import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, GripVertical, Trash2, AlertCircle } from "lucide-react";
import StepCard from "./StepCard";
import AddStepModal from "./AddStepModal";

export default function QuizStepsTab({ quiz, steps, onUpdateStep, onAddStep, onDeleteStep, onReorder, highlightStepId }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const cardRefs = useRef({});

  useEffect(() => {
    if (highlightStepId && cardRefs.current[highlightStepId]) {
      cardRefs.current[highlightStepId].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightStepId]);

  const handleDragStart = (e, index) => {
    setDragging(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragging === null || dragging === index) { setDragging(null); setDragOver(null); return; }
    const reordered = [...steps];
    const [removed] = reordered.splice(dragging, 1);
    reordered.splice(index, 0, removed);
    setDragging(null);
    setDragOver(null);
    onReorder(reordered);
  };

  const handleAddStep = async (stepType) => {
    const newStepId = await onAddStep(stepType);
    setShowAddModal(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {steps.map((step, i) => (
            <div
              key={step.step_id}
              ref={el => cardRefs.current[step.step_id] = el}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
              className={`transition-all ${dragOver === i ? "ring-2 ring-[#1e90ff] rounded-xl" : ""} ${step.step_id === highlightStepId ? "ring-2 ring-yellow-400 rounded-xl" : ""}`}
            >
              <StepCard
                step={step}
                index={i}
                totalSteps={steps.length}
                allSteps={steps}
                onUpdate={(patch) => onUpdateStep(step.step_id, patch)}
                onDelete={() => onDeleteStep(step.step_id)}
              />
            </div>
          ))}

          {steps.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No steps yet. Add your first step below.</p>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed py-4 rounded-xl text-sm font-semibold transition-all"
            style={{ borderColor: "var(--theme-border-emphasis, rgba(139,92,246,0.3))", color: "var(--theme-text-faint, #64748b)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--theme-primary, #8b5cf6)"; e.currentTarget.style.color = "var(--theme-primary, #8b5cf6)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--theme-border-emphasis, rgba(139,92,246,0.3))"; e.currentTarget.style.color = "var(--theme-text-faint, #64748b)"; }}
          >
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddStepModal onSelect={handleAddStep} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
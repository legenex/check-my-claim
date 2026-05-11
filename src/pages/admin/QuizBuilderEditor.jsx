import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import QuizEditorTopBar from "@/components/quizbuilder/QuizEditorTopBar";
import QuizStepsTab from "@/components/quizbuilder/QuizStepsTab";
import QuizCanvasTab from "@/components/quizbuilder/QuizCanvasTab";
import QuizSettingsTab from "@/components/quizbuilder/QuizSettingsTab";

const TABS = ["Steps", "Canvas", "Settings"];

export default function QuizBuilderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [steps, setSteps] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState("Steps");
  const [publishErrors, setPublishErrors] = useState([]);
  const [highlightStepId, setHighlightStepId] = useState(null);
  const autoSaveTimer = useRef(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [quizList, stepList, brandList, allQs] = await Promise.all([
      base44.entities.Quiz.filter({ id }),
      base44.entities.QuizStep.filter({ quiz_id: id }),
      base44.entities.Brand.list(),
      base44.entities.Quiz.list("-updated_date", 200),
    ]);
    const q = quizList[0] || null;
    setQuiz(q);
    setSteps(stepList.slice().sort((a, b) => a.step_order - b.step_order));
    setBrands(brandList);
    setAllQuizzes(allQs);
    setLoading(false);
  };

  const updateQuiz = useCallback((patch) => {
    setQuiz(prev => ({ ...prev, ...patch }));
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true);
      await base44.entities.Quiz.update(id, patch);
      setSaving(false);
      setLastSaved(new Date());
    }, 1200);
  }, [id]);

  const saveQuizNow = async (patch = {}) => {
    setSaving(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const merged = { ...quiz, ...patch };
    await base44.entities.Quiz.update(id, merged);
    setQuiz(merged);
    setSaving(false);
    setLastSaved(new Date());
  };

  // Rebuild QuizTransition cache
  const rebuildTransitions = useCallback(async (stepsArr) => {
    // Delete existing transitions
    const existing = await base44.entities.QuizTransition.filter({ quiz_id: id });
    await Promise.all(existing.map(t => base44.entities.QuizTransition.delete(t.id)));
    // Emit new transitions
    const transitions = [];
    stepsArr.forEach(step => {
      if (step.default_next_step_id) {
        transitions.push({ quiz_id: id, source_step_id: step.step_id, target_step_id: step.default_next_step_id, transition_type: "default", label: null });
      }
      (step.answer_options || []).forEach(opt => {
        if (opt.target_step_id) {
          transitions.push({ quiz_id: id, source_step_id: step.step_id, target_step_id: opt.target_step_id, transition_type: "answer", label: opt.label || null });
        }
      });
    });
    if (transitions.length) await base44.entities.QuizTransition.bulkCreate(transitions);
  }, [id]);

  const updateStep = useCallback(async (stepId, patch) => {
    setSaving(true);
    const step = steps.find(s => s.step_id === stepId);
    if (!step) return;
    const updated = { ...step, ...patch };
    await base44.entities.QuizStep.update(step.id, patch);
    const newSteps = steps.map(s => s.step_id === stepId ? updated : s);
    setSteps(newSteps);
    await rebuildTransitions(newSteps);
    setSaving(false);
    setLastSaved(new Date());
  }, [steps, rebuildTransitions]);

  const addStep = useCallback(async (stepType) => {
    const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) : -1;
    const newStepId = `s_${Math.random().toString(36).slice(2, 8)}`;
    const newStep = {
      quiz_id: id, step_id: newStepId, step_order: maxOrder + 1, step_type: stepType,
      label: "", title_display: `${maxOrder + 2}. ${stepType}`,
      default_next_step_id: null, answer_options: [], config: {},
    };
    const created = await base44.entities.QuizStep.create(newStep);
    // Auto-chain: if previous last step is non-branching/non-terminal, link it to new step
    const BRANCHING = ["single_select", "multi_choice", "dropdown", "yes_no", "decision", "webhook"];
    const TERMINAL = ["results", "redirect"];
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      if (!BRANCHING.includes(lastStep.step_type) && !TERMINAL.includes(lastStep.step_type)) {
        const updatedLast = { ...lastStep, default_next_step_id: newStepId };
        await base44.entities.QuizStep.update(lastStep.id, { default_next_step_id: newStepId });
        const newSteps = [...steps.map(s => s.step_id === lastStep.step_id ? updatedLast : s), { ...newStep, id: created.id }];
        setSteps(newSteps);
        await rebuildTransitions(newSteps);
        return newStepId;
      }
    }
    const newSteps = [...steps, { ...newStep, id: created.id }];
    setSteps(newSteps);
    await rebuildTransitions(newSteps);
    return newStepId;
  }, [steps, id, rebuildTransitions]);

  const deleteStep = useCallback(async (stepId) => {
    const step = steps.find(s => s.step_id === stepId);
    if (!step) return;
    await base44.entities.QuizStep.delete(step.id);
    const newSteps = steps.filter(s => s.step_id !== stepId);
    setSteps(newSteps);
    await rebuildTransitions(newSteps);
  }, [steps, rebuildTransitions]);

  const reorderSteps = useCallback(async (newSteps) => {
    const BRANCHING = ["single_select", "multi_choice", "dropdown", "yes_no", "decision", "webhook"];
    const TERMINAL = ["results", "redirect"];
    // Update step_order and auto-chain defaults
    const updated = newSteps.map((s, i) => {
      const next = newSteps[i + 1];
      let defaultNext = s.default_next_step_id;
      if (!BRANCHING.includes(s.step_type) && !TERMINAL.includes(s.step_type)) {
        defaultNext = next ? next.step_id : null;
      }
      return { ...s, step_order: i, default_next_step_id: defaultNext };
    });
    setSteps(updated);
    // Set first step as start_step_id
    if (updated.length > 0) {
      updateQuiz({ start_step_id: updated[0].step_id });
    }
    // Persist all
    await Promise.all(updated.map(s => base44.entities.QuizStep.update(s.id, { step_order: s.step_order, default_next_step_id: s.default_next_step_id })));
    await rebuildTransitions(updated);
  }, [rebuildTransitions, updateQuiz]);

  const validateAndPublish = async () => {
    const errors = [];
    if (!quiz.title) errors.push("Title is required.");
    if (!quiz.slug) errors.push("Slug is required.");
    // Slug uniqueness
    const existing = allQuizzes.filter(q => q.slug === quiz.slug && q.id !== id);
    if (existing.length) errors.push(`Slug "${quiz.slug}" is already in use.`);
    const startStep = steps.find(s => s.step_type === "start");
    if (!startStep) errors.push("At least one step with type 'start' is required.");
    if (!quiz.start_step_id || !steps.find(s => s.step_id === quiz.start_step_id)) errors.push("start_step_id must point to an existing step.");
    // Reference integrity
    const stepIds = new Set(steps.map(s => s.step_id));
    steps.forEach(s => {
      if (s.default_next_step_id && !stepIds.has(s.default_next_step_id)) errors.push(`Step "${s.title_display}" has a broken default_next_step_id.`);
      (s.answer_options || []).forEach(o => {
        if (o.target_step_id && !stepIds.has(o.target_step_id)) errors.push(`Step "${s.title_display}" answer "${o.label}" has a broken target_step_id.`);
      });
    });
    if (errors.length) { setPublishErrors(errors); return; }
    setPublishErrors([]);
    await saveQuizNow({ status: "published", published_at: new Date().toISOString(), version: (quiz.version || 1) + 1 });
  };

  const handleCanvasNodeClick = (stepId) => {
    setActiveTab("Steps");
    setHighlightStepId(stepId);
    setTimeout(() => setHighlightStepId(null), 2000);
  };

  if (loading) return (
    <AdminRouteGuard>
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-[#1e90ff] rounded-full animate-spin" />
      </div>
    </AdminRouteGuard>
  );

  if (!quiz) return (
    <AdminRouteGuard>
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Quiz not found</p>
          <button onClick={() => navigate("/admin/QuizBuilder")} className="text-[#1e90ff] hover:underline text-sm">← Back to Quiz Builder</button>
        </div>
      </div>
    </AdminRouteGuard>
  );

  return (
    <AdminRouteGuard>
      <div className="fixed inset-0 bg-[#0a1628] flex flex-col overflow-hidden">
        <QuizEditorTopBar
          quiz={quiz}
          brands={brands}
          allQuizzes={allQuizzes}
          saving={saving}
          lastSaved={lastSaved}
          publishErrors={publishErrors}
          onTitleChange={t => updateQuiz({ title: t })}
          onSlugChange={s => updateQuiz({ slug: s })}
          onBrandChange={b => updateQuiz({ brand_id: b })}
          onPublish={validateAndPublish}
          onBack={() => navigate("/admin/QuizBuilder")}
        />
        {publishErrors.length > 0 && (
          <div className="bg-red-900/30 border-b border-red-500/30 px-4 py-2 flex-shrink-0">
            {publishErrors.map((e, i) => <p key={i} className="text-red-300 text-xs">⚠ {e}</p>)}
          </div>
        )}
        {/* Tabs */}
        <div className="bg-[#0f1e35] border-b border-white/10 flex flex-shrink-0">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? "text-white border-[#1e90ff]" : "text-slate-400 border-transparent hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "Steps" && (
            <QuizStepsTab
              quiz={quiz}
              steps={steps}
              onUpdateStep={updateStep}
              onAddStep={addStep}
              onDeleteStep={deleteStep}
              onReorder={reorderSteps}
              highlightStepId={highlightStepId}
            />
          )}
          {activeTab === "Canvas" && (
            <QuizCanvasTab
              quiz={quiz}
              steps={steps}
              onNodeClick={handleCanvasNodeClick}
            />
          )}
          {activeTab === "Settings" && (
            <QuizSettingsTab
              quiz={quiz}
              brands={brands}
              onUpdate={updateQuiz}
            />
          )}
        </div>
      </div>
    </AdminRouteGuard>
  );
}
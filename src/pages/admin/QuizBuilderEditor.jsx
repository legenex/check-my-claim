import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import QuizEditorTopBar from "@/components/quizbuilder/QuizEditorTopBar";
import QuizStepsTab from "@/components/quizbuilder/QuizStepsTab";
import QuizCanvasTab from "@/components/quizbuilder/QuizCanvasTab";
import QuizSettingsTab from "@/components/quizbuilder/QuizSettingsTab";
import { applyThemeVars, MIDNIGHT_GLASS_FALLBACK, themeFromBrand } from "@/lib/themeTokens";

const TABS = ["Steps", "Canvas", "Settings"];

export default function QuizBuilderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rootRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [steps, setSteps] = useState([]);
  const [brands, setBrands] = useState([]);
  const [themes, setThemes] = useState([]);
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
    const [quizList, stepList, brandList, allQs, themeList] = await Promise.all([
      base44.entities.Quiz.filter({ id }),
      base44.entities.QuizStep.filter({ quiz_id: id }),
      base44.entities.Brand.list(),
      base44.entities.Quiz.list("-updated_date", 200),
      base44.entities.Theme.list("-updated_date", 100),
    ]);
    const q = quizList[0] || null;
    setQuiz(q);
    setSteps(stepList.slice().sort((a, b) => a.step_order - b.step_order));
    setBrands(brandList);
    setAllQuizzes(allQs);
    setThemes(themeList);
    setLoading(false);
  };

  // Apply theme CSS vars whenever quiz.theme_id or themes change
  useEffect(() => {
    if (!rootRef.current || !quiz) return;
    let theme = null;
    if (quiz.theme_id && themes.length) {
      theme = themes.find(t => t.id === quiz.theme_id) || null;
    }
    if (!theme && quiz.brand_id && brands.length) {
      const brand = brands.find(b => b.id === quiz.brand_id);
      theme = brand ? themeFromBrand(brand) : MIDNIGHT_GLASS_FALLBACK;
    }
    applyThemeVars(rootRef.current, theme || MIDNIGHT_GLASS_FALLBACK);
  }, [quiz?.theme_id, quiz?.brand_id, themes, brands]);

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

  const rebuildTransitions = useCallback(async (stepsArr) => {
    const existing = await base44.entities.QuizTransition.filter({ quiz_id: id });
    await Promise.all(existing.map(t => base44.entities.QuizTransition.delete(t.id)));
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
    const updated = newSteps.map((s, i) => {
      const next = newSteps[i + 1];
      let defaultNext = s.default_next_step_id;
      if (!BRANCHING.includes(s.step_type) && !TERMINAL.includes(s.step_type)) {
        defaultNext = next ? next.step_id : null;
      }
      return { ...s, step_order: i, default_next_step_id: defaultNext };
    });
    setSteps(updated);
    if (updated.length > 0) updateQuiz({ start_step_id: updated[0].step_id });
    await Promise.all(updated.map(s => base44.entities.QuizStep.update(s.id, { step_order: s.step_order, default_next_step_id: s.default_next_step_id })));
    await rebuildTransitions(updated);
  }, [rebuildTransitions, updateQuiz]);

  const validateAndPublish = async () => {
    const errors = [];
    if (!quiz.title) errors.push("Title is required.");
    if (!quiz.slug) errors.push("Slug is required.");
    const existing = allQuizzes.filter(q => q.slug === quiz.slug && q.id !== id);
    if (existing.length) errors.push(`Slug "${quiz.slug}" is already in use.`);
    const startStep = steps.find(s => s.step_type === "start");
    if (!startStep) errors.push("At least one step with type 'start' is required.");
    if (!quiz.start_step_id || !steps.find(s => s.step_id === quiz.start_step_id)) errors.push("start_step_id must point to an existing step.");
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

  const handleThemeChange = (themeId) => {
    updateQuiz({ theme_id: themeId });
  };

  if (loading) return (
    <AdminRouteGuard>
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--theme-background, #0a0a1f)" }}>
        <div className="w-8 h-8 border-4 border-slate-700 rounded-full animate-spin" style={{ borderTopColor: "var(--theme-primary, #8b5cf6)" }} />
      </div>
    </AdminRouteGuard>
  );

  if (!quiz) return (
    <AdminRouteGuard>
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0a0a1f" }}>
        <div className="text-center">
          <p className="text-xl font-bold mb-2 text-white">Quiz not found</p>
          <button onClick={() => navigate("/admin/QuizBuilder")} className="text-[#8b5cf6] hover:underline text-sm">← Back to Quiz Builder</button>
        </div>
      </div>
    </AdminRouteGuard>
  );

  return (
    <AdminRouteGuard>
      <div
        ref={rootRef}
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{ background: "var(--theme-background-gradient, #0a0a1f)" }}
      >
        {/* Top toolbar — glass panel */}
        <div style={{
          background: "var(--theme-surface-glass, rgba(20,18,40,0.7))",
          borderBottom: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))",
          backdropFilter: "blur(16px)",
          flexShrink: 0,
        }}>
          <QuizEditorTopBar
            quiz={quiz}
            brands={brands}
            themes={themes}
            allQuizzes={allQuizzes}
            saving={saving}
            lastSaved={lastSaved}
            publishErrors={publishErrors}
            onTitleChange={t => updateQuiz({ title: t })}
            onSlugChange={s => updateQuiz({ slug: s })}
            onBrandChange={b => updateQuiz({ brand_id: b })}
            onThemeChange={handleThemeChange}
            onPublish={validateAndPublish}
            onBack={() => navigate("/admin/QuizBuilder")}
          />
        </div>

        {/* Publish errors */}
        {publishErrors.length > 0 && (
          <div className="flex-shrink-0 px-4 py-2" style={{ background: "rgba(251,71,133,0.08)", borderBottom: "1px solid rgba(251,71,133,0.2)" }}>
            {publishErrors.map((e, i) => <p key={i} className="text-xs" style={{ color: "var(--theme-error, #fb7185)" }}>⚠ {e}</p>)}
          </div>
        )}

        {/* Tab strip */}
        <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))", background: "var(--theme-surface-glass, rgba(20,18,40,0.5))" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-6 py-2.5 text-sm font-semibold transition-colors border-b-2"
              style={{
                color: activeTab === tab ? "var(--theme-text-primary, #f1f5f9)" : "var(--theme-text-faint, #64748b)",
                borderBottomColor: activeTab === tab ? "var(--theme-primary, #8b5cf6)" : "transparent",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
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
            <QuizCanvasTab quiz={quiz} steps={steps} onNodeClick={handleCanvasNodeClick} />
          )}
          {activeTab === "Settings" && (
            <QuizSettingsTab quiz={quiz} brands={brands} onUpdate={updateQuiz} />
          )}
        </div>
      </div>
    </AdminRouteGuard>
  );
}
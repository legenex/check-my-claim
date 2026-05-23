import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import SurveyTopBar from "@/components/surveybuilder/SurveyTopBar";
import SurveyStatusBar from "@/components/surveybuilder/SurveyStatusBar";
import StepRail from "@/components/surveybuilder/StepRail";
import StepEditor from "@/components/surveybuilder/StepEditor";
import StepInspector from "@/components/surveybuilder/StepInspector";
import AddStepModal from "@/components/surveybuilder/AddStepModal";
import FlowCanvas from "@/components/surveybuilder/FlowCanvas";
import FlowOverviewPanel from "@/components/surveybuilder/FlowOverviewPanel";
import SettingsPanel from "@/components/surveybuilder/SettingsPanel";
import TemplatesPanel from "@/components/surveybuilder/TemplatesPanel";
import PreviewOverlay from "@/components/surveybuilder/PreviewOverlay";
import { useAutosave } from "@/components/surveybuilder/useAutosave";
import { useValidation } from "@/components/surveybuilder/useValidation";

export default function SurveyEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const [survey, setSurvey] = useState(null);
  const [steps, setSteps] = useState([]);
  const [fields, setFields] = useState([]);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Editor");
  const [activeStepId, setActiveStepId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { save, saveStep, saveState, savedLabel } = useAutosave();
  const errors = useValidation(survey, steps, fields);

  // Load everything
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const load = async () => {
      const [surveyRes, stepsRes, fieldsRes, themesRes] = await Promise.all([
        base44.entities.Survey.filter({ id }),
        base44.entities.SurveyStep.filter({ survey_id: id }),
        base44.entities.SurveyField.list(null, 300),
        base44.entities.SurveyTheme.list(),
      ]);
      if (surveyRes.length > 0) {
        const s = surveyRes[0];
        setSurvey(s);
        const t = themesRes.find(t => t.id === s.theme_id);
        setTheme(t || null);
        // Auto-select first step
        const firstStepId = (s.step_order || [])[0] || stepsRes[0]?.id;
        if (firstStepId) setActiveStepId(firstStepId);
      }
      setSteps(stepsRes);
      setFields(fieldsRes);
      setLoading(false);
    };
    load();
  }, [id]);

  const activeStep = steps.find(s => s.id === activeStepId) || null;

  // Update survey + autosave
  const updateSurvey = useCallback((patch) => {
    setSurvey(prev => {
      const next = { ...prev, ...patch };
      save("Survey", id, patch);
      return next;
    });
  }, [id, save]);

  // Update a step + autosave
  const updateStep = useCallback((stepDbId, patch) => {
    setSteps(prev => prev.map(s => s.id === stepDbId ? { ...s, ...patch } : s));
    saveStep(stepDbId, patch);
  }, [saveStep]);

  const handleStepChange = useCallback((patch) => {
    if (!activeStep) return;
    updateStep(activeStep.id, patch);
  }, [activeStep, updateStep]);

  // Reorder
  const handleReorder = useCallback((newOrder, newStartId) => {
    const patch = { step_order: newOrder };
    if (newStartId) patch.start_step_id = newStartId;
    updateSurvey(patch);
  }, [updateSurvey]);

  // Add step
  const handleAddStep = useCallback(async (stepData) => {
    const created = await base44.entities.SurveyStep.create({ ...stepData, survey_id: id });
    setSteps(prev => [...prev, created]);
    const newOrder = [...(survey?.step_order || []), created.id];
    updateSurvey({ step_order: newOrder });
    setActiveStepId(created.id);
  }, [id, survey, updateSurvey]);

  // Delete step
  const handleDeleteStep = useCallback(async () => {
    if (!activeStep) return;
    await base44.entities.SurveyStep.delete(activeStep.id);
    setSteps(prev => prev.filter(s => s.id !== activeStep.id));
    const newOrder = (survey?.step_order || []).filter(sid => sid !== activeStep.id);
    const newStart = survey?.start_step_id === activeStep.id ? (newOrder[0] || "") : survey?.start_step_id;
    updateSurvey({ step_order: newOrder, start_step_id: newStart });
    setActiveStepId(newOrder[0] || null);
  }, [activeStep, survey, updateSurvey]);

  // Duplicate step
  const handleDuplicateStep = useCallback(async () => {
    if (!activeStep) return;
    const copy = { ...activeStep };
    delete copy.id;
    const newId = `${activeStep.id}_copy_${Date.now().toString(36)}`;
    const created = await base44.entities.SurveyStep.create({ ...copy, id: newId, title: `${activeStep.title} (Copy)`, survey_id: id });
    setSteps(prev => [...prev, created]);
    const stepOrder = survey?.step_order || [];
    const insertIdx = stepOrder.indexOf(activeStep.id) + 1;
    const newOrder = [...stepOrder.slice(0, insertIdx), created.id, ...stepOrder.slice(insertIdx)];
    updateSurvey({ step_order: newOrder });
    setActiveStepId(created.id);
  }, [activeStep, survey, id, updateSurvey]);

  // Set start
  const handleSetStart = useCallback(() => {
    if (!activeStep) return;
    updateSurvey({ start_step_id: activeStep.id });
  }, [activeStep, updateSurvey]);

  // Publish
  const handlePublish = useCallback(async () => {
    if (!survey) return;
    await base44.entities.Survey.update(id, { status: "published" });
    setSurvey(prev => ({ ...prev, status: "published" }));
  }, [survey, id]);

  // Title change
  const handleTitleChange = useCallback((name) => {
    updateSurvey({ name });
  }, [updateSurvey]);

  // Field CRUD
  const handleFieldCreated = useCallback((field) => {
    setFields(prev => [...prev, field]);
  }, []);
  const handleFieldUpdated = useCallback((field) => {
    setFields(prev => prev.map(f => f.id === field.id ? field : f));
  }, []);
  const handleFieldDeleted = useCallback((fieldId) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#050b14" }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#2282fc] animate-spin" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-3" style={{ background: "#050b14" }}>
        <p className="text-white font-semibold">Survey not found.</p>
        <a href="/admin/QuizBuilder" className="text-[#2282fc] text-sm hover:underline">Back to Surveys</a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: "#050b14", fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {/* Top bar */}
      <SurveyTopBar
        survey={survey}
        steps={steps}
        fields={fields}
        theme={theme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTitleChange={handleTitleChange}
        onPublish={handlePublish}
        saveState={saveState}
        savedLabel={savedLabel}
        onPreview={() => setShowPreview(true)}
      />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "Editor" && (
          <>
            {/* Left rail */}
            <div style={{ width: 280, flexShrink: 0 }}>
              <StepRail
                survey={survey}
                steps={steps}
                activeStepId={activeStepId}
                onSelectStep={setActiveStepId}
                onReorder={handleReorder}
                onAddStep={() => setShowAddModal(true)}
              />
            </div>

            {/* Center: step editor */}
            <div className="flex-1 overflow-hidden" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
              <StepEditor
                step={activeStep}
                steps={steps}
                fields={fields}
                surveyId={id}
                onChange={handleStepChange}
                onDelete={handleDeleteStep}
                onDuplicate={handleDuplicateStep}
                onSetStart={handleSetStart}
                isStart={survey?.start_step_id === activeStepId}
                onFieldCreated={handleFieldCreated}
              />
            </div>

            {/* Right rail: inspector */}
            <div style={{ width: 320, flexShrink: 0, background: "#0a1320", borderLeft: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="px-3 py-2.5 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: "#2282fc" }}>Inspector</span>
              </div>
              <StepInspector
                step={activeStep}
                steps={steps}
                fields={fields}
                errors={errors}
                onJumpToStep={setActiveStepId}
              />
            </div>
          </>
        )}

        {activeTab === "Flow" && (
          <>
            <div className="flex-1 overflow-hidden">
              <FlowCanvas
                survey={survey}
                steps={steps}
                activeStepId={activeStepId}
                onSelectStep={(stepId) => {
                  setActiveStepId(stepId);
                  setActiveTab("Editor");
                }}
              />
            </div>
            <div style={{ width: 300, flexShrink: 0, background: "#0a1320", borderLeft: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <FlowOverviewPanel survey={survey} steps={steps} fields={fields} errors={errors} />
            </div>
          </>
        )}

        {activeTab === "Settings" && (
          <div className="flex-1 overflow-hidden">
            <SettingsPanel
              survey={survey}
              steps={steps}
              fields={fields}
              theme={theme}
              onSurveyChange={updateSurvey}
              onFieldCreated={handleFieldCreated}
              onFieldUpdated={handleFieldUpdated}
              onFieldDeleted={handleFieldDeleted}
            />
          </div>
        )}

        {activeTab === "Templates" && (
          <div className="flex-1 overflow-hidden flex flex-col" style={{ background: "#050b14" }}>
            <TemplatesPanel surveyId={id} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <SurveyStatusBar
        saveState={saveState}
        savedLabel={savedLabel}
        steps={steps}
        fields={fields}
        errors={errors}
        onErrorClick={() => {
          if (errors[0]?.stepId) setActiveStepId(errors[0].stepId);
        }}
      />

      {/* Add step modal */}
      {showAddModal && (
        <AddStepModal
          onAdd={handleAddStep}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Preview overlay */}
      {showPreview && (
        <PreviewOverlay
          survey={survey}
          steps={steps}
          fields={fields}
          theme={theme}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
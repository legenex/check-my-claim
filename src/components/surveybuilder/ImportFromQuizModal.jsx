import React, { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

const TYPE_MAP = {
  multiple_choice: "single_select",
  checkbox: "multi_select",
  text: "text_input",
  number: "number_input",
  email: "email_input",
  phone: "phone_input",
  date: "date_input",
  dropdown: "single_select",
  info: "welcome",
  welcome: "welcome",
  start: "welcome",
  form: "text_input",
};

const FIELD_TYPE_MAP = {
  string: "text",
  text: "text",
  number: "number",
  boolean: "boolean",
  email: "email",
  phone: "phone",
  date: "date",
  enum: "enum",
  url: "url",
};

export default function ImportFromQuizModal({ onClose, onImported }) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { surveyId, stepCount, fieldCount, warnings }
  const [opts, setOpts] = useState({
    copySteps: true,
    copyFields: true,
    createMissingFields: true,
    preserveLegacyId: false,
  });

  useEffect(() => {
    base44.entities.Quiz.list("-updated_date", 100).then(setQuizzes).finally(() => setLoading(false));
  }, []);

  const doImport = async () => {
    if (!selectedQuizId) return;
    setImporting(true);
    const warnings = [];
    const createdSurveyStepIds = [];
    const createdSurveyFieldIds = [];
    let newSurveyId = null;

    try {
      const quiz = quizzes.find(q => q.id === selectedQuizId);
      const [quizSteps, existingFields] = await Promise.all([
        base44.entities.QuizStep.filter({ quiz_id: selectedQuizId }, "step_order", 200),
        opts.createMissingFields ? base44.entities.SurveyField.list(null, 200) : Promise.resolve([]),
      ]);

      // Build existing field key set
      const existingFieldKeys = new Set(existingFields.map(f => f.key));

      // Create Survey
      const surveyData = {
        name: `${quiz.title} (imported)`,
        slug: `${quiz.slug || "quiz"}-imported-${Date.now().toString(36)}`,
        status: "draft",
        vertical: quiz.vertical || "mva",
        tiers_active: ["shared", "t1", "t2", "t3", "t4", "dq"],
        step_order: [],
      };
      if (opts.preserveLegacyId) {
        surveyData.description = `Imported from Quiz ID: ${quiz.id}`;
      }
      const newSurvey = await base44.entities.Survey.create(surveyData);
      newSurveyId = newSurvey.id;

      const stepOrderIds = [];

      for (const qs of quizSteps) {
        // Determine SurveyStep type
        const rawType = qs.step_type || qs.type || "text";
        let mappedType = TYPE_MAP[rawType];
        if (!mappedType) {
          warnings.push(`Unknown step type "${rawType}" for step "${qs.label || qs.step_id}" - defaulted to single_select`);
          mappedType = "single_select";
        }

        // Handle display_mode for dropdown
        const displayMode = rawType === "dropdown" ? "dropdown" : "buttons";

        // Map options
        let customOptions = undefined;
        const rawOptions = qs.answer_options || qs.options || [];
        if (rawOptions.length > 0 && opts.copyFields) {
          customOptions = rawOptions.map(o => ({
            value: o.value || o.id || "",
            label: o.label || o.value || "",
            icon: o.image_url || undefined,
          }));
        }

        // Map save_to field
        const saveToField = qs.save_to || qs.identifier || undefined;

        // Create missing SurveyField if needed
        if (opts.createMissingFields && saveToField && !existingFieldKeys.has(saveToField)) {
          const fieldType = FIELD_TYPE_MAP[rawType] || "text";
          const newField = await base44.entities.SurveyField.create({
            key: saveToField,
            label: qs.label || saveToField,
            type: fieldType === "enum" ? "enum" : fieldType,
            category: "qualify",
            allowed_values: fieldType === "enum" ? rawOptions.map(o => ({ value: o.value, label: o.label })) : undefined,
          });
          createdSurveyFieldIds.push(newField.id);
          existingFieldKeys.add(saveToField);
        }

        // Map branching rules
        const branchingRules = qs.branching_rules || [];
        const branchingMode = branchingRules.length > 0 ? "by_answer" : "none";

        // Create SurveyStep
        const stepData = {
          survey_id: newSurveyId,
          type: mappedType,
          tier: "shared",
          title: qs.label || qs.title_display || qs.identifier || "Untitled Step",
          helper_text: qs.help_text || undefined,
          save_to_field: saveToField,
          display_mode: displayMode,
          required: qs.required || false,
          custom_options: customOptions,
          branching_mode: branchingMode,
          branching_rules: branchingRules,
        };

        const newStep = await base44.entities.SurveyStep.create(stepData);
        createdSurveyStepIds.push(newStep.id);
        stepOrderIds.push(newStep.id);
      }

      // Update survey with step_order and start_step_id
      await base44.entities.Survey.update(newSurveyId, {
        step_order: stepOrderIds,
        start_step_id: stepOrderIds[0] || "",
      });

      setResult({
        surveyId: newSurveyId,
        stepCount: createdSurveyStepIds.length,
        fieldCount: createdSurveyFieldIds.length,
        warnings,
      });
    } catch (err) {
      // Compensating delete (rollback)
      for (const id of createdSurveyStepIds) {
        await base44.entities.SurveyStep.delete(id).catch(() => {});
      }
      for (const id of createdSurveyFieldIds) {
        await base44.entities.SurveyField.delete(id).catch(() => {});
      }
      if (newSurveyId) {
        await base44.entities.Survey.delete(newSurveyId).catch(() => {});
      }
      warnings.push(`Import failed and was rolled back: ${err.message}`);
      setResult({ surveyId: null, stepCount: 0, fieldCount: 0, warnings });
    } finally {
      setImporting(false);
    }
  };

  const openNewSurvey = () => {
    if (result?.surveyId) {
      onImported?.();
      navigate(`/admin/QuizBuilder/Edit?id=${result.surveyId}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a1320] border border-white/10 rounded-lg w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Import from Quiz
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {!result ? (
            <>
              {/* Quiz selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Select a Quiz to import:</label>
                {loading ? (
                  <div className="text-slate-400 text-sm">Loading quizzes...</div>
                ) : (
                  <select
                    value={selectedQuizId}
                    onChange={e => setSelectedQuizId(e.target.value)}
                    className="w-full bg-[#0f1c30] border border-white/10 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2282fc]"
                  >
                    <option value="">-- Select a Quiz --</option>
                    {quizzes.map(q => (
                      <option key={q.id} value={q.id}>{q.title} ({q.status})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Import options:</label>
                <div className="space-y-2">
                  {[
                    { key: "copySteps", label: "Copy all QuizStep records as SurveyStep records" },
                    { key: "copyFields", label: "Copy all QuizField references" },
                    { key: "createMissingFields", label: "Create missing SurveyField records as needed" },
                    { key: "preserveLegacyId", label: "Preserve original Quiz ID in Survey description" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={opts[key]}
                        onChange={e => setOpts(o => ({ ...o, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#2282fc]"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tier note */}
              <div className="bg-[#0f1c30] border border-white/10 rounded-md px-4 py-3">
                <p className="text-xs text-slate-400">
                  Tier assignment for imported steps: all imported steps default to <span className="font-mono text-[#2282fc]">shared</span> tier.
                </p>
              </div>

              {/* Warning */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-md px-4 py-3 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200">
                  This creates a NEW Survey. The original Quiz is not modified or deleted. Landing pages continue using Quiz data until you manually migrate them.
                </p>
              </div>
            </>
          ) : (
            /* Result */
            <div className="space-y-4">
              {result.surveyId ? (
                <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-md px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-300">Import successful.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {result.stepCount} steps imported. {result.fieldCount} new SurveyFields created.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">Import failed and was rolled back. No records were created.</p>
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="bg-[#0f1c30] border border-white/10 rounded-md px-4 py-3">
                  <p className="text-xs font-semibold text-amber-400 mb-2">Warnings:</p>
                  <ul className="space-y-1">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-slate-400 font-mono">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          {!result ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={doImport}
                disabled={!selectedQuizId || importing}
                className="flex items-center gap-2 bg-[#2282fc] hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-md text-sm transition-all"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {importing ? "Importing..." : "Import as new Survey"}
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Close
              </button>
              {result.surveyId && (
                <button
                  onClick={openNewSurvey}
                  className="flex items-center gap-2 bg-[#2282fc] hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-md text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open the new Survey
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
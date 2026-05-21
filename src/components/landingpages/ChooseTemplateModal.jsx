import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check } from "lucide-react";

export default function ChooseTemplateModal({ onClose, onTemplateChoose, existingPages }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [step, setStep] = useState(1); // 1=choose template, 2=confirm

  React.useEffect(() => {
    base44.entities.LandingPageTemplate.filter({ is_active: true })
      .then(ts => {
        setTemplates(ts.sort((a, b) => (a.display_order || 50) - (b.display_order || 50)));
        setLoading(false);
      });
  }, []);

  const handleContinue = () => {
    if (selectedTemplate) {
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (!selectedTemplate) return;
    
    // Generate unique slug
    const baseSlug = selectedTemplate.template_key.replace(/-/g, "-");
    let slug = baseSlug;
    let counter = 1;
    const existingSlugs = existingPages.map(p => p.slug);
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create LandingPage with template data
    const newPage = {
      title: `${selectedTemplate.template_name} Page`,
      slug,
      status: "draft",
      version: 1,
      template_key: selectedTemplate.template_key,
      campaign_type: selectedTemplate.campaign_type || "MVA",
      design_tokens_override: selectedTemplate.design_tokens || {},
      section_order_override: selectedTemplate.section_order || [],
      embedded_quiz_theme_id: selectedTemplate.embedded_quiz_theme_id,
      // Spread default field values
      ...(selectedTemplate.default_field_values || {}),
    };

    const created = await base44.entities.LandingPage.create(newPage);
    onTemplateChoose(created.id);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Create New Landing Page</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {step === 1 ? "Choose a starting template" : "Confirm page creation"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-slate-400 py-12">Loading templates...</div>
          ) : step === 1 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    selectedTemplate?.id === t.id
                      ? "border-[#1e90ff] bg-[#1e90ff]/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white text-lg">{t.template_name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{t.template_tagline}</p>
                    </div>
                    {selectedTemplate?.id === t.id && (
                      <Check className="w-5 h-5 text-[#1e90ff] flex-shrink-0" />
                    )}
                  </div>
                  {t.preview_image_url && (
                    <img
                      src={t.preview_image_url}
                      alt={t.template_name}
                      className="w-full h-32 object-cover rounded-lg mt-3"
                    />
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                      {t.campaign_type}
                    </span>
                    <span className="text-xs text-slate-500">
                      Quiz theme: {t.embedded_quiz_theme_id ? "Custom" : "Default"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-bold text-white mb-2">Template Selected</h3>
                <div className="flex items-center gap-3">
                  <div className="text-slate-300">
                    <span className="font-semibold">{selectedTemplate.template_name}</span>
                    <span className="text-slate-500 ml-2">→</span>
                    <span className="ml-2 text-slate-400">
                      Quiz theme will be applied automatically
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-200 text-sm">
                  <strong>Note:</strong> You'll be able to select or change the embedded Quiz in the next step after the page is created.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step === 1 ? (
            <button
              onClick={handleContinue}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-40 text-white font-semibold rounded-lg text-sm transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-[#1e90ff] hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition-all"
            >
              Create Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
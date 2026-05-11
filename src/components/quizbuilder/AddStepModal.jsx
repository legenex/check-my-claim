import React from "react";
import { X } from "lucide-react";

const STEP_TYPES = [
  { type: "start", label: "Start", description: "Entry point of the quiz. Auto-advances to next step.", phase: 1 },
  { type: "single_select", label: "Single Select", description: "One answer from multiple options. Supports per-answer branching.", phase: 1 },
  { type: "text_field", label: "Text Field", description: "Free text input, saved to a custom field.", phase: 1 },
  { type: "results", label: "Results", description: "Terminal step. Shows result template with field interpolation.", phase: 1 },
  { type: "multi_choice", label: "Multi Choice", description: "Multiple answers can be selected.", phase: 2 },
  { type: "dropdown", label: "Dropdown", description: "Single select rendered as a dropdown menu.", phase: 2 },
  { type: "yes_no", label: "Yes / No", description: "Simplified two-option single select.", phase: 2 },
  { type: "email_input", label: "Email Input", description: "Email address field with validation.", phase: 2 },
  { type: "phone_input", label: "Phone Input", description: "Phone number field with formatting.", phase: 2 },
  { type: "number_input", label: "Number Input", description: "Numeric input with optional min/max.", phase: 2 },
  { type: "date_picker", label: "Date Picker", description: "Date selection field.", phase: 2 },
  { type: "slider", label: "Slider", description: "Range slider input.", phase: 2 },
  { type: "address", label: "Address", description: "Multi-field address input.", phase: 2 },
  { type: "decision", label: "Decision Node", description: "Evaluates conditions and routes without showing UI.", phase: 2 },
  { type: "webhook", label: "Webhook / API", description: "Calls an external URL and routes on response.", phase: 3 },
  { type: "form", label: "Form", description: "Renders a ContactForm record.", phase: 2 },
  { type: "notification", label: "Notification", description: "Sends SMS, email, or webhook notification.", phase: 3 },
  { type: "script", label: "Script", description: "Executes custom JavaScript.", phase: 3 },
  { type: "redirect", label: "Redirect", description: "Redirects the browser to a URL.", phase: 2 },
];

export default function AddStepModal({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Add Step</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-2">
          {STEP_TYPES.map(st => (
            <button
              key={st.type}
              onClick={() => onSelect(st.type)}
              className="w-full p-3 rounded-xl border border-white/10 hover:border-[#1e90ff] text-left transition-all flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{st.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${st.phase === 1 ? "bg-green-500/20 text-green-400" : st.phase === 2 ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                    Phase {st.phase}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{st.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
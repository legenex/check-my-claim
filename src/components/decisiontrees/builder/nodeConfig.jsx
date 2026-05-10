export const NODE_TYPES = [
  { type: "start", label: "Start", color: "#22c55e", section: "Flow" },
  { type: "question", label: "Question", color: "#1e90ff", section: "Input" },
  { type: "yes_no", label: "Yes / No", color: "#1e90ff", section: "Input" },
  { type: "multiple_choice", label: "Multiple Choice", color: "#1e90ff", section: "Input" },
  { type: "text_input", label: "Text Input", color: "#6366f1", section: "Input" },
  { type: "email_input", label: "Email Input", color: "#6366f1", section: "Input" },
  { type: "phone_input", label: "Phone Input", color: "#6366f1", section: "Input" },
  { type: "date_input", label: "Date Input", color: "#6366f1", section: "Input" },
  { type: "number_input", label: "Number Input", color: "#6366f1", section: "Input" },
  { type: "contact_form", label: "Contact Form", color: "#f59e0b", section: "Conversion" },
  { type: "qualified", label: "Qualified", color: "#22c55e", section: "Outcome" },
  { type: "disqualified", label: "Disqualified", color: "#ef4444", section: "Outcome" },
  { type: "outcome", label: "Outcome", color: "#8b5cf6", section: "Outcome" },
  { type: "info", label: "Info / Statement", color: "#0ea5e9", section: "Display" },
  { type: "redirect", label: "Redirect", color: "#f97316", section: "Action" },
  { type: "webhook", label: "Webhook", color: "#64748b", section: "Action" },
  { type: "condition", label: "Condition / Branch", color: "#ec4899", section: "Logic" },
  { type: "calculator", label: "Calculator", color: "#14b8a6", section: "Logic" },
];

export const NODE_SECTIONS = ["Flow", "Input", "Conversion", "Outcome", "Display", "Action", "Logic"];

export function getNodeColor(type) {
  return NODE_TYPES.find(n => n.type === type)?.color || "#64748b";
}

export function getNodeLabel(type) {
  return NODE_TYPES.find(n => n.type === type)?.label || type;
}
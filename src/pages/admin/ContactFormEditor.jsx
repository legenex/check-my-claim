import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Eye, ArrowLeft } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Editor from "@monaco-editor/react";
import ContactFormRenderer from "@/components/contactforms/ContactFormRenderer";

const TABS = ["Form", "Fields", "TCPA", "TrustedForm", "Disclaimers", "Webhook", "Scripts"];

const FIELD_TYPES = [
  { value: "string", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Text Area" },
  { value: "checkbox", label: "Checkbox" },
  { value: "hidden", label: "Hidden" },
];

const WIDTH_OPTIONS = [
  { value: "full", label: "Full Width" },
  { value: "half", label: "Half Width" },
  { value: "third", label: "Third Width" },
];

const SUGGESTED_FIELDS = [
  { field_key: "first_name", label: "First Name", type: "string" },
  { field_key: "last_name", label: "Last Name", type: "string" },
  { field_key: "email", label: "Email", type: "email" },
  { field_key: "phone", label: "Phone", type: "tel" },
  { field_key: "zip_code", label: "ZIP Code", type: "string" },
  { field_key: "state", label: "State", type: "select", options: ["CA", "TX", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "MI"] },
  { field_key: "address_line_1", label: "Address", type: "string" },
  { field_key: "city", label: "City", type: "string" },
];

const DEFAULT_TCPA = `By clicking "Submit", you agree to our Terms of Service and Privacy Policy. You may receive calls/texts from us or our partner attorneys at the number provided. Consent is not a condition of purchase. Msg/data rates may apply. <a href="/partners" target="_blank" class="underline">Click here to view a list of our network attorneys.</a>`;

function SortableField({ field, onRemove, onChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.field_key });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-3 p-3 bg-[#0a1628] rounded-lg border border-white/10 mb-2">
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-400">⋮⋮</div>
      <div className="flex-1 grid grid-cols-4 gap-2">
        <div>
          <Label className="text-xs text-slate-400">Field Key</Label>
          <Input value={field.field_key} onChange={(e) => onChange(field.field_key, "field_key", e.target.value.replace(/\s+/g, "_").toLowerCase())} className="text-xs" />
        </div>
        <div>
          <Label className="text-xs text-slate-400">Label</Label>
          <Input value={field.label} onChange={(e) => onChange(field.field_key, "label", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-xs text-slate-400">Type</Label>
          <Select value={field.type} onValueChange={(v) => onChange(field.field_key, "type", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-400">Width</Label>
          <Select value={field.width || "full"} onValueChange={(v) => onChange(field.field_key, "width", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{WIDTH_OPTIONS.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-slate-400">Placeholder</Label>
          <Input value={field.placeholder || ""} onChange={(e) => onChange(field.field_key, "placeholder", e.target.value)} className="text-xs" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-slate-400">Help Text</Label>
          <Input value={field.help_text || ""} onChange={(e) => onChange(field.field_key, "help_text", e.target.value)} className="text-xs" />
        </div>
        <div className="col-span-2 flex items-center gap-2 mt-4">
          <Switch checked={field.required || false} onCheckedChange={(c) => onChange(field.field_key, "required", c)} />
          <Label className="text-xs">Required</Label>
        </div>
        <div className="col-span-2 flex items-center justify-end mt-4">
          <Button variant="ghost" size="sm" onClick={() => onRemove(field.field_key)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}

export default function ContactFormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Form");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [showAddField, setShowAddField] = useState(false);
  const autoSaveTimer = useRef(null);

  useEffect(() => { loadForm(); }, [id]);

  const loadForm = async () => {
    const forms = await base44.entities.ContactForm.filter({ id });
    if (forms.length) setForm(forms[0]);
    setLoading(false);
  };

  const updateForm = (patch) => {
    setForm(prev => ({ ...prev, ...patch }));
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true);
      await base44.entities.ContactForm.update(id, patch);
      setSaving(false);
    }, 500);
  };

  const handleFieldChange = (fieldKey, fieldProp, value) => {
    const newFields = (form.fields || []).map(f => f.field_key === fieldKey ? { ...f, [fieldProp]: value } : f);
    updateForm({ fields: newFields });
  };

  const removeField = (fieldKey) => {
    updateForm({ fields: (form.fields || []).filter(f => f.field_key !== fieldKey) });
  };

  const addField = (template) => {
    const exists = (form.fields || []).some(f => f.field_key === template.field_key);
    if (exists) return;
    updateForm({ fields: [...(form.fields || []), { ...template, required: false, width: "full" }] });
    setShowAddField(false);
  };

  const onFieldsReorder = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = (form.fields || []).findIndex(f => f.field_key === active.id);
      const newIndex = (form.fields || []).findIndex(f => f.field_key === over.id);
      const newFields = arrayMove(form.fields || [], oldIndex, newIndex);
      updateForm({ fields: newFields });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (!form) return <div className="p-8 text-center text-slate-400">Form not found</div>;

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-[#0a1628] text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f1e35]">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/ContactForms")}><ArrowLeft className="w-4 h-4" /></Button>
            <Input value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className="w-64 font-semibold bg-transparent border-none" />
            <Badge variant={form.form_type === "qualified" ? "default" : "secondary"}>{form.form_type}</Badge>
            {saving && <span className="text-xs text-slate-400">Saving...</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("Form")}>Edit</Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("Preview")}>Preview</Button>
          </div>
        </div>

        {/* Tabs */}
        {activeTab !== "Preview" && (
          <div className="flex border-b border-white/10 bg-[#0f1e35] px-4">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-[#1e90ff] text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{tab}</button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-2 gap-6 p-6 h-[calc(100vh-140px)] overflow-hidden">
          {/* Left: Editor */}
          <div className="overflow-y-auto pr-4">
            {activeTab === "Form" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Form Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Form Type</Label>
                    <Select value={form.form_type} onValueChange={(v) => updateForm({ form_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="disqualified">Disqualified</SelectItem>
                        <SelectItem value="callback">Callback</SelectItem>
                        <SelectItem value="generic">Generic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Submit Button Label</Label>
                    <Input value={form.submit_button_label} onChange={(e) => updateForm({ submit_button_label: e.target.value })} />
                  </div>
                  <div>
                    <Label>Success Redirect URL</Label>
                    <Input value={form.success_redirect_url || ""} onChange={(e) => updateForm({ success_redirect_url: e.target.value })} placeholder="https://..." />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "Fields" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Form Fields</h3>
                  <Button size="sm" onClick={() => setShowAddField(true)}><Plus className="w-4 h-4 mr-1" /> Add Field</Button>
                </div>
                {showAddField && (
                  <div className="mb-4 p-4 bg-[#0a1628] rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold mb-2">Suggested Fields:</h4>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_FIELDS.filter(sf => !(form.fields || []).some(f => f.field_key === sf.field_key)).map(sf => (
                        <Button key={sf.field_key} variant="outline" size="sm" onClick={() => addField(sf)}>{sf.label}</Button>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddField(false)} className="mt-2"><X className="w-3 h-3 mr-1" /> Close</Button>
                  </div>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onFieldsReorder}>
                  <SortableContext items={(form.fields || []).map(f => f.field_key)} strategy={verticalListSortingStrategy}>
                    {(form.fields || []).map(field => (
                      <SortableField key={field.field_key} field={field} onRemove={removeField} onChange={handleFieldChange} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {activeTab === "TCPA" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">TCPA Consent</CardTitle>
                    <Switch checked={form.tcpa_enabled} onCheckedChange={(c) => updateForm({ tcpa_enabled: c })} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" size="sm" onClick={() => updateForm({ tcpa_text: DEFAULT_TCPA })}>Use Default Template</Button>
                  <Textarea value={form.tcpa_text || ""} onChange={(e) => updateForm({ tcpa_text: e.target.value })} className="h-48 font-mono text-xs" placeholder="TCPA text (HTML supported)" />
                </CardContent>
              </Card>
            )}

            {activeTab === "TrustedForm" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">TrustedForm</CardTitle>
                    <Switch checked={form.trustedform_enabled} onCheckedChange={(c) => updateForm({ trustedform_enabled: c })} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>TrustedForm Field ID</Label>
                    <Input value={form.trustedform_field_id} onChange={(e) => updateForm({ trustedform_field_id: e.target.value })} placeholder="xxTrustedFormCertUrl" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "Disclaimers" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Disclaimers</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.show_personal_info_guarantee} onCheckedChange={(c) => updateForm({ show_personal_info_guarantee: c })} />
                    <Label>Show Personal Information Guarantee</Label>
                  </div>
                  <Textarea value={form.disclaimer_html || ""} onChange={(e) => updateForm({ disclaimer_html: e.target.value })} className="h-48 font-mono text-xs" placeholder="Disclaimer HTML" />
                </CardContent>
              </Card>
            )}

            {activeTab === "Webhook" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Webhook Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <Input value={form.submit_webhook_url || ""} onChange={(e) => updateForm({ submit_webhook_url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Headers (JSON)</Label>
                    <Editor height="150px" language="json" value={JSON.stringify(form.submit_webhook_headers || {}, null, 2)} onChange={(v) => updateForm({ submit_webhook_headers: JSON.parse(v || "{}") })} />
                  </div>
                  <div>
                    <Label>Body Template (use {"{{field_key}}"} placeholders)</Label>
                    <Editor height="300px" language="json" value={form.submit_webhook_body_template || JSON.stringify({ example: "{{first_name}}" }, null, 2)} onChange={(v) => updateForm({ submit_webhook_body_template: v })} />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "Scripts" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Custom Scripts</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { trigger: "on_render", label: "On Render" },
                    { trigger: "on_submit_success", label: "On Submit Success" },
                    { trigger: "on_submit_error", label: "On Submit Error" },
                  ].map(scriptConfig => {
                    const script = (form.scripts || []).find(s => s.trigger === scriptConfig.trigger) || { trigger: scriptConfig.trigger, code: "", is_enabled: true };
                    return (
                      <div key={scriptConfig.trigger}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold">{scriptConfig.label}</Label>
                          <Switch checked={script.is_enabled} onCheckedChange={(c) => {
                            const newScripts = (form.scripts || []).filter(s => s.trigger !== scriptConfig.trigger);
                            if (c) newScripts.push({ ...script, is_enabled: true });
                            updateForm({ scripts: newScripts });
                          }} />
                        </div>
                        <Editor height="200px" language="javascript" value={script.code} onChange={(v) => {
                          const newScripts = (form.scripts || []).filter(s => s.trigger !== scriptConfig.trigger);
                          newScripts.push({ ...script, code: v || "" });
                          updateForm({ scripts: newScripts });
                        }} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Live Preview</h3>
              <div className="flex gap-2">
                <Button variant={previewMode === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("desktop")}>Desktop</Button>
                <Button variant={previewMode === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("mobile")}>Mobile</Button>
              </div>
            </div>
            <div className={`flex-1 bg-white rounded-lg overflow-hidden ${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
              <ContactFormRenderer formId={form.id} />
            </div>
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
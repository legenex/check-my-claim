import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, GripVertical } from "lucide-react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTier({ tier, index, onRemove, onChange, contactForms, quizSteps }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tier.tier_key });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="p-4 bg-[#0a1628] rounded-lg border border-white/10 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab text-slate-400"><GripVertical className="w-4 h-4" /></div>
          <Badge variant="outline">Tier {index + 1}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(tier.tier_key)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tier Key</Label>
          <Input value={tier.tier_key} onChange={(e) => onChange(tier.tier_key, "tier_key", e.target.value.replace(/\s+/g, "_").toLowerCase())} className="text-xs" />
        </div>
        <div>
          <Label>Tier Label</Label>
          <Input value={tier.tier_label} onChange={(e) => onChange(tier.tier_key, "tier_label", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label>Min Score</Label>
          <Input type="number" value={tier.min_score || 0} onChange={(e) => onChange(tier.tier_key, "min_score", parseFloat(e.target.value))} className="text-xs" />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={tier.description || ""} onChange={(e) => onChange(tier.tier_key, "description", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label>Contact Form</Label>
          <Select value={tier.contact_form_id || ""} onValueChange={(v) => onChange(tier.tier_key, "contact_form_id", v)}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              {contactForms.map(cf => <SelectItem key={cf.id} value={cf.id}>{cf.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Redirect URL</Label>
          <Input value={tier.redirect_url || ""} onChange={(e) => onChange(tier.tier_key, "redirect_url", e.target.value)} className="text-xs" placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Deeper Questions Start Step</Label>
          <Select value={tier.deeper_questions_start_step_id || ""} onValueChange={(v) => onChange(tier.tier_key, "deeper_questions_start_step_id", v)}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="None (skip to results)" /></SelectTrigger>
            <SelectContent>
              {quizSteps.map(step => <SelectItem key={step.step_id} value={step.step_id}>{step.title_display || step.label || step.step_id}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-slate-400 mt-1">When set, users in this tier will be routed to this step for deeper questions before reaching results.</p>
        </div>
      </div>
    </div>
  );
}

function TierRoutingRule({ rule, index, onRemove, onChange, quizSteps }) {
  return (
    <div className="p-4 bg-[#0a1628] rounded-lg border border-white/10 mb-3">
      <div className="flex items-center justify-between mb-3">
        <Label className="font-semibold">Rule {index + 1}</Label>
        <Button variant="ghost" size="sm" onClick={() => onRemove(index)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Condition Expression</Label>
          <Input value={rule.condition_expression || ""} onChange={(e) => onChange(index, "condition_expression", e.target.value)} placeholder="e.g. score >= 80 || tags.includes('high_value')" className="text-xs" />
          <p className="text-[10px] text-slate-400 mt-1">JavaScript expression. Available: score, fields.*, tags[], answer.*</p>
        </div>
        <div>
          <Label>Target Tier Key</Label>
          <Select value={rule.target_tier_key || ""} onValueChange={(v) => onChange(index, "target_tier_key", v)}>
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tier_1">tier_1</SelectItem>
              <SelectItem value="tier_2">tier_2</SelectItem>
              <SelectItem value="tier_3">tier_3</SelectItem>
              <SelectItem value="dq">dq</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Label</Label>
          <Input value={rule.label || ""} onChange={(e) => onChange(index, "label", e.target.value)} className="text-xs" />
        </div>
      </div>
    </div>
  );
}

export default function QuizTiersTab({ quiz, onUpdate, contactForms, quizSteps }) {
  const [editingPaths, setEditingPaths] = useState(quiz.qualification_paths || []);
  const [editingRules, setEditingRules] = useState(quiz.tier_routing_rules || []);

  const handlePathChange = (tierKey, prop, value) => {
    const newPaths = editingPaths.map(p => p.tier_key === tierKey ? { ...p, [prop]: value } : p);
    setEditingPaths(newPaths);
    onUpdate({ qualification_paths: newPaths });
  };

  const addPath = () => {
    const newTier = { tier_key: `tier_${editingPaths.length + 1}`, tier_label: `Tier ${editingPaths.length + 1}`, min_score: editingPaths.length * 20, description: "", contact_form_id: null, redirect_url: null, deeper_questions_start_step_id: null };
    setEditingPaths([...editingPaths, newTier]);
    onUpdate({ qualification_paths: [...editingPaths, newTier] });
  };

  const removePath = (tierKey) => {
    const newPaths = editingPaths.filter(p => p.tier_key !== tierKey);
    setEditingPaths(newPaths);
    onUpdate({ qualification_paths: newPaths });
  };

  const onPathsReorder = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = editingPaths.findIndex(p => p.tier_key === active.id);
      const newIndex = editingPaths.findIndex(p => p.tier_key === over.id);
      const newPaths = arrayMove(editingPaths, oldIndex, newIndex);
      setEditingPaths(newPaths);
      onUpdate({ qualification_paths: newPaths });
    }
  };

  const handleRuleChange = (index, prop, value) => {
    const newRules = editingRules.map((r, i) => i === index ? { ...r, [prop]: value } : r);
    setEditingRules(newRules);
    onUpdate({ tier_routing_rules: newRules });
  };

  const addRule = () => {
    setEditingRules([...editingRules, { condition_expression: "", target_tier_key: "tier_1", label: "" }]);
    onUpdate({ tier_routing_rules: [...editingRules, { condition_expression: "", target_tier_key: "tier_1", label: "" }] });
  };

  const removeRule = (index) => {
    const newRules = editingRules.filter((_, i) => i !== index);
    setEditingRules(newRules);
    onUpdate({ tier_routing_rules: newRules });
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Qualification Tiers</h2>
          <p className="text-sm text-slate-400 mt-1">Define tier paths for lead qualification. Users are routed based on score or rules.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={quiz.scoring_enabled !== false} onCheckedChange={(c) => onUpdate({ scoring_enabled: c })} />
            <Label>Scoring Enabled</Label>
          </div>
          <Button onClick={addPath}><Plus className="w-4 h-4 mr-1" /> Add Tier</Button>
        </div>
      </div>

      {/* Qualification Paths */}
      <Card className="bg-[#0f1e35] border-white/10 mb-6">
        <CardHeader><CardTitle className="text-white">Qualification Paths</CardTitle></CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onPathsReorder}>
            <SortableContext items={editingPaths.map(p => p.tier_key)} strategy={verticalListSortingStrategy}>
              {editingPaths.map((tier, i) => (
                <SortableTier key={tier.tier_key} tier={tier} index={i} onRemove={removePath} onChange={handlePathChange} contactForms={contactForms} quizSteps={quizSteps} />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Tier Routing Rules */}
      <Card className="bg-[#0f1e35] border-white/10">
        <CardHeader><CardTitle className="text-white">Tier Routing Rules</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">Optional explicit rules evaluated at quiz end. First matching rule wins. Falls back to score-based qualification paths.</p>
          {editingRules.map((rule, i) => (
            <TierRoutingRule key={i} rule={rule} index={i} onRemove={removeRule} onChange={handleRuleChange} quizSteps={quizSteps} />
          ))}
          <Button variant="outline" onClick={addRule} className="mt-2"><Plus className="w-4 h-4 mr-1" /> Add Rule</Button>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Save, Eye, ArrowLeft, Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Editor from "@monaco-editor/react";
import { HexColorPicker } from "react-colorful";
import ChooseTemplateModal from "@/components/landingpages/ChooseTemplateModal";

const TABS = ["Template & Quiz", "Hero & Quiz Card", "Trust Pillars", "Benefits", "Recent Wins", "Guarantee", "Testimonials", "FAQ", "SEO & Pixels", "Compliance", "Design Tokens", "Advanced"];

const CAMPAIGN_TYPES = ["MVA", "Mass Tort", "Workers Comp", "Slip and Fall", "Med Mal", "Custom"];

function SortableItem({ item, onRemove, onChange, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id || item.label });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-[#0a1628] rounded-lg border border-white/10 mb-2">
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-400">⋮⋮</div>
      <div className="flex-1">{children}</div>
      <Button variant="ghost" size="sm" onClick={() => onRemove(item.id || item.label)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></Button>
    </div>
  );
}

export default function LandingPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [brands, setBrands] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [quizThemes, setQuizThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState("Template & Quiz");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [previewTs, setPreviewTs] = useState(Date.now());
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [publishErrors, setPublishErrors] = useState([]);
  const autoSaveTimer = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [pages, brandList, quizList, tplList, themeList] = await Promise.all([
      base44.entities.LandingPage.filter({ id }),
      base44.entities.DecisionTreeBrand.list(),
      base44.entities.Quiz.list("-updated_date", 200),
      base44.entities.LandingPageTemplate.list(),
      base44.entities.QuizTheme.list(),
    ]);
    setPage(pages[0] || null);
    setBrands(brandList);
    setQuizzes(quizList);
    setTemplates(tplList);
    setQuizThemes(themeList);
    setLoading(false);
  };

  const updatePage = useCallback((patch) => {
    setPage(prev => ({ ...prev, ...patch }));
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true);
      await base44.entities.LandingPage.update(id, patch);
      setSaving(false);
      setLastSaved(new Date());
      setPreviewTs(Date.now());
    }, 500);
  }, [id]);

  const validateAndPublish = async () => {
    const errors = [];
    if (!page.hero_headline) errors.push("Hero headline is required.");
    if (!page.quiz_id) errors.push("Embedded Quiz is required.");
    const quiz = quizzes.find(q => q.id === page.quiz_id);
    if (quiz && quiz.status !== "published") errors.push("Selected quiz must be published.");
    const existing = await base44.entities.LandingPage.filter({ slug: page.slug });
    if (existing.some(p => p.id !== id)) errors.push(`Slug "${page.slug}" is already in use.`);
    if (errors.length) { setPublishErrors(errors); return; }
    setPublishErrors([]);
    await updatePage({ status: "published", published_at: new Date().toISOString(), version: (page.version || 1) + 1 });
  };

  const duplicatePage = async () => {
    const copy = { ...page, id: undefined, title: `${page.title} (Copy)`, slug: `${page.slug}-copy-${Date.now().toString(36)}`, status: "draft", view_count: 0, unique_visitors: 0, total_quiz_starts: 0 };
    const created = await base44.entities.LandingPage.create(copy);
    navigate(`/admin/LandingPages/${created.id}/edit`);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (!page) return <div className="p-8 text-center text-slate-400">Page not found</div>;

  const currentTemplate = templates.find(t => t.template_key === page.template_key);

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-[#0a1628] text-white flex flex-col">
        {/* Top toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f1e35] flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/LandingPages")}><ArrowLeft className="w-4 h-4" /></Button>
            <Input value={page.title} onChange={(e) => updatePage({ title: e.target.value })} className="w-64 font-semibold bg-transparent border-none text-base" />
            {currentTemplate && <Badge variant="outline">{currentTemplate.template_name}</Badge>}
            <Select value={page.brand_id || ""} onValueChange={(v) => updatePage({ brand_id: v })}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Select Brand" /></SelectTrigger>
              <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.brand_name}</SelectItem>)}</SelectContent>
            </Select>
            <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
            {saving ? <span className="text-xs text-slate-400">Saving...</span> : lastSaved && <span className="text-xs text-slate-400">Saved {lastSaved.toLocaleTimeString()}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open(`/lp/${page.slug}`, "_blank")}><ExternalLink className="w-4 h-4 mr-1" /> View Live</Button>
            <Button variant="outline" size="sm" onClick={duplicatePage}><Copy className="w-4 h-4 mr-1" /> Duplicate</Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={validateAndPublish}>Publish</Button>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-white/10 bg-[#0f1e35] px-4 flex-shrink-0 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? "border-[#1e90ff] text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{tab}</button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden min-h-0">
          {/* Left: Editor */}
          <div className="overflow-y-auto pr-4">
            {/* Template & Quiz */}
            {activeTab === "Template & Quiz" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Template & Quiz</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={() => setShowTemplateModal(true)}>Change Template</Button>
                  <div>
                    <Label>Campaign Type</Label>
                    <Select value={page.campaign_type} onValueChange={(v) => updatePage({ campaign_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CAMPAIGN_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input value={page.slug} onChange={(e) => updatePage({ slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })} />
                  </div>
                  <div>
                    <Label>Embedded Quiz</Label>
                    <Select value={page.quiz_id || ""} onValueChange={(v) => updatePage({ quiz_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a quiz" /></SelectTrigger>
                      <SelectContent>{quizzes.filter(q => q.status === "published").map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quiz Theme Override</Label>
                    <Select value={page.embedded_quiz_theme_id || ""} onValueChange={(v) => updatePage({ embedded_quiz_theme_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Use template default" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Use Template Default</SelectItem>
                        {quizThemes.map(t => <SelectItem key={t.id} value={t.id}>{t.theme_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hero & Quiz Card */}
            {activeTab === "Hero & Quiz Card" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Hero Section</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Hero Eyebrow</Label><Input value={page.hero_eyebrow || ""} onChange={(e) => updatePage({ hero_eyebrow: e.target.value })} /></div>
                  <div><Label>Hero Headline</Label><Textarea value={page.hero_headline || ""} onChange={(e) => updatePage({ hero_headline: e.target.value })} className="h-24" /></div>
                  <div><Label>Hero Subheadline</Label><Textarea value={page.hero_subheadline || ""} onChange={(e) => updatePage({ hero_subheadline: e.target.value })} className="h-20" /></div>
                  <div><Label>Hero Subheadline Helper</Label><Input value={page.hero_subheadline_helper || ""} onChange={(e) => updatePage({ hero_subheadline_helper: e.target.value })} /></div>
                  <div className="flex items-center gap-2"><Switch checked={page.show_hero_phone_cta !== false} onCheckedChange={(c) => updatePage({ show_hero_phone_cta: c })} /><Label>Show Phone CTA Below Quiz</Label></div>
                  <div><Label>Hero Phone Label</Label><Input value={page.hero_phone_label || ""} onChange={(e) => updatePage({ hero_phone_label: e.target.value })} /></div>
                </CardContent>
              </Card>
            )}

            {/* Trust Pillars */}
            {activeTab === "Trust Pillars" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Trust Stats</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Stat 1 Value</Label><Input value={page.trust_stat_1_value || ""} onChange={(e) => updatePage({ trust_stat_1_value: e.target.value })} /></div>
                    <div><Label>Stat 1 Label</Label><Input value={page.trust_stat_1_label || ""} onChange={(e) => updatePage({ trust_stat_1_label: e.target.value })} /></div>
                    <div><Label>Stat 2 Value</Label><Input value={page.trust_stat_2_value || ""} onChange={(e) => updatePage({ trust_stat_2_value: e.target.value })} /></div>
                    <div><Label>Stat 2 Label</Label><Input value={page.trust_stat_2_label || ""} onChange={(e) => updatePage({ trust_stat_2_label: e.target.value })} /></div>
                    <div><Label>Stat 3 Value</Label><Input value={page.trust_stat_3_value || ""} onChange={(e) => updatePage({ trust_stat_3_value: e.target.value })} /></div>
                    <div><Label>Stat 3 Label</Label><Input value={page.trust_stat_3_label || ""} onChange={(e) => updatePage({ trust_stat_3_label: e.target.value })} /></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {activeTab === "Benefits" && (
              <div>
                <Card className="bg-[#0f1e35] border-white/10 mb-4">
                  <CardHeader><CardTitle className="text-white">Benefits Section</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><Label>Section Title</Label><Input value={page.benefits_section_title || ""} onChange={(e) => updatePage({ benefits_section_title: e.target.value })} /></div>
                    <div><Label>Section Subtitle</Label><Input value={page.benefits_section_subtitle || ""} onChange={(e) => updatePage({ benefits_section_subtitle: e.target.value })} /></div>
                  </CardContent>
                </Card>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Benefits Items</h3>
                  <Button size="sm" onClick={() => updatePage({ benefits_items: [...(page.benefits_items || []), { icon: "✦", label: "New Benefit" }] })}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                  const { active, over } = e;
                  if (active.id !== over.id) {
                    const oldIndex = (page.benefits_items || []).findIndex(i => i.label === active.id);
                    const newIndex = (page.benefits_items || []).findIndex(i => i.label === over.id);
                    updatePage({ benefits_items: arrayMove(page.benefits_items || [], oldIndex, newIndex) });
                  }
                }}>
                  <SortableContext items={(page.benefits_items || []).map(i => i.label)} strategy={verticalListSortingStrategy}>
                    {(page.benefits_items || []).map((item, i) => (
                      <SortableItem key={item.label} item={item} onRemove={() => updatePage({ benefits_items: (page.benefits_items || []).filter((_, idx) => idx !== i) })} onChange={(key, val) => {
                        const newItems = (page.benefits_items || []).map((it, idx) => idx === i ? { ...it, [key]: val } : it);
                        updatePage({ benefits_items: newItems });
                      }}>
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={item.icon || ""} onChange={(e) => { const newItems = (page.benefits_items || []).map((it, idx) => idx === i ? { ...it, icon: e.target.value } : it); updatePage({ benefits_items: newItems }); }} placeholder="Icon" className="text-xs" />
                          <Input value={item.label || ""} onChange={(e) => { const newItems = (page.benefits_items || []).map((it, idx) => idx === i ? { ...it, label: e.target.value } : it); updatePage({ benefits_items: newItems }); }} placeholder="Label" className="text-xs" />
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Recent Wins */}
            {activeTab === "Recent Wins" && (
              <div>
                <Card className="bg-[#0f1e35] border-white/10 mb-4">
                  <CardHeader><CardTitle className="text-white">Recent Wins Section</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><Label>Section Title</Label><Input value={page.recent_wins_title || ""} onChange={(e) => updatePage({ recent_wins_title: e.target.value })} /></div>
                    <div><Label>Section Subtitle</Label><Input value={page.recent_wins_subtitle || ""} onChange={(e) => updatePage({ recent_wins_subtitle: e.target.value })} /></div>
                  </CardContent>
                </Card>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Win Cards</h3>
                  <Button size="sm" onClick={() => updatePage({ recent_wins_items: [...(page.recent_wins_items || []), { amount: "$0", name_initials: "XX", age: 0, location: "" }] })}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                  const { active, over } = e;
                  if (active.id !== over.id) {
                    const oldIndex = (page.recent_wins_items || []).findIndex(i => i.amount === active.id);
                    const newIndex = (page.recent_wins_items || []).findIndex(i => i.amount === over.id);
                    updatePage({ recent_wins_items: arrayMove(page.recent_wins_items || [], oldIndex, newIndex) });
                  }
                }}>
                  <SortableContext items={(page.recent_wins_items || []).map(i => i.amount)} strategy={verticalListSortingStrategy}>
                    {(page.recent_wins_items || []).map((win, i) => (
                      <SortableItem key={win.amount} item={win} onRemove={() => updatePage({ recent_wins_items: (page.recent_wins_items || []).filter((_, idx) => idx !== i) })} onChange={(key, val) => {
                        const newItems = (page.recent_wins_items || []).map((w, idx) => idx === i ? { ...w, [key]: val } : w);
                        updatePage({ recent_wins_items: newItems });
                      }}>
                        <div className="grid grid-cols-4 gap-2">
                          <Input value={win.amount || ""} onChange={(e) => { const newItems = (page.recent_wins_items || []).map((w, idx) => idx === i ? { ...w, amount: e.target.value } : w); updatePage({ recent_wins_items: newItems }); }} placeholder="Amount" className="text-xs" />
                          <Input value={win.name_initials || ""} onChange={(e) => { const newItems = (page.recent_wins_items || []).map((w, idx) => idx === i ? { ...w, name_initials: e.target.value } : w); updatePage({ recent_wins_items: newItems }); }} placeholder="Initials" className="text-xs" />
                          <Input type="number" value={win.age || 0} onChange={(e) => { const newItems = (page.recent_wins_items || []).map((w, idx) => idx === i ? { ...w, age: parseInt(e.target.value) } : w); updatePage({ recent_wins_items: newItems }); }} placeholder="Age" className="text-xs" />
                          <Input value={win.location || ""} onChange={(e) => { const newItems = (page.recent_wins_items || []).map((w, idx) => idx === i ? { ...w, location: e.target.value } : w); updatePage({ recent_wins_items: newItems }); }} placeholder="Location" className="text-xs" />
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Guarantee */}
            {activeTab === "Guarantee" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Guarantee Section</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Eyebrow</Label><Input value={page.guarantee_eyebrow || ""} onChange={(e) => updatePage({ guarantee_eyebrow: e.target.value })} /></div>
                  <div><Label>Title</Label><Input value={page.guarantee_title || ""} onChange={(e) => updatePage({ guarantee_title: e.target.value })} /></div>
                  <div><Label>Body HTML</Label><Editor height="200px" language="html" value={page.guarantee_body_html || ""} onChange={(v) => updatePage({ guarantee_body_html: v })} /></div>
                  <div><Label>Bullets</Label>
                    {(page.guarantee_bullets || []).map((b, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <Input value={b} onChange={(e) => updatePage({ guarantee_bullets: (page.guarantee_bullets || []).map((bul, idx) => idx === i ? e.target.value : bul) })} />
                        <Button variant="ghost" size="sm" onClick={() => updatePage({ guarantee_bullets: (page.guarantee_bullets || []).filter((_, idx) => idx !== i) })}><X className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => updatePage({ guarantee_bullets: [...(page.guarantee_bullets || []), "New bullet"] })}><Plus className="w-4 h-4 mr-1" /> Add Bullet</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testimonials */}
            {activeTab === "Testimonials" && (
              <div>
                <Card className="bg-[#0f1e35] border-white/10 mb-4">
                  <CardHeader><CardTitle className="text-white">Testimonials Section</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><Label>Section Title</Label><Input value={page.testimonials_title || ""} onChange={(e) => updatePage({ testimonials_title: e.target.value })} /></div>
                    <div><Label>Section Subtitle</Label><Input value={page.testimonials_subtitle || ""} onChange={(e) => updatePage({ testimonials_subtitle: e.target.value })} /></div>
                  </CardContent>
                </Card>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Testimonials</h3>
                  <Button size="sm" onClick={() => updatePage({ testimonials: [...(page.testimonials || []), { quote: "", name: "", initials: "", rating: 5, time_ago: "" }] })}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </div>
                {(page.testimonials || []).map((t, i) => (
                  <Card key={i} className="bg-[#0a1628] border-white/10 mb-2">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between"><Label>Quote</Label><Button variant="ghost" size="sm" onClick={() => updatePage({ testimonials: (page.testimonials || []).filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></Button></div>
                      <Textarea value={t.quote || ""} onChange={(e) => updatePage({ testimonials: (page.testimonials || []).map((test, idx) => idx === i ? { ...test, quote: e.target.value } : test) })} className="h-20" />
                      <div className="grid grid-cols-3 gap-2">
                        <Input value={t.name || ""} onChange={(e) => updatePage({ testimonials: (page.testimonials || []).map((test, idx) => idx === i ? { ...test, name: e.target.value } : test) })} placeholder="Name" />
                        <Input value={t.initials || ""} onChange={(e) => updatePage({ testimonials: (page.testimonials || []).map((test, idx) => idx === i ? { ...test, initials: e.target.value } : test) })} placeholder="Initials" />
                        <Input type="number" value={t.rating || 5} onChange={(e) => updatePage({ testimonials: (page.testimonials || []).map((test, idx) => idx === i ? { ...test, rating: parseInt(e.target.value) } : test) })} placeholder="Rating" />
                      </div>
                      <Input value={t.time_ago || ""} onChange={(e) => updatePage({ testimonials: (page.testimonials || []).map((test, idx) => idx === i ? { ...test, time_ago: e.target.value } : test) })} placeholder="Time ago (e.g. '2 weeks ago')" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* FAQ */}
            {activeTab === "FAQ" && (
              <div>
                <Card className="bg-[#0f1e35] border-white/10 mb-4">
                  <CardHeader><CardTitle className="text-white">FAQ Section</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><Label>Section Title</Label><Input value={page.faq_title || ""} onChange={(e) => updatePage({ faq_title: e.target.value })} /></div>
                    <div><Label>Section Subtitle</Label><Input value={page.faq_subtitle || ""} onChange={(e) => updatePage({ faq_subtitle: e.target.value })} /></div>
                  </CardContent>
                </Card>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">FAQ Items</h3>
                  <Button size="sm" onClick={() => updatePage({ faq_items: [...(page.faq_items || []), { question: "", answer: "" }] })}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </div>
                {(page.faq_items || []).map((item, i) => (
                  <Card key={i} className="bg-[#0a1628] border-white/10 mb-2">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between"><Label>Question</Label><Button variant="ghost" size="sm" onClick={() => updatePage({ faq_items: (page.faq_items || []).filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></Button></div>
                      <Input value={item.question || ""} onChange={(e) => updatePage({ faq_items: (page.faq_items || []).map((it, idx) => idx === i ? { ...it, question: e.target.value } : it) })} />
                      <Label>Answer</Label>
                      <Textarea value={item.answer || ""} onChange={(e) => updatePage({ faq_items: (page.faq_items || []).map((it, idx) => idx === i ? { ...it, answer: e.target.value } : it) })} className="h-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* SEO & Pixels */}
            {activeTab === "SEO & Pixels" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">SEO & Tracking Pixels</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Meta Title</Label><Input value={page.meta_title || ""} onChange={(e) => updatePage({ meta_title: e.target.value })} /></div>
                  <div><Label>Meta Description</Label><Textarea value={page.meta_description || ""} onChange={(e) => updatePage({ meta_description: e.target.value })} className="h-20" /></div>
                  <div><Label>OG Image URL</Label><Input value={page.og_image_url || ""} onChange={(e) => updatePage({ og_image_url: e.target.value })} /></div>
                  <div><Label>Favicon URL</Label><Input value={page.favicon_url || ""} onChange={(e) => updatePage({ favicon_url: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Meta Pixel ID</Label><Input value={page.global_pixels?.meta_pixel_id || ""} onChange={(e) => updatePage({ global_pixels: { ...page.global_pixels, meta_pixel_id: e.target.value } })} /></div>
                    <div><Label>Google Analytics ID</Label><Input value={page.global_pixels?.google_analytics_id || ""} onChange={(e) => updatePage({ global_pixels: { ...page.global_pixels, google_analytics_id: e.target.value } })} /></div>
                    <div><Label>Google Ads ID</Label><Input value={page.global_pixels?.google_ads_id || ""} onChange={(e) => updatePage({ global_pixels: { ...page.global_pixels, google_ads_id: e.target.value } })} /></div>
                    <div><Label>Taboola Pixel ID</Label><Input value={page.global_pixels?.taboola_pixel_id || ""} onChange={(e) => updatePage({ global_pixels: { ...page.global_pixels, taboola_pixel_id: e.target.value } })} /></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compliance */}
            {activeTab === "Compliance" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Compliance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2"><Switch checked={page.show_footer_disclaimer !== false} onCheckedChange={(c) => updatePage({ show_footer_disclaimer: c })} /><Label>Show Footer Disclaimer</Label></div>
                  <div><Label>Footer Disclaimer HTML</Label><Editor height="300px" language="html" value={page.footer_disclaimer_html || ""} onChange={(v) => updatePage({ footer_disclaimer_html: v })} /></div>
                </CardContent>
              </Card>
            )}

            {/* Design Tokens */}
            {activeTab === "Design Tokens" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Design Token Overrides</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-400">Override template design tokens. Leave empty to use template defaults.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <HexColorPicker color={page.design_tokens_override?.primary_color || "#1e90ff"} onChange={(c) => updatePage({ design_tokens_override: { ...page.design_tokens_override, primary_color: c } })} />
                        <Input value={page.design_tokens_override?.primary_color || "#1e90ff"} onChange={(e) => updatePage({ design_tokens_override: { ...page.design_tokens_override, primary_color: e.target.value } })} />
                      </div>
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <HexColorPicker color={page.design_tokens_override?.accent_color || "#22c55e"} onChange={(c) => updatePage({ design_tokens_override: { ...page.design_tokens_override, accent_color: c } })} />
                        <Input value={page.design_tokens_override?.accent_color || "#22c55e"} onChange={(e) => updatePage({ design_tokens_override: { ...page.design_tokens_override, accent_color: e.target.value } })} />
                      </div>
                    </div>
                    <div><Label>Background Color</Label><Input value={page.design_tokens_override?.background_color || "#0b1220"} onChange={(e) => updatePage({ design_tokens_override: { ...page.design_tokens_override, background_color: e.target.value } })} /></div>
                    <div><Label>Font Headline</Label><Input value={page.design_tokens_override?.font_headline || "Georgia"} onChange={(e) => updatePage({ design_tokens_override: { ...page.design_tokens_override, font_headline: e.target.value } })} /></div>
                    <div><Label>Font Body</Label><Input value={page.design_tokens_override?.font_body || "Inter"} onChange={(e) => updatePage({ design_tokens_override: { ...page.design_tokens_override, font_body: e.target.value } })} /></div>
                    <div><Label>Button Style</Label>
                      <Select value={page.design_tokens_override?.button_style || "pill"} onValueChange={(v) => updatePage({ design_tokens_override: { ...page.design_tokens_override, button_style: v } })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="pill">Pill</SelectItem><SelectItem value="rounded">Rounded</SelectItem><SelectItem value="square">Square</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced */}
            {activeTab === "Advanced" && (
              <Card className="bg-[#0f1e35] border-white/10">
                <CardHeader><CardTitle className="text-white">Advanced Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Custom Head HTML</Label><Editor height="150px" language="html" value={page.custom_head_html || ""} onChange={(v) => updatePage({ custom_head_html: v })} /></div>
                  <div><Label>Custom Body HTML</Label><Editor height="150px" language="html" value={page.custom_body_html || ""} onChange={(v) => updatePage({ custom_body_html: v })} /></div>
                  <div><Label>Section Order Override (JSON array)</Label><Editor height="100px" language="json" value={JSON.stringify(page.section_order_override || [], null, 2)} onChange={(v) => updatePage({ section_order_override: JSON.parse(v || "[]") })} /></div>
                  <div><Label>Notes (internal)</Label><Textarea value={page.notes || ""} onChange={(e) => updatePage({ notes: e.target.value })} className="h-20" /></div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="font-semibold">Live Preview</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreviewMode("desktop")} className={previewMode === "desktop" ? "bg-white/10" : ""}><Monitor className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewMode("tablet")} className={previewMode === "tablet" ? "bg-white/10" : ""}><Tablet className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewMode("mobile")} className={previewMode === "mobile" ? "bg-white/10" : ""}><Smartphone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewTs(Date.now())}><RefreshCw className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className={`flex-1 bg-white rounded-lg overflow-hidden flex-shrink-0 ${previewMode === "mobile" ? "max-w-sm mx-auto w-full" : previewMode === "tablet" ? "max-w-2xl mx-auto w-full" : "w-full"}`}>
              <iframe src={`/lp/${page.slug}?preview=1&ts=${previewTs}`} className="w-full h-full border-0" title="Preview" />
            </div>
          </div>
        </div>

        {showTemplateModal && (
          <ChooseTemplateModal
            onClose={() => setShowTemplateModal(false)}
            onTemplateChoose={(template) => {
              updatePage({
                template_key: template.template_key,
                design_tokens_override: {},
                section_order_override: [],
                embedded_quiz_theme_id: template.embedded_quiz_theme_id || null,
              });
              setShowTemplateModal(false);
            }}
            existingPages={[]}
            isChangeTemplate
          />
        )}
      </div>
    </AdminRouteGuard>
  );
}
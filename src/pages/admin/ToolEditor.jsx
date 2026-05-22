import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { Save, Globe, ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";

const TABS = ["Identity", "Hero", "Quiz", "Analysis", "Match Reveal", "Routing"];

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#b8860b] transition-colors";
const textareaCls = inputCls + " resize-none";

const EMPTY_TOOL = {
  slug: "", name: "", status: "draft", subtype_default: "auto",
  hero_eyebrow: "", hero_headline: "", hero_subhead: "", hero_lead: "",
  key_facts: ["", "", "", ""],
  quiz_questions: [],
  attorney_type_map: [],
  statute_map: [],
  match_criteria_lines: [
    "Strong negotiation history with {insurer_class}",
    "Experience with {liability_complexity} liability cases",
    "Medical documentation expertise",
    "Trial capable if the carrier resists",
  ],
  match_reveal_headline: "Your match is ready.",
  match_reveal_subhead: "Based on your case profile, your file has been routed to a {attorney_type} in the {state} network. The intake desk is standing by.",
  cta_button_text: "CALL MY MATCH NOW",
  cta_subline: "Available 24/7. Average wait under 2 minutes. No fee unless they recover for you.",
  trust_strip: "CHECKMYCLAIM.CO IS NOT A LAW FIRM. THE MATCH ENGINE CONNECTS YOU WITH INDEPENDENT ATTORNEYS IN OUR VETTED NETWORK.",
  call_tracking_number: "",
  lead_endpoint_source: "tools_match",
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
}

function F({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export default function ToolEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_TOOL);
  const [tab, setTab] = useState("Identity");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isNew = !id || id === "new";

  useEffect(() => {
    const load = async () => {
      if (!isNew) {
        const res = await base44.entities.Tool.filter({ id });
        if (res.length > 0) setForm({ ...EMPTY_TOOL, ...res[0] });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const set = (field, value) => {
    setForm(f => {
      const next = { ...f, [field]: value };
      if (field === "name" && isNew) next.slug = slugify(value);
      return next;
    });
  };

  const save = async (newStatus) => {
    setSaving(true);
    const data = { ...form };
    if (newStatus) data.status = newStatus;
    if (isNew) {
      const created = await base44.entities.Tool.create(data);
      navigate(`/admin/tools/${created.id}/edit`, { replace: true });
    } else {
      await base44.entities.Tool.update(id, data);
      setForm(f => ({ ...f, ...data }));
    }
    setSaving(false);
  };

  if (loading) return <AdminLayout title="Loading..."><div className="text-slate-400 text-center py-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout
      title={isNew ? "New Tool" : `Edit: ${form.name || "Untitled"}`}
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Experiments", href: "/admin/experiments" }, { label: isNew ? "New Tool" : "Edit Tool" }]}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/experiments" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-3">
          {!isNew && form.status === "live" && (
            <a href={`/tools/${form.slug}?preview=1`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
              <Globe className="w-4 h-4" /> Preview
            </a>
          )}
          <button onClick={() => save()} disabled={saving}
            className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => save("live")} disabled={saving}
            className="flex items-center gap-2 bg-[#b8860b] hover:bg-[#8b6914] disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg">
            <Globe className="w-4 h-4" /> Publish Live
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t ? "text-white border-b-2 border-[#b8860b]" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-5 max-w-4xl">
        {/* IDENTITY */}
        {tab === "Identity" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <F label="Name *"><input value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} placeholder="Attorney Match Engine" /></F>
              <F label="Slug *"><input value={form.slug} onChange={e => set("slug", e.target.value)} className={inputCls} placeholder="attorney-match" /></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Status">
                <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="paused">Paused</option>
                </select>
              </F>
              <F label="Subtype Default">
                <select value={form.subtype_default} onChange={e => set("subtype_default", e.target.value)} className={inputCls}>
                  <option value="auto">Auto</option>
                  <option value="commercial">Commercial</option>
                  <option value="rideshare">Rideshare</option>
                </select>
              </F>
            </div>
          </>
        )}

        {/* HERO */}
        {tab === "Hero" && (
          <>
            <F label="Eyebrow (JetBrains Mono uppercase, gold)" hint="Short uppercase label shown above the headline. No em dashes.">
              <input value={form.hero_eyebrow} onChange={e => set("hero_eyebrow", e.target.value)} className={inputCls} />
            </F>
            <F label="Headline" hint="Large Fraunces display heading. Wrap 'Right' in the word to italicize.">
              <input value={form.hero_headline} onChange={e => set("hero_headline", e.target.value)} className={inputCls} />
            </F>
            <F label="Subhead (IBM Plex Serif, ink-soft)">
              <textarea value={form.hero_subhead} onChange={e => set("hero_subhead", e.target.value)} rows={3} className={textareaCls} />
            </F>
            <F label="Lead Body (two paragraphs, separate with blank line)" hint="Shown below subhead. Supports paragraph breaks with two newlines.">
              <textarea value={form.hero_lead} onChange={e => set("hero_lead", e.target.value)} rows={6} className={textareaCls} />
            </F>
            <F label="Key Facts (up to 5)" hint="Numbered 01-05 with gold numerals.">
              {(form.key_facts || ["", "", "", ""]).map((fact, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <span className="font-mono text-[#b8860b] text-sm w-6 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <input value={fact} onChange={e => {
                    const arr = [...(form.key_facts || [])];
                    arr[i] = e.target.value;
                    set("key_facts", arr);
                  }} className={inputCls} placeholder={`Key fact ${i + 1}`} />
                  {(form.key_facts || []).length > 1 && (
                    <button onClick={() => {
                      const arr = [...(form.key_facts || [])];
                      arr.splice(i, 1);
                      set("key_facts", arr);
                    }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              {(form.key_facts || []).length < 5 && (
                <button onClick={() => set("key_facts", [...(form.key_facts || []), ""])}
                  className="flex items-center gap-2 text-[#b8860b] hover:text-white text-sm mt-1">
                  <Plus className="w-3 h-3" /> Add fact
                </button>
              )}
            </F>
          </>
        )}

        {/* QUIZ */}
        {tab === "Quiz" && (
          <div>
            <p className="text-slate-400 text-sm mb-4">Questions are editable below. The 7 default questions are used if this is empty. Reorder by dragging (drag handle coming soon).</p>
            {(form.quiz_questions || []).length === 0 ? (
              <div className="bg-[#0a1628] border border-white/10 rounded-lg p-6 text-center text-slate-400">
                <p className="mb-3">Using built-in defaults (7 questions). To customize, click below.</p>
                <button
                  onClick={() => set("quiz_questions", [
                    { id: "accident_type", type: "single_select", question: "What type of accident were you involved in?", help_text: "", options: [
                      { id: "passenger_car", label: "Passenger car collision" },
                      { id: "commercial_truck", label: "Hit by a commercial truck or van" },
                      { id: "rideshare", label: "Uber or Lyft incident" },
                      { id: "motorcycle", label: "Motorcycle accident" },
                    ]},
                  ])}
                  className="bg-[#b8860b] hover:bg-[#8b6914] text-white font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  Customize Questions
                </button>
              </div>
            ) : (
              <>
                {form.quiz_questions.map((q, qi) => (
                  <div key={qi} className="bg-[#0a1628] border border-white/10 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <GripVertical className="w-4 h-4 text-slate-500" />
                      <span className="font-mono text-[#b8860b] text-xs">Q{qi + 1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input value={q.id} onChange={e => {
                          const arr = [...form.quiz_questions]; arr[qi] = { ...q, id: e.target.value }; set("quiz_questions", arr);
                        }} className={inputCls} placeholder="question_id" />
                        <select value={q.type} onChange={e => {
                          const arr = [...form.quiz_questions]; arr[qi] = { ...q, type: e.target.value }; set("quiz_questions", arr);
                        }} className={inputCls}>
                          <option value="single_select">Single Select</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                      </div>
                      <button onClick={() => {
                        const arr = [...form.quiz_questions]; arr.splice(qi, 1); set("quiz_questions", arr);
                      }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <input value={q.question} onChange={e => {
                      const arr = [...form.quiz_questions]; arr[qi] = { ...q, question: e.target.value }; set("quiz_questions", arr);
                    }} className={`${inputCls} mb-2`} placeholder="Question text" />
                    <input value={q.help_text || ""} onChange={e => {
                      const arr = [...form.quiz_questions]; arr[qi] = { ...q, help_text: e.target.value }; set("quiz_questions", arr);
                    }} className={`${inputCls} mb-3`} placeholder="Help text (italic, optional)" />
                    <div className="pl-3 border-l border-white/10 space-y-2">
                      {(q.options || []).map((opt, oi) => (
                        <div key={oi} className="flex gap-2">
                          <input value={opt.id} onChange={e => {
                            const arr = [...form.quiz_questions]; const opts = [...q.options]; opts[oi] = { ...opt, id: e.target.value }; arr[qi] = { ...q, options: opts }; set("quiz_questions", arr);
                          }} className={`${inputCls} w-32 flex-shrink-0`} placeholder="option_id" />
                          <input value={opt.label} onChange={e => {
                            const arr = [...form.quiz_questions]; const opts = [...q.options]; opts[oi] = { ...opt, label: e.target.value }; arr[qi] = { ...q, options: opts }; set("quiz_questions", arr);
                          }} className={inputCls} placeholder="Label" />
                          <button onClick={() => {
                            const arr = [...form.quiz_questions]; const opts = [...q.options]; opts.splice(oi, 1); arr[qi] = { ...q, options: opts }; set("quiz_questions", arr);
                          }} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const arr = [...form.quiz_questions]; const opts = [...(q.options || []), { id: "", label: "" }]; arr[qi] = { ...q, options: opts }; set("quiz_questions", arr);
                      }} className="text-[#b8860b] text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Add option</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => set("quiz_questions", [...form.quiz_questions, { id: "", type: "single_select", question: "", help_text: "", options: [] }])}
                  className="flex items-center gap-2 text-[#b8860b] hover:text-white text-sm">
                  <Plus className="w-4 h-4" /> Add question
                </button>
              </>
            )}
          </div>
        )}

        {/* ANALYSIS */}
        {tab === "Analysis" && (
          <>
            <div>
              <p className="text-slate-400 text-sm mb-4">Attorney type map: rows matched top-to-bottom. Use "any" in the surgery column to match all surgery values.</p>
              <div className="space-y-2">
                {(form.attorney_type_map || []).map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={row.accident_type || ""} onChange={e => { const arr = [...form.attorney_type_map]; arr[i] = { ...row, accident_type: e.target.value }; set("attorney_type_map", arr); }}
                      className={`${inputCls} w-36`} placeholder="accident_type" />
                    <input value={row.surgery || ""} onChange={e => { const arr = [...form.attorney_type_map]; arr[i] = { ...row, surgery: e.target.value }; set("attorney_type_map", arr); }}
                      className={`${inputCls} w-36`} placeholder="surgery (or any)" />
                    <input value={row.label || ""} onChange={e => { const arr = [...form.attorney_type_map]; arr[i] = { ...row, label: e.target.value }; set("attorney_type_map", arr); }}
                      className={inputCls} placeholder="Attorney type label" />
                    <button onClick={() => { const arr = [...form.attorney_type_map]; arr.splice(i, 1); set("attorney_type_map", arr); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => set("attorney_type_map", [...(form.attorney_type_map || []), { accident_type: "", surgery: "any", label: "" }])}
                  className="flex items-center gap-2 text-[#b8860b] text-sm"><Plus className="w-3 h-3" /> Add row</button>
              </div>
              <p className="text-slate-500 text-xs mt-1">Leave empty to use built-in defaults.</p>
            </div>

            <div className="border-t border-white/10 pt-5">
              <p className="text-slate-300 text-sm font-semibold mb-3">Match Criteria Lines (4 lines, use tokens: {"{insurer_class}"}, {"{liability_complexity}"}, {"{state}"}, {"{attorney_type}"})</p>
              {(form.match_criteria_lines || ["", "", "", ""]).map((line, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <span className="text-[#b8860b] font-mono text-sm w-4 flex-shrink-0">{i + 1}</span>
                  <input value={line} onChange={e => { const arr = [...(form.match_criteria_lines || [])]; arr[i] = e.target.value; set("match_criteria_lines", arr); }}
                    className={inputCls} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* MATCH REVEAL */}
        {tab === "Match Reveal" && (
          <>
            <F label="Reveal Headline"><input value={form.match_reveal_headline} onChange={e => set("match_reveal_headline", e.target.value)} className={inputCls} /></F>
            <F label="Reveal Subhead" hint="Supports {attorney_type} and {state} tokens.">
              <textarea value={form.match_reveal_subhead} onChange={e => set("match_reveal_subhead", e.target.value)} rows={3} className={textareaCls} />
            </F>
            <F label="CTA Button Text"><input value={form.cta_button_text} onChange={e => set("cta_button_text", e.target.value)} className={inputCls} /></F>
            <F label="CTA Sub-line"><input value={form.cta_subline} onChange={e => set("cta_subline", e.target.value)} className={inputCls} /></F>
            <F label="Trust Strip (uppercase footer text)">
              <textarea value={form.trust_strip} onChange={e => set("trust_strip", e.target.value)} rows={2} className={textareaCls} />
            </F>
          </>
        )}

        {/* ROUTING */}
        {tab === "Routing" && (
          <>
            <F label="Call Tracking Number" hint="Leave empty to use site default: (844) 840-6905. Include parentheses and dashes.">
              <input value={form.call_tracking_number} onChange={e => set("call_tracking_number", e.target.value)} className={inputCls} placeholder="(844) 840-6905" />
            </F>
            <F label="Lead Source Identifier" hint='Value stored in the leads endpoint "source" field.'>
              <input value={form.lead_endpoint_source} onChange={e => set("lead_endpoint_source", e.target.value)} className={inputCls} placeholder="tools_match" />
            </F>
          </>
        )}

        <div className="pt-6 border-t border-white/10 flex gap-3">
          <button onClick={() => save()} disabled={saving}
            className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => save("live")} disabled={saving}
            className="bg-[#b8860b] hover:bg-[#8b6914] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-sm">
            Publish Live
          </button>
          {!isNew && (
            <a href={`/tools/${form.slug}?preview=1`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all">
              <Globe className="w-4 h-4" /> Preview
            </a>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
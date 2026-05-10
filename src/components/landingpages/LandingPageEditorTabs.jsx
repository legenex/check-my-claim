import React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

const TABS = [
  { id: "hero", label: "Hero & Quiz" },
  { id: "trust", label: "Trust Pillars" },
  { id: "benefits", label: "Benefits" },
  { id: "wins", label: "Recent Wins" },
  { id: "guarantee", label: "Guarantee" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "seo", label: "SEO & Pixels" },
  { id: "compliance", label: "Compliance" },
  { id: "advanced", label: "Advanced" },
];

export default function LandingPageEditorTabs({ page, quizzes, brands, activeTab, setActiveTab, onUpdate }) {
  const set = (field, value) => onUpdate({ [field]: value });

  return (
    <div className="flex flex-col h-full">
      {/* Tab nav */}
      <div className="border-b border-white/10 flex flex-wrap gap-0.5 p-2">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? "bg-[#1e90ff] text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "hero" && <HeroTab page={page} quizzes={quizzes} set={set} />}
        {activeTab === "trust" && <TrustTab page={page} set={set} />}
        {activeTab === "benefits" && <BenefitsTab page={page} set={set} />}
        {activeTab === "wins" && <WinsTab page={page} set={set} />}
        {activeTab === "guarantee" && <GuaranteeTab page={page} set={set} />}
        {activeTab === "testimonials" && <TestimonialsTab page={page} set={set} />}
        {activeTab === "faq" && <FaqTab page={page} set={set} />}
        {activeTab === "seo" && <SeoTab page={page} set={set} />}
        {activeTab === "compliance" && <ComplianceTab page={page} set={set} />}
        {activeTab === "advanced" && <AdvancedTab page={page} brands={brands} set={set} />}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] transition-colors";
const textareaCls = `${inputCls} resize-none`;

function HeroTab({ page, quizzes, set }) {
  return (
    <div className="space-y-4">
      <Field label="Eyebrow text">
        <input value={page.hero_eyebrow || ""} onChange={e => set("hero_eyebrow", e.target.value)} className={inputCls} placeholder="Small text above H1" />
      </Field>
      <Field label="Headline (H1) *">
        <input value={page.hero_headline || ""} onChange={e => set("hero_headline", e.target.value)} className={inputCls} placeholder="Get The Maximum Cash Payout..." />
      </Field>
      <Field label="Subheadline">
        <input value={page.hero_subheadline || ""} onChange={e => set("hero_subheadline", e.target.value)} className={inputCls} placeholder="How Were You Injured?" />
      </Field>
      <Field label="Helper text">
        <input value={page.hero_subheadline_helper || ""} onChange={e => set("hero_subheadline_helper", e.target.value)} className={inputCls} placeholder="Select The Type Of Accident..." />
      </Field>
      <Field label="Decision Tree (Quiz) *">
        <select value={page.decision_tree_quiz_id || ""} onChange={e => set("decision_tree_quiz_id", e.target.value)} className={inputCls}>
          <option value="">— Pick a published quiz —</option>
          {quizzes.map(q => <option key={q.id} value={q.id}>{q.title} ({q.campaign_type || "Custom"})</option>)}
        </select>
        {!page.decision_tree_quiz_id && (
          <p className="text-xs text-amber-400 mt-1">⚠ Pick a Decision Tree to render this page correctly</p>
        )}
      </Field>
      <Field label="Quiz card style">
        <select value={page.decision_tree_card_style || "white_navy"} onChange={e => set("decision_tree_card_style", e.target.value)} className={inputCls}>
          <option value="white_navy">White / Navy glow (default)</option>
          <option value="navy_glow">Navy glow</option>
          <option value="minimal">Minimal</option>
        </select>
      </Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="show_phone" checked={page.show_hero_phone_cta !== false} onChange={e => set("show_hero_phone_cta", e.target.checked)} className="w-4 h-4 rounded" />
        <label htmlFor="show_phone" className="text-sm text-slate-300 cursor-pointer">Show phone CTA below quiz</label>
      </div>
      {page.show_hero_phone_cta !== false && (
        <Field label="Phone CTA label">
          <input value={page.hero_phone_label || ""} onChange={e => set("hero_phone_label", e.target.value)} className={inputCls} />
        </Field>
      )}
    </div>
  );
}

function TrustTab({ page, set }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(n => (
        <div key={n} className="bg-[#0a1628] rounded-xl p-4 border border-white/10">
          <div className="text-xs text-slate-400 mb-2 font-semibold">Stat {n}</div>
          <div className="space-y-2">
            <Field label="Value">
              <input value={page[`trust_stat_${n}_value`] || ""} onChange={e => set(`trust_stat_${n}_value`, e.target.value)} className={inputCls} placeholder="$50M+" />
            </Field>
            <Field label="Label">
              <input value={page[`trust_stat_${n}_label`] || ""} onChange={e => set(`trust_stat_${n}_label`, e.target.value)} className={inputCls} placeholder="Recovered" />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function BenefitsTab({ page, set }) {
  const items = page.benefits_items || [];
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    set("benefits_items", next);
  };
  const add = () => set("benefits_items", [...items, { icon: "CheckCircle", label: "" }]);
  const remove = (i) => set("benefits_items", items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Section title"><input value={page.benefits_section_title || ""} onChange={e => set("benefits_section_title", e.target.value)} className={inputCls} /></Field>
      <Field label="Section subtitle"><textarea value={page.benefits_section_subtitle || ""} onChange={e => set("benefits_section_subtitle", e.target.value)} rows={2} className={textareaCls} /></Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">Benefits Items</label>
          <button onClick={add} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input value={item.icon || ""} onChange={e => update(i, "icon", e.target.value)} placeholder="Icon (Trophy)" className={`${inputCls} w-24 text-xs`} />
            <input value={item.label || ""} onChange={e => update(i, "label", e.target.value)} placeholder="Label" className={`${inputCls} flex-1`} />
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WinsTab({ page, set }) {
  const items = page.recent_wins_items || [];
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    set("recent_wins_items", next);
  };
  const add = () => set("recent_wins_items", [...items, { amount: "", name_initials: "", age: 35, location: "" }]);
  const remove = (i) => set("recent_wins_items", items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Section title"><input value={page.recent_wins_title || ""} onChange={e => set("recent_wins_title", e.target.value)} className={inputCls} /></Field>
      <Field label="Section subtitle"><textarea value={page.recent_wins_subtitle || ""} onChange={e => set("recent_wins_subtitle", e.target.value)} rows={2} className={textareaCls} /></Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">Win Items</label>
          <button onClick={add} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="bg-[#0a1628] rounded-xl p-3 border border-white/10 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Win {i + 1}</span>
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={item.amount || ""} onChange={e => update(i, "amount", e.target.value)} placeholder="$132,700" className={inputCls} />
              <input value={item.name_initials || ""} onChange={e => update(i, "name_initials", e.target.value)} placeholder="Mike P." className={inputCls} />
              <input type="number" value={item.age || ""} onChange={e => update(i, "age", parseInt(e.target.value))} placeholder="Age" className={inputCls} />
              <input value={item.location || ""} onChange={e => update(i, "location", e.target.value)} placeholder="Memphis, TN" className={inputCls} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuaranteeTab({ page, set }) {
  const bullets = page.guarantee_bullets || [];
  const updateBullet = (i, val) => { const next = [...bullets]; next[i] = val; set("guarantee_bullets", next); };
  const addBullet = () => set("guarantee_bullets", [...bullets, ""]);
  const removeBullet = (i) => set("guarantee_bullets", bullets.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Section title"><input value={page.guarantee_title || ""} onChange={e => set("guarantee_title", e.target.value)} className={inputCls} /></Field>
      <Field label="Eyebrow"><input value={page.guarantee_eyebrow || ""} onChange={e => set("guarantee_eyebrow", e.target.value)} className={inputCls} /></Field>
      <Field label="Body (HTML)"><textarea value={page.guarantee_body_html || ""} onChange={e => set("guarantee_body_html", e.target.value)} rows={5} className={textareaCls} /></Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">Bullets</label>
          <button onClick={addBullet} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input value={b} onChange={e => updateBullet(i, e.target.value)} className={`${inputCls} flex-1`} placeholder="Bullet text" />
            <button onClick={() => removeBullet(i)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsTab({ page, set }) {
  const items = page.testimonials || [];
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    set("testimonials", next);
  };
  const add = () => set("testimonials", [...items, { quote: "", name: "", time_ago: "", rating: 5, initials: "" }]);
  const remove = (i) => set("testimonials", items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Section title"><input value={page.testimonials_title || ""} onChange={e => set("testimonials_title", e.target.value)} className={inputCls} /></Field>
      <Field label="Section subtitle"><input value={page.testimonials_subtitle || ""} onChange={e => set("testimonials_subtitle", e.target.value)} className={inputCls} /></Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">Testimonials</label>
          <button onClick={add} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="bg-[#0a1628] rounded-xl p-3 border border-white/10 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Testimonial {i + 1}</span>
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
            </div>
            <textarea value={item.quote || ""} onChange={e => update(i, "quote", e.target.value)} rows={3} placeholder="Quote..." className={`${textareaCls} mb-2`} />
            <div className="grid grid-cols-2 gap-2">
              <input value={item.name || ""} onChange={e => update(i, "name", e.target.value)} placeholder="Name" className={inputCls} />
              <input value={item.initials || ""} onChange={e => update(i, "initials", e.target.value)} placeholder="JL" className={inputCls} />
              <input value={item.time_ago || ""} onChange={e => update(i, "time_ago", e.target.value)} placeholder="1 Month ago" className={inputCls} />
              <input type="number" min="1" max="5" value={item.rating || 5} onChange={e => update(i, "rating", parseInt(e.target.value))} placeholder="Rating (1-5)" className={inputCls} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqTab({ page, set }) {
  const items = page.faq_items || [];
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    set("faq_items", next);
  };
  const add = () => set("faq_items", [...items, { question: "", answer: "" }]);
  const remove = (i) => set("faq_items", items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Section title"><input value={page.faq_title || ""} onChange={e => set("faq_title", e.target.value)} className={inputCls} /></Field>
      <Field label="Section subtitle"><input value={page.faq_subtitle || ""} onChange={e => set("faq_subtitle", e.target.value)} className={inputCls} /></Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400">FAQ Items</label>
          <button onClick={add} className="text-xs text-[#1e90ff] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="bg-[#0a1628] rounded-xl p-3 border border-white/10 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Q{i + 1}</span>
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
            </div>
            <input value={item.question || ""} onChange={e => update(i, "question", e.target.value)} placeholder="Question" className={`${inputCls} mb-2`} />
            <textarea value={item.answer || ""} onChange={e => update(i, "answer", e.target.value)} rows={3} placeholder="Answer" className={textareaCls} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoTab({ page, set }) {
  const pixels = page.global_pixels || {};
  const setPixel = (k, v) => set("global_pixels", { ...pixels, [k]: v });
  return (
    <div className="space-y-4">
      <Field label="Meta title"><input value={page.meta_title || ""} onChange={e => set("meta_title", e.target.value)} className={inputCls} /></Field>
      <Field label="Meta description"><textarea value={page.meta_description || ""} onChange={e => set("meta_description", e.target.value)} rows={3} className={textareaCls} /></Field>
      <Field label="OG Image URL"><input value={page.og_image_url || ""} onChange={e => set("og_image_url", e.target.value)} className={inputCls} /></Field>
      <hr className="border-white/10" />
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tracking Pixels</div>
      <Field label="Meta Pixel ID"><input value={pixels.meta_pixel_id || ""} onChange={e => setPixel("meta_pixel_id", e.target.value)} className={inputCls} /></Field>
      <Field label="Google Analytics ID"><input value={pixels.google_analytics_id || ""} onChange={e => setPixel("google_analytics_id", e.target.value)} className={inputCls} /></Field>
      <Field label="Google Ads ID"><input value={pixels.google_ads_id || ""} onChange={e => setPixel("google_ads_id", e.target.value)} className={inputCls} /></Field>
      <Field label="TikTok Pixel ID"><input value={pixels.tiktok_pixel_id || ""} onChange={e => setPixel("tiktok_pixel_id", e.target.value)} className={inputCls} /></Field>
      <Field label="Taboola Pixel ID"><input value={pixels.taboola_pixel_id || ""} onChange={e => setPixel("taboola_pixel_id", e.target.value)} className={inputCls} /></Field>
      <Field label="TrustedForm Field ID"><input value={pixels.trustedform_field_id || ""} onChange={e => setPixel("trustedform_field_id", e.target.value)} className={inputCls} /></Field>
    </div>
  );
}

function ComplianceTab({ page, set }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input type="checkbox" id="show_disclaimer" checked={page.show_footer_disclaimer !== false} onChange={e => set("show_footer_disclaimer", e.target.checked)} className="w-4 h-4 rounded" />
        <label htmlFor="show_disclaimer" className="text-sm text-slate-300 cursor-pointer">Show footer disclaimer</label>
      </div>
      {page.show_footer_disclaimer !== false && (
        <Field label="Disclaimer HTML">
          <textarea value={page.footer_disclaimer_html || ""} onChange={e => set("footer_disclaimer_html", e.target.value)} rows={12} className={textareaCls} />
        </Field>
      )}
    </div>
  );
}

function AdvancedTab({ page, brands, set }) {
  return (
    <div className="space-y-4">
      <Field label="Brand">
        <select value={page.brand_id || ""} onChange={e => set("brand_id", e.target.value)} className={inputCls}>
          <option value="">— No brand —</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
        </select>
      </Field>
      <Field label="Custom head HTML"><textarea value={page.custom_head_html || ""} onChange={e => set("custom_head_html", e.target.value)} rows={5} placeholder="Injected before </head>" className={`${textareaCls} font-mono text-xs`} /></Field>
      <Field label="Custom body HTML"><textarea value={page.custom_body_html || ""} onChange={e => set("custom_body_html", e.target.value)} rows={5} placeholder="Injected before </body>" className={`${textareaCls} font-mono text-xs`} /></Field>
      <Field label="Admin notes"><textarea value={page.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} className={textareaCls} /></Field>
      <Field label="Tags (comma separated)">
        <input value={(page.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} className={inputCls} />
      </Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_template" checked={page.is_template || false} onChange={e => set("is_template", e.target.checked)} className="w-4 h-4 rounded" />
        <label htmlFor="is_template" className="text-sm text-slate-300 cursor-pointer">Mark as template (usable as "Start from Default")</label>
      </div>
    </div>
  );
}
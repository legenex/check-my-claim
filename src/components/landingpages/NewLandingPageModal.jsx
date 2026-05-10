import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Layout, Sparkles, Copy } from "lucide-react";

const CAMPAIGN_TYPES = ["MVA", "Mass Tort", "Workers Comp", "Slip and Fall", "Med Mal", "Custom"];
const VOICES = ["empathetic", "urgent", "professional", "casual"];
const TRUST_ANGLES = ["settlement-amounts-focused", "no-win-no-fee-focused", "speed-focused", "personal-care-focused"];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 60);
}

const DEFAULT_FOOTER_HTML = `<p><strong>ADVERTORIAL</strong> — This is a paid advertisement. checkmyclaim.co is not a law firm or an attorney referral service. Past results do not guarantee future outcomes.</p>
<p><strong>DISCLAIMER:</strong> checkmyclaim.co is not a law firm or an attorney referral service. This advertisement is not legal advice and is not a guarantee or prediction of the outcome of your legal matter. Every case is different, and the outcome depends on the laws, facts, and circumstances unique to each case. Hiring an attorney is an important decision that should not be based solely on advertising. Request free information about your attorney's background and experience. <strong>CA RESIDENTS:</strong> Paid attorney advertising on behalf of jointly advertising independent attorneys, including: The Law Offices of Larry H. Parker, San Antonio, CA. A full listing of attorney sponsors can be found <a href="https://checkmyclaim.co/PartnerList">here</a>. Check My Claim is not a law firm and does not provide legal services. You can request an attorney by name. This advertising does not imply a higher quality of legal services than that provided by other attorneys, nor does it imply that the attorneys are certified specialists or experts in any area of law. Please note that past results showcased in advertisements do not dictate future results. If you live in AL, FL, MO, NY, or WY, <a href="https://checkmyclaim.co/disclosures/">Click here</a> to see additional information about attorney advertising in your state.</p>
<p>We use cookies to personalize content and to analyze our traffic. We also share information about your use of our site with our analytics partners who may combine it with other information that you've provided to them or that they've collected from your use of their services. You consent to our cookies if you continue to use our website. <a href="https://dsar.cptn.co/dsar/0ca83d86-1ffc-4e4e-afad-2edb0fd5440b">Request access to your data</a>.</p>`;

export default function NewLandingPageModal({ onClose, onCreated, existingPages }) {
  const [mode, setMode] = useState(null); // "default" | "blank" | "ai"
  const [quizzes, setQuizzes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [creating, setCreating] = useState(false);

  // Blank form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [campaignType, setCampaignType] = useState("MVA");

  // AI form
  const [aiCampaign, setAiCampaign] = useState("MVA");
  const [aiNiche, setAiNiche] = useState("");
  const [aiVoice, setAiVoice] = useState("empathetic");
  const [aiTrust, setAiTrust] = useState("no-win-no-fee-focused");
  const [aiQuizId, setAiQuizId] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState(1);

  useEffect(() => {
    Promise.all([
      base44.entities.Quiz.filter({ status: "Published" }),
      base44.entities.DecisionTreeBrand.list(),
    ]).then(([qs, bs]) => { setQuizzes(qs); setBrands(bs); });
  }, []);

  const handleTitleChange = (v) => { setTitle(v); setSlug(slugify(v)); };

  const getDefaultMvaData = () => ({
    title: "MVA Default Landing Page",
    slug: "mva",
    status: "published",
    campaign_type: "MVA",
    is_default_for_campaign: true,
    decision_tree_card_style: "white_navy",
    hero_eyebrow: "Take the 30 Second Quiz to Start the Process of Seeing How Much Your Claim Could Be Worth",
    hero_headline: "Get The Maximum Cash Payout For Your Accident Injury!!",
    hero_subheadline: "How Were You Injured?",
    hero_subheadline_helper: "Select The Type Of Accident You Were Involved In:",
    hero_phone_label: "If you'd prefer to speak to someone right away, please call:",
    show_hero_phone_cta: true,
    trust_stat_1_value: "$50M+", trust_stat_1_label: "Recovered",
    trust_stat_2_value: "50,000+", trust_stat_2_label: "Total Client Wins",
    trust_stat_3_value: "100%", trust_stat_3_label: "Free",
    benefits_section_title: "We'll Never Stop Fighting For You",
    benefits_section_subtitle: "We work with only the best attorneys to get you the compensation you deserve.",
    benefits_items: [
      { icon: "Trophy", label: "Vetted attorneys with proven track records" },
      { icon: "Info", label: "Thousands of successful claims nationwide" },
      { icon: "Users", label: "Personalized legal care for every client" },
      { icon: "Shield", label: "100% commitment to your success" },
    ],
    recent_wins_title: "Millions Recovered for Clients Just Like You",
    recent_wins_subtitle: "We connect you with high-performing attorneys who know how to win cases and get you what you deserve.",
    recent_wins_items: [
      { amount: "$132,700", name_initials: "Mike P.", age: 31, location: "Memphis, TN" },
      { amount: "$197,500", name_initials: "John M.", age: 54, location: "Tampa, FL" },
      { amount: "$114,600", name_initials: "Sarah J.", age: 43, location: "Los Angeles, CA" },
    ],
    guarantee_title: "Our Attorneys Don't Get Paid Unless You Do",
    guarantee_eyebrow: "THE NO WIN, NO FEE GUARANTEE",
    guarantee_body_html: "<p>Check My Claim connects you with vetted attorneys in our network who work on a 'no win, no fee' basis. This means the attorneys we match you with will not charge you a cent if they do not secure a positive outcome in your case. Our role is simple: we provide a free eligibility check and connect you with the right legal professional.</p>",
    guarantee_bullets: [
      "Free claim eligibility check, always 100% free",
      "Connected to attorneys who work on contingency",
      "Attorneys only get paid if you win your case",
      "No upfront costs or surprise bills from matched attorneys",
    ],
    testimonials_title: "Loved By Thousands of Clients",
    testimonials_subtitle: "See what our satisfied clients have to say",
    testimonials: [
      { quote: "I had no clue how to handle my claim after my crash, but they did everything. Start to finish: professional, efficient, and got me the best possible outcome.", name: "Jason Lambert", time_ago: "1 Month ago", rating: 5, initials: "JL" },
      { quote: "My car was totaled, and I had no idea what to do next. Thanks to Check My Claim, I received compensation fast, and it was more than I expected!", name: "Dana Hopson", time_ago: "2 Weeks ago", rating: 5, initials: "DH" },
      { quote: "I wasn't sure at first but really Check My Claim turned out to be a blessing! We got connected with top specialists and our claim was handled smoothly.", name: "Kyle Benavides", time_ago: "4 Months ago", rating: 3, initials: "KB" },
      { quote: "Got covered for all the damage and had money to spare. Check came through fast and they were a pleasure to deal with.", name: "Trevon Obral", time_ago: "3 Weeks ago", rating: 5, initials: "TO" },
    ],
    faq_title: "Frequently Asked Questions",
    faq_subtitle: "Everything you need to know about our survey and process",
    faq_items: [
      { question: "How long does the survey take?", answer: "Our free eligibility check takes just 30 seconds to complete. You'll answer a few quick questions about your accident, and we'll provide instant results." },
      { question: "Is the survey really free?", answer: "Yes — completely free. There is no cost to use the eligibility check, and the attorneys we connect you with work on contingency, meaning you pay nothing unless they win your case." },
      { question: "What happens after I complete the survey?", answer: "Based on your answers, we match you with one vetted attorney in your state who handles cases like yours. They will reach out to you for a free, no-obligation consultation." },
      { question: "Do I have to pay an attorney if I hire one?", answer: "No. The attorneys in our network work on a 'no win, no fee' basis. They only get paid if they recover compensation for you, and their fee is a percentage of the settlement, agreed up front in writing." },
      { question: "Will my information be kept private?", answer: "Yes. Your information is shared only with the attorney we match you with for the purpose of evaluating your case. We never sell your data to unrelated third parties." },
      { question: "Can I redo the survey if I made a mistake?", answer: "Absolutely. You can restart the survey at any time. If you've already submitted and need to update your information, the attorney you're matched with can correct any details during your initial consultation." },
    ],
    show_footer_disclaimer: true,
    footer_disclaimer_html: DEFAULT_FOOTER_HTML,
    meta_title: "Get The Maximum Cash Payout For Your Accident | Check My Claim",
    meta_description: "Free 30-second claim check. Connect with a vetted attorney in your state. No win, no fee.",
    global_pixels: { meta_pixel_id: "", google_analytics_id: "", taboola_pixel_id: "", trustedform_field_id: "xxTrustedFormCertUrl" },
    is_template: true,
    version: 1,
    view_count: 0,
    unique_visitors: 0,
    total_quiz_starts: 0,
    published_at: new Date().toISOString(),
  });

  const createFromDefault = async () => {
    setCreating(true);
    const mvaData = getDefaultMvaData();
    // Find MVA quiz
    const mvaQuiz = quizzes.find(q => q.campaign_type === "MVA" && q.status === "Published") || quizzes[0];
    if (mvaQuiz) mvaData.decision_tree_quiz_id = mvaQuiz.id;
    // Find cmc brand
    const cmcBrand = brands.find(b => b.brand_name?.toLowerCase().includes("cmc") || b.brand_name?.toLowerCase().includes("check my claim")) || brands[0];
    if (cmcBrand) mvaData.brand_id = cmcBrand.id;
    // Unique slug
    const existing = existingPages.map(p => p.slug);
    let finalSlug = mvaData.slug;
    if (existing.includes(finalSlug)) finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    mvaData.slug = finalSlug;
    const created = await base44.entities.LandingPage.create(mvaData);
    setCreating(false);
    onCreated(created.id);
  };

  const createBlank = async () => {
    if (!title || !slug) return;
    setCreating(true);
    const defaultData = getDefaultMvaData();
    const cmcBrand = brands.find(b => b.brand_name?.toLowerCase().includes("cmc") || b.brand_name?.toLowerCase().includes("check my claim")) || brands[0];
    const created = await base44.entities.LandingPage.create({
      ...defaultData,
      title,
      slug,
      campaign_type: campaignType,
      status: "draft",
      is_default_for_campaign: false,
      is_template: false,
      brand_id: cmcBrand?.id || "",
      published_at: undefined,
      version: 1,
    });
    setCreating(false);
    onCreated(created.id);
  };

  const generateWithAI = async () => {
    setAiGenerating(true);
    try {
      const aiSlug = slugify(`${aiCampaign}-${aiNiche}-${Date.now().toString(36)}`);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior conversion copywriter for legal lead-generation landing pages.

Campaign type: ${aiCampaign}
Niche/sub-vertical: ${aiNiche || aiCampaign}
Brand voice: ${aiVoice}
Trust angle: ${aiTrust}

Generate a complete landing page config as JSON. Rules:
1) hero_headline must contain a specific outcome promise and one '!' or '!!' for emphasis
2) trust stats must use specific numbers (never vague terms)
3) Generate 4 benefits_items with Lucide icon names (Trophy, Shield, Users, Info, Award, Heart, Star, Clock, CheckCircle)
4) Generate 3 recent_wins_items with realistic amounts ($45k–$250k), realistic ages 28–62, US cities
5) Generate 4 testimonials with first-person voice, specific details, mix of 3 and 5 star ratings
6) Generate 6 faq_items covering: time, cost, what happens next, attorney fees, privacy, restart
7) Match brand voice and trust angle throughout
NEVER fabricate real public figures. NEVER promise specific outcomes for the user's case.`,
        response_json_schema: {
          type: "object",
          properties: {
            hero_eyebrow: { type: "string" },
            hero_headline: { type: "string" },
            hero_subheadline: { type: "string" },
            hero_subheadline_helper: { type: "string" },
            trust_stat_1_value: { type: "string" }, trust_stat_1_label: { type: "string" },
            trust_stat_2_value: { type: "string" }, trust_stat_2_label: { type: "string" },
            trust_stat_3_value: { type: "string" }, trust_stat_3_label: { type: "string" },
            benefits_section_title: { type: "string" },
            benefits_section_subtitle: { type: "string" },
            benefits_items: { type: "array", items: { type: "object", properties: { icon: { type: "string" }, label: { type: "string" } } } },
            recent_wins_title: { type: "string" },
            recent_wins_subtitle: { type: "string" },
            recent_wins_items: { type: "array", items: { type: "object", properties: { amount: { type: "string" }, name_initials: { type: "string" }, age: { type: "number" }, location: { type: "string" } } } },
            guarantee_title: { type: "string" }, guarantee_eyebrow: { type: "string" },
            guarantee_body_html: { type: "string" },
            guarantee_bullets: { type: "array", items: { type: "string" } },
            testimonials_title: { type: "string" }, testimonials_subtitle: { type: "string" },
            testimonials: { type: "array", items: { type: "object", properties: { quote: { type: "string" }, name: { type: "string" }, time_ago: { type: "string" }, rating: { type: "number" }, initials: { type: "string" } } } },
            faq_title: { type: "string" }, faq_subtitle: { type: "string" },
            faq_items: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
          }
        },
        model: "claude_sonnet_4_6"
      });

      const defaultData = getDefaultMvaData();
      const cmcBrand = brands.find(b => b.brand_name?.toLowerCase().includes("cmc") || b.brand_name?.toLowerCase().includes("check my claim")) || brands[0];
      const created = await base44.entities.LandingPage.create({
        ...defaultData,
        ...result,
        title: `${aiCampaign} - ${aiNiche || "Generated"} Landing Page`,
        slug: aiSlug,
        campaign_type: aiCampaign,
        decision_tree_quiz_id: aiQuizId || defaultData.decision_tree_quiz_id,
        brand_id: cmcBrand?.id || "",
        status: "draft",
        is_default_for_campaign: false,
        is_template: false,
        version: 1,
      });
      onCreated(created.id);
    } finally {
      setAiGenerating(false);
    }
  };

  if (!mode) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold flex items-center gap-2"><Layout className="w-5 h-5 text-[#1e90ff]" /> New Landing Page</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <button onClick={() => { setCreating(true); createFromDefault(); }}
            disabled={creating}
            className="w-full p-4 rounded-xl border border-white/10 hover:border-[#1e90ff] text-left transition-all group disabled:opacity-50">
            <div className="flex items-center gap-3">
              <Copy className="w-5 h-5 text-[#1e90ff]" />
              <div>
                <div className="text-sm font-semibold text-white">Start from Default</div>
                <div className="text-xs text-slate-400 mt-0.5">Clone the seeded MVA Default — all sections populated</div>
              </div>
            </div>
          </button>
          <button onClick={() => setMode("blank")}
            className="w-full p-4 rounded-xl border border-white/10 hover:border-[#1e90ff] text-left transition-all group">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm font-semibold text-white">Start Blank</div>
                <div className="text-xs text-slate-400 mt-0.5">Create a draft with pre-filled defaults, edit everything</div>
              </div>
            </div>
          </button>
          <button onClick={() => setMode("ai")}
            className="w-full p-4 rounded-xl border border-white/10 hover:border-purple-500 text-left transition-all group">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm font-semibold text-white">Generate with AI</div>
                <div className="text-xs text-slate-400 mt-0.5">Claude Sonnet generates copy, benefits, FAQs and testimonials</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "blank") return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">New Blank Landing Page</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Title *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. MVA Spring Campaign" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Slug</label>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-sm">/lp/</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} className={`${inputCls} flex-1`} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)} className={inputCls}>
              {CAMPAIGN_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setMode(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm">Back</button>
          <button onClick={createBlank} disabled={!title || !slug || creating}
            className="flex-1 bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm">
            {creating ? "Creating..." : "Create Draft →"}
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "ai") return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1e35] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Generate with AI</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Campaign Type</label>
            <select value={aiCampaign} onChange={e => setAiCampaign(e.target.value)} className={inputCls}>
              {CAMPAIGN_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Niche / Sub-vertical</label>
            <input value={aiNiche} onChange={e => setAiNiche(e.target.value)} placeholder="e.g. Uber/Lyft accidents, Truck crashes" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Brand Voice</label>
            <select value={aiVoice} onChange={e => setAiVoice(e.target.value)} className={inputCls}>
              {VOICES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Trust Angle</label>
            <select value={aiTrust} onChange={e => setAiTrust(e.target.value)} className={inputCls}>
              {TRUST_ANGLES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Decision Tree to Embed</label>
            <select value={aiQuizId} onChange={e => setAiQuizId(e.target.value)} className={inputCls}>
              <option value="">— Pick a quiz —</option>
              {quizzes.map(q => <option key={q.id} value={q.id}>{q.title} ({q.campaign_type})</option>)}
            </select>
          </div>
        </div>
        {aiGenerating && (
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300">
            Using Claude Sonnet — uses additional credits. Generating copy, benefits, FAQs and testimonials...
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={() => setMode(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm">Back</button>
          <button onClick={generateWithAI} disabled={aiGenerating}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
            {aiGenerating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Page</>}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]";
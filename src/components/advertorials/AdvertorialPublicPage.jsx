import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { buildAdvUrl, captureAdvParams, incrementAdvClicks, incrementAdvViews } from "@/lib/advUrl";
import ReactMarkdown from "react-markdown";
import { Shield, User, Clock, CheckCircle } from "lucide-react";

const QUIZ_BASE = "https://qualify.checkmyclaim.co/s/mva";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/440596289_PrimaryLogo_CheckMyClaim.png";
const PHONE = "(844) 738-1035";
const PHONE_TEL = "+18447381035";
const DISCLAIMER = `checkmyclaim.co is not a law firm or an attorney referral service. This advertisement is not legal advice and is not a guarantee or prediction of the outcome of your legal matter. Every case is different, and the outcome depends on the laws, facts, and circumstances unique to each case. Hiring an attorney is an important decision that should not be based solely on advertising. Request free information about your attorney's background and experience. CA RESIDENTS: Paid attorney advertising on behalf of jointly advertising independent attorneys, including: The Law Offices of Larry H. Parker, San Antonio, CA. A full listing of attorney sponsors can be found at checkmyclaim.co/PartnerList. Check My Claim is a matching service, not a law firm, and does not provide legal services. You can request an attorney by name. This advertising does not imply a higher quality of legal services than that provided by other attorneys, nor does it imply that the attorneys are certified specialists or experts in any area of law. Past results shown in advertisements do not dictate future results.`;

// ---------------------------------------------------------------------------
// Sticky navbar
// ---------------------------------------------------------------------------
function AdvNavbar({ phone, onPhoneClick }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"} border-b border-slate-100`}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/"><img src={LOGO_URL} alt="Check My Claim" className="h-9 w-auto" /></Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-slate-500">Prefer to speak with someone?</span>
          <a
            href={`tel:${phone?.replace(/\D/g, "") || PHONE_TEL}`}
            onClick={onPhoneClick}
            className="flex items-center gap-2 bg-[#1E5BFF] hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full transition-all"
          >
            Check My Claim
          </a>
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Inline CTA bar
// ---------------------------------------------------------------------------
const INLINE_COPY = [
  { headline: "See If You Qualify in 60 Seconds", sub: "Free case review, no obligation, no upfront fees." },
  { headline: "Free Case Review, No Obligation", sub: "Find out what your accident claim could be worth." },
  { headline: "Do Not Wait. Your Window Could Be Closing.", sub: "Every state has a filing deadline. Check yours now." },
];

function InlineMiniCta({ index, url, onClick }) {
  const copy = INLINE_COPY[(index - 1) % 3];
  return (
    <div
      className="my-8 rounded-xl flex flex-col sm:flex-row items-center gap-4 p-5"
      style={{ background: "linear-gradient(135deg, #1E5BFF 0%, #1244D4 100%)" }}
    >
      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
        <Shield className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-white font-bold text-base leading-snug">{copy.headline}</p>
        <p className="text-blue-100 text-sm mt-0.5">{copy.sub}</p>
      </div>
      <a
        href={url}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 bg-white text-[#1E5BFF] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-blue-50 transition-all whitespace-nowrap"
      >
        Check My Claim
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mid-image card
// ---------------------------------------------------------------------------
function MidImageCard({ url }) {
  return (
    <div className="my-8 block md:float-right md:ml-8 md:mb-6 md:w-72 lg:w-80 w-full">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {url && (
          <img src={url} alt="Claim check" className="w-full aspect-video object-cover" />
        )}
        <div className="p-5">
          <p className="text-[#1E5BFF] text-xs font-bold uppercase tracking-widest mb-2">BEFORE YOU SIGN</p>
          <h3 className="text-slate-900 font-bold text-base leading-snug mb-2">
            Get a Claim Estimate in About 60 Seconds
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Our claim checker looks at how cases like yours have settled to give you a realistic sense of what your situation could be worth.
          </p>
          <ul className="space-y-1.5 mb-4">
            {["100% Free, No Credit Card", "No Obligation, Ever", "Private and Secure"].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <a
            href={QUIZ_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#1E5BFF] hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition-all"
          >
            Check My Claim Value Now
          </a>
          <p className="text-center text-xs text-slate-400 mt-2">Used by accident victims nationwide</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pull quote
// ---------------------------------------------------------------------------
function PullQuote({ text }) {
  if (!text) return null;
  return (
    <blockquote className="my-8 border-l-4 border-[#1E5BFF] pl-5 py-2">
      <p className="text-slate-700 text-lg font-medium italic leading-relaxed">{text}</p>
    </blockquote>
  );
}

// ---------------------------------------------------------------------------
// Body renderer -- parses markers from markdown body
// ---------------------------------------------------------------------------
function BodyRenderer({ advertorial, buildUrl, onCtaClick }) {
  const body = advertorial.body_content || "";

  // Split on our markers, keeping them as tokens
  const parts = body.split(/(\[CTA_INLINE_[123]\]|\[MID_IMAGE\])/g);

  return (
    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-headings:leading-tight prose-p:text-slate-700 prose-p:leading-[1.85] prose-p:text-[1.05rem] prose-a:text-[#1E5BFF] prose-strong:text-slate-900 overflow-hidden">
      {parts.map((part, i) => {
        if (part === "[CTA_INLINE_1]") return <InlineMiniCta key={i} index={1} url={buildUrl("link_1")} onClick={onCtaClick} />;
        if (part === "[CTA_INLINE_2]") return <InlineMiniCta key={i} index={2} url={buildUrl("link_2")} onClick={onCtaClick} />;
        if (part === "[CTA_INLINE_3]") return <InlineMiniCta key={i} index={3} url={buildUrl("link_3")} onClick={onCtaClick} />;
        if (part === "[MID_IMAGE]") return <MidImageCard key={i} url={advertorial.secondary_image_url} />;
        if (!part.trim()) return null;
        return (
          <ReactMarkdown key={i}>{part}</ReactMarkdown>
        );
      })}
      <div style={{ clear: "both" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Final CTA panel
// ---------------------------------------------------------------------------
function AdvFinalCta({ finalUrl, onCtaClick }) {
  return (
    <div className="mx-4 my-12 rounded-3xl px-8 py-14 text-center" style={{ background: "radial-gradient(ellipse at 60% 40%, #1B2F6E 0%, #0a1120 100%)" }}>
      <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
        FREE EVALUATION
      </div>
      <h2 className="text-white text-2xl md:text-3xl font-extrabold leading-tight mb-4 max-w-lg mx-auto">
        Find Out What Your Accident Claim Could Be Worth
      </h2>
      <p className="text-slate-300 text-base mb-8">Takes about 60 seconds. No obligation. Confidential.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={finalUrl}
          onClick={onCtaClick}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1E5BFF] hover:bg-blue-600 text-white font-bold text-base px-8 py-3.5 rounded-full transition-all"
        >
          Start My Free Check
        </a>
        <a
          href={finalUrl}
          onClick={onCtaClick}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-3.5 rounded-full transition-all"
        >
          Estimate My Claim Value
        </a>
      </div>
      <p className="text-slate-400 text-sm mt-5">Free Case Review &middot; No Obligation</p>
      <p className="text-slate-500 text-xs mt-2">2026 &copy;checkmyclaim.co | All Rights Reserved</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Minimal legal footer
// ---------------------------------------------------------------------------
function MinimalLegalFooter({ phone, onPhoneClick }) {
  return (
    <footer className="bg-slate-950 text-slate-400 px-6 pt-10 pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <img src={LOGO_URL} alt="Check My Claim" className="h-8 w-auto opacity-70" />
          <div className="flex items-center gap-2 text-sm">
            <span>Prefer to call us?</span>
            <a href={`tel:${(phone || PHONE).replace(/\D/g, "")}`} onClick={onPhoneClick} className="text-[#1E5BFF] font-semibold hover:underline">{phone || PHONE}</a>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>&copy; 2026 checkmyclaim.co</span>
            <Link to="/TermsOfService" className="hover:text-white">Terms</Link>
            <Link to="/PrivacyPolicy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
        <div className="pt-6 space-y-4 text-xs leading-relaxed text-slate-500">
          <p><strong className="text-slate-400">ADVERTORIAL</strong> — This is a paid advertisement. Check My Claim is a matching service, not a law firm.</p>
          <p><strong className="text-slate-400">DISCLAIMER:</strong> {DISCLAIMER}</p>
          <p>We use cookies to personalize content and to analyze our traffic. We also share information about your use of our site with our analytics partners who may combine it with other information you have provided to them or that they have collected from your use of their services.</p>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AdvertorialPublicPage({ slug }) {
  const [advertorial, setAdvertorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    captureAdvParams();
    const urlSlug = slug || window.location.pathname.split("/a/")[1]?.split("?")[0];
    if (!urlSlug) { setNotFound(true); setLoading(false); return; }

    base44.entities.Advertorial.filter({ slug: urlSlug, status: "published" })
      .then(results => {
        if (results.length === 0) { setNotFound(true); setLoading(false); return; }
        const adv = results[0];
        setAdvertorial(adv);
        setLoading(false);
        incrementAdvViews(adv, base44);
        if (adv.tracking_pixel_meta) injectMetaPixel(adv.tracking_pixel_meta);
        if (adv.tracking_pixel_taboola) injectTaboolaPixel(adv.tracking_pixel_taboola);
        document.title = adv.meta_title || `${adv.headline} | Check My Claim`;
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E5BFF] rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h1>
        <Link to="/" className="text-[#1E5BFF] hover:underline">Back to Check My Claim</Link>
      </div>
    </div>
  );

  const phone = advertorial.phone_number || PHONE;

  const buildUrl = (linkId) => buildAdvUrl({
    slug: advertorial.slug,
    adLabel: advertorial.ad_label,
    linkId,
  });

  const handleCtaClick = async () => {
    await incrementAdvClicks(advertorial, base44);
  };

  const finalUrl = buildUrl("link_final");

  return (
    <div className="min-h-screen bg-white">
      <AdvNavbar phone={phone} onPhoneClick={handleCtaClick} />

      {/* Article */}
      <main className="max-w-5xl mx-auto px-4 py-10 lg:px-16">

        {/* Eyebrow */}
        {advertorial.eyebrow && (
          <p className="text-[#1E5BFF] text-xs font-bold uppercase tracking-widest mb-4">
            {advertorial.eyebrow}
          </p>
        )}

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 leading-tight mb-4">
          {advertorial.headline}
        </h1>

        {/* Subheadline */}
        {advertorial.subheadline && (
          <p className="text-xl text-slate-600 leading-relaxed mb-6 font-light">
            {advertorial.subheadline}
          </p>
        )}

        {/* Byline */}
        <div className="flex items-center gap-3 py-4 border-t border-b border-slate-200 mb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <User className="w-4 h-4" />
            <span className="font-semibold text-slate-700">{advertorial.author_name || "Sarah Mitchell, Staff Writer"}</span>
          </div>
          {advertorial.estimated_reading_time && (
            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
              <span className="text-slate-300">|</span>
              <Clock className="w-4 h-4" />
              <span>{advertorial.estimated_reading_time} min read</span>
            </div>
          )}
        </div>

        {/* Hero image */}
        {advertorial.featured_image_url && (
          <div className="mb-8">
            <img
              src={advertorial.featured_image_url}
              alt={advertorial.featured_image_alt || advertorial.headline}
              className="w-full aspect-video object-cover rounded-xl"
            />
            {advertorial.featured_image_caption && (
              <p className="text-xs text-slate-400 mt-2 text-center italic">{advertorial.featured_image_caption}</p>
            )}
          </div>
        )}

        {/* Body */}
        <BodyRenderer advertorial={advertorial} buildUrl={buildUrl} onCtaClick={handleCtaClick} />

        {/* Pull quote */}
        <PullQuote text={advertorial.pull_quote} />
      </main>

      {/* Final CTA */}
      <AdvFinalCta finalUrl={finalUrl} onCtaClick={handleCtaClick} />

      {/* Footer */}
      <MinimalLegalFooter phone={phone} onPhoneClick={handleCtaClick} />
    </div>
  );
}

function injectMetaPixel(pixelId) {
  if (!pixelId || document.getElementById("meta-pixel")) return;
  const s = document.createElement("script");
  s.id = "meta-pixel";
  s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
  document.head.appendChild(s);
}

function injectTaboolaPixel(pixelId) {
  if (!pixelId || document.getElementById("taboola-pixel")) return;
  const s = document.createElement("script");
  s.id = "taboola-pixel";
  s.innerHTML = `window._tfa=window._tfa||[];window._tfa.push({notify:'event',name:'page_view',id:${pixelId}});!function(t,f,a,x){if(!document.getElementById(x)){t.async=1;t.src=a;t.id=x;f.parentNode.insertBefore(t,f);}}(document.createElement('script'),document.getElementsByTagName('script')[0],'//cdn.taboola.com/libtrc/unip/${pixelId}/tfa.js','tb_tfa_script');`;
  document.head.appendChild(s);
}
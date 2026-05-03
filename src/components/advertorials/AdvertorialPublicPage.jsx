import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";

function SoftCTA({ text, ctaUrl, slug }) {
  if (!text) return null;
  return (
    <div className="my-8 px-6 py-5 bg-blue-50 border-l-4 border-[#2BB6F6] rounded-r-lg">
      <p className="text-base italic text-slate-700 leading-relaxed">
        {text}{" "}
        <a
          href={`${ctaUrl}?utm_source=advertorial&utm_medium=advertorial&utm_campaign=${slug}`}
          className="text-[#1a6fc4] font-semibold not-italic underline hover:text-blue-800"
          target="_blank" rel="noopener noreferrer"
        >
          Run the free 30-second check here →
        </a>
      </p>
    </div>
  );
}

function PrimaryCTA({ advertorial }) {
  const url = `${advertorial.primary_cta_url}?utm_source=advertorial&utm_medium=advertorial&utm_campaign=${advertorial.slug}`;
  const handleClick = async () => {
    try {
      await base44.entities.Advertorial.update(advertorial.id, {
        conversion_count: (advertorial.conversion_count || 0) + 1
      });
    } catch {}
    window.open(url, "_blank");
  };

  return (
    <div className="bg-[#0a1628] text-white py-12 px-6 text-center mt-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          {["50,000+ Wins", "$50M+ Recovered", "100% Free"].map(badge => (
            <div key={badge} className="bg-[#1e3a5f] px-4 py-2 rounded-full text-sm font-bold text-[#2BB6F6]">
              ✓ {badge}
            </div>
          ))}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          Ready to Find Out What Your Case Is Worth?
        </h2>
        <p className="text-slate-300 mb-6 text-base">
          It takes 30 seconds. No obligation. No law firm pressure. Just answers.
        </p>
        <button
          onClick={handleClick}
          className="inline-block bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          {advertorial.primary_cta_text || "Start Your Free 30-Second Claim Check"} →
        </button>
        <p className="text-xs text-slate-500 mt-4">No win, no fee. No upfront costs. Free consultation.</p>
      </div>
    </div>
  );
}

export default function AdvertorialPublicPage({ slug }) {
  const [advertorial, setAdvertorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const urlSlug = slug || window.location.pathname.split("/advertorial/")[1]?.split("?")[0];
    if (!urlSlug) { setNotFound(true); setLoading(false); return; }

    base44.entities.Advertorial.filter({ slug: urlSlug, status: "published" })
      .then(results => {
        if (results.length === 0) { setNotFound(true); setLoading(false); return; }
        const adv = results[0];
        setAdvertorial(adv);
        setLoading(false);
        // Increment view count
        base44.entities.Advertorial.update(adv.id, { view_count: (adv.view_count || 0) + 1 }).catch(() => {});
        // Inject pixels
        if (adv.tracking_pixel_meta) injectMetaPixel(adv.tracking_pixel_meta);
        if (adv.tracking_pixel_taboola) injectTaboolaPixel(adv.tracking_pixel_taboola);
        // SEO
        if (adv.meta_title) document.title = adv.meta_title;
        else document.title = `${adv.headline} | Check My Claim`;
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#2BB6F6] rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center"><h1 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h1>
        <Link to="/" className="text-[#2BB6F6] hover:underline">← Back to Check My Claim</Link>
      </div>
    </div>
  );

  const ctaUrl = advertorial.primary_cta_url || "https://qualify.checkmyclaim.co/s/mva";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#0a1628] border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/"><img src={LOGO_URL} alt="Check My Claim" className="h-8 w-auto" /></Link>
          <a
            href={`${ctaUrl}?utm_source=advertorial&utm_medium=advertorial&utm_campaign=${advertorial.slug}`}
            className="bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
            target="_blank" rel="noopener noreferrer"
          >
            Free Claim Check →
          </a>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2">
        <p className="max-w-4xl mx-auto text-xs text-slate-500 text-center">
          <strong>ADVERTORIAL</strong> — This is a paid advertisement. checkmyclaim.co is not a law firm or an attorney referral service. Past results do not guarantee future outcomes.
        </p>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Category tag */}
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2BB6F6] bg-blue-50 px-3 py-1 rounded-full">
            {advertorial.category}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(advertorial.author_name || "C")[0]}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">{advertorial.author_name || "Check My Claim Editorial Team"}</div>
            <div className="text-xs text-slate-500">
              {advertorial.author_role || "Consumer Advocacy Desk"}
              {advertorial.published_date && <> · {new Date(advertorial.published_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>}
              {advertorial.estimated_reading_time && <> · {advertorial.estimated_reading_time} min read</>}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {advertorial.featured_image_url && (
          <div className="mb-8 -mx-4 md:mx-0">
            <img
              src={advertorial.featured_image_url}
              alt={advertorial.featured_image_alt || advertorial.headline}
              className="w-full max-h-[480px] object-cover rounded-lg"
            />
          </div>
        )}

        {/* Body with soft CTAs interspersed */}
        <BodyWithCTAs advertorial={advertorial} ctaUrl={ctaUrl} />
      </article>

      {/* Primary CTA Section */}
      <PrimaryCTA advertorial={advertorial} />

      {/* Footer Disclaimer */}
      <footer className="bg-[#0a1628] text-slate-400 px-6 py-10 text-xs leading-relaxed">
        <div className="max-w-4xl mx-auto space-y-4">
          <p>
            <strong className="text-slate-300">DISCLAIMER:</strong> checkmyclaim.co is not a law firm or an attorney referral service. This advertisement is not legal advice and is not a guarantee or prediction of the outcome of your legal matter. Every case is different, and the outcome depends on the laws, facts, and circumstances unique to each case. Hiring an attorney is an important decision that should not be based solely on advertising. Request free information about your attorney's background and experience. <strong>CA RESIDENTS:</strong> Paid attorney advertising on behalf of jointly advertising independent attorneys, including: The Law Offices of Larry H. Parker, San Antonio, CA. A full listing of attorney sponsors can be found <a href="https://checkmyclaim.co/PartnerList" className="text-[#2BB6F6] underline">here</a>. Check My Claim is not a law firm and does not provide legal services. You can request an attorney by name. This advertising does not imply a higher quality of legal services than that provided by other attorneys, nor does it imply that the attorneys are certified specialists or experts in any area of law. Please note that past results showcased in advertisements do not dictate future results. If you live in AL, FL, MO, NY, or WY, <a href="https://checkmyclaim.co/disclosures/" className="text-[#2BB6F6] underline">Click here</a> to see additional information about attorney advertising in your state.
          </p>
          <p>
            We use cookies to personalize content and to analyze our traffic. We also share information about your use of our site with our analytics partners who may combine it with other information that you've provided to them or that they've collected from your use of their services. You consent to our cookies if you continue to use our website. <a href="https://dsar.cptn.co/dsar/0ca83d86-1ffc-4e4e-afad-2edb0fd5440b" className="text-[#2BB6F6] underline">Request access to your data</a>.
          </p>
          <p className="text-slate-500">© 2026 Check My Claim. All rights reserved. | checkmyclaim.co</p>
        </div>
      </footer>

      {/* Sticky CTA */}
      <StickyBar advertorial={advertorial} ctaUrl={ctaUrl} />
    </div>
  );
}

function BodyWithCTAs({ advertorial, ctaUrl }) {
  const body = advertorial.body_content || "";
  const paragraphs = body.split(/\n\n+/);
  const total = paragraphs.length;
  const cta1At = Math.floor(total * 0.33);
  const cta2At = Math.floor(total * 0.66);
  const cta3At = Math.floor(total * 0.88);

  return (
    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-p:text-slate-800 prose-p:leading-[1.85] prose-p:text-[1.05rem] prose-a:text-[#1a6fc4]">
      {paragraphs.map((para, i) => (
        <React.Fragment key={i}>
          <div dangerouslySetInnerHTML={{ __html: para }} />
          {i === cta1At && <SoftCTA text={advertorial.soft_cta_text_1} ctaUrl={ctaUrl} slug={advertorial.slug} />}
          {i === cta2At && <SoftCTA text={advertorial.soft_cta_text_2} ctaUrl={ctaUrl} slug={advertorial.slug} />}
          {i === cta3At && <SoftCTA text={advertorial.soft_cta_text_3} ctaUrl={ctaUrl} slug={advertorial.slug} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function StickyBar({ advertorial, ctaUrl }) {
  const [visible, setVisible] = useState(false);
  const url = `${ctaUrl}?utm_source=advertorial&utm_medium=advertorial&utm_campaign=${advertorial.slug}`;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <>
      {/* Desktop pill */}
      <a
        href={url} target="_blank" rel="noopener noreferrer"
        className="hidden md:block fixed bottom-6 right-6 bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white font-bold px-6 py-3 rounded-full shadow-xl transition-all z-50 text-sm"
      >
        Free Claim Check ›
      </a>
      {/* Mobile bar */}
      <a
        href={url} target="_blank" rel="noopener noreferrer"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2BB6F6] hover:bg-[#1a9fd8] text-white font-bold py-4 text-center z-50 text-base shadow-2xl"
      >
        Start Your Free Claim Check →
      </a>
    </>
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
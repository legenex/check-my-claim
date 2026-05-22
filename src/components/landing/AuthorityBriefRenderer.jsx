import React, { useEffect } from "react";
import { Phone, CheckCircle, Scale, Clock, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";
import QuizRuntimeEmbedded from "@/components/landingpages/EmbeddedQuiz";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";

export default function AuthorityBriefRenderer({ landingPage, template, brand, quizTheme, quiz, isPreview }) {
  useEffect(() => {
    captureIncomingParams();
    // Inject pixels
    const pixels = landingPage.global_pixels || {};
    if (pixels.meta_pixel_id) injectMetaPixel(pixels.meta_pixel_id);
    if (pixels.taboola_pixel_id) injectTaboolaPixel(pixels.taboola_pixel_id);
    if (pixels.google_analytics_id) injectGA(pixels.google_analytics_id);
    // Increment view count (once per session)
    const viewKey = `cmc_lp_viewed_${landingPage.slug}`;
    if (!isPreview && !sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "1");
      base44.entities.LandingPage.update(landingPage.id, {
        view_count: (landingPage.view_count || 0) + 1,
        unique_visitors: (landingPage.unique_visitors || 0) + 1,
      }).catch(() => {});
    }
  }, [landingPage]);

  const onQuizStart = () => {
    if (!landingPage || isPreview) return;
    const key = `cmc_lp_started_${landingPage.slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      base44.entities.LandingPage.update(landingPage.id, {
        total_quiz_starts: (landingPage.total_quiz_starts || 0) + 1,
      }).catch(() => {});
    }
  };
  const sectionOrder = landingPage.section_order_override?.length ? landingPage.section_order_override : (template?.section_order || []);

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "sticky_header": return <Header landingPage={landingPage} brand={brand} />;
      case "hero": return <Hero key="hero" landingPage={landingPage} quizTheme={quizTheme} quiz={quiz} isPreview={isPreview} onQuizStart={onQuizStart} />;
      case "phone_cta_banner": return <PhoneCTABanner landingPage={landingPage} />;
      case "trust_pillars": return <TrustPillars landingPage={landingPage} />;
      case "benefits": return <Benefits landingPage={landingPage} />;
      case "recent_wins": return <RecentWins landingPage={landingPage} />;
      case "guarantee": return <Guarantee landingPage={landingPage} />;
      case "testimonials": return <Testimonials landingPage={landingPage} />;
      case "faq": return <FAQ landingPage={landingPage} />;
      case "footer_disclaimer": return <FooterDisclaimer landingPage={landingPage} />;
      default: return null;
    }
  };

  return (
    <div className="cmc-auth-root min-h-screen bg-[#f7f3ea] text-[#1a1d24] relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=IBM+Plex+Serif:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        .cmc-auth-root { font-family: 'IBM Plex Serif', serif; }
        .cmc-auth-root .font-display { font-family: 'Fraunces', serif; }
        .cmc-auth-root .font-mono { font-family: 'JetBrains Mono', monospace; }
        .cmc-auth-root .hairline-gold { border-bottom: 1px solid #d8cfb8; }
        .cmc-auth-root .hairline-gold-deep { border-bottom: 1.5px solid #8b6914; }
        .cmc-auth-root .gold-deep { color: #8b6914; }
        .cmc-auth-root .ink-muted { color: rgba(26,29,36,0.6); }
        .cmc-auth-root .paper-soft { background: #fbf7ef; }
      `}</style>
      {sectionOrder.map(renderSection)}
      <ClaimBotWidget pageType="landing_page" />
    </div>
  );
}

function Header({ landingPage, brand }) {
  return (
    <header className="sticky top-0 z-50 h-[56px] bg-[#f7f3ea] border-b border-[#8b6914] flex items-center justify-between px-6">
      <div className="flex items-center gap-1">
        <span className="font-display text-[22px] font-semibold tracking-tight text-[#1a1d24]">CheckMyClaim</span>
        <span className="font-mono text-[14px] text-[#1a1d24]">.co</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#1a1d24]">Case Desk</span>
        <a href={`tel:${brand?.phone_number || "(844) 840-6905"}`} className="font-display text-[18px] font-medium text-[#8b6914] underline decoration-[1.5px] decoration-[#8b6914]">
          {brand?.phone_number || "(844) 840-6905"}
        </a>
      </div>
    </header>
  );
}

function Hero({ landingPage, quizTheme, quiz, isPreview, onQuizStart }) {
  return (
    <section className="px-6 py-12 md:py-16 max-w-[1400px] mx-auto">
      <div className="grid md:grid-cols-5 gap-8 md:gap-12">
        <div className="md:col-span-3 space-y-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#1a1d24]">
            Filed · {landingPage.hero_eyebrow || "Case Review"} · <span className="text-red-700">Statute clock running</span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,64px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#1a1d24]">
            {landingPage.hero_headline || "Were You Injured in a Car Accident?"}
          </h1>
          <p className="font-serif text-[17px] leading-[1.55] text-[#1a1d24] max-w-[580px]">
            {landingPage.hero_subheadline || "Our network attorneys have recovered over $50M for accident victims. No fee unless you win."}
          </p>
          {landingPage.benefits_items?.length > 0 && (
            <div className="pt-4">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1a1d24] mb-3">Key Facts</h3>
              {landingPage.benefits_items.slice(0, 4).map((item, i) => (
                <div key={i} className="flex gap-3 items-start py-2 border-b border-[#d8cfb8]">
                  <span className="font-mono text-[14px] text-[#8b6914] font-medium">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif text-[16px] text-[#1a1d24] flex-1">{item.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="font-mono text-[11px] text-[#1a1d24] pt-2">
            Available Nationwide · No Fee Unless You Win · Case Review Is Free · Bar-Verified Network
          </div>
        </div>
        <div className="md:col-span-2">
          <QuizRuntimeEmbedded quizId={quiz?.id} themeId={quizTheme?.id} isPreview={isPreview} onFirstInteraction={() => onQuizStart()} />
        </div>
      </div>
    </section>
  );
}

function PhoneCTABanner({ landingPage }) {
  if (!landingPage.show_hero_phone_cta) return null;
  return (
    <section className="bg-[#fbf7ef] border-y border-[#d8cfb8] py-8 px-6">
      <div className="max-w-[900px] mx-auto text-center">
        <p className="font-serif text-[17px] text-[#1a1d24] mb-2">Prefer to speak directly? Call our case desk:</p>
        <a href="tel:(844) 840-6905" className="font-display text-[22px] font-medium text-[#8b6914] hover:underline decoration-[1.5px] decoration-[#8b6914]">
          (844) 840-6905
        </a>
      </div>
    </section>
  );
}

function TrustPillars({ landingPage }) {
  return (
    <section className="px-6 py-12 max-w-[1200px] mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { value: landingPage.trust_stat_1_value || "$50M+", label: landingPage.trust_stat_1_label || "Recovered" },
          { value: landingPage.trust_stat_2_value || "50,000+", label: landingPage.trust_stat_2_label || "Total Client Wins" },
          { value: landingPage.trust_stat_3_value || "100%", label: landingPage.trust_stat_3_label || "Free" },
        ].map((stat, i) => (
          <div key={i} className="text-center md:text-left">
            <div className="font-display text-[40px] font-medium text-[#8b6914]">{stat.value}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1a1d24] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits({ landingPage }) {
  if (!landingPage.benefits_section_title) return null;
  return (
    <section className="px-6 py-16 max-w-[1200px] mx-auto">
      <h2 className="font-display text-[36px] font-medium text-[#1a1d24] text-center mb-3">
        {landingPage.benefits_section_title || "Why Work With Our Network"}
      </h2>
      {landingPage.benefits_section_subtitle && (
        <p className="font-serif text-[18px] text-[#1a1d24] text-center max-w-[600px] mx-auto mb-10">
          {landingPage.benefits_section_subtitle}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {(landingPage.benefits_items || []).map((item, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="font-mono text-[24px] text-[#8b6914]">{item.icon || "✦"}</div>
            <div>
              <div className="font-serif text-[17px] text-[#1a1d24] leading-[1.5]">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentWins({ landingPage }) {
  if (!landingPage.recent_wins_items?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[1200px] mx-auto">
      <h2 className="font-display text-[32px] font-medium text-[#1a1d24] mb-8">
        {landingPage.recent_wins_title || "Partial Record of Recent Recoveries"}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-[1.5px] border-[#8b6914]">
              <th className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1a1d24] text-left py-3 pr-4">Recovery</th>
              <th className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1a1d24] text-left py-3 pr-4">Claimant</th>
              <th className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1a1d24] text-left py-3 pr-4">Case Type</th>
              <th className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1a1d24] text-right py-3">State</th>
            </tr>
          </thead>
          <tbody>
            {landingPage.recent_wins_items.map((win, i) => (
              <tr key={i} className="border-b border-[#f0ebe0]">
                <td className="font-display text-[22px] font-medium text-[#1a1d24] py-4 pr-4">{win.amount}</td>
                <td className="font-serif italic text-[16px] text-[#1a1d24] py-4 pr-4">{win.name_initials}</td>
                <td className="font-serif text-[15px] text-[#1a1d24] py-4 pr-4">{win.location}</td>
                <td className="font-mono text-[12px] uppercase text-[#1a1d24] py-4 text-right">{win.age || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-mono text-[11px] text-[#1a1d24] mt-4">Outcomes vary based on individual circumstances. Past results do not guarantee future outcomes.</p>
    </section>
  );
}

function Guarantee({ landingPage }) {
  if (!landingPage.guarantee_title && !landingPage.guarantee_body_html) return null;
  return (
    <section className="px-6 py-16 bg-[#fbf7ef]">
      <div className="max-w-[800px] mx-auto">
        {landingPage.guarantee_eyebrow && (
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8b6914] mb-3">{landingPage.guarantee_eyebrow}</div>
        )}
        <h2 className="font-display text-[36px] font-medium text-[#1a1d24] mb-6">{landingPage.guarantee_title || "Our Guarantee to You"}</h2>
        {landingPage.guarantee_body_html && (
          <div 
            className="font-serif text-[17px] leading-[1.7] text-[#1a1d24] mb-8 first-letter:font-display first-letter:text-[64px] first-letter:text-[#8b6914] first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8]"
            dangerouslySetInnerHTML={{ __html: landingPage.guarantee_body_html }} 
          />
        )}
        {landingPage.guarantee_bullets?.length > 0 && (
          <div className="space-y-3">
            {landingPage.guarantee_bullets.map((bullet, i) => (
              <div key={i} className="flex gap-3 items-start py-2 border-b border-[#d8cfb8]">
                <span className="font-mono text-[14px] text-[#8b6914] font-medium">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-serif text-[16px] text-[#1a1d24] flex-1">{bullet}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Testimonials({ landingPage }) {
  if (!landingPage.testimonials?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[1200px] mx-auto">
      <h2 className="font-display text-[32px] font-medium text-[#1a1d24] text-center mb-3">
        {landingPage.testimonials_title || "Case File Notes"}
      </h2>
      {landingPage.testimonials_subtitle && (
        <p className="font-serif text-[18px] text-[#1a1d24] text-center mb-10">{landingPage.testimonials_subtitle}</p>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        {landingPage.testimonials.map((t, i) => (
          <div key={i} className="border border-[#d8cfb8] p-6 bg-white">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1a1d24] mb-3">Case file note</div>
            <div className="font-display italic text-[19px] text-[#1a1d24] leading-[1.5] mb-4">"{t.quote}"</div>
            <div className="border-t border-[#d8cfb8] pt-3">
              <span className="font-mono text-[11px] uppercase text-[#1a1d24]">{t.initials || t.name} · {t.time_ago}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ({ landingPage }) {
  if (!landingPage.faq_items?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[900px] mx-auto">
      <h2 className="font-display text-[32px] font-medium text-[#1a1d24] mb-3">
        {landingPage.faq_title || "Frequently Asked Questions"}
      </h2>
      {landingPage.faq_subtitle && (
        <p className="font-serif text-[18px] text-[#1a1d24] mb-8">{landingPage.faq_subtitle}</p>
      )}
      <div className="space-y-4">
        {landingPage.faq_items.map((item, i) => (
          <div key={i} className="border-b border-[#d8cfb8] pb-4">
            <h3 className="font-display text-[19px] font-medium text-[#1a1d24] mb-2">{item.question}</h3>
            <p className="font-serif text-[16px] leading-[1.65] text-[#1a1d24]">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterDisclaimer({ landingPage }) {
  if (!landingPage.show_footer_disclaimer) return null;
  return (
    <footer className="bg-[#f7f3ea] border-t-[1px] border-[#8b6914] px-6 py-10">
      <div 
        className="max-w-[1000px] mx-auto font-serif text-[12px] leading-[1.7] text-[#1a1d24] opacity-70"
        dangerouslySetInnerHTML={{ __html: landingPage.footer_disclaimer_html || "" }} 
      />
    </footer>
  );
}

function injectMetaPixel(pixelId) {
  if (!pixelId || document.getElementById("meta-pixel-lp")) return;
  const s = document.createElement("script");
  s.id = "meta-pixel-lp";
  s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
  document.head.appendChild(s);
}
function injectTaboolaPixel(pixelId) {
  if (!pixelId || document.getElementById("taboola-pixel-lp")) return;
  const s = document.createElement("script");
  s.id = "taboola-pixel-lp";
  s.innerHTML = `window._tfa=window._tfa||[];window._tfa.push({notify:'event',name:'page_view',id:${pixelId}});!function(t,f,a,x){if(!document.getElementById(x)){t.async=1;t.src=a;t.id=x;f.parentNode.insertBefore(t,f);}}(document.createElement('script'),document.getElementsByTagName('script')[0],'//cdn.taboola.com/libtrc/unip/${pixelId}/tfa.js','tb_tfa_script');`;
  document.head.appendChild(s);
}
function injectGA(gaId) {
  if (!gaId || document.getElementById("ga-lp")) return;
  const s = document.createElement("script");
  s.id = "ga-lp";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);
  const s2 = document.createElement("script");
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
  document.head.appendChild(s2);
}
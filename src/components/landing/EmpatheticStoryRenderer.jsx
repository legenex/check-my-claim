import React, { useEffect } from "react";
import { Phone, Heart, Users, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";
import QuizRuntimeEmbedded from "@/components/landingpages/EmbeddedQuiz";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";

export default function EmpatheticStoryRenderer({ landingPage, template, brand, quizTheme, quiz, isPreview }) {
  useEffect(() => {
    captureIncomingParams();
    const pixels = landingPage.global_pixels || {};
    if (pixels.meta_pixel_id) injectMetaPixel(pixels.meta_pixel_id);
    if (pixels.taboola_pixel_id) injectTaboolaPixel(pixels.taboola_pixel_id);
    if (pixels.google_analytics_id) injectGA(pixels.google_analytics_id);
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
      base44.entities.LandingPage.update(landingPage.id, { total_quiz_starts: (landingPage.total_quiz_starts || 0) + 1 }).catch(() => {});
    }
  };
  const sectionOrder = landingPage.section_order_override?.length ? landingPage.section_order_override : (template?.section_order || []);

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "sticky_header": return <Header landingPage={landingPage} brand={brand} />;
      case "hero": return <Hero landingPage={landingPage} quizTheme={quizTheme} quiz={quiz} isPreview={isPreview} />;
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
    <div className="cmc-emp-root min-h-screen bg-[#f5ede0] text-[#2a2d35] relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        .cmc-emp-root { font-family: 'Fraunces', serif; }
        .cmc-emp-root .font-ui { font-family: 'Inter', sans-serif; }
        .cmc-emp-root .sage { color: #7a9b6e; }
        .cmc-emp-root .sage-deep { color: #5a7a4e; }
        .cmc-emp-root .navy-deep { color: #1a2740; }
        .cmc-emp-root .cream-warm { color: #fbf3e4; }
        .cmc-emp-root .ink-soft { color: rgba(42,45,53,0.7); }
        .cmc-emp-root .cream-deep { border-color: #e8dcc8; }
      `}</style>
      {sectionOrder.map(renderSection)}
      <ClaimBotWidget pageType="landing_page" />
    </div>
  );
}

function Header({ landingPage, brand }) {
  return (
    <header className="sticky top-0 z-50 h-[72px] bg-[#1a2740]/90 backdrop-blur-[12px] flex items-center justify-between px-6">
      <div className="flex items-center gap-1">
        <span className="font-display text-[24px] font-semibold text-[#fbf3e4]">Check My</span>
        <span className="font-display italic text-[24px] font-medium text-[#7a9b6e]">Claim</span>
      </div>
      <div className="text-right">
        <div className="font-ui text-[11px] uppercase tracking-[0.14em] text-[#7a9b6e]">Confidential Intake</div>
        <a href={`tel:${brand?.phone_number || "(844) 840-6905"}`} className="font-display text-[19px] text-[#fbf3e4] hover:opacity-80">
          {brand?.phone_number || "(844) 840-6905"}
        </a>
      </div>
    </header>
  );
}

function Hero({ landingPage, quizTheme, quiz, isPreview }) {
  return (
    <section className="relative">
      <div className="bg-gradient-to-b from-[#1a2740] via-[#1a2740] to-[#f5ede0] pt-16 pb-24">
        <div className="max-w-[760px] mx-auto px-6 text-center space-y-6">
          {landingPage.hero_eyebrow && (
            <div className="font-ui text-[12px] uppercase tracking-[0.16em] text-[#7a9b6e]">{landingPage.hero_eyebrow}</div>
          )}
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-medium leading-[1.05] tracking-[-0.02em] text-[#fbf3e4]">
            {(landingPage.hero_headline || "").split('\n').map((line, i, arr) => (
              <span key={i} className={arr.length > 1 && i === 1 ? "italic" : ""}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
          {landingPage.hero_subheadline && (
            <p className="font-display italic text-[22px] text-[#fbf3e4]/90 leading-[1.5] max-w-[640px] mx-auto">
              {landingPage.hero_subheadline}
            </p>
          )}
          {landingPage.hero_subheadline_helper && (
            <p className="font-display text-[18px] text-[#fbf3e4] leading-[1.6]">
              {landingPage.hero_subheadline_helper}
            </p>
          )}
        </div>
      </div>
      <svg className="w-full h-[80px] -mt-1" viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path d="M0,40 C300,60 600,20 1200,40 L1200,80 L0,80 Z" fill="#f5ede0" />
      </svg>
      <div className="bg-[#f5ede0] px-6 pb-16 -mt-8">
        <div className="max-w-[700px] mx-auto">
          <QuizRuntimeEmbedded quizId={quiz?.id} themeId={quizTheme?.id} isPreview={isPreview} onFirstInteraction={() => onQuizStart()} />
        </div>
      </div>
    </section>
  );
}

function PhoneCTABanner({ landingPage }) {
  if (!landingPage.show_hero_phone_cta) return null;
  return (
    <section className="bg-[#f5ede0] px-6 py-10">
      <div className="max-w-[700px] mx-auto text-center">
        <p className="font-display text-[17px] text-[#2a2d35] mb-2">If you'd rather talk to someone now, you can:</p>
        <a href="tel:(844) 840-6905" className="font-display text-[32px] font-medium text-[#5a7a4e] hover:underline decoration-[2px] decoration-[#7a9b6e]">
          (844) 840-6905
        </a>
      </div>
    </section>
  );
}

function TrustPillars({ landingPage }) {
  return (
    <section className="px-6 py-16 max-w-[1200px] mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { value: landingPage.trust_stat_1_value || "$50M+", label: landingPage.trust_stat_1_label || "Recovered" },
          { value: landingPage.trust_stat_2_value || "50,000+", label: landingPage.trust_stat_2_label || "Total Client Wins" },
          { value: landingPage.trust_stat_3_value || "100%", label: landingPage.trust_stat_3_label || "Free" },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="font-display text-[56px] font-medium text-[#5a7a4e]">{stat.value}</div>
            <div className="font-display italic text-[17px] text-[#2a2d35]/70 mt-1">{stat.label}</div>
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
      <h2 className="font-display text-[36px] text-[#2a2d35] text-center mb-3">
        {landingPage.benefits_section_title || "Why People Trust Us"}
      </h2>
      {landingPage.benefits_section_subtitle && (
        <p className="font-display italic text-[19px] text-[#2a2d35]/70 text-center mb-10">
          {landingPage.benefits_section_subtitle}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {(landingPage.benefits_items || []).map((item, i) => (
          <div key={i} className="bg-[#fbf3e4] rounded-[20px] p-8 border border-[#7a9b6e]/30">
            <div className="text-[#7a9b6e] mb-3">{item.icon || <Heart className="w-6 h-6" />}</div>
            <div className="font-display text-[19px] leading-[1.5] text-[#2a2d35]">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentWins({ landingPage }) {
  if (!landingPage.recent_wins_items?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[1000px] mx-auto">
      <h2 className="font-display text-[32px] text-[#2a2d35] text-center mb-3">
        {landingPage.recent_wins_title || "Stories from Claimants"}
      </h2>
      {landingPage.recent_wins_subtitle && (
        <p className="font-display italic text-[18px] text-[#2a2d35]/70 text-center mb-10">
          {landingPage.recent_wins_subtitle}
        </p>
      )}
      <div className="space-y-6">
        {landingPage.recent_wins_items.map((win, i) => (
          <div key={i} className="bg-[#fbf3e4] rounded-[20px] p-6 border border-[#7a9b6e]/30">
            <div className="font-display text-[32px] font-medium text-[#5a7a4e] mb-2">{win.amount}</div>
            <div className="font-display italic text-[18px] text-[#2a2d35] mb-3">{win.name_initials}</div>
            <div className="border-t border-[#7a9b6e]/30 pt-3">
              <p className="font-display text-[16px] leading-[1.5] text-[#2a2d35]/70">{win.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Guarantee({ landingPage }) {
  if (!landingPage.guarantee_title && !landingPage.guarantee_body_html) return null;
  return (
    <section className="px-6 py-16 bg-[#fbf3e4]">
      <div className="max-w-[680px] mx-auto text-center">
        {landingPage.guarantee_eyebrow && (
          <div className="font-ui text-[11px] uppercase tracking-[0.14em] text-[#7a9b6e] mb-3">{landingPage.guarantee_eyebrow}</div>
        )}
        <h2 className="font-display text-[36px] text-[#5a7a4e] mb-6">
          {landingPage.guarantee_title || "You don't owe anyone anything to start a conversation"}
        </h2>
        {landingPage.guarantee_body_html && (
          <div 
            className="font-display text-[19px] leading-[1.7] text-[#2a2d35] mb-8"
            dangerouslySetInnerHTML={{ __html: landingPage.guarantee_body_html }} 
          />
        )}
        {landingPage.guarantee_bullets?.length > 0 && (
          <ul className="space-y-3 max-w-[600px] mx-auto">
            {landingPage.guarantee_bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-[6px] h-[6px] rounded-full bg-[#7a9b6e] mt-2 flex-shrink-0" />
                <span className="font-display text-[17px] leading-[1.5] text-[#2a2d35]">{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Testimonials({ landingPage }) {
  if (!landingPage.testimonials?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[1100px] mx-auto">
      <h2 className="font-display text-[32px] text-[#2a2d35] text-center mb-3">
        {landingPage.testimonials_title || "What People Share"}
      </h2>
      {landingPage.testimonials_subtitle && (
        <p className="font-display italic text-[18px] text-[#2a2d35]/70 text-center mb-10">
          {landingPage.testimonials_subtitle}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {landingPage.testimonials.map((t, i) => (
          <div key={i} className="bg-[#fbf3e4] rounded-[20px] p-8 border border-[#7a9b6e]/30">
            <span className="font-display text-[72px] italic text-[#7a9b6e] leading-none">"</span>
            <p className="font-display italic text-[21px] leading-[1.5] text-[#2a2d35] -mt-4 mb-4">{t.quote}</p>
            <div className="border-t border-[#7a9b6e]/30 pt-4 flex items-center gap-2">
              <span className="font-display text-[16px] font-medium text-[#2a2d35]">{t.name}</span>
              <span className="font-ui text-[12px] uppercase tracking-[0.12em] text-[#2a2d35]/50">{t.time_ago}</span>
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
    <section className="px-6 py-16 max-w-[720px] mx-auto">
      <h2 className="font-display text-[32px] text-[#2a2d35] text-center mb-3">
        {landingPage.faq_title || "Questions, Answered"}
      </h2>
      {landingPage.faq_subtitle && (
        <p className="font-display italic text-[18px] text-[#2a2d35]/70 text-center mb-10">
          {landingPage.faq_subtitle}
        </p>
      )}
      <div className="space-y-6">
        {landingPage.faq_items.map((item, i) => (
          <div key={i} className="border-b border-[#e8dcc8] pb-6">
            <h3 className="font-display text-[22px] font-medium text-[#2a2d35] mb-3">{item.question}</h3>
            <p className="font-display text-[18px] leading-[1.7] text-[#2a2d35]/70">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterDisclaimer({ landingPage }) {
  if (!landingPage.show_footer_disclaimer) return null;
  return (
    <footer className="bg-[#1a2740] px-6 py-12">
      <div className="max-w-[900px] mx-auto text-center">
        <div className="font-display text-[20px] text-[#fbf3e4] mb-6">Check My Claim</div>
        <div 
          className="font-ui text-[12px] leading-[1.6] text-[#fbf3e4]/70"
          dangerouslySetInnerHTML={{ __html: landingPage.footer_disclaimer_html || "" }} 
        />
      </div>
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
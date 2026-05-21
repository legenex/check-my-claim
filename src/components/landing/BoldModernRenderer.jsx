import React, { useEffect, useRef, useState } from "react";
import { Phone, Star, ChevronDown, ChevronUp, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";
import QuizRuntimeEmbedded from "@/components/landingpages/EmbeddedQuiz";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";

export default function BoldModernRenderer({ landingPage, template, brand, quizTheme, quiz, isPreview }) {
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
  const [animatedWins, setAnimatedWins] = useState({});
  const winsRef = useRef({});

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "sticky_header": return <Header landingPage={landingPage} brand={brand} />;
      case "hero": return <Hero landingPage={landingPage} quizTheme={quizTheme} quiz={quiz} isPreview={isPreview} />;
      case "phone_cta_banner": return <PhoneCTABanner landingPage={landingPage} />;
      case "trust_pillars": return <TrustPillars landingPage={landingPage} />;
      case "benefits": return <Benefits landingPage={landingPage} />;
      case "recent_wins": return <RecentWins landingPage={landingPage} animatedWins={animatedWins} setAnimatedWins={setAnimatedWins} winsRef={winsRef} />;
      case "guarantee": return <Guarantee landingPage={landingPage} />;
      case "testimonials": return <Testimonials landingPage={landingPage} />;
      case "faq": return <FAQ landingPage={landingPage} />;
      case "footer_disclaimer": return <FooterDisclaimer landingPage={landingPage} />;
      default: return null;
    }
  };

  return (
    <div className="cmc-bold-root min-h-screen bg-[#0a0e27] text-white relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .cmc-bold-root { font-family: 'Inter', sans-serif; }
        .cmc-bold-root .font-mono { font-family: 'JetBrains Mono', monospace; }
        .cmc-bold-root .gradient-text {
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cmc-bold-root .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .cmc-bold-root .glass-hover:hover {
          background: rgba(255,255,255,0.07);
        }
        .cmc-bold-root .text-soft { color: rgba(255,255,255,0.7); }
        .cmc-bold-root .text-muted { color: rgba(255,255,255,0.5); }
        .cmc-bold-root .white-10 { border-color: rgba(255,255,255,0.10); }
        .cmc-bold-root .indigo-glow { box-shadow: 0 0 20px rgba(99,102,241,0.4); }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .cmc-bold-root .orb-animation { animation: orb-drift 30s ease-in-out infinite; }
      `}</style>
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#6366f1]/20 rounded-full blur-[120px] orb-animation" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#06b6d4]/20 rounded-full blur-[120px] orb-animation" style={{ animationDelay: '-15s' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>
      <div className="relative z-10">
        {sectionOrder.map(renderSection)}
      </div>
      <ClaimBotWidget pageType="landing_page" />
    </div>
  );
}

function Header({ landingPage, brand }) {
  return (
    <header className="sticky top-0 z-50 h-[64px] bg-[#0a0e27]/65 backdrop-blur-[20px] saturate-[180%] border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-[18px] text-white">Check My</span>
        <span className="font-bold text-[18px] gradient-text">Claim</span>
      </div>
      <a href={`tel:${brand?.phone_number || "(844) 840-6905"}`} className="font-mono text-[14px] text-white hover:text-[#6366f1] transition-colors">
        {brand?.phone_number || "(844) 840-6905"}
      </a>
    </header>
  );
}

function Hero({ landingPage, quizTheme, quiz, isPreview }) {
  return (
    <section className="px-6 py-12 md:py-16 max-w-[1400px] mx-auto">
      <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">{landingPage.hero_eyebrow || "Free Case Evaluation"}</span>
          </div>
          <h1 className="font-bold text-[clamp(40px,6vw,80px)] tracking-[-0.03em] leading-[1.0] text-white">
            {(landingPage.hero_headline || "").split('\n').map((line, i, arr) => (
              <span key={i} className={arr.length > 1 && i === 1 ? "gradient-text" : ""}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
          {landingPage.hero_subheadline && (
            <p className="font-medium text-[19px] leading-[1.5] text-white/70 max-w-[580px]">
              {landingPage.hero_subheadline}
            </p>
          )}
          {landingPage.hero_subheadline_helper && (
            <p className="text-[17px] leading-[1.6] text-white/50">
              {landingPage.hero_subheadline_helper}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-4">
            {[
              { value: landingPage.trust_stat_1_value || "$50M+", label: landingPage.trust_stat_1_label || "Recovered" },
              { value: landingPage.trust_stat_2_value || "50K+", label: landingPage.trust_stat_2_label || "Wins" },
              { value: landingPage.trust_stat_3_value || "100%", label: landingPage.trust_stat_3_label || "Free" },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-lg px-4 py-3 border border-white/10">
                <div className="gradient-text font-bold text-[24px]">{stat.value}</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <QuizRuntimeEmbedded quizId={quiz?.id} themeId={quizTheme?.id} isPreview={isPreview} onFirstInteraction={() => onQuizStart()} />
        </div>
      </div>
    </section>
  );
}

function PhoneCTABanner({ landingPage }) {
  if (!landingPage.show_hero_phone_cta) return null;
  return (
    <section className="px-6 py-8">
      <div className="max-w-[600px] mx-auto glass rounded-full px-6 py-4 border border-white/10 text-center">
        <p className="text-[14px] text-white/70 mb-1">Prefer to talk to a human?</p>
        <a href="tel:(844) 840-6905" className="font-bold text-[22px] text-white hover:text-[#06b6d4] transition-colors inline-block">
          (844) 840-6905
        </a>
      </div>
    </section>
  );
}

function TrustPillars({ landingPage }) {
  return (
    <section className="px-6 py-12 max-w-[1200px] mx-auto">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { value: landingPage.trust_stat_1_value || "$50M+", label: landingPage.trust_stat_1_label || "Recovered" },
          { value: landingPage.trust_stat_2_value || "50K+", label: landingPage.trust_stat_2_label || "Wins" },
          { value: landingPage.trust_stat_3_value || "100%", label: landingPage.trust_stat_3_label || "Free" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-lg p-6 border border-white/10 glass-hover transition-all">
            <div className="gradient-text font-bold text-[32px] mb-2">{stat.value}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">{stat.label}</div>
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
      <h2 className="font-bold text-[40px] gradient-text text-center mb-3">
        {landingPage.benefits_section_title || "Why Choose Us"}
      </h2>
      {landingPage.benefits_section_subtitle && (
        <p className="text-[18px] text-white/50 text-center mb-10">
          {landingPage.benefits_section_subtitle}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {(landingPage.benefits_items || []).map((item, i) => (
          <div key={i} className="glass rounded-[20px] p-8 border border-white/10 glass-hover transition-all">
            <div className="gradient-text mb-4">{item.icon || <Check className="w-7 h-7" />}</div>
            <div className="font-medium text-[18px] text-white">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentWins({ landingPage, animatedWins, setAnimatedWins, winsRef }) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animatedWins[entry.target.dataset.index]) {
          const targetAmount = parseFloat(entry.target.dataset.amount.replace(/[^0-9.]/g, '')) || 0;
          const duration = 1400;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = targetAmount * easeOut;
            entry.target.textContent = '$' + current.toLocaleString('en-US', { maximumFractionDigits: 0 });
            if (progress < 1) requestAnimationFrame(animate);
            else setAnimatedWins(prev => ({ ...prev, [entry.target.dataset.index]: true }));
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.5 });
    Object.values(winsRef.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [landingPage.recent_wins_items]);

  if (!landingPage.recent_wins_items?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[1200px] mx-auto">
      <h2 className="font-bold text-[36px] text-white text-center mb-3">
        {landingPage.recent_wins_title || "Recent Settlements"}
      </h2>
      {landingPage.recent_wins_subtitle && (
        <p className="text-[18px] text-white/50 text-center mb-10">
          {landingPage.recent_wins_subtitle}
        </p>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        {landingPage.recent_wins_items.map((win, i) => (
          <div key={i} className="glass rounded-[20px] p-8 border border-white/10 glass-hover transition-all">
            <div 
              ref={el => winsRef.current[i] = el} 
              data-index={i} 
              data-amount={win.amount}
              className="gradient-text font-bold text-[36px] mb-4"
            >
              {win.amount}
            </div>
            <div className="text-[14px] text-white/70 leading-[1.5] mb-3">{win.location}</div>
            <div className="font-mono text-[12px] uppercase tracking-[0.12em] text-white/50">{win.name_initials}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Guarantee({ landingPage }) {
  if (!landingPage.guarantee_title && !landingPage.guarantee_body_html) return null;
  return (
    <section className="px-6 py-16 max-w-[720px] mx-auto">
      {landingPage.guarantee_eyebrow && (
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#10b981] mb-3">{landingPage.guarantee_eyebrow}</div>
      )}
      <h2 className="font-bold text-[48px] text-white mb-6">
        {landingPage.guarantee_title || "No Fee Unless You Win"}
      </h2>
      {landingPage.guarantee_body_html && (
        <div 
          className="text-[18px] leading-[1.6] text-white/70 mb-8"
          dangerouslySetInnerHTML={{ __html: landingPage.guarantee_body_html }} 
        />
      )}
      {landingPage.guarantee_bullets?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {landingPage.guarantee_bullets.map((bullet, i) => (
            <div key={i} className="glass rounded-lg px-4 py-2 border border-white/10 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#10b981]" />
              <span className="text-[15px] text-white">{bullet}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Testimonials({ landingPage }) {
  if (!landingPage.testimonials?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[1200px] mx-auto">
      <h2 className="font-bold text-[36px] text-white text-center mb-3">
        {landingPage.testimonials_title || "Client Stories"}
      </h2>
      {landingPage.testimonials_subtitle && (
        <p className="text-[18px] text-white/50 text-center mb-10">
          {landingPage.testimonials_subtitle}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {landingPage.testimonials.map((t, i) => (
          <div key={i} className="glass rounded-[20px] p-8 border border-white/10 glass-hover transition-all">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 gradient-text fill-current" />)}
            </div>
            <p className="text-[17px] leading-[1.6] text-white/90 mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-text flex items-center justify-center font-bold text-white text-sm">
                {t.initials?.[0] || t.name?.[0] || '?'}
              </div>
              <div>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">{t.time_ago}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ({ landingPage }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!landingPage.faq_items?.length) return null;
  return (
    <section className="px-6 py-16 max-w-[800px] mx-auto">
      <h2 className="font-bold text-[36px] text-white text-center mb-3">
        {landingPage.faq_title || "FAQ"}
      </h2>
      {landingPage.faq_subtitle && (
        <p className="text-[18px] text-white/50 text-center mb-10">
          {landingPage.faq_subtitle}
        </p>
      )}
      <div className="space-y-4">
        {landingPage.faq_items.map((item, i) => (
          <div key={i} className="glass rounded-[20px] border border-white/10 overflow-hidden hover:border-[#6366f1]/50 transition-colors">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="font-semibold text-[18px] text-white">{item.question}</span>
              {openIndex === i ? <ChevronUp className="w-5 h-5 text-[#6366f1]" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
            </button>
            {openIndex === i && (
              <div className="px-6 pb-6 text-[16px] leading-[1.7] text-white/70">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterDisclaimer({ landingPage }) {
  if (!landingPage.show_footer_disclaimer) return null;
  return (
    <footer className="bg-[#06091e] px-6 py-12">
      <div className="max-w-[1000px] mx-auto">
        <div className="font-bold text-[20px] gradient-text text-center mb-6">Check My Claim</div>
        <div 
          className="text-[12px] leading-[1.6] text-white/50"
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
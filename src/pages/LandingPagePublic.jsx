import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { captureIncomingParams } from "@/lib/surveyUrl";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";
import { QuizRuntimeEmbedded } from "@/pages/QuizRuntime";
import AuthorityBriefRenderer from "@/components/landing/AuthorityBriefRenderer";
import EmpatheticStoryRenderer from "@/components/landing/EmpatheticStoryRenderer";
import BoldModernRenderer from "@/components/landing/BoldModernRenderer";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";
const DEFAULT_PHONE = "(844) 840-6905";

// Dot pattern overlay
const DOT_PATTERN = `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`;

export default function LandingPagePublic() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [brand, setBrand] = useState(null);
  const [template, setTemplate] = useState(null);
  const [quizTheme, setQuizTheme] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const quizRef = useRef(null);

  useEffect(() => {
    captureIncomingParams();
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      const pages = await base44.entities.LandingPage.filter({ slug });
      if (!pages.length) { setNotFound(true); setLoading(false); return; }
      const p = pages[0];
      setPage(p);

      // SEO
      document.title = p.meta_title || `${p.hero_headline} | Check My Claim`;

      // Increment view count (once per session)
      const viewKey = `cmc_lp_viewed_${p.slug}`;
      if (!sessionStorage.getItem(viewKey)) {
        sessionStorage.setItem(viewKey, "1");
        base44.entities.LandingPage.update(p.id, {
          view_count: (p.view_count || 0) + 1,
          unique_visitors: (p.unique_visitors || 0) + 1,
        }).catch(() => {});
      }

      // Load template if template_key exists
      if (p.template_key) {
        const ts = await base44.entities.LandingPageTemplate.filter({ template_key: p.template_key });
        if (ts.length) setTemplate(ts[0]);
      }

      // Load quiz theme (from page override or template default)
      const themeId = p.embedded_quiz_theme_id || (template?.embedded_quiz_theme_id || null);
      if (themeId) {
        const ths = await base44.entities.QuizTheme.filter({ id: themeId });
        if (ths.length) setQuizTheme(ths[0]);
      }

      // Load quiz
      if (p.quiz_id) {
        const qs = await base44.entities.Quiz.filter({ id: p.quiz_id });
        if (qs.length) setQuizzes(qs);
      }

      // Load brand
      if (p.brand_id) {
        const bs = await base44.entities.DecisionTreeBrand.filter({ id: p.brand_id });
        if (bs.length) setBrand(bs[0]);
      }

      // Inject custom pixels
      const pixels = p.global_pixels || {};
      if (pixels.meta_pixel_id) injectMetaPixel(pixels.meta_pixel_id);
      if (pixels.taboola_pixel_id) injectTaboolaPixel(pixels.taboola_pixel_id);
      if (pixels.google_analytics_id) injectGA(pixels.google_analytics_id);
    } catch (e) {
      setNotFound(true);
    }
    setLoading(false);
  };

  const scrollToQuiz = () => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onQuizStart = () => {
    if (!page) return;
    const key = `cmc_lp_started_${page.slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      base44.entities.LandingPage.update(page.id, {
        total_quiz_starts: (page.total_quiz_starts || 0) + 1,
      }).catch(() => {});
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0b1220" }}>
      <div className="w-8 h-8 border-4 border-slate-700 border-t-[#1e90ff] rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0b1220" }}>
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <a href="/" className="text-[#1e90ff] hover:underline">← Back to Check My Claim</a>
      </div>
    </div>
  );

  const phone = brand?.phone_number || page?.brand_phone || DEFAULT_PHONE;
  const telNum = phone.replace(/\D/g, "");
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const quiz = quizzes[0];

  // Route to appropriate renderer based on template_key
  switch (page.template_key) {
    case "authority-brief":
      return <AuthorityBriefRenderer landingPage={page} template={template} brand={brand} quizTheme={quizTheme} quiz={quiz} isPreview={isPreview} />;
    case "empathetic-story":
      return <EmpatheticStoryRenderer landingPage={page} template={template} brand={brand} quizTheme={quizTheme} quiz={quiz} isPreview={isPreview} />;
    case "bold-modern":
      return <BoldModernRenderer landingPage={page} template={template} brand={brand} quizTheme={quizTheme} quiz={quiz} isPreview={isPreview} />;
    default:
      // Fall back to classic rendering (existing code below)
      return <ClassicRenderer page={page} brand={brand} quizTheme={quizTheme} template={template} phone={phone} telNum={telNum} quiz={quiz} isPreview={isPreview} />;
  }
}

// Classic renderer (existing implementation - kept for backwards compatibility)
function ClassicRenderer({ page, brand, quizTheme, template, phone, telNum, quiz, isPreview }) {
  const [openFaq, setOpenFaq] = useState(null);
  const quizRef = useRef(null);
  const stats = [
    { value: page.trust_stat_1_value || "$50M+", label: page.trust_stat_1_label || "Recovered" },
    { value: page.trust_stat_2_value || "50,000+", label: page.trust_stat_2_label || "Total Client Wins" },
    { value: page.trust_stat_3_value || "100%", label: page.trust_stat_3_label || "Free" },
  ];

  const scrollToQuiz = () => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const onQuizStart = () => {
    if (!page) return;
    const key = `cmc_lp_started_${page.slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      base44.entities.LandingPage.update(page.id, { total_quiz_starts: (page.total_quiz_starts || 0) + 1 }).catch(() => {});
    }
  };

  return (
    <div style={{ background: "#0b1220", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Sticky header */}
      <header style={{ background: "#0b1220", borderBottom: "1px solid #1e3a5f", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/"><img src={brand?.logo_url || LOGO_URL} alt="Check My Claim" style={{ height: 36, width: "auto" }} /></a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }} className="hidden sm:block">Prefer to speak to someone directly?</span>
            <a href={`tel:${telNum}`}
              style={{ background: "#1e90ff", color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 18px", borderRadius: 99, textDecoration: "none", whiteSpace: "nowrap" }}>
              CLICK HERE TO CALL
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={quizRef} style={{
        background: "linear-gradient(160deg, #0b1220 0%, #0f2040 50%, #0b1220 100%)",
        backgroundImage: `${DOT_PATTERN}, linear-gradient(160deg, #0b1220 0%, #0f2040 50%, #0b1220 100%)`,
        backgroundSize: "20px 20px, auto",
        padding: "60px 20px 80px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {page.hero_eyebrow && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20, lineHeight: 1.5 }}>{page.hero_eyebrow}</p>
          )}
          <h1 style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            {page.hero_headline || "Get The Maximum Cash Payout For Your Accident Injury!!"}
          </h1>
          {page.hero_subheadline && (
            <h2 style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(20px, 3vw, 30px)",
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 8,
            }}>{page.hero_subheadline}</h2>
          )}
          {page.hero_subheadline_helper && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 28 }}>{page.hero_subheadline_helper}</p>
          )}

          {/* Embedded quiz card */}
          <div style={{
            background: quizTheme?.card_background_color || "#ffffff",
            borderRadius: quizTheme?.card_border_radius || 16,
            padding: quizTheme?.card_padding_desktop || "32px",
            border: quizTheme?.border_color ? `2px solid ${quizTheme.border_color}` : "2px solid #ffd700",
            boxShadow: quizTheme?.border_glow_shadow || "0 0 40px rgba(255,215,0,0.3), 0 0 80px rgba(30,144,255,0.2), 0 30px 60px rgba(0,0,0,0.6)",
            maxWidth: 720,
            margin: "0 auto 32px",
            textAlign: "left",
          }}>
            {quiz ? (
              <QuizRuntimeEmbedded quizId={quiz.id} onFirstInteraction={onQuizStart} quizThemeId={page.embedded_quiz_theme_id || template?.embedded_quiz_theme_id} />
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff8f0", borderRadius: 12, border: "1px solid #fed7aa" }}>
                <p style={{ fontWeight: 700, color: "#92400e", marginBottom: 8 }}>This page is temporarily unavailable.</p>
                <p style={{ fontSize: 13, color: "#78350f" }}>Please refresh in a moment or call us at {phone}.</p>
              </div>
            )}
          </div>

          {/* Phone CTA below quiz */}
          {page.show_hero_phone_cta !== false && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                border: "1px solid rgba(34,197,94,0.4)", borderRadius: 99, padding: "10px 28px",
                display: "inline-block", marginBottom: 12,
              }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>
                  {page.hero_phone_label || "If you'd prefer to speak to someone right away, please call:"}
                </p>
              </div>
              <div>
                <a href={`tel:${telNum}`} style={{
                  fontSize: 28, fontWeight: 700, color: "#1e90ff", textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.76a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust pillars */}
      <section style={{ background: "#0b1220", padding: "60px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#1e3a5f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#1e90ff", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: "#0f1e35", padding: "80px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              {page.benefits_section_title || "We'll Never Stop Fighting For You"}
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto" }}>
              {page.benefits_section_subtitle || ""}
            </p>
          </div>
          <div style={{ display: "grid", gap: 12, maxWidth: 700, margin: "0 auto" }}>
            {(page.benefits_items || []).map((item, i) => (
              <div key={i} style={{ background: "#1e3a5f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ color: "#1e90ff", fontSize: 22, flexShrink: 0 }}>✦</div>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <button onClick={scrollToQuiz} style={{
              background: "#1e90ff", color: "#fff", fontWeight: 700, padding: "16px 36px",
              borderRadius: 99, border: "none", fontSize: 16, cursor: "pointer",
              boxShadow: "0 4px 24px rgba(30,144,255,0.4)",
            }}>Get Your Free Claim Check ›</button>
          </div>
        </div>
      </section>

      {/* Recent Wins */}
      <section style={{ background: "#0b1220", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              {page.recent_wins_title || "Millions Recovered for Clients Just Like You"}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto" }}>
              {page.recent_wins_subtitle || ""}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {(page.recent_wins_items || []).map((w, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.12em", marginBottom: 6 }}>RECENT WIN</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#1e293b", lineHeight: 1 }}>{w.amount}</div>
                <div style={{ fontSize: 14, color: "#64748b", marginTop: 10 }}>{w.name_initials}, age {w.age}</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>{w.location}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <button onClick={scrollToQuiz} style={{
              border: "2px solid #1e90ff", color: "#1e90ff", background: "transparent",
              fontWeight: 700, padding: "14px 32px", borderRadius: 99, fontSize: 15, cursor: "pointer",
            }}>Claim Checker Now ›</button>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section style={{ background: "#0f1e35", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "auto 1fr", gap: 48, alignItems: "center" }} className="flex-col md:grid">
          <div style={{ textAlign: "center", minWidth: 220 }}>
            <div style={{ background: "linear-gradient(135deg, #1e3a5f, #0b1220)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", padding: "32px 24px" }}>
              <div style={{ fontSize: 40 }}>🛡</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.1em", marginTop: 12 }}>RISK-FREE GUARANTEE</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: "#22c55e", marginTop: 8 }}>100%</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>FREE</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Zero Risk Guarantee</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.1em", marginBottom: 12 }}>
              {page.guarantee_eyebrow || "THE NO WIN, NO FEE GUARANTEE"}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
              {page.guarantee_title || "Our Attorneys Don't Get Paid Unless You Do"}
            </h2>
            {page.guarantee_body_html && (
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 20 }}
                dangerouslySetInnerHTML={{ __html: page.guarantee_body_html }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(page.guarantee_bullets || []).map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "#22c55e", fontSize: 18, lineHeight: 1.4 }}>✓</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 20 }}>YOU HAVE NOTHING TO LOSE!</p>
          <button onClick={scrollToQuiz} style={{
            background: "#1e90ff", color: "#fff", fontWeight: 700, padding: "16px 40px",
            borderRadius: 99, border: "none", fontSize: 16, cursor: "pointer",
            boxShadow: "0 4px 24px rgba(30,144,255,0.4)",
          }}>Start Your Free Claim Check</button>
        </div>
      </section>

      {/* Testimonials */}
      {(page.testimonials || []).length > 0 && (
        <section style={{ background: "#0b1220", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                {page.testimonials_title || "Loved By Thousands of Clients"}
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)" }}>{page.testimonials_subtitle || ""}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {(page.testimonials || []).map((t, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
                  <div style={{ color: "#fbbf24", fontSize: 16, marginBottom: 10 }}>{"★".repeat(t.rating || 5)}{"☆".repeat(5 - (t.rating || 5))}</div>
                  <p style={{ fontSize: 14, color: "#475569", fontStyle: "italic", lineHeight: 1.6, marginBottom: 16 }}>"{t.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{t.time_ago}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {(page.faq_items || []).length > 0 && (
        <section style={{ background: "#0f1e35", padding: "80px 20px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                {page.faq_title || "Frequently Asked Questions"}
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)" }}>{page.faq_subtitle || ""}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(page.faq_items || []).map((item, i) => (
                <div key={i} style={{ background: "#1e3a5f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{item.question}</span>
                    <span style={{ color: "#1e90ff", fontSize: 20, lineHeight: 1 }}>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 20px 16px", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: "#050d1a", padding: "40px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {page.show_footer_disclaimer !== false && page.footer_disclaimer_html && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, marginBottom: 20 }}
              dangerouslySetInnerHTML={{ __html: page.footer_disclaimer_html }} />
          )}
          {!page.footer_disclaimer_html && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
              checkmyclaim.co is not a law firm or an attorney referral service. This advertisement is not legal advice. Past results do not guarantee future outcomes.
            </p>
          )}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            © 2026 Check My Claim. All rights reserved. | checkmyclaim.co
          </p>
        </div>
      </footer>

      <ClaimBotWidget pageType="landing_page" />
    </div>
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
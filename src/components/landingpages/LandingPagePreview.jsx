import React from "react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c8efa75d8857518d34273/a32c079ff_DarkMode-PrimaryLogo_CheckMyClaim.png";

export default function LandingPagePreview({ page, previewMode, quizzes, brands }) {
  const quiz = page?.decision_tree_quiz_id ? quizzes.find(q => q.id === page.decision_tree_quiz_id) : null;
  const brand = page?.brand_id ? brands.find(b => b.id === page.brand_id) : null;
  const phone = brand?.phone_number || "(844) 840-6905";

  const containerStyle = previewMode === "mobile"
    ? { width: 390, minHeight: 844, border: "2px solid rgba(255,255,255,0.1)", borderRadius: 24, overflow: "hidden" }
    : { width: "100%", maxWidth: 1100, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden" };

  const stats = [
    { value: page?.trust_stat_1_value || "$50M+", label: page?.trust_stat_1_label || "Recovered" },
    { value: page?.trust_stat_2_value || "50,000+", label: page?.trust_stat_2_label || "Total Client Wins" },
    { value: page?.trust_stat_3_value || "100%", label: page?.trust_stat_3_label || "Free" },
  ];

  return (
    <div style={containerStyle} className="bg-white shadow-2xl mx-auto flex-shrink-0">
      {/* Sticky header */}
      <div style={{ background: "#0b1220", borderBottom: "1px solid #1e3a5f" }} className="px-4 py-3 flex items-center justify-between">
        <img src={LOGO_URL} alt="Check My Claim" className="h-7 w-auto" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60 hidden md:block">Prefer to speak directly?</span>
          <a href={`tel:${phone.replace(/\D/g, "")}`}
            className="bg-[#1e90ff] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-blue-600 transition-all">
            CLICK HERE TO CALL
          </a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0b1220 0%, #0f1e35 60%, #0b1220 100%)", position: "relative", overflow: "hidden" }} className="px-6 py-10 text-center">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "20px 20px", pointerEvents: "none" }} />
        {page?.hero_eyebrow && (
          <p className="text-xs font-medium mb-4 relative" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.02em" }}>{page.hero_eyebrow}</p>
        )}
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: previewMode === "mobile" ? "28px" : "42px", fontWeight: 700, color: "#ffffff", lineHeight: 1.15 }} className="mb-3">
          {page?.hero_headline || "Your Hero Headline Goes Here!!"}
        </h1>
        {page?.hero_subheadline && (
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: previewMode === "mobile" ? "20px" : "26px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }} className="mb-2">
            {page.hero_subheadline}
          </h2>
        )}
        {page?.hero_subheadline_helper && (
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>{page.hero_subheadline_helper}</p>
        )}

        {/* Quiz card */}
        <div style={{
          background: "#ffffff", borderRadius: 16, padding: previewMode === "mobile" ? "20px" : "32px",
          border: "2px solid #ffd700",
          boxShadow: "0 0 40px rgba(255,215,0,0.25), 0 0 80px rgba(30,144,255,0.15), 0 25px 50px rgba(0,0,0,0.5)",
          maxWidth: 700, margin: "0 auto", position: "relative"
        }}>
          {quiz ? (
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#1e90ff" }}>
                {quiz.title}
              </div>
              <div className="text-lg font-bold text-slate-800 mb-4">How Were You Injured?</div>
              <div className="space-y-2">
                {["Car Accident", "Truck Accident", "Motorcycle Accident", "Uber/Lyft Accident"].map(opt => (
                  <div key={opt} style={{ border: "2px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#1e293b", background: "#f8fafc" }}>
                    {opt}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center mt-3">← Preview of quiz options</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-amber-500 font-semibold text-sm mb-1">⚠ No Decision Tree selected</div>
              <p className="text-slate-400 text-xs">Go to "Hero & Quiz" tab and pick a published quiz</p>
            </div>
          )}
        </div>

        {/* Phone CTA */}
        {page?.show_hero_phone_cta !== false && (
          <div className="mt-6 relative">
            <div style={{ border: "1px solid rgba(34,197,94,0.4)", borderRadius: 99, padding: "10px 24px", display: "inline-block", maxWidth: 500 }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{page?.hero_phone_label || "If you'd prefer to speak to someone right away, please call:"}</p>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-2xl font-bold" style={{ color: "#1e90ff" }}>📞 {phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Trust pillars */}
      <div style={{ background: "#0b1220", padding: "40px 24px" }}>
        <div className={`grid gap-4 ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"} max-w-3xl mx-auto`}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#1e3a5f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#1e90ff" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{ background: "#0f1e35", padding: "60px 24px" }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: previewMode === "mobile" ? 24 : 32, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 8 }}>
            {page?.benefits_section_title || "We'll Never Stop Fighting For You"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 32, fontSize: 15 }}>
            {page?.benefits_section_subtitle || "We work with only the best attorneys to get you the compensation you deserve."}
          </p>
          <div className="grid gap-3 grid-cols-1">
            {(page?.benefits_items || []).map((item, i) => (
              <div key={i} style={{ background: "#1e3a5f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ color: "#1e90ff", fontSize: 20 }}>✦</div>
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <div style={{ background: "#1e90ff", color: "#fff", fontWeight: 700, padding: "14px 32px", borderRadius: 99, display: "inline-block", fontSize: 15, cursor: "pointer" }}>
              Get Your Free Claim Check ›
            </div>
          </div>
        </div>
      </div>

      {/* Recent Wins */}
      <div style={{ background: "#0b1220", padding: "60px 24px" }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 8 }}>
            {page?.recent_wins_title || "Millions Recovered for Clients Just Like You"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 32, fontSize: 14 }}>
            {page?.recent_wins_subtitle || ""}
          </p>
          <div className={`grid gap-4 ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
            {(page?.recent_wins_items || []).map((w, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "20px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
                <div style={{ color: "#1e90ff", fontSize: 24, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", marginBottom: 4 }}>RECENT WIN</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>{w.amount}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{w.name_initials}, age {w.age}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{w.location}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <div style={{ border: "2px solid #1e90ff", color: "#1e90ff", fontWeight: 700, padding: "12px 32px", borderRadius: 99, display: "inline-block", fontSize: 14, cursor: "pointer" }}>
              Claim Checker Now ›
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials preview */}
      <div style={{ background: "#0f1e35", padding: "60px 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 24 }}>
          {page?.testimonials_title || "Loved By Thousands of Clients"}
        </h2>
        <div className={`grid gap-4 max-w-4xl mx-auto ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
          {(page?.testimonials || []).slice(0, 2).map((t, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "20px" }}>
              <div style={{ color: "#fbbf24", fontSize: 14, marginBottom: 8 }}>{"★".repeat(t.rating || 5)}</div>
              <p style={{ fontSize: 13, color: "#475569", fontStyle: "italic", marginBottom: 12 }}>"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{t.time_ago}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer preview */}
      <div style={{ background: "#050d1a", padding: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          © 2026 Check My Claim · Full disclaimer shown on public page
        </p>
      </div>
    </div>
  );
}
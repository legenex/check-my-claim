import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function ToolsIndex() {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    base44.entities.Tool.filter({ status: "live" }).then(setTools).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f3ea", fontFamily: "'IBM Plex Serif', Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=IBM+Plex+Serif&family=JetBrains+Mono&display=swap');`}</style>
      <header style={{ height: 56, background: "#f7f3ea", borderBottom: "1px solid #8b6914", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <a href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#1a1d24", textDecoration: "none" }}>
          CheckMyClaim<span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#6b7280" }}>.co</span>
        </a>
      </header>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8b6914", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>CASE TOOLS</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 500, color: "#1a1d24", marginBottom: 40, lineHeight: 1.1 }}>
          Tools for accident victims who want straight answers.
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {tools.map(t => (
            <a key={t.id} href={`/tools/${t.slug}`} style={{ display: "block", background: "#fbf8f0", border: "1px solid #d8cfb8", borderRadius: 2, padding: 24, textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#8b6914"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#d8cfb8"}
            >
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, color: "#1a1d24", marginBottom: 8 }}>{t.name}</div>
              {t.hero_subhead && <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{t.hero_subhead.substring(0, 100)}{t.hero_subhead.length > 100 ? "..." : ""}</p>}
              <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8b6914", textTransform: "uppercase", letterSpacing: "0.12em" }}>Start intake</div>
            </a>
          ))}
          {tools.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: 16 }}>No tools available at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}
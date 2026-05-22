import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AttorneyMatchEngine from "@/components/tools/AttorneyMatchEngine";

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f3ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #d8cfb8", borderTopColor: "#8b6914", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AttorneyMatchPage() {
  const location = useLocation();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPreview = new URLSearchParams(location.search).get("preview") === "1";

  useEffect(() => {
    const load = async () => {
      const results = await base44.entities.Tool.filter({ slug: "attorney-match" });
      if (results.length > 0) {
        const t = results[0];
        // Check status unless preview or admin
        if (t.status !== "live" && !isPreview) {
          let isAdmin = false;
          try { const me = await base44.auth.me(); isAdmin = me?.role === "admin"; } catch (_) {}
          if (!isAdmin) { setLoading(false); return; }
        }
        setTool(t);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingScreen />;

  if (!tool) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f3ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#1a1d24", marginBottom: 8 }}>Tool not found</h1>
          <a href="/" style={{ color: "#8b6914" }}>Back to CheckMyClaim.co</a>
        </div>
      </div>
    );
  }

  return <AttorneyMatchEngine tool={tool} isPreview={isPreview} />;
}
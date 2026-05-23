import React, { useState, useEffect } from "react";

const BQ_URL = "https://script.google.com/macros/s/AKfycbzdr-Rd9vM_D6xJTNE4UMleA5VKOmj0SM1xq3lnw4b0VLlAa0lMPVIy9_GgH03dmkQJ-A/exec?accident_state=CA";
const PING_INTERVAL = 60000;

export default function SurveyStatusBar({ saveState, savedLabel, steps, fields, errors, onErrorClick }) {
  const dot = saveState === "error" ? "#ef4444" : saveState === "saving" ? "#f59e0b" : "#3ab54b";
  const [bqStatus, setBqStatus] = useState("unknown"); // online | offline | unknown
  const [lastPing, setLastPing] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [showBqDetail, setShowBqDetail] = useState(false);

  const ping = async () => {
    try {
      const res = await fetch(BQ_URL, { signal: AbortSignal.timeout(8000) });
      if (res.ok) { setBqStatus("online"); setLastPing(new Date()); setLastError(null); }
      else { setBqStatus("offline"); setLastError(`HTTP ${res.status}`); }
    } catch (e) {
      setBqStatus("offline");
      setLastError(e.message);
    }
  };

  useEffect(() => {
    ping();
    const id = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const bqDot = bqStatus === "online" ? "#3ab54b" : bqStatus === "offline" ? "#ef4444" : "#f59e0b";

  return (
    <div
      className="flex items-center gap-4 px-4 flex-shrink-0 border-t border-white/10 relative"
      style={{ height: 28, background: "#050b14", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569" }}
    >
      <span className="flex items-center gap-1.5">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
        {savedLabel()}
      </span>
      <span className="text-white/20">·</span>
      <span>{steps.length} steps</span>
      <span className="text-white/20">·</span>
      <span>{fields.length} fields</span>
      <span className="text-white/20">·</span>
      <button
        onClick={errors.length > 0 ? onErrorClick : undefined}
        style={{ color: errors.length > 0 ? "#ef4444" : "#475569", cursor: errors.length > 0 ? "pointer" : "default" }}
      >
        {errors.length} validation error{errors.length !== 1 ? "s" : ""}
      </button>
      <span className="text-white/20">·</span>
      <button onClick={() => setShowBqDetail(v => !v)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: bqDot, display: "inline-block" }} />
        <span style={{ color: bqDot }}>BQ proxy: {bqStatus}</span>
      </button>
      <span className="ml-auto text-white/20">v0.3.0</span>

      {showBqDetail && (
        <div style={{ position: "absolute", bottom: 32, left: 200, background: "#0a1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 12px", zIndex: 50 }}>
          <div className="text-xs text-slate-300">Last ping: {lastPing ? lastPing.toLocaleTimeString() : "never"}</div>
          {lastError && <div className="text-xs text-red-400 mt-1">Error: {lastError}</div>}
          <button onClick={() => { ping(); setShowBqDetail(false); }} className="text-xs text-[#2282fc] mt-1 hover:underline block">Ping now</button>
        </div>
      )}
    </div>
  );
}
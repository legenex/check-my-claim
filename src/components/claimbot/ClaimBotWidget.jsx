import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { buildSurveyUrl } from "@/lib/surveyUrl";

const DEFAULT_SETTINGS = {
  bot_name: "ClaimBot",
  bot_tagline: "Your free claim assistant",
  greeting_message: "Hi 👋 I'm ClaimBot. I can help you understand whether you may have a claim, what it could be worth, and how the free 30-second check works. What happened?",
  input_placeholder: "Ask anything about your claim...",
  cta_label: "Start My Free Claim Check",
  cta_url: "https://qualify.checkmyclaim.co/s/mva",
  phone_number: "(844) 840-6905",
  phone_cta_label: "Prefer to talk to someone?",
  primary_color: "#1e90ff",
  accent_color: "#22c55e",
  background_color: "#0b1220",
  text_color: "#ffffff",
  position: "bottom-right",
  launcher_label: "Chat with ClaimBot",
  auto_open_after_seconds: 0,
  escalation_after_n_turns: 6,
  max_messages_per_session: 30,
  compliance_disclaimer_short: "ClaimBot provides general information only. It is not a lawyer and does not provide legal advice.",
  fallback_response: "I'm not sure I have a great answer for that. Would you like to start a free 30-second claim check, or speak with someone directly?",
  is_enabled: true,
};

function generateSessionId() {
  return "cbs_" + Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
}

export default function ClaimBotWidget({ pageType = "landing_page", advertorialSlug = "" }) {
  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [escalated, setEscalated] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    base44.entities.ClaimBotSettings.list().then(list => {
      if (list.length > 0) setSettings({ ...DEFAULT_SETTINGS, ...list[0] });
      else setSettings(DEFAULT_SETTINGS);
    }).catch(() => setSettings(DEFAULT_SETTINGS));
  }, []);

  useEffect(() => {
    if (!settings) return;
    // Auto-open
    if (settings.auto_open_after_seconds > 0) {
      const t = setTimeout(() => setOpen(true), settings.auto_open_after_seconds * 1000);
      return () => clearTimeout(t);
    }
  }, [settings]);

  useEffect(() => {
    if (open && messages.length === 0 && settings) {
      setMessages([{ role: "assistant", content: settings.greeting_message }]);
    }
  }, [open, settings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!settings) return null;

  const shouldShow = () => {
    if (!settings.is_enabled) return false;
    if (pageType === "advertorial" && !settings.show_on_advertorials) return false;
    if (pageType === "landing_page" && !settings.show_on_landing_pages) return false;
    if (pageType === "admin" && !settings.show_on_admin) return false;
    return true;
  };

  if (!shouldShow()) return null;

  const maxHit = messages.filter(m => m.role === "user").length >= settings.max_messages_per_session;
  const color = settings.primary_color || "#1e90ff";
  const isRight = settings.position !== "bottom-left";

  const sendMessage = async () => {
    if (!input.trim() || loading || maxHit) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    // Auto-escalate after N turns
    if (newTurn === settings.escalation_after_n_turns && !escalated) {
      setEscalated(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "It sounds like you have a real situation here. The fastest next step is a free 30-second claim check — it tells you what your case might be worth with no obligation. Want me to send you the link, or would you prefer to talk to someone directly?"
        }]);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const utmData = {
        utm_source: sessionStorage.getItem("cmc_utm_source") || "",
        utm_medium: sessionStorage.getItem("cmc_utm_medium") || "",
        utm_campaign: sessionStorage.getItem("cmc_utm_campaign") || "",
      };
      const res = await base44.functions.invoke("claimBotChat", {
        messages: newMessages,
        session_id: sessionId,
        source_page: pageType,
        source_advertorial_slug: advertorialSlug,
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        ...utmData,
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data?.reply || settings.fallback_response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: settings.fallback_response }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSurveyClick = async () => {
    base44.functions.invoke("claimBotConversionLog", { session_id: sessionId, event: "survey_click" }).catch(() => {});
    const url = buildSurveyUrl({ linkId: "bot_cta", utmMedium: "claimbot" });
    window.open(url, "_blank");
  };

  const handlePhoneClick = async () => {
    base44.functions.invoke("claimBotConversionLog", { session_id: sessionId, event: "phone_click" }).catch(() => {});
  };

  const ctaUrl = buildSurveyUrl({ linkId: "bot_cta", utmMedium: "claimbot" });
  const phone = settings.phone_number || "(844) 840-6905";

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title={settings.launcher_label}
          className={`fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 ${isRight ? "bottom-6 right-6" : "bottom-6 left-6"}`}
          style={{ backgroundColor: color }}
          aria-label="Open ClaimBot"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed z-50 flex flex-col shadow-2xl transition-all ${isRight ? "bottom-6 right-6" : "bottom-6 left-6"}`}
          style={{
            width: "min(380px, calc(100vw - 24px))",
            height: "min(560px, calc(100vh - 48px))",
            borderRadius: "16px",
            backgroundColor: settings.background_color || "#0b1220",
            color: settings.text_color || "#ffffff",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl flex-shrink-0" style={{ backgroundColor: color }}>
            <div className="flex items-center gap-3">
              {settings.bot_avatar_url
                ? <img src={settings.bot_avatar_url} alt={settings.bot_name} className="w-8 h-8 rounded-full object-cover" />
                : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">C</div>
              }
              <div>
                <div className="font-bold text-white text-sm">{settings.bot_name}</div>
                <div className="text-white/70 text-xs">{settings.bot_tagline}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.compliance_disclaimer_long && (
                <button onClick={() => setShowDisclaimer(!showDisclaimer)} className="text-white/60 hover:text-white text-xs p-1" title="Disclaimer">ⓘ</button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-lg leading-none p-1">×</button>
            </div>
          </div>

          {/* Disclaimer overlay */}
          {showDisclaimer && (
            <div className="absolute inset-0 z-10 rounded-2xl p-4 flex flex-col" style={{ backgroundColor: settings.background_color || "#0b1220" }}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm">Disclaimer</h3>
                <button onClick={() => setShowDisclaimer(false)} className="text-slate-400 hover:text-white">×</button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed overflow-y-auto">{settings.compliance_disclaimer_long || settings.compliance_disclaimer_short}</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === "user"
                    ? { backgroundColor: color, color: "white", borderBottomRightRadius: "4px" }
                    : { backgroundColor: "rgba(255,255,255,0.08)", color: settings.text_color || "white", borderBottomLeftRadius: "4px" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl text-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            {maxHit && (
              <div className="text-xs text-center text-slate-400 px-2">
                Looks like a great conversation! The fastest next step is the free 30-second check or calling our team.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Persistent CTA card */}
          <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={handleSurveyClick}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white mb-1.5 transition-all hover:opacity-90"
              style={{ backgroundColor: settings.accent_color || "#22c55e" }}
            >
              {settings.cta_label}
            </button>
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              onClick={handlePhoneClick}
              className="block text-center text-xs py-1 hover:underline"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {settings.phone_cta_label} {phone}
            </a>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex gap-2" style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "6px 6px 6px 12px" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={settings.input_placeholder}
                disabled={loading || maxHit}
                className="flex-1 bg-transparent text-sm outline-none placeholder-slate-500"
                style={{ color: settings.text_color || "white" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || maxHit}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                style={{ backgroundColor: color }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 px-1 leading-tight">{settings.compliance_disclaimer_short}</p>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, ChevronRight } from "lucide-react";

export default function ClaimBotConversationsTab() {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [filterSource, setFilterSource] = useState("All");
  const [filterConv, setFilterConv] = useState("All");
  const [unanswered, setUnanswered] = useState([]);

  useEffect(() => {
    loadConvs();
  }, []);

  const loadConvs = async () => {
    setLoading(true);
    const res = await base44.entities.ClaimBotConversation.list("-created_date", 200);
    setConvs(res);
    setLoading(false);

    // Compute unanswered topics: messages that contain fallback/off-topic indicators
    const fallbackMsgs = await base44.entities.ClaimBotMessage.filter({ role: "assistant" }, "-created_date", 100);
    const suspects = fallbackMsgs.filter(m =>
      m.content?.toLowerCase().includes("not sure") ||
      m.content?.toLowerCase().includes("great answer") ||
      m.content?.toLowerCase().includes("off-topic") ||
      m.content?.toLowerCase().includes("only help with")
    );
    // Get the preceding user messages by session
    const sessionIds = [...new Set(suspects.map(m => m.conversation_session_id))];
    const topicMap = {};
    for (const sid of sessionIds.slice(0, 20)) {
      const sessionMsgs = await base44.entities.ClaimBotMessage.filter({ conversation_session_id: sid });
      const pairs = sessionMsgs.filter(m => m.role === "user");
      pairs.forEach(m => {
        const t = m.content?.substring(0, 80);
        if (t) topicMap[t] = (topicMap[t] || 0) + 1;
      });
    }
    setUnanswered(Object.entries(topicMap).sort((a, b) => b[1] - a[1]).slice(0, 10));
  };

  const openConv = async (conv) => {
    setSelected(conv);
    setMsgLoading(true);
    const msgs = await base44.entities.ClaimBotMessage.filter({ conversation_session_id: conv.session_id }, "created_date", 100);
    setMessages(msgs);
    setMsgLoading(false);
  };

  const filtered = convs.filter(c => {
    const srcOk = filterSource === "All" || c.source_page === filterSource;
    const convOk = filterConv === "All" ||
      (filterConv === "Survey" && c.converted_to_survey_click) ||
      (filterConv === "Phone" && c.converted_to_phone_click) ||
      (filterConv === "None" && !c.converted_to_survey_click && !c.converted_to_phone_click);
    return srcOk && convOk;
  });

  return (
    <div>
      {/* Unanswered Topics Card */}
      {unanswered.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-6">
          <h3 className="text-amber-400 font-bold text-sm mb-3">⚠ Top Unanswered / Fallback Topics</h3>
          <p className="text-xs text-amber-300/70 mb-3">These are user questions that triggered fallback or off-topic responses. Consider adding KB entries for them.</p>
          <div className="flex flex-wrap gap-2">
            {unanswered.map(([topic, count], i) => (
              <span key={i} className="bg-amber-900/40 text-amber-200 text-xs px-3 py-1 rounded-full border border-amber-500/20">
                "{topic.substring(0, 60)}…" ({count}×)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap mb-5">
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          <option value="All">All Sources</option>
          <option value="advertorial">Advertorial</option>
          <option value="landing_page">Landing Page</option>
          <option value="admin_test">Admin Test</option>
          <option value="other">Other</option>
        </select>
        <select value={filterConv} onChange={e => setFilterConv(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e90ff]">
          <option value="All">All Outcomes</option>
          <option value="Survey">Survey Click</option>
          <option value="Phone">Phone Click</option>
          <option value="None">No Conversion</option>
        </select>
        <div className="text-xs text-slate-400 flex items-center ml-auto">{filtered.length} conversations</div>
      </div>

      <div className={`grid ${selected ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
        {/* List */}
        <div className="bg-[#0f1e35] rounded-xl border border-white/10 overflow-hidden">
          {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : (
            <table className="w-full text-sm">
              <thead className="bg-[#0a1628] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-white font-semibold">Started</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Source</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Msgs</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-semibold">Converted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(conv => (
                  <tr key={conv.id}
                    onClick={() => openConv(conv)}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${selected?.id === conv.id ? "bg-[#1e3a5f]/30" : ""}`}>
                    <td className="px-4 py-3 text-slate-300 text-xs">{conv.started_at ? new Date(conv.started_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded">{conv.source_page || "—"}</span>
                      {conv.source_advertorial_slug && <div className="text-xs text-slate-500 mt-0.5">{conv.source_advertorial_slug}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{conv.message_count || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {conv.converted_to_survey_click && <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Survey</span>}
                        {conv.converted_to_phone_click && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Phone</span>}
                        {!conv.converted_to_survey_click && !conv.converted_to_phone_click && <span className="text-xs text-slate-500">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Transcript */}
        {selected && (
          <div className="bg-[#0f1e35] rounded-xl border border-white/10 flex flex-col max-h-[600px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1e90ff]" />
                <span className="text-sm font-semibold text-white">Transcript</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? <div className="text-center text-slate-400 text-sm">Loading messages...</div> : messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === "user" ? "bg-[#1e90ff] text-white" : "bg-white/10 text-slate-200"}`}>
                    <div className="font-semibold mb-1 opacity-70">{msg.role === "user" ? "User" : "ClaimBot"}</div>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
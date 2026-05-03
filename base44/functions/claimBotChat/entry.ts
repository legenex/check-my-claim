import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { messages, session_id, source_page, source_advertorial_slug, utm_source, utm_medium, utm_campaign, device } = body;

    // Load settings
    const settingsList = await base44.asServiceRole.entities.ClaimBotSettings.list();
    if (!settingsList.length) {
      return Response.json({ error: "ClaimBot not configured" }, { status: 503 });
    }
    const settings = settingsList[0];

    if (!settings.is_enabled) {
      return Response.json({ error: "ClaimBot is disabled" }, { status: 403 });
    }

    // Load top KB entries
    const allKb = await base44.asServiceRole.entities.ClaimBotKnowledgeBase.filter({ is_active: true }, "-priority", 20);
    
    // Filter by keyword relevance if user message provided
    const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "";
    const scored = allKb.map(kb => {
      const keywords = kb.trigger_keywords || [];
      const matchScore = keywords.filter(kw => lastUserMsg.toLowerCase().includes(kw.toLowerCase())).length;
      return { ...kb, matchScore };
    });
    scored.sort((a, b) => b.matchScore - a.matchScore || b.priority - a.priority);
    const topKb = scored.slice(0, 8);

    // Build KB XML
    const kbXml = topKb.length > 0
      ? `<knowledge_base>\n${topKb.map(kb => `<kb id="${kb.id}" category="${kb.category}">${kb.title}\n\n${kb.content}</kb>`).join("\n")}\n</knowledge_base>`
      : "";

    const systemPrompt = [settings.system_prompt || "You are ClaimBot, a helpful assistant for Check My Claim.", kbXml].filter(Boolean).join("\n\n");

    // Call Anthropic
    const model = settings.ai_model || "claude-sonnet-4-20250514";
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: settings.ai_max_tokens || 600,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("Anthropic error:", err);
      return Response.json({ error: "AI error", reply: settings.fallback_response || "I'm having trouble right now. Please try the free 30-second check or call us directly." });
    }

    const anthropicData = await anthropicRes.json();
    const reply = anthropicData.content?.[0]?.text || settings.fallback_response || "I'm not sure about that. Would you like to start a free claim check?";
    const tokensIn = anthropicData.usage?.input_tokens || 0;
    const tokensOut = anthropicData.usage?.output_tokens || 0;

    // Log conversation + messages
    const now = new Date().toISOString();
    
    // Upsert conversation
    const existingConvs = await base44.asServiceRole.entities.ClaimBotConversation.filter({ session_id });
    let conv;
    if (existingConvs.length > 0) {
      conv = existingConvs[0];
      await base44.asServiceRole.entities.ClaimBotConversation.update(conv.id, {
        message_count: (conv.message_count || 0) + 2,
        ended_at: now,
      });
    } else {
      conv = await base44.asServiceRole.entities.ClaimBotConversation.create({
        session_id,
        started_at: now,
        ended_at: now,
        status: "active",
        source_page: source_page || "unknown",
        source_advertorial_slug: source_advertorial_slug || "",
        device: device || "Unknown",
        utm_source: utm_source || "",
        utm_medium: utm_medium || "",
        utm_campaign: utm_campaign || "",
        message_count: 2,
        converted_to_survey_click: false,
        converted_to_phone_click: false,
        escalated_to_phone: false,
      });
    }

    if (settings.log_full_transcripts) {
      // Log user message
      const userMsg = messages[messages.length - 1];
      if (userMsg?.role === "user") {
        await base44.asServiceRole.entities.ClaimBotMessage.create({
          conversation_session_id: session_id,
          role: "user",
          content: userMsg.content,
          timestamp: now,
        });
      }
      // Log assistant reply
      await base44.asServiceRole.entities.ClaimBotMessage.create({
        conversation_session_id: session_id,
        role: "assistant",
        content: reply,
        timestamp: now,
        model_used: model,
        tokens_input: tokensIn,
        tokens_output: tokensOut,
        kb_entries_used: topKb.map(k => k.id),
      });
    }

    // Update KB use counts
    for (const kb of topKb) {
      if (kb.matchScore > 0) {
        base44.asServiceRole.entities.ClaimBotKnowledgeBase.update(kb.id, {
          use_count: (kb.use_count || 0) + 1,
          last_used_at: now,
        }).catch(() => {});
      }
    }

    return Response.json({ reply, session_id });
  } catch (error) {
    console.error("ClaimBot error:", error);
    return Response.json({ error: error.message, reply: "I'm having trouble right now. Please try the free 30-second check or call us directly." }, { status: 500 });
  }
});
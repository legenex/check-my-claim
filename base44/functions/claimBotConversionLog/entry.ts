import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { session_id, event } = await req.json();
    // event: "survey_click" | "phone_click"

    const convs = await base44.asServiceRole.entities.ClaimBotConversation.filter({ session_id });
    if (convs.length > 0) {
      const update = {};
      if (event === "survey_click") update.converted_to_survey_click = true;
      if (event === "phone_click") { update.converted_to_phone_click = true; update.escalated_to_phone = true; }
      await base44.asServiceRole.entities.ClaimBotConversation.update(convs[0].id, update);
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});
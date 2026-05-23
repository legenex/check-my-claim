import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

const TEMPLATES = [
  {
    id: "mva-tiered-full",
    name: "MVA Tiered (Full)",
    description: "19-step survey with all 4 tiers plus DQ flow. Phase 5: BQ-primary tier resolution, injury check, fault multi-DQ, attorney 5-way split, insurance + accident description capture, legal funding route.",
    stepCount: 19,
    tiers: ["shared","t1","t2","t3","t4","dq"],
    sketch: [
      { tier: "shared", count: 9 },
      { tier: "t1", count: 2 },
      { tier: "dq", count: 3 },
    ],
    seedable: true,
  },
  {
    id: "mva-tier4-fresh",
    name: "MVA Tier 4 Only (Fresh Accident)",
    description: "Minimal 9-step T4 survey for fresh accident traffic. Skips lookup, forces tier=t4. No fault, no medical, no insurance. Fast contact capture.",
    stepCount: 9,
    tiers: ["shared","t4"],
    sketch: [
      { tier: "shared", count: 7 },
      { tier: "t4", count: 2 },
    ],
    seedable: false,
    t4_steps: [
      "s_accident_type","s_state","s_date","s_injury_check",
      "s_attorney","s_first_name","s_phone","s_email","s_results_qualified"
    ],
  },
  {
    id: "generic-qualifier",
    name: "Generic Lead Qualifier",
    description: "Minimal 5-step template for non-MVA verticals. Captures name, phone, email and routes on a single qualifier question.",
    stepCount: 5,
    tiers: ["shared","dq"],
    sketch: [
      { tier: "shared", count: 4 },
      { tier: "dq", count: 1 },
    ],
    seedable: false,
  },
];

const TIER_COLORS = {
  shared: "#a78bfa", t1: "#ef4d4d", t2: "#f59e0b",
  t3: "#2282fc", t4: "#3ab54b", dq: "#94a3b8",
};

function FlowSketch({ sketch }) {
  return (
    <div className="flex items-end gap-1 h-8">
      {sketch.map((col, i) => (
        <div key={i} className="flex flex-col gap-0.5 items-center">
          {Array.from({ length: col.count }).map((_, j) => (
            <div key={j} style={{ width: 12, height: 6, borderRadius: 1, background: TIER_COLORS[col.tier] || "#64748b", opacity: 0.7 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TemplatesPanel({ surveyId, onCreated }) {
  const [creating, setCreating] = useState(null);

  const handleUse = async (template) => {
    setCreating(template.id);
    try {
      const newSurvey = await base44.entities.Survey.create({
        name: `${template.name} — copy`,
        slug: `${template.id}-${Date.now().toString(36)}`,
        status: "draft",
        vertical: "mva",
        tiers_active: template.tiers,
        description: template.description,
        step_order: template.t4_steps || [],
      });

      // If this template needs seeding, invoke the seed function
      if (template.seedable) {
        await base44.functions.invoke("seedSurveySteps", { survey_id: newSurvey.id });
      } else if (template.t4_steps) {
        // T4 only: set the step_order to the subset (no seeding needed, user will build manually)
        await base44.entities.Survey.update(newSurvey.id, {
          start_step_id: template.t4_steps[0],
          step_order: template.t4_steps,
          description: `T4 Fresh Accident. step_order pre-set. Use Seed Steps then remove unwanted steps, or build manually. Note: s_lookup is intentionally omitted — set ctx.tier = t4 directly on s_injury_check variants.`
        });
      }

      if (onCreated) onCreated(newSurvey);
      window.location.href = `/admin/QuizBuilder/Edit?id=${newSurvey.id}`;
    } catch (e) {
      alert(`Failed to create: ${e.message}`);
      setCreating(null);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="text-xs font-mono font-bold uppercase tracking-wider mb-6" style={{ color: "#2282fc" }}>Survey Templates</div>

      <div className="grid grid-cols-1 gap-5 max-w-3xl">
        {TEMPLATES.map(tpl => (
          <div key={tpl.id} style={{ background: "#0a1320", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex-1">
                <div className="mb-4">
                  <FlowSketch sketch={tpl.sketch} />
                </div>

                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 6 }}>
                  {tpl.name}
                </div>
                <p className="text-sm text-slate-400 mb-4">{tpl.description}</p>

                <div className="flex items-center gap-3 flex-wrap">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
                    {tpl.stepCount} steps
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
                    {tpl.tiers.length} tiers
                  </span>
                  {tpl.seedable && (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "rgba(58,181,75,0.15)", color: "#3ab54b", border: "1px solid rgba(58,181,75,0.3)" }}>
                      auto-seeded
                    </span>
                  )}
                  <div className="flex gap-1">
                    {tpl.tiers.map(t => (
                      <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "1px 6px", borderRadius: 3, background: `${TIER_COLORS[t]}20`, color: TIER_COLORS[t], border: `1px solid ${TIER_COLORS[t]}40` }}>
                        {t.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUse(tpl)}
                disabled={!!creating}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold flex-shrink-0 transition-colors"
                style={{ background: creating === tpl.id ? "#1a1a2e" : "#2282fc", color: "#fff", opacity: creating && creating !== tpl.id ? 0.5 : 1, cursor: creating ? "not-allowed" : "pointer" }}
              >
                {creating === tpl.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {creating === tpl.id ? "Creating..." : "Use Template"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
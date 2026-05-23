import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

const TEMPLATES = [
  {
    id: "mva-tiered-full",
    name: "MVA Tiered (Full)",
    description: "15-step survey with all 4 tiers plus DQ flow. Includes state lookup, fault, medical treatment, contact capture.",
    stepCount: 15,
    tiers: ["shared","t1","t2","t3","t4","dq"],
    sketch: [
      { tier: "shared", count: 9 },
      { tier: "t1", count: 0 },
      { tier: "t2", count: 0 },
      { tier: "dq", count: 2 },
    ],
  },
  {
    id: "mva-fast-track",
    name: "MVA Fast-Track Only",
    description: "T4 path only. For testing fresh-accident flows and quick contact capture without deep qualification.",
    stepCount: 6,
    tiers: ["shared","t4"],
    sketch: [
      { tier: "shared", count: 4 },
      { tier: "t4", count: 2 },
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
      // Create new survey from template
      const newSurvey = await base44.entities.Survey.create({
        name: `${template.name} — copy`,
        slug: `${template.id}-${Date.now().toString(36)}`,
        status: "draft",
        vertical: "mva",
        tiers_active: template.tiers,
        description: template.description,
        step_order: [],
      });
      if (onCreated) onCreated(newSurvey);
      // Navigate to new survey
      window.location.href = `/admin/Surveys/Edit?id=${newSurvey.id}`;
    } catch (e) {
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
                {/* Sketch */}
                <div className="mb-4">
                  <FlowSketch sketch={tpl.sketch} />
                </div>

                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 6 }}>
                  {tpl.name}
                </div>
                <p className="text-sm text-slate-400 mb-4">{tpl.description}</p>

                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
                    {tpl.stepCount} steps
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748b" }}>
                    {tpl.tiers.length} tiers
                  </span>
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
                style={{ background: creating === tpl.id ? "#1a1a2e" : "#2282fc", color: "#fff", opacity: creating && creating !== tpl.id ? 0.5 : 1 }}
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
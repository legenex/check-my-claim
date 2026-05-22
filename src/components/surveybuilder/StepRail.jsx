import React, { useState, useRef, useEffect } from "react";
import {
  List, Calendar, Mail, Phone, Globe, Code, Trophy, Flag,
  AlignLeft, Hash, CheckSquare, ToggleLeft, Search, Layers,
  Webhook, Play, GitBranch, GripVertical, Plus, ChevronDown
} from "lucide-react";
import { TIER_META, STEP_TYPES } from "./constants";

const TYPE_ICONS = {
  single_select: List,
  multi_select: CheckSquare,
  text_input: AlignLeft,
  number_input: Hash,
  email_input: Mail,
  phone_input: Phone,
  date_input: Calendar,
  smart_date: Calendar,
  address_input: Globe,
  yes_no: ToggleLeft,
  lookup: Globe,
  script: Code,
  decision: GitBranch,
  results: Trophy,
  end_dq: Flag,
  custom_page: Layers,
  welcome: Play,
  transition: Layers,
  webhook_send: Webhook,
};

const TIER_CHIPS = ["All", "shared", "t1", "t2", "t3", "t4", "dq"];

export default function StepRail({ survey, steps, activeStepId, onSelectStep, onReorder, onAddStep }) {
  const [tierFilter, setTierFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dragIdx, setDragIdx] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const searchRef = useRef(null);

  const stepOrder = survey?.step_order || [];
  const startId = survey?.start_step_id;

  // Build ordered list from step_order, then append any steps not in step_order
  const orderedSteps = (() => {
    const byId = Object.fromEntries(steps.map(s => [s.id, s]));
    const ordered = stepOrder.map(id => byId[id]).filter(Boolean);
    const inOrder = new Set(stepOrder);
    steps.forEach(s => { if (!inOrder.has(s.id)) ordered.push(s); });
    return ordered;
  })();

  const filtered = orderedSteps.filter(s => {
    const matchTier = tierFilter === "All" || s.tier === tierFilter;
    const matchSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.id?.toLowerCase().includes(search.toLowerCase());
    return matchTier && matchSearch;
  });

  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDropIdx(idx);
  };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDropIdx(null); return; }
    const newOrder = [...orderedSteps];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    onReorder(newOrder.map(s => s.id), newOrder[0]?.id);
    setDragIdx(null);
    setDropIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  // Focus search on Cmd+K
  React.useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0a1320", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Tier filter chips */}
      <div className="p-3 pb-0 flex flex-wrap gap-1.5">
        {TIER_CHIPS.map(t => {
          const meta = t === "All" ? null : TIER_META[t];
          const active = tierFilter === t;
          return (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className="px-2 py-0.5 rounded text-xs font-mono font-semibold transition-all"
              style={{
                background: active ? (meta?.bg || "rgba(255,255,255,0.1)") : "rgba(255,255,255,0.04)",
                color: active ? (meta?.color || "#fff") : "#64748b",
                border: `1px solid ${active ? (meta?.border || "rgba(255,255,255,0.2)") : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {t === "All" ? "All" : (meta?.short || t.toUpperCase())}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded" style={{ background: "#050b14", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search steps… ⌘K"
            className="bg-transparent text-sm outline-none flex-1 text-white placeholder-slate-600"
            style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12 }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && (
          <div className="text-center py-6 text-slate-600 text-xs">No steps match this filter.</div>
        )}
        {filtered.map((step, displayIdx) => {
          const realIdx = orderedSteps.indexOf(step);
          const isStart = step.id === startId;
          const isActive = step.id === activeStepId;
          const meta = TIER_META[step.tier] || TIER_META.shared;
          const Icon = TYPE_ICONS[step.type] || List;
          const variantCount = Object.values(step.variants || {}).filter(v => v && Object.keys(v).some(k => v[k] !== undefined && v[k] !== null && v[k] !== false && (Array.isArray(v[k]) ? v[k].length > 0 : true))).length;
          const isDragTarget = dropIdx === realIdx;

          return (
            <div
              key={step.id}
              draggable
              onDragStart={e => handleDragStart(e, realIdx)}
              onDragOver={e => handleDragOver(e, realIdx)}
              onDrop={e => handleDrop(e, realIdx)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectStep(step.id)}
              className="group relative flex items-center gap-2 px-2.5 py-2 rounded cursor-pointer mb-0.5 transition-all"
              style={{
                background: isActive ? "rgba(34,130,252,0.12)" : "transparent",
                borderLeft: isActive ? `2px solid ${meta.color}` : "2px solid transparent",
                outline: isDragTarget ? `1px dashed ${meta.color}` : "none",
                opacity: dragIdx === realIdx ? 0.4 : 1,
              }}
            >
              {/* Drag handle */}
              <GripVertical className="w-3 h-3 text-slate-700 group-hover:text-slate-500 flex-shrink-0 cursor-grab" />

              {/* Type icon */}
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: meta.color }} />

              {/* Title + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isStart && (
                    <span className="text-xs font-mono font-bold px-1 py-0 rounded" style={{ background: "#3ab54b", color: "#fff", fontSize: 9 }}>START</span>
                  )}
                  <span className="truncate text-xs font-semibold" style={{ color: isActive ? "#fff" : "#94a3b8", fontFamily: "'Manrope', sans-serif", maxWidth: 110 }}>
                    {(step.title || step.id || "Untitled").substring(0, 28)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono" style={{ fontSize: 9, color: "#475569" }}>{step.type}</span>
                  {step.tier && (
                    <span className="font-mono px-1 rounded" style={{ fontSize: 9, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                      {meta.short}
                    </span>
                  )}
                  {variantCount > 0 && (
                    <span className="font-mono px-1 rounded" style={{ fontSize: 9, background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                      +{variantCount}v
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add step */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onAddStep}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-sm font-semibold transition-all hover:bg-white/5"
          style={{ color: "#2282fc", border: "1px dashed rgba(34,130,252,0.35)", fontFamily: "'Manrope', sans-serif" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add step
        </button>
      </div>
    </div>
  );
}
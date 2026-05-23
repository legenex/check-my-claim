import React, { useState, useRef, useEffect, useCallback } from "react";
import { TIER_META } from "./constants";
import {
  List, Calendar, Mail, Phone, Globe, Code, Trophy, Flag,
  AlignLeft, Hash, CheckSquare, ToggleLeft, Layers, Webhook,
  Play, GitBranch, ZoomIn, ZoomOut, Maximize2
} from "lucide-react";

const TYPE_ICONS = {
  single_select: List, multi_select: CheckSquare, text_input: AlignLeft,
  number_input: Hash, email_input: Mail, phone_input: Phone,
  date_input: Calendar, smart_date: Calendar, address_input: Globe,
  yes_no: ToggleLeft, lookup: Globe, script: Code, decision: GitBranch,
  results: Trophy, end_dq: Flag, custom_page: Layers, welcome: Play,
  transition: Layers, webhook_send: Webhook,
};

const COLUMNS = ["shared","t1","t2","t3","t4","dq"];
const COL_WIDTH = 272;
const COL_GAP = 20;
const ROW_HEIGHT = 88;
const ROW_GAP = 18;
const CARD_W = 252;
const CARD_H = 76;
const HEADER_H = 56;
const PAD = 24;

function getColIndex(tier) { return COLUMNS.indexOf(tier) !== -1 ? COLUMNS.indexOf(tier) : 0; }

function getCardPos(step, stepOrder) {
  const rowIndex = stepOrder.indexOf(step.id);
  const colIndex = getColIndex(step.tier);
  const x = PAD + colIndex * (COL_WIDTH + COL_GAP);
  const y = HEADER_H + PAD + rowIndex * (ROW_HEIGHT + ROW_GAP);
  return { x, y };
}

function buildEdges(steps, stepOrder) {
  const edges = [];
  steps.forEach(step => {
    const src = getCardPos(step, stepOrder);
    const srcMid = { x: src.x + CARD_W / 2, y: src.y + CARD_H };

    // Primary else_target
    if (step.else_target_step_id) {
      const tgt = steps.find(s => s.id === step.else_target_step_id);
      if (tgt) {
        const tpos = getCardPos(tgt, stepOrder);
        const tMid = { x: tpos.x + CARD_W / 2, y: tpos.y };
        const tierColor = TIER_META[tgt.tier]?.color || "#64748b";
        edges.push({ id: `${step.id}->${tgt.id}-else`, sx: srcMid.x, sy: srcMid.y, tx: tMid.x, ty: tMid.y, color: tierColor, dashed: false });
      }
    }

    // Branching rules
    const rules = step.branching_rules || [];
    rules.forEach((rule, ri) => {
      if (!rule.target_step_id) return;
      const tgt = steps.find(s => s.id === rule.target_step_id);
      if (!tgt) return;
      const tpos = getCardPos(tgt, stepOrder);
      const tMid = { x: tpos.x + CARD_W / 2, y: tpos.y };
      const tierColor = TIER_META[tgt.tier]?.color || "#64748b";
      edges.push({ id: `${step.id}->${tgt.id}-rule${ri}`, sx: srcMid.x + (ri - rules.length / 2) * 10, sy: srcMid.y, tx: tMid.x, ty: tMid.y, color: tierColor, dashed: true });
    });

    // Answer branching
    (step.answer_options || []).forEach((opt, oi) => {
      if (!opt.target_step_id) return;
      const tgt = steps.find(s => s.id === opt.target_step_id);
      if (!tgt) return;
      const tpos = getCardPos(tgt, stepOrder);
      const tMid = { x: tpos.x + CARD_W / 2, y: tpos.y };
      const tierColor = TIER_META[tgt.tier]?.color || "#64748b";
      edges.push({ id: `${step.id}->${tgt.id}-opt${oi}`, sx: srcMid.x + oi * 8, sy: srcMid.y, tx: tMid.x, ty: tMid.y, color: tierColor, dashed: true });
    });
  });
  return edges;
}

function CubicArrow({ sx, sy, tx, ty, color, dashed }) {
  const dy = Math.abs(ty - sy);
  const cp1y = sy + Math.max(40, dy * 0.4);
  const cp2y = ty - Math.max(40, dy * 0.4);
  const d = `M ${sx} ${sy} C ${sx} ${cp1y} ${tx} ${cp2y} ${tx} ${ty}`;
  const arrowSize = 6;
  const angle = Math.atan2(ty - cp2y, tx - tx) + Math.PI / 2;
  const ax1 = tx - arrowSize * Math.cos(angle - 0.5);
  const ay1 = ty - arrowSize * Math.sin(angle - 0.5);
  const ax2 = tx - arrowSize * Math.cos(angle + 0.5);
  const ay2 = ty - arrowSize * Math.sin(angle + 0.5);
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5}
        strokeDasharray={dashed ? "5,4" : undefined} strokeOpacity={0.7} />
      <polygon points={`${tx},${ty} ${ax1},${ay1} ${ax2},${ay2}`} fill={color} fillOpacity={0.8} />
    </g>
  );
}

function StepCard({ step, stepOrder, isActive, isStart, onClick }) {
  const meta = TIER_META[step.tier] || TIER_META.shared;
  const Icon = TYPE_ICONS[step.type] || List;
  const pos = getCardPos(step, stepOrder);
  const variantCount = Object.values(step.variants || {}).filter(v => v && Object.keys(v).length > 0).length;

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onClick={() => onClick(step)}
      style={{ cursor: "pointer" }}
    >
      {/* Card shadow */}
      <rect x={2} y={4} width={CARD_W} height={CARD_H} rx={5} fill="rgba(0,0,0,0.4)" />
      {/* Card bg */}
      <rect
        width={CARD_W} height={CARD_H} rx={4}
        fill={isActive ? "rgba(34,130,252,0.18)" : "#0d1f36"}
        stroke={isActive ? "#2282fc" : meta.color}
        strokeWidth={isActive ? 1.5 : 0.6}
        strokeOpacity={isActive ? 1 : 0.35}
      />
      {/* Tier left border */}
      <rect x={0} y={0} width={3} height={CARD_H} rx={2} fill={meta.color} fillOpacity={0.9} />

      {/* Icon */}
      <foreignObject x={10} y={12} width={18} height={18}>
        <Icon style={{ width: 14, height: 14, color: meta.color }} />
      </foreignObject>

      {/* Title */}
      <text x={32} y={26} fill="#e2e8f0" fontSize={12} fontWeight={600} fontFamily="'Manrope', sans-serif">
        {(step.title || step.id || "Untitled").substring(0, 28)}
      </text>

      {/* Subtitle (type) */}
      <text x={32} y={42} fill="#475569" fontSize={10} fontFamily="'JetBrains Mono', monospace">
        {step.type}
      </text>

      {/* START badge */}
      {isStart && (
        <>
          <rect x={10} y={50} width={32} height={14} rx={3} fill="#3ab54b" />
          <text x={26} y={60} fill="#fff" fontSize={8} fontWeight={700} textAnchor="middle" fontFamily="'Manrope', sans-serif">START</text>
        </>
      )}

      {/* Variants badge */}
      {variantCount > 0 && (
        <>
          <rect x={CARD_W - 32} y={8} width={22} height={14} rx={3} fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.4)" strokeWidth={0.8} />
          <text x={CARD_W - 21} y={18} fill="#a78bfa" fontSize={9} fontWeight={700} textAnchor="middle" fontFamily="'Manrope', sans-serif">+{variantCount}v</text>
        </>
      )}
    </g>
  );
}

export default function FlowCanvas({ survey, steps, activeStepId, onSelectStep }) {
  const containerRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.9);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const panRef = useRef(pan);
  panRef.current = pan;

  const stepOrder = survey?.step_order || [];
  const startId = survey?.start_step_id;

  // Canvas size
  const totalCols = COLUMNS.length;
  const totalRows = stepOrder.length;
  const canvasW = PAD * 2 + totalCols * COL_WIDTH + (totalCols - 1) * COL_GAP;
  const canvasH = HEADER_H + PAD * 2 + totalRows * ROW_HEIGHT + (totalRows - 1) * ROW_GAP + 40;

  const edges = buildEdges(steps, stepOrder);

  // Pan & zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY * 0.01;
      setZoom(z => Math.min(2, Math.max(0.3, z + delta)));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e) => {
    if (e.target.tagName === "svg" || e.target.tagName === "rect" && e.target.classList.contains("bg")) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y });
    }
  };
  const handleMouseMove = (e) => {
    if (!isPanning || !panStart) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMouseUp = () => { setIsPanning(false); setPanStart(null); };

  const fitToScreen = () => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const scaleX = width / canvasW;
    const scaleY = height / canvasH;
    const s = Math.min(scaleX, scaleY, 1) * 0.9;
    setZoom(s);
    setPan({ x: (width - canvasW * s) / 2, y: 20 });
  };

  useEffect(() => { setTimeout(fitToScreen, 50); }, [steps.length]);

  // Column step counts
  const countByTier = {};
  COLUMNS.forEach(c => { countByTier[c] = steps.filter(s => s.tier === c).length; });

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden select-none"
      style={{ background: "#050b14", cursor: isPanning ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "absolute" }}>
        <svg width={canvasW} height={canvasH} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", overflow: "visible" }}>
          {/* Column backgrounds */}
          {COLUMNS.map((col, ci) => {
            const meta = TIER_META[col];
            const cx = PAD + ci * (COL_WIDTH + COL_GAP);
            return (
              <rect key={col}
                x={cx - 10} y={0} width={COL_WIDTH + 20} height={canvasH}
                fill={meta.color} fillOpacity={0.025} rx={4}
              />
            );
          })}
          {/* Edges */}
          {edges.map(e => (
            <CubicArrow key={e.id} sx={e.sx} sy={e.sy} tx={e.tx} ty={e.ty} color={e.color} dashed={e.dashed} />
          ))}
        </svg>

        {/* Column headers */}
        {COLUMNS.map((col, ci) => {
          const meta = TIER_META[col];
          const cx = PAD + ci * (COL_WIDTH + COL_GAP);
          return (
            <div key={col} style={{ position: "absolute", left: cx, top: 8, width: COL_WIDTH, textAlign: "center" }}>
              <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 4, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>
                {meta.label} <span style={{ opacity: 0.6, fontWeight: 400 }}>({countByTier[col] || 0})</span>
              </span>
            </div>
          );
        })}

        {/* Row index lines */}
        {stepOrder.map((_, ri) => {
          const y = HEADER_H + PAD + ri * (ROW_HEIGHT + ROW_GAP) + CARD_H / 2;
          return (
            <div key={ri} style={{ position: "absolute", left: PAD, top: y, width: canvasW - PAD * 2, height: 1, background: "rgba(255,255,255,0.025)", pointerEvents: "none" }} />
          );
        })}

        {/* Step cards (SVG-based) */}
        <svg width={canvasW} height={canvasH} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
          {steps.map(step => (
            <StepCard
              key={step.id}
              step={step}
              stepOrder={stepOrder}
              isActive={step.id === activeStepId}
              isStart={step.id === startId}
              onClick={(s) => onSelectStep(s.id)}
            />
          ))}
        </svg>
      </div>

      {/* Zoom controls */}
      <div style={{ position: "absolute", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} style={zoomBtn}>
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))} style={zoomBtn}>
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={fitToScreen} style={zoomBtn}>
          <Maximize2 className="w-4 h-4" />
        </button>
        <div style={{ ...zoomBtn, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#64748b", cursor: "default", justifyContent: "center", display: "flex", alignItems: "center" }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Mini-map */}
      <MiniMap survey={survey} steps={steps} canvasW={canvasW} canvasH={canvasH} pan={pan} zoom={zoom} onJump={setPan} />
    </div>
  );
}

const zoomBtn = {
  width: 32, height: 32, borderRadius: 4, background: "#0a1320",
  border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
};

function MiniMap({ survey, steps, canvasW, canvasH, pan, zoom, onJump }) {
  const MM_W = 180, MM_H = 120;
  const scaleX = MM_W / canvasW;
  const scaleY = MM_H / canvasH;
  const stepOrder = survey?.step_order || [];

  return (
    <div style={{ position: "absolute", bottom: 24, left: 24, width: MM_W, height: MM_H, background: "#0a1320", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden", zIndex: 10 }}>
      <svg width={MM_W} height={MM_H}>
        {steps.map(step => {
          const pos = getCardPos(step, stepOrder);
          const meta = TIER_META[step.tier] || TIER_META.shared;
          return (
            <rect key={step.id}
              x={pos.x * scaleX} y={pos.y * scaleY}
              width={CARD_W * scaleX} height={CARD_H * scaleY}
              fill={meta.color} fillOpacity={0.4} rx={1}
            />
          );
        })}
        {/* Viewport indicator */}
        <rect
          x={-pan.x / zoom * scaleX} y={-pan.y / zoom * scaleY}
          width={(canvasW / zoom) * scaleX * (1 / zoom)} height={(canvasH / zoom) * scaleY * (1 / zoom)}
          fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1}
        />
      </svg>
    </div>
  );
}
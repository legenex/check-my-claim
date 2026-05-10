import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

/**
 * EmbeddedQuiz — renders the full Decision Tree runtime inline (no outer chrome).
 * Passes all URL params through to DecisionTreeRun.
 * Calls onFirstInteraction when the user clicks their first answer.
 */
export default function EmbeddedQuiz({ quizId, onFirstInteraction }) {
  const [quiz, setQuiz] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [pathTaken, setPathTaken] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const hasInteracted = useRef(false);
  const runId = useRef(null);
  const sessionId = useRef(`lp_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || sessionStorage.getItem("cmc_utm_source") || "";
  const utmMedium = urlParams.get("utm_medium") || sessionStorage.getItem("cmc_utm_medium") || "";
  const utmCampaign = urlParams.get("utm_campaign") || sessionStorage.getItem("cmc_utm_campaign") || "";
  const brandColor = quiz?.brand_color || "#1e90ff";

  useEffect(() => {
    if (!quizId) { setLoading(false); return; }
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const quizzes = await base44.entities.Quiz.filter({ id: quizId });
      if (!quizzes.length) { setLoading(false); return; }
      const q = quizzes[0];
      setQuiz(q);
      const [qs, es] = await Promise.all([
        base44.entities.Question.filter({ quiz_id: q.id }),
        base44.entities.Edge.filter({ quiz_id: q.id }),
      ]);
      setNodes(qs);
      setEdges(es);
      const startNode = qs.find(n => n.node_type === "start") || qs[0];
      if (startNode) {
        setCurrentNodeId(startNode.node_id);
        setPathTaken([startNode.node_id]);
      }
      // Create DecisionTreeRun
      const run = await base44.entities.DecisionTreeRun.create({
        quiz_id: q.id,
        session_id: sessionId.current,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        path_taken: startNode ? [startNode.node_id] : [],
        completed: false,
        source_page: window.location.pathname,
      });
      runId.current = run.id;
    } catch (e) {
      console.error("EmbeddedQuiz load error:", e);
    }
    setLoading(false);
  };

  const updateRun = async (patch) => {
    if (!runId.current) return;
    base44.entities.DecisionTreeRun.update(runId.current, patch).catch(() => {});
  };

  const handleAnswer = async (edgeOrValue) => {
    // Fire first-interaction callback once
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      onFirstInteraction?.();
    }

    const outEdges = edges.filter(e => e.source_node_id === currentNodeId);
    let nextEdge = null;
    if (typeof edgeOrValue === "string" && edgeOrValue.startsWith("edge:")) {
      nextEdge = outEdges.find(e => e.id === edgeOrValue.replace("edge:", "")) || outEdges[0];
    } else {
      nextEdge = outEdges.find(e => e.condition_value === edgeOrValue) ||
        outEdges.find(e => !e.condition_value) ||
        outEdges[0];
    }
    if (!nextEdge?.target_node_id) return;

    const newPath = [...pathTaken, nextEdge.target_node_id];
    setPathTaken(newPath);
    setCurrentNodeId(nextEdge.target_node_id);
    await updateRun({ path_taken: newPath, field_values: fieldValues });

    const nextNode = nodes.find(n => n.node_id === nextEdge.target_node_id);
    if (nextNode?.node_type === "qualified" || nextNode?.node_type === "disqualified" || nextNode?.node_type === "outcome") {
      const outcomeVal = nextNode.node_type === "qualified" ? "qualified" : nextNode.node_type === "disqualified" ? "disqualified" : "completed";
      setOutcome(outcomeVal);
      await updateRun({ completed: true, outcome: outcomeVal, path_taken: newPath, field_values: fieldValues });
    }
  };

  const handleFieldChange = (key, value) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ width: 32, height: 32, border: "4px solid #e2e8f0", borderTopColor: "#1e90ff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
    </div>
  );

  if (!quiz) return (
    <div style={{ textAlign: "center", padding: "32px", color: "#64748b", background: "#f8fafc", borderRadius: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>Quiz not available</p>
      <p style={{ fontSize: 13 }}>The linked Decision Tree could not be loaded.</p>
    </div>
  );

  const currentNode = nodes.find(n => n.node_id === currentNodeId);

  if (outcome) {
    return <OutcomeScreen outcome={outcome} node={currentNode} quiz={quiz} brandColor={brandColor} />;
  }

  return (
    <div>
      {/* Progress indicator */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.min((pathTaken.length / Math.max(nodes.length, 1)) * 100, 100)}%`,
            background: brandColor,
            borderRadius: 2,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {currentNode ? (
        <NodeRenderer
          node={currentNode}
          edges={edges.filter(e => e.source_node_id === currentNodeId)}
          fieldValues={fieldValues}
          onAnswer={handleAnswer}
          onFieldChange={handleFieldChange}
          brandColor={brandColor}
        />
      ) : (
        <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>Loading question...</div>
      )}
    </div>
  );
}

function NodeRenderer({ node, edges, fieldValues, onAnswer, onFieldChange, brandColor }) {
  const [inputValue, setInputValue] = useState(fieldValues[node.field_key] || "");
  const config = node.config || {};
  const label = node.label || node.node_type;
  const options = config.options?.length > 0 ? config.options :
    edges.map(e => ({ label: e.label || e.condition_value || "Continue", value: e.condition_value || "default", edgeId: e.id }));

  const handleSubmit = () => {
    if (node.field_key) onFieldChange(node.field_key, inputValue);
    onAnswer(inputValue);
  };

  // Choice nodes (multiple choice, yes/no, question)
  if (["question", "yes_no", "multiple_choice", "single_choice"].includes(node.node_type)) {
    return (
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{label}</h3>
        {config.description && <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>{config.description}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {options.map((opt, i) => (
            <ChoiceButton key={i} label={opt.label} brandColor={brandColor}
              onClick={() => onAnswer(opt.value || `edge:${opt.edgeId}`)} />
          ))}
        </div>
      </div>
    );
  }

  // Text inputs
  if (["text_input", "date_input", "number_input", "email_input", "phone_input"].includes(node.node_type)) {
    const inputType = node.node_type === "date_input" ? "date" : node.node_type === "number_input" ? "number" : node.node_type === "email_input" ? "email" : node.node_type === "phone_input" ? "tel" : "text";
    return (
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{label}</h3>
        {config.description && <p style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>{config.description}</p>}
        <input type={inputType} value={inputValue} onChange={e => setInputValue(e.target.value)}
          placeholder={config.placeholder || ""}
          style={{ width: "100%", border: `2px solid #e2e8f0`, borderRadius: 12, padding: "14px 16px", fontSize: 16, marginTop: 8, outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = brandColor}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
        <button onClick={handleSubmit} disabled={!inputValue}
          style={{ marginTop: 12, width: "100%", padding: "14px", borderRadius: 12, fontWeight: 700, color: "#fff", fontSize: 16, border: "none", cursor: "pointer", background: inputValue ? brandColor : "#cbd5e1", transition: "all 0.2s" }}>
          Continue →
        </button>
      </div>
    );
  }

  // Start / Info
  if (["info", "statement", "start"].includes(node.node_type)) {
    return (
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>{label}</h3>
        {config.description && <p style={{ fontSize: 15, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>{config.description}</p>}
        <button onClick={() => onAnswer("default")}
          style={{ padding: "14px 32px", borderRadius: 12, fontWeight: 700, color: "#fff", fontSize: 16, border: "none", cursor: "pointer", background: brandColor }}>
          {config.cta_text || "Get Started →"}
        </button>
      </div>
    );
  }

  // Fallback
  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>{label}</h3>
      <button onClick={() => onAnswer("default")}
        style={{ width: "100%", padding: "14px", borderRadius: 12, fontWeight: 700, color: "#fff", fontSize: 16, border: "none", cursor: "pointer", background: brandColor }}>
        Continue →
      </button>
    </div>
  );
}

function ChoiceButton({ label, brandColor, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "14px 18px",
        borderRadius: 12,
        border: `2px solid ${hovered ? brandColor : "#e2e8f0"}`,
        background: hovered ? brandColor : "#f8fafc",
        color: hovered ? "#fff" : "#1e293b",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
        transition: "all 0.12s ease",
      }}>
      {label}
    </button>
  );
}

function OutcomeScreen({ outcome, node, quiz, brandColor }) {
  const config = node?.config || {};
  const isQualified = outcome === "qualified";
  const ctaUrl = config.cta_url || quiz?.primary_cta_url || "https://qualify.checkmyclaim.co/s/mva";
  const ctaText = config.cta_text || (isQualified ? "Connect With an Attorney →" : "Learn More →");
  const heading = config.heading || node?.label || (isQualified ? "You May Qualify!" : "Thank You");
  const message = config.message || (isQualified ? "Based on your answers, you may be eligible for compensation. Connect with a vetted attorney now." : "Thank you for completing the quiz.");

  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: isQualified ? "#dcfce7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
        {isQualified ? "✓" : "✗"}
      </div>
      <h3 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>{heading}</h3>
      <p style={{ fontSize: 15, color: "#475569", marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <a href={ctaUrl}
        style={{ display: "inline-block", padding: "14px 32px", borderRadius: 12, fontWeight: 700, color: "#fff", fontSize: 16, textDecoration: "none", background: brandColor }}>
        {ctaText}
      </a>
    </div>
  );
}
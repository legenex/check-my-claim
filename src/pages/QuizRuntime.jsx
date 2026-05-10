import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-[#2BB6F6] rounded-full animate-spin" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Quiz Not Found</h1>
        <a href="/" className="text-[#2BB6F6] hover:underline">← Back to Check My Claim</a>
      </div>
    </div>
  );
}

export default function QuizRuntime() {
  const { slug } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [pathTaken, setPathTaken] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const sessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const runId = useRef(null);

  // Get UTM params and brand from URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || "";
  const utmMedium = urlParams.get("utm_medium") || "";
  const utmCampaign = urlParams.get("utm_campaign") || "";
  const brandParam = urlParams.get("brand") || "";

  useEffect(() => {
    loadQuiz();
  }, [slug]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const quizzes = await base44.entities.Quiz.filter({ slug, status: "Published" });
      if (quizzes.length === 0) { setLoading(false); return; }
      const q = quizzes[0];
      setQuiz(q);

      const [qs, es] = await Promise.all([
        base44.entities.Question.filter({ quiz_id: q.id }),
        base44.entities.Edge.filter({ quiz_id: q.id }),
      ]);
      setNodes(qs);
      setEdges(es);

      // Find start node
      const startNode = qs.find(n => n.node_type === "start") || qs[0];
      if (startNode) {
        setCurrentNodeId(startNode.node_id);
        setPathTaken([startNode.node_id]);
      }

      // Create run record
      const run = await base44.entities.DecisionTreeRun.create({
        quiz_id: q.id,
        session_id: sessionId.current,
        brand_id: brandParam,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        path_taken: startNode ? [startNode.node_id] : [],
        completed: false,
      });
      runId.current = run.id;
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateRun = async (patch) => {
    if (!runId.current) return;
    await base44.entities.DecisionTreeRun.update(runId.current, patch);
  };

  const currentNode = nodes.find(n => n.node_id === currentNodeId);

  const advanceToNode = async (nextNodeId, answer) => {
    const newPath = [...pathTaken, nextNodeId];
    setPathTaken(newPath);
    setCurrentNodeId(nextNodeId);
    await updateRun({ path_taken: newPath, field_values: fieldValues });

    const nextNode = nodes.find(n => n.node_id === nextNodeId);
    if (nextNode?.node_type === "outcome" || nextNode?.node_type === "qualified" || nextNode?.node_type === "disqualified") {
      const outcomeVal = nextNode.node_type === "qualified" ? "qualified" : nextNode.node_type === "disqualified" ? "disqualified" : "completed";
      setOutcome(outcomeVal);
      await updateRun({ completed: true, outcome: outcomeVal, path_taken: newPath, field_values: fieldValues });
    }
  };

  const handleAnswer = async (edgeOrValue) => {
    // Find next node based on edge condition or value
    const outEdges = edges.filter(e => e.source_node_id === currentNodeId);
    let nextEdge = null;

    if (typeof edgeOrValue === "string" && edgeOrValue.startsWith("edge:")) {
      // Direct edge id
      nextEdge = outEdges.find(e => e.id === edgeOrValue.replace("edge:", "")) || outEdges[0];
    } else {
      // Match by condition value or fallback to default
      nextEdge = outEdges.find(e => e.condition_value === edgeOrValue) ||
                 outEdges.find(e => !e.condition_value) ||
                 outEdges[0];
    }

    if (nextEdge?.target_node_id) {
      await advanceToNode(nextEdge.target_node_id, edgeOrValue);
    }
  };

  const handleFieldChange = (key, value) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <LoadingScreen />;
  if (!quiz) return <NotFound />;

  // Apply brand styles from quiz config
  const brandColor = quiz.brand_color || "#1e90ff";
  const bgColor = quiz.background_color || "#ffffff";
  const logoUrl = quiz.logo_url || "";

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <div className="py-4 px-6 border-b border-slate-200 flex items-center justify-between max-w-2xl mx-auto">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
        ) : (
          <div className="text-lg font-bold" style={{ color: brandColor }}>{quiz.title}</div>
        )}
        <div className="text-xs text-slate-400">{pathTaken.length} / {nodes.length} steps</div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200">
        <div className="h-1 transition-all duration-500" style={{ width: `${Math.min((pathTaken.length / Math.max(nodes.length, 1)) * 100, 100)}%`, backgroundColor: brandColor }} />
      </div>

      {/* Node content */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {outcome ? (
          <OutcomeScreen outcome={outcome} node={currentNode} brandColor={brandColor} quiz={quiz} />
        ) : currentNode ? (
          <NodeRenderer
            node={currentNode}
            edges={edges.filter(e => e.source_node_id === currentNodeId)}
            fieldValues={fieldValues}
            onAnswer={handleAnswer}
            onFieldChange={handleFieldChange}
            brandColor={brandColor}
          />
        ) : (
          <div className="text-center text-slate-400">Loading question...</div>
        )}
      </div>
    </div>
  );
}

function NodeRenderer({ node, edges, fieldValues, onAnswer, onFieldChange, brandColor }) {
  const [inputValue, setInputValue] = useState(fieldValues[node.field_key] || "");

  const config = node.config || {};
  const label = node.label || node.node_type;
  const options = config.options || edges.map(e => ({ label: e.label || e.condition_value || "Continue", value: e.condition_value || "default", edgeId: e.id }));

  const handleSubmit = () => {
    if (node.field_key) onFieldChange(node.field_key, inputValue);
    onAnswer(inputValue);
  };

  // Multiple choice / yes-no / button options
  if (["question", "yes_no", "multiple_choice", "single_choice"].includes(node.node_type)) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{label}</h2>
        {config.description && <p className="text-slate-500 mb-6">{config.description}</p>}
        <div className="space-y-3 mt-6">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(opt.value || `edge:${opt.edgeId}`)}
              className="w-full text-left px-5 py-4 rounded-xl border-2 border-slate-200 hover:border-opacity-100 font-semibold text-slate-700 hover:text-white transition-all duration-150"
              style={{ "--hover-bg": brandColor }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = brandColor; e.currentTarget.style.borderColor = brandColor; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Text input / date / number
  if (["text_input", "date_input", "number_input", "email_input", "phone_input"].includes(node.node_type)) {
    const inputType = node.node_type === "date_input" ? "date" : node.node_type === "number_input" ? "number" : node.node_type === "email_input" ? "email" : node.node_type === "phone_input" ? "tel" : "text";
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{label}</h2>
        {config.description && <p className="text-slate-500 mb-6">{config.description}</p>}
        <input
          type={inputType}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={config.placeholder || ""}
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg focus:outline-none mt-4"
          style={{ "--focus-border": brandColor }}
          onFocus={e => e.target.style.borderColor = brandColor}
          onBlur={e => e.target.style.borderColor = ""}
        />
        <button
          onClick={handleSubmit}
          disabled={!inputValue}
          className="mt-4 w-full py-3 rounded-xl font-bold text-white text-lg disabled:opacity-40 transition-all"
          style={{ backgroundColor: brandColor }}
        >
          Continue →
        </button>
      </div>
    );
  }

  // Info / statement node
  if (["info", "statement", "start"].includes(node.node_type)) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{label}</h2>
        {config.description && <p className="text-slate-600 mb-8 text-lg">{config.description}</p>}
        <button
          onClick={() => onAnswer("default")}
          className="px-10 py-4 rounded-xl font-bold text-white text-lg transition-all"
          style={{ backgroundColor: brandColor }}
        >
          {config.cta_text || "Get Started →"}
        </button>
      </div>
    );
  }

  // Fallback: just show a continue button
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{label}</h2>
      <button
        onClick={() => onAnswer("default")}
        className="w-full py-3 rounded-xl font-bold text-white text-lg transition-all"
        style={{ backgroundColor: brandColor }}
      >
        Continue →
      </button>
    </div>
  );
}

function OutcomeScreen({ outcome, node, brandColor, quiz }) {
  const config = node?.config || {};
  const isQualified = outcome === "qualified";
  const ctaUrl = config.cta_url || quiz.primary_cta_url || "https://qualify.checkmyclaim.co/s/mva";
  const ctaText = config.cta_text || (isQualified ? "Connect With an Attorney →" : "Learn More →");
  const heading = config.heading || node?.label || (isQualified ? "You May Qualify!" : "Thank You");
  const message = config.message || node?.description || (isQualified ? "Based on your answers, you may be eligible for compensation." : "Thank you for completing the quiz.");

  return (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl ${isQualified ? "bg-green-100" : "bg-slate-100"}`}>
        {isQualified ? "✓" : "✗"}
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">{heading}</h2>
      <p className="text-slate-600 mb-8 text-lg">{message}</p>
      {isQualified && (
        <a
          href={ctaUrl}
          className="inline-block px-10 py-4 rounded-xl font-bold text-white text-lg transition-all"
          style={{ backgroundColor: brandColor }}
        >
          {ctaText}
        </a>
      )}
    </div>
  );
}
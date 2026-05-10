import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BuilderTopBar from "@/components/decisiontrees/builder/BuilderTopBar";
import BasicModeBuilder from "@/components/decisiontrees/builder/BasicModeBuilder";
import AdvancedModeBuilder from "@/components/decisiontrees/builder/AdvancedModeBuilder";

export default function DecisionTreeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const autoSaveTimer = useRef(null);

  useEffect(() => {
    loadTree();
  }, [id]);

  const loadTree = async () => {
    setLoading(true);
    const [quizList, qs, es] = await Promise.all([
      base44.entities.Quiz.filter({ id }),
      base44.entities.Question.filter({ quiz_id: id }),
      base44.entities.Edge.filter({ quiz_id: id }),
    ]);
    setQuiz(quizList[0] || null);
    setNodes(qs);
    setEdges(es);
    setLoading(false);
  };

  const saveTree = useCallback(async (quizPatch, nodeUpdates, edgeUpdates) => {
    setSaving(true);
    try {
      if (quizPatch) await base44.entities.Quiz.update(id, quizPatch);
      if (nodeUpdates) {
        for (const node of nodeUpdates) {
          if (node._new) {
            const created = await base44.entities.Question.create({ ...node, _new: undefined });
            setNodes(prev => prev.map(n => n.node_id === node.node_id ? created : n));
          } else if (node._deleted) {
            if (node.id) await base44.entities.Question.delete(node.id);
          } else if (node.id) {
            await base44.entities.Question.update(node.id, node);
          }
        }
      }
      if (edgeUpdates) {
        for (const edge of edgeUpdates) {
          if (edge._new) {
            await base44.entities.Edge.create({ ...edge, _new: undefined });
          } else if (edge._deleted) {
            if (edge.id) await base44.entities.Edge.delete(edge.id);
          } else if (edge.id) {
            await base44.entities.Edge.update(edge.id, edge);
          }
        }
      }
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  }, [id]);

  const updateQuiz = useCallback((patch) => {
    setQuiz(prev => ({ ...prev, ...patch }));
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      base44.entities.Quiz.update(id, patch).then(() => setLastSaved(new Date()));
    }, 5000);
  }, [id]);

  const switchMode = async (newMode) => {
    const updated = { ...quiz, builder_mode: newMode };
    setQuiz(updated);
    await base44.entities.Quiz.update(id, { builder_mode: newMode });
  };

  const publishTree = async () => {
    setSaving(true);
    const newVersion = (quiz.version || 1) + 1;
    const patch = {
      status: "Published",
      version: newVersion,
      published_at: new Date().toISOString(),
      total_nodes: nodes.length,
      total_edges: edges.length,
    };
    await base44.entities.Quiz.update(id, patch);
    setQuiz(prev => ({ ...prev, ...patch }));
    setSaving(false);
    setLastSaved(new Date());
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-[#1e90ff] rounded-full animate-spin" />
    </div>
  );

  if (!quiz) return (
    <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-xl font-bold mb-2">Decision tree not found</p>
        <button onClick={() => navigate("/admin/DecisionTrees")} className="text-[#1e90ff] hover:underline text-sm">← Back to list</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#0a1628] flex flex-col overflow-hidden">
      <BuilderTopBar
        quiz={quiz}
        saving={saving}
        lastSaved={lastSaved}
        onTitleChange={(t) => updateQuiz({ title: t })}
        onModeSwitch={switchMode}
        onPublish={publishTree}
        onBack={() => navigate("/admin/DecisionTrees")}
        onViewAnalytics={() => navigate(`/admin/DecisionTrees/${id}/analytics`)}
      />
      <div className="flex-1 overflow-hidden">
        {quiz.builder_mode === "basic" ? (
          <BasicModeBuilder
            quiz={quiz}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            onSave={saveTree}
            onQuizUpdate={updateQuiz}
          />
        ) : (
          <AdvancedModeBuilder
            quiz={quiz}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            onSave={saveTree}
            onQuizUpdate={updateQuiz}
          />
        )}
      </div>
    </div>
  );
}
import React, { useCallback, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import DecisionTreeNode from "./DecisionTreeNode";
import NodeInspector from "./NodeInspector";
import NodePalette from "./NodePalette";
import { getNodeLabel } from "./nodeConfig";

const nodeTypes = { decisionTreeNode: DecisionTreeNode };

function dbNodesToFlow(nodes, selectedId, onSelect, onDelete) {
  return nodes.map(n => ({
    id: n.node_id,
    type: "decisionTreeNode",
    position: { x: n.position_x || 100, y: n.position_y || 100 },
    data: { node: n, onSelect, onDelete },
    selected: n.node_id === selectedId,
  }));
}

function dbEdgesToFlow(edges) {
  return edges.map(e => ({
    id: e.id || `edge_${e.source_node_id}_${e.target_node_id}`,
    source: e.source_node_id,
    target: e.target_node_id,
    label: e.label || e.condition_value || "",
    style: { stroke: "#334155" },
    labelStyle: { fill: "#94a3b8", fontSize: 11 },
    _dbId: e.id,
    _dbEdge: e,
  }));
}

export default function AdvancedModeBuilder({ quiz, nodes, edges, setNodes, setEdges, selectedNodeId, setSelectedNodeId, onSave, onQuizUpdate }) {
  const [showPalette, setShowPalette] = React.useState(false);

  const selectedNode = nodes.find(n => n.node_id === selectedNodeId);

  const handleSelect = useCallback((nodeId) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
  }, [setSelectedNodeId]);

  const handleDelete = useCallback(async (nodeId) => {
    const node = nodes.find(n => n.node_id === nodeId);
    if (node?.id) await base44.entities.Question.delete(node.id);
    const relatedEdges = edges.filter(e => e.source_node_id === nodeId || e.target_node_id === nodeId);
    for (const e of relatedEdges) {
      if (e.id) await base44.entities.Edge.delete(e.id);
    }
    setNodes(prev => prev.filter(n => n.node_id !== nodeId));
    setEdges(prev => prev.filter(e => e.source_node_id !== nodeId && e.target_node_id !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [nodes, edges, selectedNodeId]);

  const flowNodes = dbNodesToFlow(nodes, selectedNodeId, handleSelect, handleDelete);
  const flowEdges = dbEdgesToFlow(edges);

  const onNodeDragStop = useCallback(async (event, flowNode) => {
    const dbNode = nodes.find(n => n.node_id === flowNode.id);
    if (dbNode?.id) {
      await base44.entities.Question.update(dbNode.id, {
        position_x: Math.round(flowNode.position.x),
        position_y: Math.round(flowNode.position.y),
      });
      setNodes(prev => prev.map(n => n.node_id === flowNode.id
        ? { ...n, position_x: Math.round(flowNode.position.x), position_y: Math.round(flowNode.position.y) }
        : n
      ));
    }
  }, [nodes]);

  const onConnect = useCallback(async (connection) => {
    const newEdge = {
      quiz_id: quiz.id,
      source_node_id: connection.source,
      target_node_id: connection.target,
      label: "",
      condition_value: "",
    };
    const created = await base44.entities.Edge.create(newEdge);
    setEdges(prev => [...prev, created]);
  }, [quiz.id]);

  const onEdgeClick = useCallback(async (event, flowEdge) => {
    if (window.confirm("Delete this connection?")) {
      if (flowEdge._dbId) await base44.entities.Edge.delete(flowEdge._dbId);
      setEdges(prev => prev.filter(e => e.id !== flowEdge._dbId));
    }
  }, []);

  const addNode = async (type) => {
    const newNode = {
      quiz_id: quiz.id,
      node_id: `node_${type}_${Date.now()}`,
      node_type: type,
      label: getNodeLabel(type),
      position_x: 300,
      position_y: 200 + nodes.length * 80,
      config: {},
    };
    const created = await base44.entities.Question.create(newNode);
    setNodes(prev => [...prev, created]);
    setShowPalette(false);
  };

  const updateNode = async (updated) => {
    if (updated.id) await base44.entities.Question.update(updated.id, updated);
    setNodes(prev => prev.map(n => n.node_id === updated.node_id ? updated : n));
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Palette */}
      <NodePalette onAddNode={addNode} onClose={() => {}} />

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          style={{ background: "#0a1628" }}
        >
          <Background color="#1e293b" gap={20} />
          <Controls style={{ background: "#0f1e35", border: "1px solid rgba(255,255,255,0.1)" }} />
          <MiniMap
            style={{ background: "#0f1e35", border: "1px solid rgba(255,255,255,0.1)" }}
            nodeColor="#1e90ff"
            maskColor="rgba(0,0,0,0.4)"
          />
        </ReactFlow>
      </div>

      {/* Inspector */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          edges={edges}
          allNodes={nodes}
          onUpdate={updateNode}
          onClose={() => setSelectedNodeId(null)}
          onDeleteNode={handleDelete}
        />
      )}
    </div>
  );
}
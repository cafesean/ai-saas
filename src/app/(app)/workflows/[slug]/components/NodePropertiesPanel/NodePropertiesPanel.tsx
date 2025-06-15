import { useState, useEffect } from "react";
import axios from "axios";

import { NodeTypes } from "@/constants/nodes";
import { TriggerNodePropertiesPanel } from "@/components/nodes/TriggerNode";
import { AIModelNodePropertiesPanel } from "@/components/nodes/AIModelNode";
import { RulesNodePropertiesPanel } from "@/components/nodes/RulesNode";
import { LogicNodePropertiesPanel } from "@/components/nodes/LogicNode";
import { DatabaseNodePropertiesPanel } from "@/components/nodes/DatabaseNode";
import { WebhookNodePropertiesPanel } from "@/components/nodes/WebhookNode";
import { DecisionTableNodePropertiesPanel } from "@/components/nodes/DecisionTableNode";
import { WhatsAppNodePropertiesPanel } from "@/components/nodes/WhatsAppNode";
import { SplitOutNodePropertiesPanel } from "@/components/nodes/SplitOutNode";
import { LoopNodePropertiesPanel } from "@/components/nodes/LoopNode";
import { RAGNodePropertiesPanel } from "@/components/nodes/RAGNode";
import { api } from "@/utils/trpc";
import { ModelStatus } from "@/constants/general";

interface NodePropertiesPanelProps {
  nodeId: string;
  nodes: any[];
  setNodes: any;
  templates: any[];
  knowledgeBases?: any[];
}

function NodePropertiesPanel({
  nodeId,
  nodes,
  setNodes,
  templates,
  knowledgeBases,
}: NodePropertiesPanelProps) {
  const activeModels = api.model.getByStatus.useQuery(ModelStatus.ACTIVE, {
    enabled: false,
  });
  const activeDecisionTables = api.decisionTable.getByStatus.useQuery(
    ModelStatus.ACTIVE,
    {
      enabled: false,
    },
  );

  const node = nodes.find((n) => n.id === nodeId);

  if (!node) return null;

  const updateNodeData = (key: string, value: any) => {
    setNodes(
      nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              [key]: value,
            },
          };
        }
        return n;
      }),
    );
  };

  // Render different properties based on node type
  switch (node.type) {
    case NodeTypes.trigger:
      return (
        <TriggerNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
        />
      );
    case NodeTypes.aiModel:
      if (!activeModels.isFetched) {
        activeModels.refetch();
      }
      return (
        <AIModelNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
          models={activeModels.data || []}
        />
      );
    case NodeTypes.rules:
      return (
        <RulesNodePropertiesPanel node={node} updateNodeData={updateNodeData} />
      );
    case NodeTypes.logic:
      return (
        <LogicNodePropertiesPanel node={node} updateNodeData={updateNodeData} />
      );
    case NodeTypes.database:
      return (
        <DatabaseNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
        />
      );
    case NodeTypes.webhook:
      return (
        <WebhookNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
        />
      );
    case NodeTypes.decisionTable:
      if (!activeDecisionTables.isFetched) {
        activeDecisionTables.refetch();
      }
      return (
        <DecisionTableNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
          decisionTables={activeDecisionTables.data || []}
        />
      );
    case NodeTypes.whatsApp:
      return (
        <WhatsAppNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
          templates={templates}
        />
      );
    case NodeTypes.splitOut:
      return (
        <SplitOutNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
        />
      );
    case NodeTypes.loop:
      return (
        <LoopNodePropertiesPanel node={node} updateNodeData={updateNodeData} />
      );
    case NodeTypes.rag:
      return (
        <RAGNodePropertiesPanel
          node={node}
          updateNodeData={updateNodeData}
          knowledgeBases={knowledgeBases || []}
        />
      );

    default:
      return (
        <div className="text-center p-4 text-muted-foreground">
          No properties available for this node type.
        </div>
      );
  }
}

export default NodePropertiesPanel;

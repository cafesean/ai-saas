import { z } from 'zod';
import { db } from '@/db';
import { nodeTypes } from '@/db/schema/n8n';
import { eq } from 'drizzle-orm';

// Types
export type N8nNode = {
  parameters: Record<string, unknown>;
  id: string;
  name: string;
  type: string;
  position: [number, number];
  typeVersion: number;
};

export type N8nWorkflow = {
  name: string;
  nodes: N8nNode[];
  versionId: string;
  meta: {
    templateId: string;
    instanceId: string;
  };
  id: string;
};

// Validation schemas
const nodeSchema = z.object({
  parameters: z.record(z.unknown()),
  id: z.string(),
  name: z.string(),
  type: z.string(),
  position: z.tuple([z.number(), z.number()]),
  typeVersion: z.number(),
});

const workflowSchema = z.object({
  name: z.string(),
  nodes: z.array(nodeSchema),
  versionId: z.string(),
  meta: z.object({
    templateId: z.string(),
    instanceId: z.string(),
  }),
  id: z.string(),
});

// Utility functions
export const getNodeTypes = () => {
  return db.select().from(nodeTypes);
};

export const extractUserInputs = (nodes: N8nNode[], nodeTypeList: { type: string; category: string }[]) => {
  return nodes.reduce<Record<string, { category: string; parameters: Record<string, unknown> }>>((acc, node) => {
    const nodeType = nodeTypeList.find((nt) => nt.type === node.type);
    if (nodeType) {
      acc[node.id] = {
        category: nodeType.category,
        parameters: node.parameters,
      };
    }
    return acc;
  }, {});
};

export const parseWorkflow = async (workflowJson: unknown) => {
  // Validate workflow JSON
  const workflow = workflowSchema.parse(workflowJson);
  
  // Get node types that require user input
  const nodeTypeList = await getNodeTypes();
  
  // Extract user inputs from nodes
  const userInputs = extractUserInputs(workflow.nodes, nodeTypeList);

  return {
    templateId: workflow.meta.templateId,
    versionId: workflow.versionId,
    instanceId: workflow.meta.instanceId,
    userInputs,
    workflowJson: workflow as Record<string, unknown>,
  };
}; 
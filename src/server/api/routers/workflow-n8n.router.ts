import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import { 
  workflows,
  nodes,
  edges,
  endpoints,
  models,
  decision_tables,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { N8N_API } from "@/constants/api";
import { EndpointStatus } from "@/constants/general";
import {
  DecisionTableInputNumberOperators,
  DecisionTableInputStringOperators,
  DecisionTableInputBooleanOperators,
} from "@/constants/decisionTable";
import { NodeTypes, WhatsAppSendTypes } from "@/constants/nodes";
import {
  n8nHTTPRequestNode,
  n8nCodeNode,
  n8nWebhookNode,
  n8nSplitOutNode,
  n8nSplitInBatchesNode,
} from "@/constants/n8n";
import { DecisionDataTypes } from "@/constants/decisionTable";
import { ModelTypes, ThirdPartyModels } from "@/constants/model";

const instance = axios.create();

const workflowUpdateSchema = z.object({
  uuid: z.string().min(36),
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      type: z.string().optional(),
      data: z.record(z.any()),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string().min(1),
      source: z.string().min(1),
      target: z.string().min(1),
      animated: z.boolean().optional(),
      sourceHandle: z.string().optional().nullable(),
      targetHandle: z.string().optional().nullable(),
    }),
  ),
});

/**
 * Workflow N8N Integration Router
 * 
 * Handles the complex N8N integration logic that was extracted from the main workflow router.
 * This includes the complex workflow update procedure with N8N sync.
 */
export const workflowN8nRouter = createTRPCRouter({
  /**
   * Complex workflow update with N8N integration
   * This is the complex procedure extracted from the original 1047-line workflow router
   */
  update: publicProcedure
    .input(workflowUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const updateWorkflow = await db.transaction(async (tx: any) => {
          // Find the workflow by UUID
          const workflow = await tx.query.workflows.findFirst({
            where: eq(workflows.uuid, input.uuid),
          });
          if (!workflow) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Workflow not found",
            });
          }
          
          // Delete all nodes and edges associated with the workflow
          await tx
            .delete(nodes)
            .where(eq(nodes.workflowId, workflow.uuid));
          await tx
            .delete(edges)
            .where(eq(edges.workflowId, workflow.uuid));
          
          // Insert the new nodes and edges
          if (input.nodes.length > 0) {
            // Filter out node type is empty or undefined
            const filteredNodes = input.nodes.filter(
              (node) => node.type && node.type !== "",
            );
            await tx.insert(nodes).values(
              filteredNodes.map((node) => ({
                uuid: node.id,
                type: node.type,
                data: node.data,
                position: node.position,
                workflowId: workflow.uuid,
              })),
            );
          }
          
          if (input.edges.length > 0) {
            // Filter out edge type is empty or undefined
            const filteredEdges = input.edges.filter(
              (edge) => edge.source && edge.target,
            );
            await tx.insert(edges).values(
              filteredEdges.map((edge) => ({
                uuid: uuidv4(),
                source: edge.source,
                target: edge.target,
                animated: edge.animated || false,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                workflowId: workflow.uuid,
              })),
            );
          }
          
          // Handle convert workflow to n8n workflow
          let flowId = workflow.flowId;
          const { n8nNodes, n8nConnections } =
            await generateN8NNodesAndN8NConnections(
              input.nodes,
              input.edges,
              tx,
            );
          
          const payload = {
            name: workflow.name,
            nodes: n8nNodes,
            connections: n8nConnections,
            settings: {
              executionOrder: "v1",
            },
            staticData: {
              lastId: uuidv4(),
            },
          };
          
          // If flow exists, update the n8n workflow
          if (flowId) {
            try {
              const apiURI = `${N8N_API.getWorkflowById(flowId).uri}`;
              const options = {
                baseURL: process.env.N8N_API_URL,
                headers: {
                  "Content-Type": "application/json",
                  "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
                },
                url: apiURI,
                method: N8N_API.getWorkflowById(flowId).method,
              };
              const response = await instance(options);
              if (response.status == 200 && response.data.id) {
                // Update existing workflow
                const updateApiURI = `${N8N_API.updateWorkflow(flowId).uri}`;
                const updateOptions = {
                  baseURL: process.env.N8N_API_URL,
                  headers: {
                    "Content-Type": "application/json",
                    "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
                  },
                  url: updateApiURI,
                  method: N8N_API.updateWorkflow(flowId).method,
                  data: payload,
                };
                await instance(updateOptions);
              }
            } catch (error) {
              console.log("Flow not found in n8n");
              flowId = null;
            }
          }
          
          // If flow does not exist, create a new n8n workflow
          if (!flowId) {
            const createApiURI = `${N8N_API.createWorkflow().uri}`;
            const createOptions = {
              baseURL: process.env.N8N_API_URL,
              headers: {
                "Content-Type": "application/json",
                "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
              },
              url: createApiURI,
              method: N8N_API.createWorkflow().method,
              data: payload,
            };
            try {
              const createResponse = await instance(createOptions);
              // Activate workflow
              if (createResponse.status == 200 && createResponse.data.id) {
                flowId = createResponse.data.id;
                const activeApiURI = `${
                  N8N_API.activeWorkflow(`${flowId}`).uri
                }`;
                const options = {
                  baseURL: process.env.N8N_API_URL,
                  headers: {
                    "Content-Type": "application/json",
                    "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
                  },
                  url: activeApiURI,
                  method: N8N_API.activeWorkflow(`${flowId}`).method,
                };
                await instance(options);
              }
              // update flowId in workflow table
              await tx
                .update(workflows)
                .set({
                  flowId: flowId,
                })
                .where(eq(workflows.uuid, workflow.uuid))
                .returning();
            } catch (error) {
              console.error(error);
            }
          }
          
          // Create endpoints for webhook nodes
          const n8nWebhookNodes = n8nNodes.filter(
            (node: any) => node.type === n8nWebhookNode.type,
          );
          await tx
            .delete(endpoints)
            .where(eq(endpoints.workflowId, workflow.uuid));
          if (n8nWebhookNodes.length > 0) {
            for (const node of n8nWebhookNodes) {
              await tx
                .insert(endpoints)
                .values({
                  workflowId: workflow.uuid,
                  uri: node.parameters.path,
                  method: node.parameters.httpMethod,
                  payload: JSON.stringify({}),
                  status: EndpointStatus.ACTIVE,
                  flowURI: node.parameters.path,
                  flowMethod: node.parameters.httpMethod,
                  clientId: uuidv4(),
                  clientSecret: uuidv4(),
                })
                .returning();
            }
          }
        });
        return updateWorkflow;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workflow",
        });
      }
    }),

  /**
   * Delete workflow from N8N
   */
  deleteFlow: publicProcedure
    .input(z.object({ flowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const deleteApiURI = `${N8N_API.deleteWorkflow(input.flowId).uri}`;
        const deleteOptions = {
          baseURL: process.env.N8N_API_URL,
          headers: {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
          },
          url: deleteApiURI,
          method: N8N_API.deleteWorkflow(input.flowId).method,
        };
        await instance(deleteOptions);
        return { success: true };
      } catch (error) {
        console.log("Flow not found in n8n");
        return { success: false, error: "Flow not found in n8n" };
      }
    }),

  /**
   * Sync workflow settings with N8N
   */
  syncSettings: publicProcedure
    .input(z.object({
      workflowId: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workflow = await db.query.workflows.findFirst({
          where: eq(workflows.uuid, input.workflowId),
        });

        if (workflow?.flowId) {
          // Get the n8n workflow by flowId
          const apiURI = `${N8N_API.getWorkflowById(workflow.flowId).uri}`;
          const options = {
            baseURL: process.env.N8N_API_URL,
            headers: {
              "Content-Type": "application/json",
              "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
            },
            url: apiURI,
            method: N8N_API.getWorkflowById(workflow.flowId).method,
          };
          const response = await instance(options);
          if (response.status === 200) {
            const n8nWorkflow = response.data;
            // Update the n8n workflow for name
            const updateApiURI = `${N8N_API.updateWorkflow(workflow.flowId).uri}`;
            const payload = {
              name: input.name,
              nodes: n8nWorkflow.nodes,
              connections: n8nWorkflow.connections,
              settings: n8nWorkflow.settings,
              staticData: {
                lastId: uuidv4(),
              },
            };
            const updateOptions = {
              baseURL: process.env.N8N_API_URL,
              headers: {
                "Content-Type": "application/json",
                "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
              },
              url: updateApiURI,
              method: N8N_API.updateWorkflow(workflow.flowId).method,
              data: payload,
            };
            await instance(updateOptions);
          }
        }
        return { success: true };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync workflow settings with N8N",
        });
      }
    }),
});

// Copy the large helper functions from the original workflow router
// These are needed for the N8N integration to work properly

const generateN8NNodesAndN8NConnections = async (
  nodes: any[],
  edges: any[],
  tx: any,
) => {
  const n8nNodes: any[] = [];
  const n8nConnections: any = {};
  
  for (const node of nodes) {
    switch (node.type) {
      case NodeTypes.trigger:
        n8nNodes.push({
          ...n8nWebhookNode,
          parameters: {
            ...n8nWebhookNode.parameters,
            httpMethod: node.data.method,
            path: node.data.path,
          },
          position: [node.position.x, node.position.y],
          name: node.data.label,
          id: uuidv4(),
          webhookId: uuidv4(),
        });
        break;
        
      case NodeTypes.aiModel:
        // Find model
        if (node.data.type === ModelTypes[0]?.value) {
          const modelUUID = node.data.model.uuid;
          const model = await tx.query.models.findFirst({
            where: eq(models.uuid, modelUUID),
          });
          const queryParameters = [];
          if (model.fileKey) {
            queryParameters.push({
              name: "model_path",
              value: `${model.fileKey}`,
            });
          }
          if (model.metadataFileKey) {
            queryParameters.push({
              name: "metadata_path",
              value: `${model.metadataFileKey}`,
            });
          }
          n8nNodes.push({
            ...n8nHTTPRequestNode,
            parameters: {
              ...n8nHTTPRequestNode.parameters,
              url: process.env.MODEL_SERVICE_URL?.replace(
                "{model_uuid}",
                modelUUID,
              ),
              sendQuery: true,
              queryParameters: {
                parameters: queryParameters,
              },
              sendHeaders: true,
              headerParameters: {
                parameters: [
                  {
                    name: process.env.MODEL_SERVICE_ACCESS_ID_KEY,
                    value: process.env.MODEL_SERVICE_ACCESS_ID_VALUE,
                  },
                  {
                    name: process.env.MODEL_SERVICE_SECRET_KEY,
                    value: process.env.MODEL_SERVICE_SECRET_VALUE,
                  },
                ],
              },
              sendBody: true,
              specifyBody: "json",
              jsonBody:
                "={{  $input.all()[0].json.body || $input.all()[0].json }}",
            },
            position: [node.position.x, node.position.y],
            name: node.data.label,
            id: uuidv4(),
          });
        } else {
          const modelUUID = node.data.model.uuid;
          const model = ThirdPartyModels.find((m) => m.uuid === modelUUID);
          if (model) {
            n8nNodes.push({
              ...n8nHTTPRequestNode,
              parameters: {
                ...n8nHTTPRequestNode.parameters,
                url: model.url,
                sendHeaders: true,
                headerParameters: {
                  parameters: [
                    {
                      name: model.auth.name,
                      value: model.auth.value,
                    },
                  ],
                },
                sendBody: true,
                specifyBody: "json",
                jsonBody: `={ "model": "${model.value}", "messages": [ { "role": "system", "content": "${node.data.systemPrompt.value}" }, { "role": "user", "content": "${node.data.userPrompt.value}" } ] }`,
              },
              position: [node.position.x, node.position.y],
              name: node.data.label,
              id: uuidv4(),
            });
          } else {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Model not found",
            });
          }
        }
        break;
        
      case NodeTypes.decisionTable:
        const decisionTableUUID = node.data.decisionTable.uuid;
        const decisionTable = await tx.query.decision_tables.findFirst({
          where: eq(decision_tables.uuid, decisionTableUUID),
          with: {
            decisionTableRows: {
              with: {
                decisionTableInputConditions: true,
                decisionTableOutputResults: true,
              },
            },
            decisionTableInputs: true,
            decisionTableOutputs: true,
          },
        });
        
        if (decisionTable) {
          // Generate decision table logic
          let codeString = "";
          codeString += "let input = $input.all()[0].json;\n";
          codeString += "let output = {};\n";
          
          if (decisionTable.decisionTableRows.length > 0) {
            for (const [
              decisionTableRowIndex,
              decisionTableRow,
            ] of decisionTable.decisionTableRows.entries()) {
              if (decisionTableRowIndex === 0) {
                codeString += "if (";
              } else {
                codeString += "else if (";
              }
              
              for (const [
                conditionIndex,
                condition,
              ] of decisionTableRow.decisionTableInputConditions.entries()) {
                if (conditionIndex > 0) {
                  codeString += " && ";
                }
                const input = decisionTable.decisionTableInputs.find(
                  (inputItem: any) => inputItem.id === condition.decisionTableInputId,
                );
                if (input) {
                  codeString += `input.${input.name}`;
                  codeString += getInputOperatorAndValue(
                    condition.operator,
                    input.dataType,
                    condition.value,
                  );
                }
              }
              codeString += ") {\n";
              
              for (const result of decisionTableRow.decisionTableOutputResults) {
                const output = decisionTable.decisionTableOutputs.find(
                  (outputItem: any) => outputItem.id === result.decisionTableOutputId,
                );
                if (output) {
                  codeString += `  output.${output.name} =`;
                  codeString += getOutputValue(result.value, output.dataType);
                  codeString += ";\n";
                }
              }
              codeString += "}\n";
            }
          }
          codeString += "return [{ json: output }];";
          
          n8nNodes.push({
            ...n8nCodeNode,
            parameters: {
              ...n8nCodeNode.parameters,
              jsCode: codeString,
            },
            position: [node.position.x, node.position.y],
            name: node.data.label,
            id: uuidv4(),
          });
        }
        break;
        
      case NodeTypes.logic:
        n8nNodes.push({
          ...n8nCodeNode,
          parameters: {
            ...n8nCodeNode.parameters,
            jsCode: node.data.code.value,
          },
          position: [node.position.x, node.position.y],
          name: node.data.label,
          id: uuidv4(),
        });
        break;
        
      case NodeTypes.splitOut:
        n8nNodes.push({
          ...n8nSplitOutNode,
          position: [node.position.x, node.position.y],
          name: node.data.label,
          id: uuidv4(),
        });
        break;
        
      case NodeTypes.whatsApp:
        const authValue = `Basic ${Buffer.from(
          `${process.env.WHATSAPP_PHONE_NUMBER_ID}:${process.env.WHATSAPP_ACCESS_TOKEN}`,
        ).toString("base64")}`;
        
        let whatsAppPayload = {};
        if (node.data.type === WhatsAppSendTypes[0]?.value) {
          whatsAppPayload = {
            messaging_product: "whatsapp",
            to: node.data.to.valueType === "Expression" ? `{{ ${node.data.to.value} }}` : node.data.to.value,
            type: "text",
            text: {
              body: node.data.message.valueType === "Expression" ? `{{ ${node.data.message.value} }}` : node.data.message.value,
            },
          };
        }
        
        n8nNodes.push({
          ...n8nHTTPRequestNode,
          parameters: {
            ...n8nHTTPRequestNode.parameters,
            method: "POST",
            url: `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "Authorization",
                  value: authValue,
                },
              ],
            },
            sendBody: true,
            specifyBody: "json",
            jsonBody: JSON.stringify(whatsAppPayload),
          },
          position: [node.position.x, node.position.y],
          name: node.data.label,
          id: uuidv4(),
        });
        break;
        
      case NodeTypes.database:
        const insertNode: any = {
          ...n8nHTTPRequestNode,
          parameters: {
            ...n8nHTTPRequestNode.parameters,
            method: node.data.method,
            url: node.data.url.valueType === "Expression" ? `={{ ${node.data.url.value} }}` : node.data.url.value,
            sendQuery: node.data.queryParams.length > 0,
            queryParameters: {
              parameters: node.data.queryParams.map((item: any) => ({
                name: item.name,
                value: item.valueType === "Expression" ? `={{ ${item.value} }}` : item.value,
              })),
            },
            sendHeaders: node.data.headers.length > 0,
            headerParameters: {
              parameters: node.data.headers.map((item: any) => ({
                name: item.name,
                value: item.valueType === "Expression" ? `={{ ${item.value} }}` : item.value,
              })),
            },
            sendBody: node.data.body.length > 0 || !!node.data.specifyBodyValue.value,
          },
          position: [node.position.x, node.position.y],
          name: node.data.label,
          id: uuidv4(),
        };
        
        if (node.data.specifyBody === "json") {
          insertNode.parameters["specifyBody"] = "json";
          insertNode.parameters["jsonBody"] =
            node.data.specifyBodyValue.valueType === "Expression"
              ? `={{ ${node.data.specifyBodyValue.value} }}`
              : node.data.specifyBodyValue.value;
        } else {
          insertNode.parameters["bodyParameters"] = {
            parameters: node.data.body.map((item: any) => ({
              name: item.name,
              value: item.valueType === "Expression" ? `={{ ${item.value} }}` : item.value,
            })),
          };
        }
        n8nNodes.push(insertNode);
        break;
        
      case NodeTypes.loop:
        n8nNodes.push({
          ...n8nSplitInBatchesNode,
          parameters: {
            ...n8nSplitInBatchesNode.parameters,
            batchSize: node.data.batchSize,
          },
          position: [node.position.x, node.position.y],
          name: node.data.label,
          id: uuidv4(),
        });
        break;
        
      case NodeTypes.rag:
        n8nNodes.push({
          ...n8nHTTPRequestNode,
          parameters: {
            ...n8nHTTPRequestNode.parameters,
            method: "POST",
            url: `${process.env.KNOWLEDGE_BASE_CHAT_URL}`,
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "Authorization",
                  value: `Basic ${process.env.N8N_BASIC_AUTH_TOKEN}`,
                },
              ],
            },
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: "query",
                  value:
                    node.data.question.valueType === "Expression"
                      ? `={{ ${node.data.question.value} }}`
                      : node.data.question.value,
                },
                {
                  name: "user_id",
                  value: `${process.env.NEXT_PUBLIC_MOCK_USER_ID}`,
                },
                {
                  name: "kb_id",
                  value: `${node.data.kb.uuid}`,
                },
              ],
            },
          },
          position: [node.position.x, node.position.y],
          name: node.data.label,
          id: uuidv4(),
        });
        break;
        
      default:
        break;
    }
  }
  
  // Generate n8n connections
  edges.forEach((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    if (sourceNode && targetNode) {
      if (!n8nConnections[sourceNode.data.label]) {
        if (
          sourceNode.data.sourceHandle &&
          sourceNode.data.sourceHandle.length > 0
        ) {
          const mainConnections = sourceNode.data.sourceHandle.map(
            (handle: any) => {
              if (handle.id === edge.sourceHandle) {
                return [
                  {
                    node: targetNode.data.label,
                    type: "main",
                    index: 0,
                  },
                ];
              }
              return [];
            },
          );
          n8nConnections[sourceNode.data.label] = {
            main: mainConnections,
          };
        } else {
          n8nConnections[sourceNode.data.label] = {
            main: [
              [
                {
                  node: targetNode.data.label,
                  type: "main",
                  index: 0,
                },
              ],
            ],
          };
        }
      }
    }
  });
  
  return {
    n8nNodes,
    n8nConnections,
  };
};

const getInputOperatorAndValue = (
  operator: string,
  dateType?: string,
  value?: string,
) => {
  switch (dateType) {
    case DecisionDataTypes[2]?.value:
      switch (operator) {
        case DecisionTableInputBooleanOperators[0]?.operator:
          return " == true";
        case DecisionTableInputBooleanOperators[1]?.operator:
          return " == false";
        case DecisionTableInputBooleanOperators[2]?.operator:
          return ` == ${value}`;
        case DecisionTableInputBooleanOperators[3]?.operator:
          return ` != ${value}`;
      }
    case DecisionDataTypes[0]?.value:
      switch (operator) {
        case DecisionTableInputStringOperators[0]?.operator:
          return " != null";
        case DecisionTableInputStringOperators[1]?.operator:
          return " == null";
        case DecisionTableInputStringOperators[2]?.operator:
          return " == ''";
        case DecisionTableInputStringOperators[3]?.operator:
          return " != ''";
        case DecisionTableInputStringOperators[4]?.operator:
          return ` == '${value}'`;
        case DecisionTableInputStringOperators[5]?.operator:
          return ` != '${value}'`;
        case DecisionTableInputStringOperators[6]?.operator:
          return `.indexOf('${value}') != -1`;
        case DecisionTableInputStringOperators[7]?.operator:
          return `.indexOf('${value}') == -1`;
        default:
          return ` == '${value}'`;
      }
    default:
      switch (operator) {
        case DecisionTableInputNumberOperators[0]?.operator:
          return ` == ${value}`;
        case DecisionTableInputNumberOperators[1]?.operator:
          return ` != ${value}`;
        case DecisionTableInputNumberOperators[2]?.operator:
          return ` > ${value}`;
        case DecisionTableInputNumberOperators[3]?.operator:
          return ` < ${value}`;
        case DecisionTableInputNumberOperators[4]?.operator:
          return ` >= ${value}`;
        case DecisionTableInputNumberOperators[5]?.operator:
          return ` <= ${value}`;
        default:
          return ` == ${value}`;
      }
  }
};

const getOutputValue = (value: string, dateType?: string) => {
  switch (dateType) {
    case DecisionDataTypes[0]?.value:
      return ` '${value.replaceAll(/'/g, "\\'")}'`;
    default:
      return ` ${value}`;
  }
}; 
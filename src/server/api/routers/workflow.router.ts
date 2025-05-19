import { unknown, z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db/config";
import schema, { rules } from "@/db/schema";
import { eq, asc, desc, count, inArray, max } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { N8N_API } from "@/constants/api";
import { EndpointStatus, WorkflowStatus } from "@/constants/general";
import {
  DecisionTableInputNumberOperators,
  DecisionTableInputStringOperators,
  DecisionTableInputBooleanOperators,
} from "@/constants/decisionTable";
import { NodeTypes } from "@/constants/nodes";
import {
  n8nHTTPRequestNode,
  n8nCodeNode,
  n8nWebhookNode,
  n8nTwilioNode,
} from "@/constants/n8n";
import { DecisionDataTypes } from "@/constants/decisionTable";

const workflowCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
});

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
    }),
  ),
});

const workflowUpdateSettingsSchema = z.object({
  uuid: z.string().min(36),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
});

const instance = axios.create();

export const workflowRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // 1. Get workflow data with endpoints and nodes
    const workflowsData = await ctx.db.query.workflows.findMany({
      with: {
        endpoint: true,
        nodes: true,
      },
      orderBy: desc(schema.workflows.id),
    });

    // 2. Bulk get workflow run history counts AND last run timestamps
    const workflowUUIDs = workflowsData.map((w) => w.uuid);

    const historyStats = await ctx.db
      .select({
        workflowId: schema.workflowRunHistory.workflowId,
        count: count(),
        lastRunAt: max(schema.workflowRunHistory.createdAt),
      })
      .from(schema.workflowRunHistory)
      .where(inArray(schema.workflowRunHistory.workflowId, workflowUUIDs))
      .groupBy(schema.workflowRunHistory.workflowId);

    // 3. Merge workflow data with history stats
    return workflowsData.map((workflow) => {
      const stats = historyStats.find((s) => s.workflowId === workflow.uuid);
      return {
        ...workflow,
        runs: {
          count: stats?.count || 0,
          lastRunAt: stats?.lastRunAt || null,
        },
      };
    });
  }),

  getAllByStatus: publicProcedure
    .input(z.object({ status: z.nativeEnum(WorkflowStatus) }))
    .query(async ({ ctx, input }) => {
      return await db
        .select()
        .from(schema.workflows)
        .where(eq(schema.workflows.status, input.status));
    }),

  create: publicProcedure
    .input(workflowCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workflowData = await db
          .insert(schema.workflows)
          .values(input)
          .returning();
        return workflowData[0];
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create workflow",
        });
      }
    }),

  getByUUID: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflowData = await db.query.workflows.findFirst({
        where: eq(schema.workflows.uuid, input.uuid),
        with: {
          nodes: true,
          edges: true,
        },
      });
      return workflowData;
    }),

  updateStatus: publicProcedure
    .input(z.object({ uuid: z.string(), status: z.nativeEnum(WorkflowStatus) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workflowData = await db
          .update(schema.workflows)
          .set({
            status: input.status,
          })
          .where(eq(schema.workflows.uuid, input.uuid))
          .returning();
        return workflowData[0];
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workflow status",
        });
      }
    }),

  updateSettings: publicProcedure
    .input(workflowUpdateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workflowData = await db
          .update(schema.workflows)
          .set({
            name: input.name,
            description: input.description,
            type: input.type,
          })
          .where(eq(schema.workflows.uuid, input.uuid))
          .returning();
        // Detect if workflow have flowId
        if (workflowData[0]?.flowId) {
          // Get the n8n workflow by flowId
          const apiURI = `${
            N8N_API.getWorkflowById(workflowData[0]?.flowId).uri
          }`;
          const options = {
            baseURL: process.env.N8N_API_URL,
            headers: {
              "Content-Type": "application/json",
              "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
            },
            url: apiURI,
            method: N8N_API.getWorkflowById(workflowData[0]?.flowId).method,
          };
          const response = await instance(options);
          if (response.status === 200) {
            const n8nWorkflow = response.data;
            // Update the n8n workflow for name

            const updateApiURI = `${
              N8N_API.updateWorkflow(workflowData[0]?.flowId).uri
            }`;
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
              method: N8N_API.updateWorkflow(workflowData[0]?.flowId).method,
              data: payload,
            };
            await instance(updateOptions);
          }
        }
        return workflowData[0];
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workflow settings",
        });
      }
    }),

  update: publicProcedure
    .input(workflowUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const updateWorkflow = await db.transaction(async (tx: any) => {
          // Find the workflow by UUID
          const workflow = await tx.query.workflows.findFirst({
            where: eq(schema.workflows.uuid, input.uuid),
          });
          if (!workflow) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Workflow not found",
            });
          }
          // Delete all nodes and edges associated with the workflow
          await tx
            .delete(schema.nodes)
            .where(eq(schema.nodes.workflowId, workflow.uuid));
          await tx
            .delete(schema.edges)
            .where(eq(schema.edges.workflowId, workflow.uuid));
          // Insert the new nodes and edges
          if (input.nodes.length > 0) {
            // Filter out node type is empty or undefined
            const filteredNodes = input.nodes.filter(
              (node) => node.type && node.type !== "",
            );
            const nodes = await tx.insert(schema.nodes).values(
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
            const edges = await tx.insert(schema.edges).values(
              filteredEdges.map((edge) => ({
                uuid: uuidv4(),
                source: edge.source,
                target: edge.target,
                animated: edge.animated || false,
                workflowId: workflow.uuid,
              })),
            );
          }
          // Hadle convert workflow to n8n workflow
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
          // Check flow whether exists in n8n
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
              }
              if (response.data && response.data.id) {
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
                .update(schema.workflows)
                .set({
                  flowId: flowId,
                })
                .where(eq(schema.workflows.uuid, workflow.uuid))
                .returning();
            } catch (error) {
              console.error(error);
            }
          }
          // Create endpoints
          // Detect whether have n8n webhook node
          const n8nWebhookNodes = n8nNodes.filter(
            (node: any) => node.type === n8nWebhookNode.type,
          );
          await tx
            .delete(schema.endpoints)
            .where(eq(schema.endpoints.workflowId, workflow.uuid));
          if (n8nWebhookNodes) {
            // Delete all endpoints associated with the workflow
            for (const node of n8nWebhookNodes) {
              const endpoint = await tx
                .insert(schema.endpoints)
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

  delete: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleteResponse = await db.transaction(async (tx) => {
        // Delete n8n flow if flowId exists
        const workflow = await tx.query.workflows.findFirst({
          where: eq(schema.workflows.uuid, input.uuid),
        });
        if (workflow && workflow.flowId) {
          try {
            const deleteApiURI = `${
              N8N_API.deleteWorkflow(workflow.flowId).uri
            }`;
            const deleteOptions = {
              baseURL: process.env.N8N_API_URL,
              headers: {
                "Content-Type": "application/json",
                "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
              },
              url: deleteApiURI,
              method: N8N_API.deleteWorkflow(workflow.flowId).method,
            };
            await instance(deleteOptions);
          } catch (error) {
            console.log("Flow not found in n8n");
          }
        }
        return await tx
          .delete(schema.workflows)
          .where(eq(schema.workflows.uuid, input.uuid))
          .returning();
      });
      return deleteResponse;
    }),
});

const generateN8NNodesAndN8NConnections = async (
  nodes: any[],
  edges: any[],
  tx: any,
) => {
  let n8nNodes: any[] = [];
  let n8nConnections: any = {};
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
        const modelUUID = node.data.model.uuid;
        const model = await tx.query.models.findFirst({
          where: eq(schema.models.uuid, modelUUID),
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
        break;
      case NodeTypes.decisionTable:
        const decisionTableUUID = node.data.decisionTable.uuid;
        const decisionTable = await tx.query.decision_tables.findFirst({
          where: eq(schema.decision_tables.uuid, decisionTableUUID),
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
          const decisionTableRows = decisionTable.decisionTableRows;
          const decisionTableInputs = decisionTable.decisionTableInputs;
          const decisionTableOutputs = decisionTable.decisionTableOutputs;
          if (decisionTableRows.length > 0) {
            let decisionTableJSCodeArray = [];
            // Generate decision table array
            let decisionTableCode = "const decisionTable = [\n";
            decisionTableRows.forEach((row: any, rn: number) => {
              const decisionTableInputConditions =
                row.decisionTableInputConditions;
              const decisionTableOutputResults = row.decisionTableOutputResults;
              decisionTableCode += "  {\n";
              decisionTableCode += "    condition: (data) => ";
              // Loop conditions
              const conditions: any[] = [];
              decisionTableInputConditions.forEach(
                (condition: any, cn: number) => {
                  const decisionTableInput = decisionTableInputs.find(
                    (input: any) => input.uuid === condition.dt_input_id,
                  );
                  if (
                    decisionTableInput.dataType ===
                      DecisionDataTypes[1]?.value &&
                    condition.value === ""
                  ) {
                    return;
                  }
                  conditions.push(
                    `data.${decisionTableInput.name}${getInputOperatorAndValue(
                      condition.condition,
                      decisionTableInput.dataType,
                      condition.value,
                    )}`,
                  );
                },
              );
              decisionTableCode += conditions.join(" && ") + ",\n";
              // Contact outputs
              decisionTableCode += "    result: { ";
              // Loop outputs
              const results: any[] = [];
              decisionTableOutputResults.forEach((result: any, rn: number) => {
                const decisionTableOutput = decisionTableOutputs.find(
                  (output: any) => output.uuid === result.dt_output_id,
                );
                results.push(
                  `${decisionTableOutput.name}:${getOutputValue(
                    result.result,
                    decisionTableOutput.dataType,
                  )}`,
                );
              });
              decisionTableCode += results.join(", ");
              decisionTableCode += " },\n";
              decisionTableCode += "  },";
              if (rn == decisionTableRows.length - 1) {
                decisionTableCode += "\n";
              }
            });
            decisionTableCode += "];\n";
            decisionTableJSCodeArray.push(decisionTableCode);
            // Node input data
            const nodeInputCode =
              "const data = $input.all()[0].json.body || $input.all()[0].json;\n";
            decisionTableJSCodeArray.push(nodeInputCode);
            // Default result
            const defaultResult =
              'let matchedResult = { message: "No Match" };';
            decisionTableJSCodeArray.push(defaultResult);
            // Detect matched result
            const detectMatchedResult =
              "for (const rule of decisionTable) {\n  if (rule.condition(data)) {\n    matchedResult = rule.result;\n    break;\n  }\n}\n";
            decisionTableJSCodeArray.push(detectMatchedResult);
            // Return matched result
            const returnMatchedResult =
              "return [\n  {\n    json: {\n     ...matchedResult,\n    },\n  },\n];";
            decisionTableJSCodeArray.push(returnMatchedResult);
            // Generate JS code
            const jsCode = decisionTableJSCodeArray.join("\n");
            // Generate n8n code node
            n8nNodes.push({
              ...n8nCodeNode,
              parameters: {
                ...n8nCodeNode.parameters,
                jsCode,
              },
              position: [node.position.x, node.position.y],
              name: node.data.label,
              id: uuidv4(),
            });
          }
        }
        break;
      case NodeTypes.whatsApp:
        // Find trigger node name
        const triggerNode = nodes.find(
          (node: any) => node.type === NodeTypes.trigger,
        );
        if (triggerNode) {
          // Get label of trigger node
          const triggerNodeLabel = triggerNode.data.label;
          n8nNodes.push({
            ...n8nTwilioNode,
            parameters: {
              ...n8nTwilioNode.parameters,
              from: `whatsapp:${node.data.from}`,
              to: `=whatsapp:{{ $('${triggerNodeLabel}').item.json.body.to }}`,
              message: `={{ ($input.all()[0].json.body && $input.all()[0].json.body["${node.data.msgFieldName}"]) || $input.all()[0].json["${node.data.msgFieldName}"] }}`,
            },
            position: [node.position.x, node.position.y],
            name: node.data.label,
            id: uuidv4(),
            webhookId: uuidv4(),
          });
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Trigger node not found when create WhatsApp node.",
          });
        }
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

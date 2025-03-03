import { unknown, z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db/config";
import schema from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { N8N_API } from "@/constants/api";
import { WidgetStatus, WorkflowStatus } from "@/constants/general";
import { CreateflowActions, CreateflowActionTypes, FlowNameTypes, WidgetTypes, Widgets } from "@/constants/nodes";
import { EndpointStatus } from "@/constants/general";
import { base64ToArrayBuffer } from "@/utils/func";
import { minify } from "terser";

const workflowCreateSchema = z.object({
  name: z.string().min(1),
  template: z.object({
    uuid: z.string().min(36),
    name: z.string().min(1),
    description: z.string().nullable(),
    flowId: z.string().min(1),
    userInputs: z.record(z.any()).nullable(),
  }),
});

const workflowPublishSchema = z.object({
  uuid: z.string().min(36),
  name: z.string().min(1),
  userInputs: z.record(z.any()).nullable(),
  workflowJson: z.record(z.any()).nullable(),
  datasets: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        base64file: z.string().min(1),
      })
    )
    .nullable(),
});

const instance = axios.create();

export const workflowRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const workflowsData = await db.query.workflows.findMany({
      with: {
        endpoint: true,
      },
      orderBy: desc(schema.workflows.id),
    });
    return workflowsData;
  }),

  getAllByStatus: publicProcedure
    .input(z.object({ status: z.nativeEnum(WorkflowStatus) }))
    .query(async ({ ctx, input }) => {
      return await db.select().from(schema.workflows).where(eq(schema.workflows.status, input.status));
    }),

  create: publicProcedure.input(workflowCreateSchema).mutation(async ({ ctx, input }) => {
    try {
      const apiURI = `${N8N_API.getWorkflowById(input.template.flowId).uri}`;
      const options = {
        baseURL: process.env.N8N_API_URL,
        headers: {
          "Content-Type": "application/json",
          "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
        },
        url: apiURI,
        method: N8N_API.getWorkflowById(input.template.flowId).method,
      };
      const response = await instance(options);
      const flowData = response.data;
      // const RAG_Chatbot_Modify = require("../../../../n8n/RAG_Chatbot_modify.json");
      // const flowData = RAG_Chatbot_Modify;
      const payload = {
        uuid: uuidv4(),
        name: input.name,
        userInputs: input.template.userInputs,
        workflowJson: flowData,
        status: WorkflowStatus.PENDING,
      };
      const [workflow] = await db
        .insert(schema.workflows)
        .values({
          ...payload,
        })
        .returning();
      return workflow;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create workflow",
      });
    }
  }),

  getByUUID: publicProcedure.input(z.object({ uuid: z.string() })).query(async ({ ctx, input }) => {
    const workflowData = await db.query.workflows.findMany({
      where: eq(schema.workflows.uuid, input.uuid),
      with: {
        endpoint: true,
        widgets: true,
      },
      limit: 1,
    });
    return workflowData;
  }),

  publish: publicProcedure.input(workflowPublishSchema).mutation(async ({ ctx, input }) => {
    let checkResponse: {
      success: boolean;
      data: any;
      createdFlowId: string;
    } = {
      success: false,
      data: undefined,
      createdFlowId: "",
    };

    try {
      const workflowJson = input.workflowJson as Record<string, any>;
      const userInputsArray = (input.userInputs?.userInputs as Record<string, any>[]) ?? [];
      for (const action of CreateflowActions) {
        switch (action.type) {
          // Do config action
          case CreateflowActionTypes.config: {
            const configUserInputsArray = userInputsArray.filter((userInput) =>
              userInput.type.includes(CreateflowActionTypes.config)
            );
            for (const userInput of configUserInputsArray) {
              const workflowNodeIndex = workflowJson.nodes.findIndex(
                (node: any) => node.name === userInput.flowNodeName
              );
              if (workflowNodeIndex !== -1) {
                const workflowNode = workflowJson.nodes[workflowNodeIndex];
                switch (workflowNode.name) {
                  case FlowNameTypes.webhookInputFormData:
                    // Generate new path for the webhookInputFormData
                    workflowJson.nodes[workflowNodeIndex].parameters.path = uuidv4();
                    break;
                  case FlowNameTypes.webhookInputJson:
                    // Generate new path for the webhookInputJson
                    workflowJson.nodes[workflowNodeIndex].parameters.path = uuidv4();
                }
              }
            }
            // Create flow
            const createApiURI = `${N8N_API.createWorkflow().uri}`;
            const createPayload = {
              name: input.name,
              nodes: workflowJson.nodes,
              connections: workflowJson.connections,
              settings: workflowJson.settings,
              staticData: {
                lastId: uuidv4(),
              },
            };
            const createOptions = {
              baseURL: process.env.N8N_API_URL,
              headers: {
                "Content-Type": "application/json",
                "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
              },
              url: createApiURI,
              method: N8N_API.createWorkflow().method,
              data: createPayload,
            };
            const createResponse = await instance(createOptions);
            console.log("createResponse", createResponse);
            // Activate workflow
            if (createResponse.status == 200 && createResponse.data.id) {
              const activeApiURI = `${N8N_API.activeWorkflow(`${createResponse.data.id}`).uri}`;
              const options = {
                baseURL: process.env.N8N_API_URL,
                headers: {
                  "Content-Type": "application/json",
                  "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
                },
                url: activeApiURI,
                method: N8N_API.activeWorkflow(`${createResponse.data.id}`).method,
              };
              const activeResponse = await instance(options);
              if (activeResponse.status == 200) {
                checkResponse = {
                  ...checkResponse,
                  success: true,
                  data: activeResponse.data,
                  createdFlowId: createResponse.data.id,
                };
              }
            }
            break;
          }
          // Do trigger action
          case CreateflowActionTypes.trigger: {
            if (!checkResponse.success) {
              return checkResponse;
            }
            const triggerUserInputsArray = userInputsArray.filter((userInput) =>
              userInput.type.includes(CreateflowActionTypes.trigger)
            );
            for (const userInput of triggerUserInputsArray) {
              const workflowNodeIndex = workflowJson.nodes.findIndex(
                (node: any) => node.name === userInput.flowNodeName
              );
              if (workflowNodeIndex !== -1) {
                const workflowNode = workflowJson.nodes[workflowNodeIndex];
                switch (workflowNode.name) {
                  case FlowNameTypes.webhookInputFormData:
                    // Do formdata upload
                    let uploadResponse: {
                      status: number;
                      data: any;
                    } = {
                      status: 0,
                      data: undefined,
                    };
                    if (input.datasets && input.datasets.length > 0) {
                      const uploadAPIURI = `webhook/${workflowNode.parameters.path}`;
                      for (const dataset of input.datasets) {
                        const uploadId = uuidv4();
                        const formData = new FormData();
                        const base64FileMid = dataset.base64file.split(",")[1];
                        const arrayBuffer = base64ToArrayBuffer(base64FileMid!);
                        const blob = new Blob([arrayBuffer], { type: dataset.type });
                        formData.append("data", blob, `${dataset.name}`);
                        formData.append("uploadId", uploadId);
                        const uploadOptions = {
                          baseURL: process.env.N8N_API_URL,
                          headers: {
                            "Content-Type": "multipart/form-data",
                            "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
                          },
                          url: uploadAPIURI,
                          method: workflowNode.parameters.httpMethod,
                          data: formData,
                        };
                        uploadResponse = await instance(uploadOptions);
                        console.log("uploadResponse.data", uploadResponse.data);
                      }
                    }
                    if (uploadResponse.status == 200) {
                      checkResponse = {
                        ...checkResponse,
                        success: true,
                        data: uploadResponse.data,
                      };
                    }
                    break;
                }
              }
            }
            break;
          }
          // Generate endpoint
          case CreateflowActionTypes.generateEndpoint: {
            if (!checkResponse.success) {
              return checkResponse;
            }
            const generateEndpointUserInputsArray = userInputsArray.filter((userInput) =>
              userInput.type.includes(CreateflowActionTypes.generateEndpoint)
            );
            for (const userInput of generateEndpointUserInputsArray) {
              const workflowNodeIndex = workflowJson.nodes.findIndex(
                (node: any) => node.name === userInput.flowNodeName
              );
              if (workflowNodeIndex !== -1) {
                const workflowNode = workflowJson.nodes[workflowNodeIndex];
                switch (workflowNode.name) {
                  case FlowNameTypes.webhookInputJson:
                    // Create new endpoint
                    const createEndpointPayload = {
                      uuid: uuidv4(),
                      workflowId: input.uuid,
                      uri: uuidv4(),
                      method: workflowNode.parameters.httpMethod,
                      status: EndpointStatus.ACTIVE,
                      payload: userInput.parameters.inputs,
                      flowURI: workflowNode.parameters.path,
                      flowMethod: workflowNode.parameters.httpMethod,
                      clientId: uuidv4(),
                      clientSecret: uuidv4(),
                    };
                    const createEndpointResponse = await db
                      .insert(schema.endpoints)
                      .values(createEndpointPayload)
                      .returning();
                    console.log("createEndpointResponse", createEndpointResponse);
                    if (createEndpointResponse.length > 0) {
                      checkResponse = {
                        ...checkResponse,
                        success: true,
                        data: createEndpointResponse[0],
                      };
                    }
                    break;
                }
              }
            }
            break;
          }
          case CreateflowActionTypes.generateWidget: {
            if (!checkResponse.success) {
              return checkResponse;
            }
            const generateWidgetsUserInputsArray = userInputsArray.filter((userInput) =>
              userInput.type.includes(CreateflowActionTypes.generateWidget)
            );
            console.log("generateWidgetsUserInputsArray", generateWidgetsUserInputsArray);
            for (const userInput of generateWidgetsUserInputsArray) {
              switch (userInput.widgetType) {
                case WidgetTypes.chat: {
                  // Comporess scripts for widget
                  const fs = require("fs");
                  const path = require("path");
                  const widgetScriptsPath = path.join(process.cwd(), Widgets.chat.scriptsPath);
                  const chatCode = uuidv4();
                  let originCode = fs.readFileSync(widgetScriptsPath, "utf8");
                  originCode = originCode
                    .replace("AI_SASS_CHAT_WIDGET_URL", process.env.AI_SASS_CHAT_WIDGET_URL)
                    .replace("WIDGET_CODE", chatCode) as string;
                  const minifiedCode = await minify(originCode);
                  const chatScripts = `<script>${minifiedCode.code as string}</script>`;
                  console.log("compressedCode", chatScripts);
                  const createChatWidgetPayload = {
                    uuid: uuidv4(),
                    name: Widgets.chat.name,
                    type: Widgets.chat.type,
                    workflowId: input.uuid,
                    status: WidgetStatus.ACTIVE,
                    code: chatCode,
                    scripts: chatScripts,
                  };
                  const createChatWidgetResponse = await db
                    .insert(schema.widgets)
                    .values(createChatWidgetPayload)
                    .returning();
                  console.log("createChatWidgetResponse", createChatWidgetResponse);
                  if (createChatWidgetResponse.length > 0) {
                    checkResponse = {
                      ...checkResponse,
                      success: true,
                      data: createChatWidgetResponse[0],
                    };
                  }
                  break;
                }
                default: {
                  break;
                }
              }
            }
            break;
          }
          default: {
            break;
          }
        }
      }
      if (checkResponse.success) {
        const updateWorkflowPayload = {
          name: input.name,
          status: WorkflowStatus.ACTIVE,
          flowId: checkResponse.createdFlowId,
          workflowJson: workflowJson,
        };
        const updateWorkflowResponse = await db
          .update(schema.workflows)
          .set(updateWorkflowPayload)
          .where(eq(schema.workflows.uuid, input.uuid));
        console.log("updateWorkflowResponse", updateWorkflowResponse);
      }
      return checkResponse;
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to publish workflow" });
    }
  }),

  update: publicProcedure.input(workflowPublishSchema).mutation(async ({ ctx, input }) => {
    let checkResponse: {
      success: boolean;
      data: any;
    } = {
      success: false,
      data: undefined,
    };
    try {
      const currentWorkflow = await db.query.workflows.findFirst({
        where: eq(schema.workflows.uuid, input.uuid),
      });
      if (!currentWorkflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }
      const workflowJson = input.workflowJson as Record<string, any>;
      const userInputsArray = (input.userInputs?.userInputs as Record<string, any>[]) ?? [];
      for (const action of CreateflowActions) {
        switch (action.type) {
          case CreateflowActionTypes.config: {
            // Update workflow
            if (currentWorkflow.flowId) {
              const updateApiURI = `${N8N_API.updateWorkflow(currentWorkflow.flowId).uri}`;
              const updatePayload = {
                name: input.name,
                nodes: workflowJson.nodes,
                connections: workflowJson.connections,
                settings: workflowJson.settings,
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
                method: N8N_API.updateWorkflow(currentWorkflow.flowId).method,
                data: updatePayload,
              };
              const updateResponse = await instance(updateOptions);
              console.log("updateResponse", updateResponse.data);
              checkResponse = {
                ...checkResponse,
                success: true,
                data: updateResponse.data,
              };
            }
            break;
          }
          // Do trigger action
          case CreateflowActionTypes.trigger: {
            if (!checkResponse.success) {
              return checkResponse;
            }
            const triggerUserInputsArray = userInputsArray.filter((userInput) =>
              userInput.type.includes(CreateflowActionTypes.trigger)
            );
            for (const userInput of triggerUserInputsArray) {
              const workflowNodeIndex = workflowJson.nodes.findIndex(
                (node: any) => node.name === userInput.flowNodeName
              );
              if (workflowNodeIndex !== -1) {
                const workflowNode = workflowJson.nodes[workflowNodeIndex];
                switch (workflowNode.name) {
                  case FlowNameTypes.webhookInputFormData:
                    // Do formdata upload
                    let uploadResponse: {
                      status: number;
                      data: any;
                    } = {
                      status: 0,
                      data: undefined,
                    };
                    if (input.datasets && input.datasets.length > 0) {
                      const uploadAPIURI = `webhook/${workflowNode.parameters.path}`;
                      for (const dataset of input.datasets) {
                        const uploadId = uuidv4();
                        const formData = new FormData();
                        const base64FileMid = dataset.base64file.split(",")[1];
                        const arrayBuffer = base64ToArrayBuffer(base64FileMid!);
                        const blob = new Blob([arrayBuffer], { type: dataset.type });
                        formData.append("data", blob, `${dataset.name}`);
                        formData.append("uploadId", uploadId);
                        const uploadOptions = {
                          baseURL: process.env.N8N_API_URL,
                          headers: {
                            "Content-Type": "multipart/form-data",
                            "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
                          },
                          url: uploadAPIURI,
                          method: workflowNode.parameters.httpMethod,
                          data: formData,
                        };
                        uploadResponse = await instance(uploadOptions);
                        console.log("uploadResponse.data", uploadResponse.data);
                      }
                    }
                    break;
                }
              }
            }
            break;
          }
          default: {
            break;
          }
        }
      }
      if (checkResponse.success) {
        const updateWorkflowPayload = {
          name: input.name,
        };
        const updateWorkflowResponse = await db
          .update(schema.workflows)
          .set(updateWorkflowPayload)
          .where(eq(schema.workflows.uuid, input.uuid));
        console.log("updateWorkflowResponse", updateWorkflowResponse);
      }
      return checkResponse;
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update workflow" });
    }
  }),

  delete: publicProcedure
    .input(z.object({ uuid: z.string(), flowId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const deleteResponse = await db.transaction(async (tx) => {
        if (input.flowId) {
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
        }
        await tx.delete(schema.endpoints).where(eq(schema.endpoints.workflowId, input.uuid)).returning();
        await tx.delete(schema.widgets).where(eq(schema.widgets.workflowId, input.uuid)).returning();
        return await tx.delete(schema.workflows).where(eq(schema.workflows.uuid, input.uuid)).returning();
      });
      return deleteResponse;
    }),
});

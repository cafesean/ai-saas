import { unknown, z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db/config";
import schema from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { N8N_API } from "@/constants/api";
import { WorkflowStatus } from "@/constants/general";

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
        const updateWorkflow = await db.transaction(async (tx) => {

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
                workflowId: workflow.uuid,
              })),
            );
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
        return await tx
          .delete(schema.workflows)
          .where(eq(schema.workflows.uuid, input.uuid))
          .returning();
      });
      return deleteResponse;
    }),
});

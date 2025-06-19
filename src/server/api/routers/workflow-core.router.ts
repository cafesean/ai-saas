import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, getUserTenantId, protectedMutationWithRateLimit } from "../trpc";
import { db } from "@/db";
import { workflows, workflowRunHistory } from "@/db/schema";
import { eq, desc, count, inArray, max } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { WorkflowStatus } from "@/constants/general";

// Validation schemas
const workflowCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
});

const workflowUpdateSettingsSchema = z.object({
  uuid: z.string().min(36),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
});

/**
 * Core Workflow Router
 * 
 * Handles basic CRUD operations for workflows:
 * - Reading workflows (getAll, getByUUID, getAllByStatus)
 * - Creating workflows
 * - Updating workflow settings (non-structural changes)
 * - Deleting workflows
 */
export const workflowCoreRouter = createTRPCRouter({
  // Get all workflows with run statistics
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // 1. Get workflow data with endpoints and nodes
    const workflowsData = await ctx.db.query.workflows.findMany({
      with: {
        endpoint: true,
        nodes: true,
      },
      orderBy: desc(workflows.id),
    });

    // 2. Bulk get workflow run history counts AND last run timestamps
    const workflowUUIDs = workflowsData.map((w) => w.uuid);

    const historyStats = await ctx.db
      .select({
        workflowId: workflowRunHistory.workflowId,
        count: count(),
        lastRunAt: max(workflowRunHistory.createdAt),
      })
      .from(workflowRunHistory)
      .where(inArray(workflowRunHistory.workflowId, workflowUUIDs))
      .groupBy(workflowRunHistory.workflowId);

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

  // Get workflows by status
  getAllByStatus: publicProcedure
    .input(z.object({ status: z.nativeEnum(WorkflowStatus) }))
    .query(async ({ ctx, input }) => {
      return await db
        .select()
        .from(workflows)
        .where(eq(workflows.status, input.status));
    }),

  // Get workflow by UUID with nodes and edges
  getByUUID: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflowData = await db.query.workflows.findFirst({
        where: eq(workflows.uuid, input.uuid),
        with: {
          nodes: true,
          edges: true,
        },
      });
      return workflowData;
    }),

  // Create new workflow
  create: protectedMutationWithRateLimit
    .input(workflowCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // 🔒 SECURITY FIX: Get tenant from authenticated user context
        const tenantId = await getUserTenantId(ctx.session.user.id);
        const workflowData = await db
          .insert(workflows)
          .values({
            ...input,
            tenantId,
          })
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

  // Update workflow settings (name, description, type)
  updateSettings: publicProcedure
    .input(workflowUpdateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workflowData = await db
          .update(workflows)
          .set({
            name: input.name,
            description: input.description,
            type: input.type,
          })
          .where(eq(workflows.uuid, input.uuid))
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

  // Delete workflow
  delete: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workflowData = await db
          .delete(workflows)
          .where(eq(workflows.uuid, input.uuid))
          .returning();
        
        return { 
          success: true, 
          deletedWorkflow: workflowData[0] 
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete workflow",
        });
      }
    }),
}); 
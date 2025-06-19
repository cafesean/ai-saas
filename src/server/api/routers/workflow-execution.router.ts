import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { WorkflowStatus } from "@/constants/general";

/**
 * Workflow Execution Router
 * 
 * Handles workflow execution and runtime operations:
 * - Status updates
 * - Execution control
 * - Runtime monitoring
 */
export const workflowExecutionRouter = createTRPCRouter({
  // Update workflow status
  updateStatus: publicProcedure
    .input(z.object({ 
      uuid: z.string(), 
      status: z.nativeEnum(WorkflowStatus) 
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workflowData = await db
          .update(workflows)
          .set({
            status: input.status,
          })
          .where(eq(workflows.uuid, input.uuid))
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

  // Get workflow execution status
  getExecutionStatus: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const workflow = await db.query.workflows.findFirst({
          where: eq(workflows.uuid, input.uuid),
          columns: {
            uuid: true,
            name: true,
            status: true,
            updatedAt: true,
          },
        });

        if (!workflow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workflow not found",
          });
        }

        return {
          uuid: workflow.uuid,
          name: workflow.name,
          status: workflow.status,
          lastUpdated: workflow.updatedAt,
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workflow execution status",
        });
      }
    }),

  // Pause workflow execution
  pause: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        // Update workflow status to paused
        const [workflow] = await tx
          .update(workflows)
          .set({
            status: WorkflowStatus.PAUSED,
            updatedAt: new Date(),
          })
          .where(eq(workflows.uuid, input.uuid))
          .returning();

        if (!workflow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workflow not found",
          });
        }

        return {
          uuid: workflow.uuid,
          status: workflow.status,
          message: "Workflow paused successfully",
        };
      });
    }),

  // Resume workflow execution
  resume: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        // Update workflow status to published
        const [workflow] = await tx
          .update(workflows)
          .set({
            status: WorkflowStatus.PUBLISHED,
            updatedAt: new Date(),
          })
          .where(eq(workflows.uuid, input.uuid))
          .returning();

        if (!workflow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workflow not found",
          });
        }

        return {
          uuid: workflow.uuid,
          status: workflow.status,
          message: "Workflow resumed successfully",
        };
      });
    }),
}); 
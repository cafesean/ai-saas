import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { workflowCoreRouter } from "./workflow-core.router";
import { workflowExecutionRouter } from "./workflow-execution.router";
import { workflowN8nRouter } from "./workflow-n8n.router";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Main Workflow Router
 * 
 * This router combines all workflow-related sub-routers:
 * - Core: Basic CRUD operations (getAll, create, getByUUID, updateSettings)
 * - Execution: Status updates and runtime operations (updateStatus, pause, resume)
 * - N8N: Complex N8N integration operations (update, syncSettings, deleteFlow)
 * 
 * The complex workflow update procedure with N8N integration has been extracted
 * to the workflowN8nRouter for better maintainability.
 */
export const workflowRouter = createTRPCRouter({
  // Merge all sub-routers
  core: workflowCoreRouter,
  execution: workflowExecutionRouter,
  n8n: workflowN8nRouter,

  // Direct access to most commonly used procedures for backward compatibility
  getAll: workflowCoreRouter.getAll,
  create: workflowCoreRouter.create,
  getByUUID: workflowCoreRouter.getByUUID,
  updateSettings: workflowCoreRouter.updateSettings,
  getAllByStatus: workflowCoreRouter.getAllByStatus,
  
  updateStatus: workflowExecutionRouter.updateStatus,
  getExecutionStatus: workflowExecutionRouter.getExecutionStatus,
  pause: workflowExecutionRouter.pause,
  resume: workflowExecutionRouter.resume,
  
  update: workflowN8nRouter.update,
  syncSettings: workflowN8nRouter.syncSettings,
  deleteFlow: workflowN8nRouter.deleteFlow,

  // Enhanced delete that also removes from N8N
  delete: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleteResponse = await db.transaction(async (tx) => {
        // Get workflow to check if it has N8N flowId
        const workflow = await tx.query.workflows.findFirst({
          where: eq(workflows.uuid, input.uuid),
        });
        
        if (workflow?.flowId) {
          // Delete from N8N first using our N8N router
          try {
            await workflowN8nRouter.createCaller(ctx).deleteFlow({ 
              flowId: workflow.flowId 
            });
          } catch (error) {
            console.log("Failed to delete from N8N, continuing with local delete");
          }
        }
        
        // Delete from local database
        return await tx
          .delete(workflows)
          .where(eq(workflows.uuid, input.uuid))
          .returning();
      });
      
      return { 
        success: true, 
        deletedWorkflow: deleteResponse[0] 
      };
    }),
}); 
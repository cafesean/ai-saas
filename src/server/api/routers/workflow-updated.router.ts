import { createTRPCRouter } from "../trpc";
import { workflowCoreRouter } from "./workflow-core.router";
import { workflowExecutionRouter } from "./workflow-execution.router";

/**
 * Main Workflow Router
 * 
 * This router combines all workflow-related sub-routers:
 * - Core: Basic CRUD operations
 * - Execution: Status updates and runtime operations
 * - Nodes: Complex node/edge management and N8N integration (to be added)
 * - N8N: Pure N8N integration operations (to be added)
 */
export const workflowRouter = createTRPCRouter({
  // Core CRUD operations
  ...workflowCoreRouter._def.procedures,
  
  // Execution and status management
  ...workflowExecutionRouter._def.procedures,
  
  // TODO: Add workflow nodes router procedures
  // ...workflowNodesRouter._def.procedures,
  
  // TODO: Add workflow N8N router procedures  
  // ...workflowN8nRouter._def.procedures,
}); 
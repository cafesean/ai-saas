import { createTRPCRouter } from "./trpc";
import { n8nRouter } from "./routers/n8n";
import { modelRouter } from "./routers/model.router";
import { workflowRouter } from "./routers/workflow.router";
import { templateRouter } from "./routers/template.router";
import { widgetsRouter} from "./routers/widget.router";
import { rulesRouter } from "./routers/rule.router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 * The name you use here will be the name you import in your client code.
 */
export const appRouter = createTRPCRouter({
  n8n: n8nRouter,
	model: modelRouter,
	workflow: workflowRouter,
	template: templateRouter,
	widget: widgetsRouter,
	rule: rulesRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

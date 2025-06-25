import { createTRPCRouter } from "./trpc";
import { n8nRouter } from "./routers/n8n";
import { modelRouter } from "./routers/model.router";
import { workflowRouter } from "./routers/workflow.router";
import { templateRouter } from "./routers/template.router";
import { widgetsRouter } from "./routers/widget.router";
import { rulesRouter } from "./routers/rule.router";
import { decisionTableRouter } from "./routers/decisionTable.router";
import { knowledgeBasesRouter } from "./routers/knowledge-bases.router";
import { dashboardRouter } from "./routers/dashboard.router";
import { adminRouter } from "./routers/admin.router";
import { twilioRouter } from "./routers/twilio.router";
import { roleRouter } from "./routers/role.router";
import { permissionRouter } from "./routers/permission.router";
import { authRouter } from "./routers/auth.router";
import { userRouter } from "./routers/user.router";
import { orgRouter } from "./routers/org.router";
import { variableRouter } from "./routers/variable.router";
import { lookupTableRouter } from "./routers/lookup-table.router";
import { ruleSetRouter } from "./routers/rule-set.router";
/**
 *
/**
 * This is the primary router for your server.
/**
 *

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
  decisionTable: decisionTableRouter,
  knowledgeBases: knowledgeBasesRouter,
  dashboard: dashboardRouter,
  admin: adminRouter,
  twilio: twilioRouter,
  role: roleRouter,
  permission: permissionRouter,
  auth: authRouter,
  user: userRouter,
  org: orgRouter,
  variable: variableRouter,
  lookupTable: lookupTableRouter,
  ruleSet: ruleSetRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

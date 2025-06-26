import { z } from "zod";
import { eq, sql, gte, lt, and, desc } from "drizzle-orm";

import { db } from "@/db";
import { models, inferences, workflows } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { ModelStatus } from "@/constants/general";
import { createTRPCRouter, protectedProcedure, getUserOrgId } from "../trpc";
import { WorkflowStatus } from "@/constants/general";
import type { ExtendedSession } from "@/db/auth-hydration";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
    try {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);
      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No org access",
        });
      }

      const now = new Date();
      const firstDayOfThisMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );
      const firstDayOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const totalModels = await db
        .select({ count: sql<number>`count(*)` })
        .from(models)
        .where(eq(models.orgId, orgId));

      const modelsLastMonth = await db
        .select({ count: sql<number>`count(*)` })
        .from(models)
        .where(
          and(
            eq(models.orgId, orgId),
            gte(models.createdAt, firstDayOfLastMonth),
            lt(models.createdAt, firstDayOfThisMonth),
          ),
        );
      const activeModels = await db
        .select({ count: sql<number>`count(*)` })
        .from(models)
        .where(
          and(
            eq(models.orgId, orgId),
            eq(models.status, ModelStatus.ACTIVE)
          )
        );
      const activeModelsLastMonth = await db
        .select({ count: sql<number>`count(*)` })
        .from(models)
        .where(
          and(
            eq(models.orgId, orgId),
            gte(models.createdAt, firstDayOfLastMonth),
            lt(models.createdAt, firstDayOfThisMonth),
            eq(models.status, ModelStatus.ACTIVE),
          ),
        );

      const totalInferences = await db
        .select({ count: sql<number>`count(*)` })
        .from(inferences)
        .innerJoin(models, eq(inferences.modelId, models.id))
        .where(eq(models.orgId, orgId));

      const publishedWorkflows = await db
        .select({ count: sql<number>`count(*)` })
        .from(workflows)
        .where(
          and(
            eq(workflows.orgId, orgId),
            eq(workflows.status, WorkflowStatus.PUBLISHED)
          )
        );
      const publishedWorkflowsLastMonth = await db
        .select({ count: sql<number>`count(*)` })
        .from(workflows)
        .where(
          and(
            eq(workflows.orgId, orgId),
            gte(workflows.createdAt, firstDayOfLastMonth),
            lt(workflows.createdAt, firstDayOfThisMonth),
            eq(workflows.status, WorkflowStatus.PUBLISHED),
          ),
        );
      const latestThreePublishedWorkflows = await db
        .select()
        .from(workflows)
        .where(
          and(
            eq(workflows.orgId, orgId),
            eq(workflows.status, WorkflowStatus.PUBLISHED)
          )
        )
        .orderBy(desc(workflows.createdAt))
        .limit(3);
      const latestThreeInferences = await db
        .select({
          inference: inferences,
          model: models,
        })
        .from(inferences)
        .innerJoin(models, eq(inferences.modelId, models.id))
        .where(eq(models.orgId, orgId))
        .orderBy(desc(inferences.createdAt))
        .limit(3);

      return {
        totalModels: totalModels[0]?.count,
        modelsLastMonth: modelsLastMonth[0]?.count,
        activeModels: activeModels[0]?.count,
        activeModelsLastMonth: activeModelsLastMonth[0]?.count,
        totalInferences: totalInferences[0]?.count,
        publishedWorkflows: publishedWorkflows[0]?.count,
        publishedWorkflowsLastMonth: publishedWorkflowsLastMonth[0]?.count,
        latestThreePublishedWorkflows,
        latestThreeInferences,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get stats",
      });
    }
  }),
});

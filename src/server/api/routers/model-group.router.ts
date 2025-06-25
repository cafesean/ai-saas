import { z } from "zod";
import { eq, asc, desc, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { modelGroups, modelGroupMemberships, models } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { ModelGroupRole, ModelGroupStatus } from "@/constants/general";
import { createTRPCRouter, protectedProcedure, getUserOrgId } from "../trpc";
import { NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST } from "@/constants/errorCode";
import {
  createModelGroupSchema,
  updateModelGroupSchema,
  createModelGroupMembershipSchema,
  bulkAssignModelsSchema,
  promoteToChampionSchema,
} from "@/schemas/model-group.schema";
import type { ExtendedSession } from "@/db/auth-hydration";

const MODEL_GROUP_NOT_FOUND_ERROR = "Model group not found";
const MODEL_GROUP_CREATE_ERROR = "Failed to create model group";
const MODEL_GROUP_UPDATE_ERROR = "Failed to update model group";
const MEMBERSHIP_CREATE_ERROR = "Failed to create model group membership";
const PROMOTION_ERROR = "Failed to promote challenger to champion";

export const modelGroupRouter = createTRPCRouter({
  // Get all model groups for the organization
  getAll: protectedProcedure
    .input(z.void())
    .query(async ({ ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      const modelGroupsData = await db.query.modelGroups.findMany({
        where: eq(modelGroups.orgId, orgId),
        orderBy: desc(modelGroups.updatedAt),
        with: {
          memberships: {
            where: eq(modelGroupMemberships.isActive, true),
            with: {
              model: {
                with: {
                  metrics: {
                    orderBy: desc(models.updatedAt),
                    limit: 1,
                  },
                },
              },
            },
          },
        },
      });
      return modelGroupsData;
    }),

  // Get model group by UUID
  getByUUID: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      const modelGroup = await db.query.modelGroups.findFirst({
        where: and(
          eq(modelGroups.uuid, input),
          eq(modelGroups.orgId, orgId)
        ),
        with: {
          memberships: {
            where: eq(modelGroupMemberships.isActive, true),
            with: {
              model: {
                with: {
                  metrics: {
                    orderBy: desc(models.updatedAt),
                    limit: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (!modelGroup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: MODEL_GROUP_NOT_FOUND_ERROR,
        });
      }

      return modelGroup;
    }),

  // Create a new model group
  create: protectedProcedure
    .input(createModelGroupSchema)
    .mutation(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      try {
        const newModelGroup = await db.transaction(async (tx) => {
          const [modelGroup] = await tx
            .insert(modelGroups)
            .values({
              uuid: uuidv4(),
              name: input.name,
              description: input.description,
              strategy: input.strategy,
              status: input.status || ModelGroupStatus.CONFIGURING,
              trafficConfig: input.trafficConfig,
              testMetadata: input.testMetadata,
              promotionRules: input.promotionRules,
              orgId,
            })
            .returning();

          return modelGroup;
        });

        return newModelGroup;
      } catch (error) {
        console.error("Model group creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: MODEL_GROUP_CREATE_ERROR,
        });
      }
    }),

  // Update model group
  update: protectedProcedure
    .input(updateModelGroupSchema)
    .mutation(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      try {
        const [updatedModelGroup] = await db
          .update(modelGroups)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(and(
            eq(modelGroups.uuid, input.uuid),
            eq(modelGroups.orgId, orgId)
          ))
          .returning();

        if (!updatedModelGroup) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: MODEL_GROUP_NOT_FOUND_ERROR,
          });
        }

        return updatedModelGroup;
      } catch (error) {
        console.error("Model group update error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: MODEL_GROUP_UPDATE_ERROR,
        });
      }
    }),

  // Delete model group
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      const [deletedModelGroup] = await db
        .delete(modelGroups)
        .where(and(
          eq(modelGroups.uuid, input),
          eq(modelGroups.orgId, orgId)
        ))
        .returning();

      if (!deletedModelGroup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: MODEL_GROUP_NOT_FOUND_ERROR,
        });
      }

      return deletedModelGroup;
    }),

  // Add models to a group with roles
  addModels: protectedProcedure
    .input(bulkAssignModelsSchema)
    .mutation(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      try {
        const result = await db.transaction(async (tx) => {
          // Verify model group exists and belongs to org
          const modelGroup = await tx.query.modelGroups.findFirst({
            where: and(
              eq(modelGroups.uuid, input.modelGroupUuid),
              eq(modelGroups.orgId, orgId)
            ),
          });

          if (!modelGroup) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: MODEL_GROUP_NOT_FOUND_ERROR,
            });
          }

          // Create memberships
          const memberships = [];
          for (const assignment of input.assignments) {
            // Get model by UUID
            const model = await tx.query.models.findFirst({
              where: and(
                eq(models.uuid, assignment.modelUuid),
                eq(models.orgId, orgId)
              ),
            });

            if (!model) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Model ${assignment.modelUuid} not found`,
              });
            }

            // If assigning as champion, deactivate current champion
            if (assignment.role === ModelGroupRole.CHAMPION) {
              await tx
                .update(modelGroupMemberships)
                .set({ isActive: false })
                .where(and(
                  eq(modelGroupMemberships.modelGroupId, modelGroup.id),
                  eq(modelGroupMemberships.role, ModelGroupRole.CHAMPION),
                  eq(modelGroupMemberships.isActive, true)
                ));
            }

            const [membership] = await tx
              .insert(modelGroupMemberships)
              .values({
                uuid: uuidv4(),
                modelGroupId: modelGroup.id,
                modelId: model.id,
                role: assignment.role,
                trafficPercentage: assignment.trafficPercentage,
              })
              .returning();

            memberships.push(membership);
          }

          return memberships;
        });

        return result;
      } catch (error) {
        console.error("Add models error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: MEMBERSHIP_CREATE_ERROR,
        });
      }
    }),

  // Promote challenger to champion
  promoteToChampion: protectedProcedure
    .input(promoteToChampionSchema)
    .mutation(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      try {
        const result = await db.transaction(async (tx) => {
          // Get model group
          const modelGroup = await tx.query.modelGroups.findFirst({
            where: and(
              eq(modelGroups.uuid, input.modelGroupUuid),
              eq(modelGroups.orgId, orgId)
            ),
          });

          if (!modelGroup) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: MODEL_GROUP_NOT_FOUND_ERROR,
            });
          }

          // Get challenger model
          const challengerModel = await tx.query.models.findFirst({
            where: and(
              eq(models.uuid, input.challengerModelUuid),
              eq(models.orgId, orgId)
            ),
          });

          if (!challengerModel) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Challenger model not found",
            });
          }

          // Verify challenger is in the group
          const challengerMembership = await tx.query.modelGroupMemberships.findFirst({
            where: and(
              eq(modelGroupMemberships.modelGroupId, modelGroup.id),
              eq(modelGroupMemberships.modelId, challengerModel.id),
              eq(modelGroupMemberships.role, ModelGroupRole.CHALLENGER),
              eq(modelGroupMemberships.isActive, true)
            ),
          });

          if (!challengerMembership) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Model is not an active challenger in this group",
            });
          }

          // Deactivate current champion
          await tx
            .update(modelGroupMemberships)
            .set({ isActive: false })
            .where(and(
              eq(modelGroupMemberships.modelGroupId, modelGroup.id),
              eq(modelGroupMemberships.role, ModelGroupRole.CHAMPION),
              eq(modelGroupMemberships.isActive, true)
            ));

          // Promote challenger to champion
          const [promotedMembership] = await tx
            .update(modelGroupMemberships)
            .set({ 
              role: ModelGroupRole.CHAMPION,
              assignedAt: new Date(),
            })
            .where(eq(modelGroupMemberships.id, challengerMembership.id))
            .returning();

          return promotedMembership;
        });

        return result;
      } catch (error) {
        console.error("Promotion error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: PROMOTION_ERROR,
        });
      }
    }),

  // Get champion/challenger performance comparison
  getPerformanceComparison: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      const modelGroup = await db.query.modelGroups.findFirst({
        where: and(
          eq(modelGroups.uuid, input),
          eq(modelGroups.orgId, orgId)
        ),
        with: {
          memberships: {
            where: eq(modelGroupMemberships.isActive, true),
            with: {
              model: {
                with: {
                  metrics: {
                    orderBy: desc(models.updatedAt),
                    limit: 5, // Get recent metrics
                  },
                  inferences: {
                    orderBy: desc(models.updatedAt),
                    limit: 100, // Get recent inferences for comparison
                  },
                },
              },
            },
          },
        },
      });

      if (!modelGroup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: MODEL_GROUP_NOT_FOUND_ERROR,
        });
      }

      // Separate champion and challengers
      const champion = modelGroup.memberships.find(m => m.role === ModelGroupRole.CHAMPION);
      const challengers = modelGroup.memberships.filter(m => m.role === ModelGroupRole.CHALLENGER);

      return {
        modelGroup,
        champion,
        challengers,
        // Add performance comparison logic here
        comparison: {
          // This would include statistical significance tests,
          // performance metrics comparison, etc.
        },
      };
    }),
}); 
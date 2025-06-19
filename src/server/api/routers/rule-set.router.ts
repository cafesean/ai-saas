import { z } from "zod";
import { createTRPCRouter, protectedProcedure, getUserTenantId } from "../trpc";
import { desc, eq, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { rule_sets, rule_set_steps } from "@/db/schema";
import { RuleSetStatus } from "@/db/schema/rule_set";

// Validation schemas
const createRuleSetSchema = z.object({
  name: z.string().min(1, "Rule set name is required"),
  description: z.string().optional(),
  inputSchema: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().default(false),
    description: z.string().optional(),
  })).optional(),
  outputSchema: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
  })).optional(),
});

const updateRuleSetSchema = createRuleSetSchema.extend({
  uuid: z.string().uuid(),
  version: z.number().optional(),
});

const publishRuleSetSchema = z.object({
  uuid: z.string().uuid(),
});

const createStepSchema = z.object({
  ruleSetId: z.string().uuid(),
  stepName: z.string().min(1, "Step name is required"),
  stepOrder: z.number().int().min(1),
  artifactType: z.enum(["decision_table", "lookup_table", "variable", "formula"]),
  artifactId: z.string().uuid(),
  inputMapping: z.record(z.any()).optional(),
  outputMapping: z.record(z.any()).optional(),
  executionCondition: z.string().optional(),
});

const updateStepSchema = createStepSchema.extend({
  uuid: z.string().uuid(),
}).omit({ ruleSetId: true });

const reorderStepsSchema = z.object({
  ruleSetId: z.string().uuid(),
  steps: z.array(z.object({
    uuid: z.string().uuid(),
    stepOrder: z.number().int().min(1),
  })),
});

export const ruleSetRouter = createTRPCRouter({
  // Get all rule sets for current tenant
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.enum([RuleSetStatus.DRAFT, RuleSetStatus.PUBLISHED, RuleSetStatus.DEPRECATED]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access found",
        });
      }

      const whereConditions = [eq(rule_sets.tenantId, tenantId)];
      
      if (input?.status) {
        whereConditions.push(eq(rule_sets.status, input.status));
      }

      const ruleSetList = await db
        .select()
        .from(rule_sets)
        .where(and(...whereConditions))
        .orderBy(desc(rule_sets.updatedAt));

      return ruleSetList;
    }),

  // Get published rule sets only (for use in workflows)
  getPublished: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    if (!tenantId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access found",
      });
    }

    const publishedRuleSets = await db
      .select()
      .from(rule_sets)
      .where(
        and(
          eq(rule_sets.tenantId, tenantId),
          eq(rule_sets.status, RuleSetStatus.PUBLISHED)
        )
      )
      .orderBy(rule_sets.name);

    return publishedRuleSets;
  }),

  // Get rule set by UUID with steps
  getByUuid: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access found",
        });
      }

      const ruleSet = await db.query.rule_sets.findFirst({
        where: and(
          eq(rule_sets.uuid, input),
          eq(rule_sets.tenantId, tenantId)
        ),
      });

      if (!ruleSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rule set not found",
        });
      }

      // Get steps for this rule set
      const steps = await db
        .select()
        .from(rule_set_steps)
        .where(eq(rule_set_steps.ruleSetId, input))
        .orderBy(asc(rule_set_steps.stepOrder));

      return {
        ...ruleSet,
        steps,
      };
    }),

  // Create new rule set
  create: protectedProcedure
    .input(createRuleSetSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
      const userId = ctx.session?.user?.id;

      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access found",
        });
      }

      try {
        const [newRuleSet] = await db
          .insert(rule_sets)
          .values({
            ...input,
            tenantId,
            status: RuleSetStatus.DRAFT,
            version: 1,
          })
          .returning();

        return newRuleSet;
      } catch (error: any) {
        if (error.code === "23505") { // Unique constraint violation
          throw new TRPCError({
            code: "CONFLICT",
            message: "A rule set with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create rule set",
        });
      }
    }),

  // Update rule set (only drafts can be updated)
  update: protectedProcedure
    .input(updateRuleSetSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access found",
        });
      }

      // Check if rule set exists and is editable
      const existingRuleSet = await db.query.rule_sets.findFirst({
        where: and(
          eq(rule_sets.uuid, input.uuid),
          eq(rule_sets.tenantId, tenantId)
        ),
      });

      if (!existingRuleSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rule set not found",
        });
      }

      if (existingRuleSet.status !== RuleSetStatus.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft rule sets can be updated",
        });
      }

      try {
        const { uuid, version, ...updateData } = input;
        
        const [updatedRuleSet] = await db
          .update(rule_sets)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(rule_sets.uuid, input.uuid),
              eq(rule_sets.tenantId, tenantId)
            )
          )
          .returning();

        return updatedRuleSet;
      } catch (error: any) {
        if (error.code === "23505") { // Unique constraint violation
          throw new TRPCError({
            code: "CONFLICT",
            message: "A rule set with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update rule set",
        });
      }
    }),

  // Publish rule set (makes it available for use in workflows)
  publish: protectedProcedure
    .input(publishRuleSetSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
      const userId = ctx.session?.user?.id;

      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access found",
        });
      }

      const existingRuleSet = await db.query.rule_sets.findFirst({
        where: and(
          eq(rule_sets.uuid, input.uuid),
          eq(rule_sets.tenantId, tenantId)
        ),
      });

      if (!existingRuleSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rule set not found",
        });
      }

      if (existingRuleSet.status !== RuleSetStatus.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft rule sets can be published",
        });
      }

      // Validate that rule set has at least one step
      const stepCount = await db
        .select({ count: rule_set_steps.id })
        .from(rule_set_steps)
        .where(eq(rule_set_steps.ruleSetId, input.uuid));

      if (!stepCount.length || stepCount[0].count === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Rule set must have at least one step before publishing",
        });
      }

      const [publishedRuleSet] = await db
        .update(rule_sets)
        .set({
          status: RuleSetStatus.PUBLISHED,
          publishedAt: new Date(),
          publishedBy: userId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(rule_sets.uuid, input.uuid),
            eq(rule_sets.tenantId, tenantId)
          )
        )
        .returning();

      return publishedRuleSet;
    }),

  // Deprecate rule set
  deprecate: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access found",
        });
      }

      const existingRuleSet = await db.query.rule_sets.findFirst({
        where: and(
          eq(rule_sets.uuid, input),
          eq(rule_sets.tenantId, tenantId)
        ),
      });

      if (!existingRuleSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rule set not found",
        });
      }

      if (existingRuleSet.status !== RuleSetStatus.PUBLISHED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only published rule sets can be deprecated",
        });
      }

      const [deprecatedRuleSet] = await db
        .update(rule_sets)
        .set({
          status: RuleSetStatus.DEPRECATED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(rule_sets.uuid, input),
            eq(rule_sets.tenantId, tenantId)
          )
        )
        .returning();

      return deprecatedRuleSet;
    }),

  // Delete rule set (only drafts can be deleted)
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access found",
        });
      }

      const existingRuleSet = await db.query.rule_sets.findFirst({
        where: and(
          eq(rule_sets.uuid, input),
          eq(rule_sets.tenantId, tenantId)
        ),
      });

      if (!existingRuleSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rule set not found",
        });
      }

      if (existingRuleSet.status !== RuleSetStatus.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft rule sets can be deleted",
        });
      }

      // Delete rule set (steps will be cascade deleted)
      await db
        .delete(rule_sets)
        .where(
          and(
            eq(rule_sets.uuid, input),
            eq(rule_sets.tenantId, tenantId)
          )
        );

      return { success: true, message: "Rule set deleted successfully" };
    }),

  // Nested router for step management
  steps: createTRPCRouter({
    // Create new step
    create: protectedProcedure
      .input(createStepSchema)
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
        const tenantId = await getUserTenantId(ctx.session.user.id);
        if (!tenantId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No tenant access found",
          });
        }

        // Verify rule set exists and is editable
        const ruleSet = await db.query.rule_sets.findFirst({
          where: and(
            eq(rule_sets.uuid, input.ruleSetId),
            eq(rule_sets.tenantId, tenantId)
          ),
        });

        if (!ruleSet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Rule set not found",
          });
        }

        if (ruleSet.status !== RuleSetStatus.DRAFT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only add steps to draft rule sets",
          });
        }

        try {
          const [newStep] = await db
            .insert(rule_set_steps)
            .values(input)
            .returning();

          return newStep;
        } catch (error: any) {
          if (error.code === "23505") { // Unique constraint violation
            throw new TRPCError({
              code: "CONFLICT",
              message: "A step with this order already exists",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create step",
          });
        }
      }),

    // Update step
    update: protectedProcedure
      .input(updateStepSchema)
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
        const tenantId = await getUserTenantId(ctx.session.user.id);
        if (!tenantId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No tenant access found",
          });
        }

        // Get step and verify rule set is editable
        const step = await db.query.rule_set_steps.findFirst({
          where: eq(rule_set_steps.uuid, input.uuid),
        });

        if (!step) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step not found",
          });
        }

        const ruleSet = await db.query.rule_sets.findFirst({
          where: and(
            eq(rule_sets.uuid, step.ruleSetId),
            eq(rule_sets.tenantId, tenantId)
          ),
        });

        if (!ruleSet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Rule set not found",
          });
        }

        if (ruleSet.status !== RuleSetStatus.DRAFT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only update steps in draft rule sets",
          });
        }

        try {
          const { uuid, ...updateData } = input;
          
          const [updatedStep] = await db
            .update(rule_set_steps)
            .set({
              ...updateData,
              updatedAt: new Date(),
            })
            .where(eq(rule_set_steps.uuid, input.uuid))
            .returning();

          return updatedStep;
        } catch (error: any) {
          if (error.code === "23505") { // Unique constraint violation
            throw new TRPCError({
              code: "CONFLICT",
              message: "A step with this order already exists",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update step",
          });
        }
      }),

    // Delete step
    delete: protectedProcedure
      .input(z.string().uuid())
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
        const tenantId = await getUserTenantId(ctx.session.user.id);
        if (!tenantId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No tenant access found",
          });
        }

        // Get step and verify rule set is editable
        const step = await db.query.rule_set_steps.findFirst({
          where: eq(rule_set_steps.uuid, input),
        });

        if (!step) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Step not found",
          });
        }

        const ruleSet = await db.query.rule_sets.findFirst({
          where: and(
            eq(rule_sets.uuid, step.ruleSetId),
            eq(rule_sets.tenantId, tenantId)
          ),
        });

        if (!ruleSet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Rule set not found",
          });
        }

        if (ruleSet.status !== RuleSetStatus.DRAFT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only delete steps from draft rule sets",
          });
        }

        await db
          .delete(rule_set_steps)
          .where(eq(rule_set_steps.uuid, input));

        return { success: true, message: "Step deleted successfully" };
      }),

    // Reorder steps
    reorder: protectedProcedure
      .input(reorderStepsSchema)
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
        const tenantId = await getUserTenantId(ctx.session.user.id);
        if (!tenantId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No tenant access found",
          });
        }

        // Verify rule set exists and is editable
        const ruleSet = await db.query.rule_sets.findFirst({
          where: and(
            eq(rule_sets.uuid, input.ruleSetId),
            eq(rule_sets.tenantId, tenantId)
          ),
        });

        if (!ruleSet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Rule set not found",
          });
        }

        if (ruleSet.status !== RuleSetStatus.DRAFT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only reorder steps in draft rule sets",
          });
        }

        // Update step orders in a transaction
        try {
          for (const step of input.steps) {
            await db
              .update(rule_set_steps)
              .set({
                stepOrder: step.stepOrder,
                updatedAt: new Date(),
              })
              .where(eq(rule_set_steps.uuid, step.uuid));
          }

          return { success: true, message: "Steps reordered successfully" };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to reorder steps",
          });
        }
      }),
  }),
}); 
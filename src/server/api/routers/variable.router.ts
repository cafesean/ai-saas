import { z } from "zod";
import { createTRPCRouter, protectedProcedure, getUserOrgId, protectedMutationWithRateLimit } from "../trpc";
import { desc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { ExtendedSession } from "@/db/auth-hydration";

import { db } from "@/db";
import { variables } from "@/db/schema";
import { VariableLogicTypes, VariableDataTypes, VariableStatus } from "@/db/schema/variable";

// Validation schemas
const createVariableSchema = z.object({
  name: z.string().min(1, "Variable name is required"),
  description: z.string().optional(),
  dataType: z.enum([
    VariableDataTypes.STRING,
    VariableDataTypes.NUMBER,
    VariableDataTypes.BOOLEAN,
    VariableDataTypes.DATE,
  ]),
  logicType: z.enum([
    VariableLogicTypes.DIRECT_MAP,
    VariableLogicTypes.FORMULA,
    VariableLogicTypes.LOOKUP,
  ]),
  formula: z.string().optional(),
  lookupTableId: z.string().uuid().optional(),
  defaultValue: z.string().optional(),
});

const updateVariableSchema = createVariableSchema.extend({
  uuid: z.string().uuid(),
  version: z.number().optional(),
});

const publishVariableSchema = z.object({
  uuid: z.string().uuid(),
});

export const variableRouter = createTRPCRouter({
  // Get all variables for current org
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.enum([VariableStatus.DRAFT, VariableStatus.PUBLISHED, VariableStatus.DEPRECATED]).optional(),
        logicType: z.enum([VariableLogicTypes.DIRECT_MAP, VariableLogicTypes.FORMULA, VariableLogicTypes.LOOKUP]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = session.user.orgId || 1;

      const whereConditions = [eq(variables.orgId, orgId)];
      
      if (input?.status) {
        whereConditions.push(eq(variables.status, input.status));
      }
      
      if (input?.logicType) {
        whereConditions.push(eq(variables.logicType, input.logicType));
      }

      const variableList = await db
        .select()
        .from(variables)
        .where(and(...whereConditions))
        .orderBy(desc(variables.updatedAt));

      return variableList;
    }),

  // Get published variables only (for use in other artifacts)
  getPublished: protectedProcedure.query(async ({ ctx }) => {
    const session = ctx.session as ExtendedSession;
    const orgId = session.user.orgId || 1;

    const publishedVariables = await db
      .select()
      .from(variables)
      .where(
        and(
          eq(variables.orgId, orgId),
          eq(variables.status, VariableStatus.PUBLISHED)
        )
      )
      .orderBy(variables.name);

    return publishedVariables;
  }),

  // Get variable by UUID
  getByUuid: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = session.user.orgId || 1;

      const variable = await db.query.variables.findFirst({
        where: and(
          eq(variables.uuid, input),
          eq(variables.orgId, orgId)
        ),
      });

      if (!variable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      return variable;
    }),

  // Create new variable
  create: protectedMutationWithRateLimit
    .input(createVariableSchema)
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = session.user.orgId || 1;
      const userId = session.user.id;

      // Validate logic type specific fields
      if (input.logicType === VariableLogicTypes.FORMULA && !input.formula) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Formula is required for formula logic type",
        });
      }

      if (input.logicType === VariableLogicTypes.LOOKUP && !input.lookupTableId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lookup table ID is required for lookup logic type",
        });
      }

      try {
        const [newVariable] = await db
          .insert(variables)
          .values({
            ...input,
            orgId,
            status: VariableStatus.DRAFT,
            version: 1,
          })
          .returning();

        return newVariable;
      } catch (error: any) {
        if (error.code === "23505") { // Unique constraint violation
          throw new TRPCError({
            code: "CONFLICT",
            message: "A variable with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create variable",
        });
      }
    }),

  // Update variable (only drafts can be updated)
  update: protectedMutationWithRateLimit
    .input(updateVariableSchema)
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = session.user.orgId || 1;

      // Check if variable exists and is editable
      const existingVariable = await db.query.variables.findFirst({
        where: and(
          eq(variables.uuid, input.uuid),
          eq(variables.orgId, orgId)
        ),
      });

      if (!existingVariable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      if (existingVariable.status !== VariableStatus.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft variables can be updated",
        });
      }

      // Validate logic type specific fields
      if (input.logicType === VariableLogicTypes.FORMULA && !input.formula) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Formula is required for formula logic type",
        });
      }

      if (input.logicType === VariableLogicTypes.LOOKUP && !input.lookupTableId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lookup table ID is required for lookup logic type",
        });
      }

      try {
        const { uuid, version, ...updateData } = input;
        
        const [updatedVariable] = await db
          .update(variables)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(variables.uuid, input.uuid),
              eq(variables.orgId, orgId)
            )
          )
          .returning();

        return updatedVariable;
      } catch (error: any) {
        if (error.code === "23505") { // Unique constraint violation
          throw new TRPCError({
            code: "CONFLICT",
            message: "A variable with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update variable",
        });
      }
    }),

  // Publish variable (makes it available for use in other artifacts)
  publish: protectedProcedure
    .input(publishVariableSchema)
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = session.user.orgId || 1;
      const userId = session.user.id;

      const existingVariable = await db.query.variables.findFirst({
        where: and(
          eq(variables.uuid, input.uuid),
          eq(variables.orgId, orgId)
        ),
      });

      if (!existingVariable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      if (existingVariable.status !== VariableStatus.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft variables can be published",
        });
      }

      const [publishedVariable] = await db
        .update(variables)
        .set({
          status: VariableStatus.PUBLISHED,
          publishedAt: new Date(),
          publishedBy: userId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(variables.uuid, input.uuid),
            eq(variables.orgId, orgId)
          )
        )
        .returning();

      return publishedVariable;
    }),

  // Deprecate variable
  deprecate: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = session.user.orgId || 1;

      const existingVariable = await db.query.variables.findFirst({
        where: and(
          eq(variables.uuid, input),
          eq(variables.orgId, orgId)
        ),
      });

      if (!existingVariable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      if (existingVariable.status !== VariableStatus.PUBLISHED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only published variables can be deprecated",
        });
      }

      const [deprecatedVariable] = await db
        .update(variables)
        .set({
          status: VariableStatus.DEPRECATED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(variables.uuid, input),
            eq(variables.orgId, orgId)
          )
        )
        .returning();

      return deprecatedVariable;
    }),

  // Delete variable (only drafts can be deleted)
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = session.user.orgId || 1;

      const existingVariable = await db.query.variables.findFirst({
        where: and(
          eq(variables.uuid, input),
          eq(variables.orgId, orgId)
        ),
      });

      if (!existingVariable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      if (existingVariable.status !== VariableStatus.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft variables can be deleted",
        });
      }

      await db
        .delete(variables)
        .where(
          and(
            eq(variables.uuid, input),
            eq(variables.orgId, orgId)
          )
        );

      return { success: true, message: "Variable deleted successfully" };
    }),
}); 
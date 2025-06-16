import { z } from "zod"
import { eq, and, desc } from "drizzle-orm"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { 
  lookup_tables
} from "@/db/schema/lookup_table"
import { TRPCError } from "@trpc/server"

export const lookupTableRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = 1;
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access",
        })
      }

      // TEMPORARY FIX: Only select existing columns from current database schema
      const tables = await ctx.db
        .select({
          id: lookup_tables.id,
          uuid: lookup_tables.uuid,
          name: lookup_tables.name,
          description: lookup_tables.description,
          status: lookup_tables.status,
          version: lookup_tables.version,
          tenantId: lookup_tables.tenantId,
          createdAt: lookup_tables.createdAt,
          updatedAt: lookup_tables.updatedAt,
        })
        .from(lookup_tables)
        .where(eq(lookup_tables.tenantId, tenantId))
        .orderBy(desc(lookup_tables.updatedAt))

      return tables
    }),

  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "published", "deprecated"]).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = 1;
      if (!tenantId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tenant access",
        })
      }

      const conditions = [eq(lookup_tables.tenantId, tenantId)]

      if (input.status) {
        conditions.push(eq(lookup_tables.status, input.status))
      }

      // TEMPORARY FIX: Only select existing columns
      const tables = await ctx.db
        .select({
          id: lookup_tables.id,
          uuid: lookup_tables.uuid,
          name: lookup_tables.name,
          description: lookup_tables.description,
          status: lookup_tables.status,
          version: lookup_tables.version,
          tenantId: lookup_tables.tenantId,
          createdAt: lookup_tables.createdAt,
          updatedAt: lookup_tables.updatedAt,
        })
        .from(lookup_tables)
        .where(and(...conditions))
        .orderBy(desc(lookup_tables.updatedAt))

      return tables.filter(
        (table) =>
          !input.search ||
          table.name.toLowerCase().includes(input.search.toLowerCase()) ||
          table.description?.toLowerCase().includes(input.search.toLowerCase()),
      )
    }),

  // TEMPORARILY DISABLED: Create/Update/Delete operations until database migration is complete
  // These will be re-enabled with N-dimensional support once schema is migrated

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "CRUD operations temporarily disabled during N-dimensional migration",
      })
    }),

  getByUuid: protectedProcedure
    .input(z.object({ uuid: z.string() }))
    .query(async ({ ctx, input }) => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED", 
        message: "CRUD operations temporarily disabled during N-dimensional migration",
      })
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Create operations temporarily disabled during N-dimensional migration",
      })
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Update operations temporarily disabled during N-dimensional migration", 
      })
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Publish operations temporarily disabled during N-dimensional migration",
      })
    }),

  deprecate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Deprecate operations temporarily disabled during N-dimensional migration",
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: "NOT_IMPLEMENTED", 
        message: "Delete operations temporarily disabled during N-dimensional migration",
      })
    }),
}) 
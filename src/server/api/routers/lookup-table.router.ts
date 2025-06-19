import { z } from "zod"
import { eq, and, desc } from "drizzle-orm"
import { createTRPCRouter, protectedProcedure, getUserTenantId } from "../trpc"
import { 
  lookup_tables, 
  lookup_table_dimension_bins, 
  lookup_table_cells,
  lookup_table_inputs,
  lookup_table_outputs
} from "@/db/schema/lookup_table"
import { TRPCError } from "@trpc/server"

const createLookupTableSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  outputVariableId: z.number(),
  inputVariable1Id: z.number(),
  inputVariable2Id: z.number().optional(),
  dimensionBins: z.array(
    z.object({
      dimension: z.number().min(1).max(2),
      binIndex: z.number(),
      label: z.string(),
      binType: z.enum(["exact", "range"]),
      exactValue: z.string().optional(),
      rangeMin: z.number().optional(),
      rangeMax: z.number().optional(),
      isMinInclusive: z.boolean().default(true),
      isMaxInclusive: z.boolean().default(false),
    }),
  ),
  cells: z.array(
    z.object({
      row1BinIndex: z.number(),
      row2BinIndex: z.number().optional(),
      outputValue: z.string(),
    }),
  ),
})

const updateLookupTableSchema = createLookupTableSchema.extend({
  id: z.number(),
})

export const lookupTableRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "published", "deprecated"]).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
      const tenantId = await getUserTenantId(ctx.session.user.id);
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

      const tables = await ctx.db
        .select()
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

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    if (!tenantId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access",
      })
    }

    const table = await ctx.db.query.lookup_tables.findFirst({
      where: and(eq(lookup_tables.id, input.id), eq(lookup_tables.tenantId, tenantId)),
      with: {
        inputs: {
          with: {
            variable: true,
          },
        },
        outputs: {
          with: {
            variable: true,
          },
        },
        dimensionBins: {
          orderBy: [lookup_table_dimension_bins.dimensionOrder, lookup_table_dimension_bins.binIndex],
        },
        cells: true,
      },
    })

    if (!table) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return table
  }),

  getByUuid: protectedProcedure.input(z.object({ uuid: z.string() })).query(async ({ ctx, input }) => {
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    if (!tenantId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access",
      })
    }

    const table = await ctx.db.query.lookup_tables.findFirst({
      where: and(eq(lookup_tables.uuid, input.uuid), eq(lookup_tables.tenantId, tenantId)),
      with: {
        inputs: {
          with: {
            variable: true,
          },
        },
        outputs: {
          with: {
            variable: true,
          },
        },
        dimensionBins: {
          orderBy: [lookup_table_dimension_bins.dimensionOrder, lookup_table_dimension_bins.binIndex],
        },
        cells: true,
      },
    })

    if (!table) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return table
  }),

  create: protectedProcedure.input(createLookupTableSchema).mutation(async ({ ctx, input }) => {
    console.log("Create lookup table input:", input)
    
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    const userId = ctx.session?.user?.id || 1 // Fallback to user ID 1 for now
    
    console.log("Session:", ctx.session)
    console.log("User ID:", userId)
    console.log("Tenant ID:", tenantId)
    
    if (!tenantId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access",
      })
    }

    return await ctx.db.transaction(async (tx) => {
      // Create the lookup table
      const [newTable] = await tx
        .insert(lookup_tables)
        .values({
          tenantId: tenantId,
          name: input.name,
          description: input.description,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning()

      if (!newTable) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create lookup table",
        })
      }

      // Create input variable mappings
      const inputInserts = []
      if (input.inputVariable1Id) {
        inputInserts.push({
          tenantId: tenantId,
          lookupTableId: newTable.id,
          variableId: input.inputVariable1Id,
          dimensionOrder: 1,
        })
      }
      if (input.inputVariable2Id) {
        inputInserts.push({
          tenantId: tenantId,
          lookupTableId: newTable.id,
          variableId: input.inputVariable2Id,
          dimensionOrder: 2,
        })
      }
      if (inputInserts.length > 0) {
        await tx.insert(lookup_table_inputs).values(inputInserts)
      }

      // Create output variable mapping
      await tx.insert(lookup_table_outputs).values({
        tenantId: tenantId,
        lookupTableId: newTable.id,
        variableId: input.outputVariableId,
        outputOrder: 1,
      })

      // Create dimension bins
      const binInserts = input.dimensionBins.map((bin) => ({
        tenantId: tenantId,
        lookupTableId: newTable.id,
        dimension: bin.dimension,
        dimensionOrder: bin.dimension,
        binIndex: bin.binIndex,
        label: bin.label,
        binType: bin.binType,
        exactValue: bin.exactValue,
        rangeMin: bin.rangeMin?.toString(),
        rangeMax: bin.rangeMax?.toString(),
        isMinInclusive: bin.isMinInclusive,
        isMaxInclusive: bin.isMaxInclusive,
      }))

      console.log("Creating dimension bins:", binInserts)
      const createdBins = await tx.insert(lookup_table_dimension_bins).values(binInserts).returning()

      // Create a mapping from bin index to bin ID for cell creation
      const binIndexToId = new Map<string, number>()
      createdBins.forEach((bin) => {
        const key = `${bin.dimensionOrder}-${bin.binIndex}`
        binIndexToId.set(key, bin.id)
      })

      // Create cells using legacy format for backward compatibility
      const cellInserts = input.cells.map((cell) => {
        const row1BinId = binIndexToId.get(`1-${cell.row1BinIndex}`)!
        const row2BinId = cell.row2BinIndex !== undefined ? binIndexToId.get(`2-${cell.row2BinIndex}`)! : undefined

        return {
          tenantId: tenantId,
          lookupTableId: newTable.id,
          // Use legacy columns for compatibility with existing database schema
          row1BinId: row1BinId,
          row2BinId: row2BinId,
          outputValue: cell.outputValue,
          // Also include N-dimensional format if database supports it
          inputCoordinates: {
            "1": row1BinId,
            ...(row2BinId ? { "2": row2BinId } : {})
          },
          outputValues: { "1": cell.outputValue },
        }
      })

      await tx.insert(lookup_table_cells).values(cellInserts)

      return newTable
    })
  }),

  update: protectedProcedure.input(updateLookupTableSchema).mutation(async ({ ctx, input }) => {
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    const userId = ctx.session?.user?.id
    if (!tenantId || !userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access",
      })
    }

    return await ctx.db.transaction(async (tx) => {
      // Update the lookup table
      const [updatedTable] = await tx
        .update(lookup_tables)
        .set({
          name: input.name,
          description: input.description,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(and(eq(lookup_tables.id, input.id), eq(lookup_tables.tenantId, tenantId)))
        .returning()

      if (!updatedTable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lookup table not found",
        })
      }

      // Delete existing related data
      await tx.delete(lookup_table_cells).where(eq(lookup_table_cells.lookupTableId, input.id))
      await tx.delete(lookup_table_dimension_bins).where(eq(lookup_table_dimension_bins.lookupTableId, input.id))
      await tx.delete(lookup_table_inputs).where(eq(lookup_table_inputs.lookupTableId, input.id))
      await tx.delete(lookup_table_outputs).where(eq(lookup_table_outputs.lookupTableId, input.id))

      // Recreate input variable mappings
      const inputInserts = []
      if (input.inputVariable1Id) {
        inputInserts.push({
          tenantId: tenantId,
          lookupTableId: updatedTable.id,
          variableId: input.inputVariable1Id,
          dimensionOrder: 1,
        })
      }
      if (input.inputVariable2Id) {
        inputInserts.push({
          tenantId: tenantId,
          lookupTableId: updatedTable.id,
          variableId: input.inputVariable2Id,
          dimensionOrder: 2,
        })
      }
      if (inputInserts.length > 0) {
        await tx.insert(lookup_table_inputs).values(inputInserts)
      }

      // Recreate output variable mapping
      await tx.insert(lookup_table_outputs).values({
        tenantId: tenantId,
        lookupTableId: updatedTable.id,
        variableId: input.outputVariableId,
        outputOrder: 1,
      })

      // Recreate dimension bins and cells (same logic as create)
      const binInserts = input.dimensionBins.map((bin) => ({
        tenantId: tenantId,
        lookupTableId: updatedTable.id,
        dimension: bin.dimension, // Keep for backward compatibility with old schema
        dimensionOrder: bin.dimension, // New field name
        binIndex: bin.binIndex,
        label: bin.label,
        binType: bin.binType,
        exactValue: bin.exactValue,
        rangeMin: bin.rangeMin?.toString(),
        rangeMax: bin.rangeMax?.toString(),
        isMinInclusive: bin.isMinInclusive,
        isMaxInclusive: bin.isMaxInclusive,
      }))

      const createdBins = await tx.insert(lookup_table_dimension_bins).values(binInserts).returning()

      const binIndexToId = new Map<string, number>()
      createdBins.forEach((bin) => {
        const key = `${bin.dimensionOrder}-${bin.binIndex}`
        binIndexToId.set(key, bin.id)
      })

      const cellInserts = input.cells.map((cell) => {
        const row1BinId = binIndexToId.get(`1-${cell.row1BinIndex}`)!
        const row2BinId = cell.row2BinIndex !== undefined ? binIndexToId.get(`2-${cell.row2BinIndex}`)! : undefined

        return {
          tenantId: tenantId,
          lookupTableId: updatedTable.id,
          // Use legacy columns for compatibility with existing database schema
          row1BinId: row1BinId,
          row2BinId: row2BinId,
          outputValue: cell.outputValue,
          // Also include N-dimensional format if database supports it
          inputCoordinates: {
            "1": row1BinId,
            ...(row2BinId ? { "2": row2BinId } : {})
          },
          outputValues: { "1": cell.outputValue },
        }
      })

      await tx.insert(lookup_table_cells).values(cellInserts)

      return updatedTable
    })
  }),

  publish: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    const userId = ctx.session?.user?.id
    if (!tenantId || !userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access",
      })
    }

    // First get the current table to increment version
    const currentTable = await ctx.db
      .select()
      .from(lookup_tables)
      .where(and(eq(lookup_tables.id, input.id), eq(lookup_tables.tenantId, tenantId)))
      .limit(1)
    
    if (!currentTable[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    const [updatedTable] = await ctx.db
      .update(lookup_tables)
      .set({
        status: "published",
        version: currentTable[0].version + 1,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(lookup_tables.id, input.id), eq(lookup_tables.tenantId, tenantId)))
      .returning()

    if (!updatedTable) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return updatedTable
  }),

  deprecate: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    const userId = ctx.session?.user?.id
    if (!tenantId || !userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access",
      })
    }

    const [updatedTable] = await ctx.db
      .update(lookup_tables)
      .set({
        status: "deprecated",
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(lookup_tables.id, input.id), eq(lookup_tables.tenantId, tenantId)))
      .returning()

    if (!updatedTable) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return updatedTable
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    // TODO: Implement proper tenant lookup - using hardcoded tenantId for now
    const tenantId = await getUserTenantId(ctx.session.user.id);
    if (!tenantId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No tenant access",
      })
    }

    return await ctx.db.transaction(async (tx) => {
      // Delete related data first (FK constraints will handle cascade)
      await tx.delete(lookup_table_cells).where(eq(lookup_table_cells.lookupTableId, input.id))
      await tx.delete(lookup_table_dimension_bins).where(eq(lookup_table_dimension_bins.lookupTableId, input.id))
      await tx.delete(lookup_table_inputs).where(eq(lookup_table_inputs.lookupTableId, input.id))
      await tx.delete(lookup_table_outputs).where(eq(lookup_table_outputs.lookupTableId, input.id))

      // Delete the table
      const [deletedTable] = await tx
        .delete(lookup_tables)
        .where(and(eq(lookup_tables.id, input.id), eq(lookup_tables.tenantId, tenantId)))
        .returning()

      if (!deletedTable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lookup table not found",
        })
      }

      return deletedTable
    })
  }),
})

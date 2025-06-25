import { z } from "zod";
import { createTRPCRouter, protectedProcedure, getUserOrgId } from "../trpc";
import { TRPCError } from "@trpc/server";
import { sql, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { modelGroups } from "@/db/schema";
import { inferenceTableService } from "@/services/inference-table-provisioning.service";
import { ProvisionTableInputSchema } from "@/schemas/inference-table.schema";
import type { ExtendedSession } from "@/db/auth-hydration";

export const inferenceTableRouter = createTRPCRouter({
  /**
   * Provision a new inference table for a ModelGroup
   */
  provisionTable: protectedProcedure
    .input(ProvisionTableInputSchema)
    .output(z.object({
      success: z.boolean(),
      tableName: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);

        // Verify ModelGroup exists and belongs to user's organization
        const modelGroup = await db.query.modelGroups.findFirst({
          where: and(
            eq(modelGroups.id, input.modelGroupId),
            eq(modelGroups.orgId, orgId)
          ),
        });

        if (!modelGroup) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "ModelGroup not found or access denied",
          });
        }

        // Check if table already exists
        const existingTable = await inferenceTableService.getTableName(
          modelGroup.uuid,
          orgId
        );

        if (existingTable) {
          return {
            success: true,
            tableName: existingTable,
            message: "Inference table already exists",
          };
        }

        // Provision new table
        const tableName = await inferenceTableService.provisionTable({
          modelGroupId: input.modelGroupId,
          modelGroupUuid: modelGroup.uuid,
          orgId,
          retentionDays: input.retentionDays,
          partitionStrategy: input.partitionStrategy,
        });

        return {
          success: true,
          tableName,
          message: "Inference table provisioned successfully",
        };
      } catch (error) {
        console.error("Error provisioning inference table:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to provision table",
        });
      }
    }),

  /**
   * Auto-provision table when ModelGroup is created (internal use)
   */
  autoProvision: protectedProcedure
    .input(z.object({ modelGroupId: z.number() }))
    .output(z.object({
      success: z.boolean(),
      tableName: z.string().optional(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);

        // Verify ModelGroup access
        const modelGroup = await db.query.modelGroups.findFirst({
          where: and(
            eq(modelGroups.id, input.modelGroupId),
            eq(modelGroups.orgId, orgId)
          ),
        });

        if (!modelGroup) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "ModelGroup not found or access denied",
          });
        }

        const tableName = await inferenceTableService.autoProvisionOnModelGroupCreation(
          input.modelGroupId
        );

        return {
          success: Boolean(tableName),
          tableName: tableName || undefined,
          message: tableName 
            ? "Inference table auto-provisioned successfully" 
            : "Failed to auto-provision inference table",
        };
      } catch (error) {
        console.error("Error in auto-provision:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to auto-provision inference table",
        });
      }
    }),

  /**
   * Get inference table statistics
   */
  getTableStats: protectedProcedure
    .input(z.object({ modelGroupUuid: z.string().uuid() }))
    .output(z.object({
      tableName: z.string(),
      rowCount: z.number(),
      tableSize: z.string(),
      indexSize: z.string(),
      lastUpdated: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);

        // Get table name for the ModelGroup
        const tableName = await inferenceTableService.getTableName(
          input.modelGroupUuid,
          orgId
        );

        if (!tableName) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inference table not found for this ModelGroup",
          });
        }

        // Get basic table statistics
        const stats = await inferenceTableService.getTableStats(tableName);

        return {
          tableName,
          ...stats,
        };
      } catch (error) {
        console.error("Error getting table stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get table statistics",
        });
      }
    }),

  /**
   * List all inference tables for the organization
   */
  listTables: protectedProcedure
    .input(z.void())
    .output(z.array(z.object({
      tableName: z.string(),
      modelGroupUuid: z.string(),
      rowCount: z.number(),
      tableSize: z.string(),
    })))
    .query(async ({ ctx }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);

        const tableNames = await inferenceTableService.listInferenceTables(orgId);

        // Get stats for each table
        const tablesWithStats = await Promise.all(
          tableNames.map(async (tableName) => {
            // Extract ModelGroup UUID from table name
            const uuidMatch = tableName.match(/inferences_mg_\d+_([a-f0-9]{8})/);
            const modelGroupUuid = uuidMatch?.[1] || "unknown";

            try {
              const stats = await inferenceTableService.getTableStats(tableName);
              return {
                tableName,
                modelGroupUuid,
                rowCount: stats.rowCount,
                tableSize: stats.tableSize,
              };
            } catch (error) {
              console.warn(`Failed to get stats for table ${tableName}:`, error);
              return {
                tableName,
                modelGroupUuid,
                rowCount: 0,
                tableSize: "Unknown",
              };
            }
          })
        );

        return tablesWithStats;
      } catch (error) {
        console.error("Error listing inference tables:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list inference tables",
        });
      }
    }),

  /**
   * Insert inference record
   */
  insertInference: protectedProcedure
    .input(z.object({
      modelGroupUuid: z.string().uuid(),
      modelId: z.number(),
      requestId: z.string(),
      input: z.record(z.string(), z.any()),
      output: z.record(z.string(), z.any()),
      metadata: z.object({
        latency: z.number(),
        modelRole: z.enum(["champion", "challenger"]),
        sessionId: z.string().optional(),
        userId: z.string().optional(),
      }),
      auditTrail: z.object({
        requestSource: z.string(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }),
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);

        // Get table name
        const tableName = await inferenceTableService.getTableName(
          input.modelGroupUuid,
          orgId
        );

        if (!tableName) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inference table not found for this ModelGroup",
          });
        }

        // Insert record using raw SQL
        await db.execute(sql`
          INSERT INTO ${sql.identifier(tableName)} (
            model_group_id, model_id, request_id, input, output,
            metadata, audit_trail, latency_ms, model_role,
            session_id, user_id, request_source, ip_address, user_agent
          ) VALUES (
            (SELECT id FROM model_groups WHERE uuid = ${input.modelGroupUuid}),
            ${input.modelId}, ${input.requestId},
            ${JSON.stringify(input.input)}, ${JSON.stringify(input.output)},
            ${JSON.stringify(input.metadata)}, ${JSON.stringify(input.auditTrail)},
            ${input.metadata.latency}, ${input.metadata.modelRole},
            ${input.metadata.sessionId}, ${input.metadata.userId},
            ${input.auditTrail.requestSource}, ${input.auditTrail.ipAddress},
            ${input.auditTrail.userAgent}
          )
        `);

        return {
          success: true,
          message: "Inference record inserted successfully",
        };
      } catch (error) {
        console.error("Error inserting inference:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to insert inference record",
        });
      }
    }),

  /**
   * Query inference records with basic filters
   */
  queryInferences: protectedProcedure
    .input(z.object({
      modelGroupUuid: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      modelRole: z.enum(["champion", "challenger"]).optional(),
    }))
    .output(z.object({
      data: z.array(z.any()),
      total: z.number(),
      hasMore: z.boolean(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);

        // Get table name
        const tableName = await inferenceTableService.getTableName(
          input.modelGroupUuid,
          orgId
        );

        if (!tableName) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inference table not found for this ModelGroup",
          });
        }

        // Build WHERE clause
        let whereClause = "";
        const params: any[] = [];

        if (input.modelRole) {
          whereClause = "WHERE model_role = $1";
          params.push(input.modelRole);
        }

        // Get total count
        const countResult = await db.execute(sql.raw(`
          SELECT COUNT(*) as total
          FROM ${tableName}
          ${whereClause}
        `, params));

        const total = Number((countResult as any)[0]?.total || 0);

        // Get paginated data
        const dataParams = [...params, input.limit, input.offset];
        const dataResult = await db.execute(sql.raw(`
          SELECT *
          FROM ${tableName}
          ${whereClause}
          ORDER BY created_at DESC
          LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
        `, dataParams));

        return {
          data: dataResult as any[],
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        console.error("Error querying inferences:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to query inference records",
        });
      }
    }),
}); 
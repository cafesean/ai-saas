import { z } from "zod";
import { eq, asc, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import {
  decision_tables,
  decision_table_rows,
  decision_table_inputs,
  decision_table_outputs,
  decision_table_input_conditions,
  decision_table_output_results,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { DecisionStatus } from "@/constants/decisionTable";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  getUserTenantId,
  withPermission,
} from "../trpc";
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from "@/constants/errorCode";
import {
  DECISION_TABLE_NOT_FOUND_ERROR,
  DECISION_TABLE_CREATE_ERROR,
  DECISION_TABLE_UPDATE_ERROR,
} from "@/constants/errorMessage";

const decisionTableSchema = z.object({
  uuid: z.string().min(36),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(DecisionStatus),
  decisionTableRows: z.array(
    z.object({
      uuid: z.string().min(36),
      order: z.number(),
      type: z.string().optional(),
      decisionTableInputConditions: z.array(
        z.object({
          uuid: z.string().min(36),
          condition: z.string(),
          value: z.string(),
          dt_row_id: z.union([z.string(), z.number()]).optional(),
          dt_input_id: z.union([z.string(), z.number()]).optional(),
        }),
      ),
      decisionTableOutputResults: z.array(
        z.object({
          uuid: z.string().min(36),
          result: z.string(),
          dt_row_id: z.union([z.string(), z.number()]).optional(),
          dt_output_id: z.union([z.string(), z.number()]).optional(),
        }),
      ),
    }),
  ),
  decisionTableInputs: z.array(
    z.object({
      uuid: z.string().min(36),
      variable_id: z.string().min(36),
    }),
  ),
  decisionTableOutputs: z.array(
    z.object({
      uuid: z.string().min(36),
      variable_id: z.string().min(36),
    }),
  ),
});

export const decisionTableRouter = createTRPCRouter({
  getAll: withPermission("rules:read").query(async () => {
    try {
      const decisionTablesData = await db
        .select()
        .from(decision_tables)
        .orderBy(desc(decision_tables.updatedAt));
      return decisionTablesData;
    } catch (error) {
      console.error("Error fetching decision tables:", error);
      return [];
    }
  }),

  getByStatus: withPermission("rules:read")
    .input(z.enum([DecisionStatus.ACTIVE, DecisionStatus.INACTIVE]))
    .query(async ({ input }) => {
      try {
        const decisionTablesData = await db
          .select()
          .from(decision_tables)
          .where(eq(decision_tables.status, input))
          .orderBy(desc(decision_tables.updatedAt));
        return decisionTablesData;
      } catch (error) {
        console.error("Error fetching decision tables by status:", error);
        return [];
      }
    }),

  getByUUID: withPermission("rules:read")
    .input(z.string())
    .query(async ({ input }) => {
      const decisionTable = await db.query.decision_tables.findFirst({
        where: eq(decision_tables.uuid, input),
        with: {
          rows: {
            with: {
              inputConditions: true,
              outputResults: true,
            },
          },
          inputs: true,
          outputs: true,
        },
      });

      if (!decisionTable) {
        throw new TRPCError({
          code: `${NOT_FOUND}` as TRPCError["code"],
          message: DECISION_TABLE_NOT_FOUND_ERROR,
        });
      }

      return decisionTable;
    }),

  create: withPermission("rules:create")
    .input(decisionTableSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [decisionTable] = await db
          .insert(decision_tables)
          .values({
            uuid: input.uuid,
            name: input.name,
            description: input.description,
            status: input.status,
            tenantId: ctx.session.user.tenantId,
          })
          .returning();

        return decisionTable;
      } catch (error) {
        console.error("Decision table creation error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: DECISION_TABLE_CREATE_ERROR,
        });
      }
    }),

  updateStatus: withPermission("rules:update")
    .input(z.object({ uuid: z.string(), status: z.nativeEnum(DecisionStatus) }))
    .mutation(async ({ input }) => {
      try {
        const [decisionTable] = await db
          .update(decision_tables)
          .set({ status: input.status })
          .where(eq(decision_tables.uuid, input.uuid));
        return decisionTable;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: DECISION_TABLE_UPDATE_ERROR,
        });
      }
    }),

  update: withPermission("rules:update")
    .input(decisionTableSchema)
    .mutation(async ({ input }) => {
      try {
        const decisionTable = await db.transaction(async (tx) => {
          // Find the decision table by UUID
          const [decisionTable] = await tx
            .update(decision_tables)
            .set({
              name: input.name,
              description: input.description,
              status: input.status,
            })
            .where(eq(decision_tables.uuid, input.uuid))
            .returning();
          if (decisionTable && decisionTable.id) {
            // delete all rows, inputs, outputs, conditions, results
            await tx
              .delete(decision_table_rows)
              .where(eq(decision_table_rows.dt_id, decisionTable.uuid));
            await tx
              .delete(decision_table_inputs)
              .where(eq(decision_table_inputs.dt_id, decisionTable.uuid));
            await tx
              .delete(decision_table_outputs)
              .where(eq(decision_table_outputs.dt_id, decisionTable.uuid));

            // Insert new rows, inputs, outputs, conditions, results
            let decisionTableInputsData: any[] = [];
            if (input.decisionTableInputs.length > 0) {
              decisionTableInputsData = await tx
                .insert(decision_table_inputs)
                .values(
                  input.decisionTableInputs.map((dt_input) => ({
                    uuid: dt_input.uuid,
                    dt_id: decisionTable.uuid,
                    variable_id: dt_input.variable_id,
                  })),
                )
                .returning();
            }
            let decisionTableOutputsData: any[] = [];
            if (input.decisionTableOutputs.length > 0) {
              decisionTableOutputsData = await tx
                .insert(decision_table_outputs)
                .values(
                  input.decisionTableOutputs.map((dt_output) => ({
                    uuid: dt_output.uuid,
                    dt_id: decisionTable.uuid,
                    variable_id: dt_output.variable_id,
                  })),
                )
                .returning();
            }
            let decisionTableRowsData: any[] = [];
            if (input.decisionTableRows.length > 0) {
              decisionTableRowsData = await tx
                .insert(decision_table_rows)
                .values(
                  input.decisionTableRows.map((row) => ({
                    uuid: row.uuid,
                    dt_id: decisionTable.uuid,
                    order: row.order,
                    type: row.type,
                  })),
                )
                .returning();
            }
            if (decisionTableRowsData && decisionTableRowsData.length > 0) {
              if (
                decisionTableInputsData &&
                decisionTableInputsData.length > 0
              ) {
                const decisionTableInputConditionsData = await tx
                  .insert(decision_table_input_conditions)
                  .values(
                    input.decisionTableRows.flatMap((row) =>
                      row.decisionTableInputConditions.map((condition) => {
                        const decisionTableRow = decisionTableRowsData.find(
                          (dt_row) => dt_row.uuid === row.uuid,
                        );
                        const decisionTableInput = decisionTableInputsData.find(
                          (dt_input) => dt_input.uuid === condition.dt_input_id,
                        );
                        if (decisionTableRow && decisionTableInput) {
                          return {
                            uuid: condition.uuid,
                            dt_row_id: decisionTableRow.uuid,
                            dt_input_id: decisionTableInput.uuid,
                            condition: condition.condition,
                            value: condition.value,
                          };
                        }
                        return {
                          uuid: condition.uuid,
                          dt_row_id: "",
                          dt_input_id: "",
                          condition: condition.condition,
                          value: condition.value,
                        };
                      }),
                    ),
                  )
                  .returning();
              }
              if (
                decisionTableOutputsData &&
                decisionTableOutputsData.length > 0
              ) {
                const decisionTableOutputResultsData = await tx
                  .insert(decision_table_output_results)
                  .values(
                    input.decisionTableRows.flatMap((row) =>
                      row.decisionTableOutputResults.map((result) => {
                        const decisionTableRow = decisionTableRowsData.find(
                          (dt_row) => dt_row.uuid === row.uuid,
                        );
                        const decisionTableOutput =
                          decisionTableOutputsData.find(
                            (dt_output) =>
                              dt_output.uuid === result.dt_output_id,
                          );
                        if (decisionTableRow && decisionTableOutput) {
                          return {
                            uuid: result.uuid,
                            dt_row_id: decisionTableRow.uuid,
                            dt_output_id: decisionTableOutput.uuid,
                            result: result.result,
                          };
                        }
                        return {
                          uuid: result.uuid,
                          dt_row_id: "",
                          dt_output_id: "",
                          result: result.result,
                        };
                      }),
                    ),
                  )
                  .returning();
              }
            }
          }
          return decisionTable;
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: DECISION_TABLE_UPDATE_ERROR,
        });
      }
    }),

  delete: withPermission("rules:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      const [decisionTable] = await db
        .delete(decision_tables)
        .where(eq(decision_tables.uuid, input))
        .returning();

      if (!decisionTable) {
        throw new TRPCError({
          code: `${NOT_FOUND}` as TRPCError["code"],
          message: DECISION_TABLE_NOT_FOUND_ERROR,
        });
      }

      return decisionTable;
    }),
});

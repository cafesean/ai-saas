import { z } from "zod";
import { eq, asc, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db/config";
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
import { createTRPCRouter, publicProcedure } from "../trpc";
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
      name: z.string().min(1),
      description: z.string().optional(),
      dataType: z.string(),
    }),
  ),
  decisionTableOutputs: z.array(
    z.object({
      uuid: z.string().min(36),
      name: z.string().min(1),
      description: z.string().optional(),
      dataType: z.string(),
    }),
  ),
});

export const decisionTableRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const decisionTablesData = await db.query.decision_tables.findMany({
      orderBy: desc(decision_tables.updatedAt),
      with: {
        decisionTableRows: true,
      },
    });
    return decisionTablesData;
  }),

  getByStatus: publicProcedure
    .input(z.enum([DecisionStatus.ACTIVE, DecisionStatus.INACTIVE]))
    .query(async ({ input }) => {
      const decisionTablesData = await db.query.decision_tables.findMany({
        where: eq(decision_tables.status, input),
        orderBy: desc(decision_tables.updatedAt),
      });
      return decisionTablesData;
    }),

  getByUUID: publicProcedure.input(z.string()).query(async ({ input }) => {
    const decisionTable = await db.query.decision_tables.findFirst({
      where: eq(decision_tables.uuid, input),
      with: {
        decisionTableRows: {
          with: {
            decisionTableInputConditions: true,
            decisionTableOutputResults: true,
          },
        },
        decisionTableInputs: true,
        decisionTableOutputs: true,
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

  create: publicProcedure
    .input(decisionTableSchema)
    .mutation(async ({ input }) => {
      try {
        const newDecisionTable = await db.transaction(async (tx) => {
          const [decisionTable] = await tx
            .insert(decision_tables)
            .values({
              uuid: input.uuid,
              name: input.name,
              description: input.description,
              status: input.status,
            })
            .returning();
          if (decisionTable && decisionTable.id) {
            const [decisionTableInputsData] = await tx
              .insert(decision_table_inputs)
              .values(
                input.decisionTableInputs.map((dt_input) => ({
                  uuid: dt_input.uuid,
                  dt_id: decisionTable.uuid,
                  name: dt_input.name,
                  description: dt_input.description,
                  dataType: dt_input.dataType,
                })),
              )
              .returning();
            const [decisionTableOutputsData] = await tx
              .insert(decision_table_outputs)
              .values(
                input.decisionTableOutputs.map((dt_output) => ({
                  uuid: dt_output.uuid,
                  dt_id: decisionTable.uuid,
                  name: dt_output.name,
                  description: dt_output.description,
                  dataType: dt_output.dataType,
                })),
              )
              .returning();
            const [decisionTableRowsData] = await tx
              .insert(decision_table_rows)
              .values(
                input.decisionTableRows.map((row) => ({
                  uuid: row.uuid,
                  dt_id: decisionTable.uuid,
                  order: row.order,
                })),
              )
              .returning();
            if (
              decisionTableRowsData &&
              decisionTableRowsData.id &&
              decisionTableInputsData &&
              decisionTableInputsData.id &&
              decisionTableOutputsData &&
              decisionTableOutputsData.id
            ) {
              const [decisionTableInputConditionsData] = await tx
                .insert(decision_table_input_conditions)
                .values(
                  input.decisionTableRows.flatMap((row) =>
                    row.decisionTableInputConditions.map((condition) => ({
                      uuid: condition.uuid,
                      dt_row_id: decisionTableRowsData.uuid,
                      dt_input_id: decisionTableInputsData.uuid,
                      condition: condition.condition,
                      value: condition.value,
                    })),
                  ),
                )
                .returning();
              const [decisionTableOutputResultsData] = await tx
                .insert(decision_table_output_results)
                .values(
                  input.decisionTableRows.flatMap((row) =>
                    row.decisionTableOutputResults.map((result) => ({
                      uuid: result.uuid,
                      dt_row_id: decisionTableRowsData.uuid,
                      dt_output_id: decisionTableOutputsData.uuid,
                      result: result.result,
                    })),
                  ),
                )
                .returning();
            }
          }
        });
        return newDecisionTable;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: DECISION_TABLE_CREATE_ERROR,
        });
      }
    }),

  updateStatus: publicProcedure
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

  update: publicProcedure
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
                    name: dt_input.name,
                    description: dt_input.description,
                    dataType: dt_input.dataType,
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
                    name: dt_output.name,
                    description: dt_output.description,
                    dataType: dt_output.dataType,
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

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
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

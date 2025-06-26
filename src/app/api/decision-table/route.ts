import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { decision_tables } from "@/db/schema";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";
import { decisionService } from "@/lib/decision-service-v2";
import { DecisionTableRowTypes } from "@/constants/decisionTable";

export const POST = async (request: NextRequest) => {
  try {
    const { dtId, ...inputs } = await request.json();

    // Verify headers whether have x-ai-saas-client-id and x-ai-sass-client-secret
    const clientId = request.headers.get("x-ai-saas-client-id");
    const clientSecret = request.headers.get("x-ai-sass-client-secret");

    if (
      !clientId ||
      !clientSecret ||
      clientId !== process.env.AI_SAAS_CLIENT_id ||
      clientSecret !== process.env.AI_SAAS_CLIENT_SECRET
    ) {
      return createApiError("Authentication failed", 401);
    }

    if (!dtId) {
      return createApiError("Decision table ID is required", 400);
    }

    // Find the decision table
    const decisionTable = await db.query.decision_tables.findFirst({
      where: eq(decision_tables.uuid, dtId),
      columns: {
        uuid: true,
        name: true,
      },
      with: {
        rows: {
          columns: {
            uuid: true,
            type: true,
          },
          with: {
            inputConditions: {
              columns: {
                uuid: true,
                dt_row_id: true,
                dt_input_id: true,
                condition: true,
                value: true,
              },
            },
            outputResults: {
              columns: {
                uuid: true,
                dt_row_id: true,
                dt_output_id: true,
                result: true,
              },
            },
          },
        },
        inputs: {
          columns: {
            uuid: true,
          },
          with: {
            variable: {
              columns: {
                uuid: true,
                name: true,
                dataType: true,
              },
            },
          },
        },
        outputs: {
          columns: {
            uuid: true,
          },
          with: {
            variable: {
              columns: {
                uuid: true,
                name: true,
                dataType: true,
              },
            },
          },
        },
      },
    });

    if (!decisionTable) {
      return createApiError("Decision table not found or access denied", 404);
    }

    // Verify each of inputs are all in variables of decisionTable's inputs
    for (const input of Object.keys(inputs)) {
      if (!decisionTable.inputs.find((i) => i.variable.name === input)) {
        return createApiError(
          `Input ${input} is not in decision table's inputs`,
          400,
        );
      }
    }

    // Restructure decisionTable filter rows with NORMAL and DEFAULT
    const normalRows: any[] = [];
    const defaultRows: any[] = [];
    for (const row of decisionTable.rows) {
      if (row.type === DecisionTableRowTypes.NORMAL) {
        normalRows.push(row);
      } else if (row.type === DecisionTableRowTypes.DEFAULT) {
        defaultRows.push(row);
      }
    }
    const newDecisionTable = {
      uuid: decisionTable.uuid,
      name: decisionTable.name,
      inputs: decisionTable.inputs,
      outputs: decisionTable.outputs,
      normalRows,
      defaultRows,
    };

    decisionService.registerTable(newDecisionTable);
    const result = decisionService.evaluate(newDecisionTable.uuid, inputs);

    return NextResponse.json(
      { ...result },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    if (
      error &&
      error?.response?.data &&
      error?.response?.data?.message?.includes("Error in workflow")
    ) {
      return createApiError(`N8N: ${error?.response.data.message}`, 400);
    } else {
      return createApiError(
        error?.response?.data || "Knowledge base chat failed",
        400,
      );
    }
  }
};

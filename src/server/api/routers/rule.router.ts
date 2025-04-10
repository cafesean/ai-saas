import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db/config";
import {
  rules,
  rule_flows,
  condition_groups,
  conditions,
  rule_flow_actions,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { RuleTypes, ConditionDataTypes } from "@/constants/rule";

const releCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  flows: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      childrenItems: z.array(
        z.object({
          type: z.string(),
          id: z.string(),
          logicalOperator: z.string(),
          childrenItems: z.array(
            z.object({
              type: z.string(),
              id: z.string(),
              field: z.string(),
              value: z.string(),
              operator: z.string(),
            }),
          ),
        }),
      ),
      action: z.object({
        type: z.string(),
        id: z.string(),
        content: z.string().nullable(),
      }),
    }),
  ),
});

const releUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().nullable(),
  flows: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      childrenItems: z.array(
        z.object({
          type: z.string(),
          id: z.string(),
          logicalOperator: z.string(),
          childrenItems: z.array(
            z.object({
              type: z.string(),
              id: z.string(),
              field: z.string(),
              value: z.string(),
              operator: z.string(),
            }),
          ),
        }),
      ),
      action: z.object({
        type: z.string(),
        id: z.string(),
        content: z.string().nullable(),
      }),
    }),
  ),
});

export const rulesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const rulesData = await db.query.rules.findMany({
      orderBy: desc(rules.id),
    });
    return rulesData;
  }),
  create: publicProcedure
    .input(releCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const newRule = await db.transaction(async (tx) => {
          // Insert rules table
          const [rule] = await tx
            .insert(rules)
            .values({
              name: input.name,
              description: input.description,
            })
            .returning();

          // Insert rule flows table
          let addFlows: any[] = [];
          if (rule && rule.id) {
            const flowValues = input.flows.map((flow) => ({
              uuid: flow.id,
              ruleId: rule.id,
              type: RuleTypes.flow,
            }));

            addFlows = await tx
              .insert(rule_flows)
              .values(flowValues)
              .returning();
          }

          // Insert condition groups table
          let addConditionGroups: any[] = [];
          if (addFlows && addFlows.length > 0) {
            let conditionGroupValues: any[] = [];
            input.flows.forEach((f) => {
              const flowId = addFlows.find((flow) => flow.uuid === f.id)?.id;
              f.childrenItems?.forEach((cg) => {
                conditionGroupValues.push({
                  uuid: cg.id,
                  ruleFlowId: flowId,
                  type: RuleTypes.conditionGroup,
                  logicalOperator: cg.logicalOperator,
                });
              });
            });
            addConditionGroups = await tx
              .insert(condition_groups)
              .values(conditionGroupValues)
              .returning();
          }

          // Insert condition table
          let addConditions: any[] = [];
          if (addConditionGroups && addConditionGroups.length > 0) {
            let conditionValues: any[] = [];
            input.flows.forEach((flow) => {
              flow.childrenItems?.forEach((cg) => {
                const conditionGroupId = addConditionGroups.find(
                  (conditionGroup) => conditionGroup.uuid === cg.id,
                )?.id;
                cg.childrenItems?.forEach((c) => {
                  conditionValues.push({
                    uuid: c.id,
                    conditionGroupId: conditionGroupId,
                    type: RuleTypes.condition,
                    field: c.field,
                    value: c.value,
                    operator: c.operator,
                    dataType: ConditionDataTypes.string,
                  });
                });
              });
            });
            addConditions = await tx
              .insert(conditions)
              .values(conditionValues)
              .returning();
          }

          // Insert flow actions table
          let addFlowActions: any[] = [];
          if (addFlows && addFlows.length > 0) {
            let flowActionValues: any[] = [];
            input.flows.forEach((f) => {
              const flowId = addFlows.find((flow) => flow.uuid === f.id)?.id;
              if (flowId) {
                flowActionValues.push({
                  uuid: f.action.id,
                  ruleFlowId: flowId,
                  type: f.action.type,
                  content: f.action.content,
                });
              }
            });
            addFlowActions = await tx
              .insert(rule_flow_actions)
              .values(flowActionValues)
              .returning();
          }

          return {
            rule: {
              ...rule,
              flows: addFlows,
              conditionGroups: addConditionGroups,
              conditions: addConditions,
              flowActions: addFlowActions,
            },
          };
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create rule",
        });
      }
    }),
  getByUUID: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .query(async ({ ctx, input }) => {
      const ruleData = await db.query.rules.findMany({
        where: eq(rules.uuid, input.uuid),
        with: {
          ruleFlows: {
            with: {
              conditionGroups: {
                with: {
                  conditions: true,
                },
              },
              ruleFlowActions: true,
            },
          },
        },
        limit: 1,
      });
      const rule = ruleData[0];

      if (!rule) {
        return null;
      }

      return {
        ...rule,
        flows: formatFlows(rule?.ruleFlows),
      };
    }),
  update: publicProcedure
    .input(releUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(input);
        // Delete flows of the rule
        const updateRule = await db.transaction(async (tx) => {
          await tx
            .delete(rule_flows)
            .where(eq(rule_flows.ruleId, input.id))
            .returning();
          // Update rule
          const [rule] = await tx
            .update(rules)
            .set({
              name: input.name,
              description: input.description,
            })
            .where(eq(rules.id, input.id))
            .returning();
          // Insert rule flows table
          let addFlows: any[] = [];
          if (rule && rule.id) {
            const flowValues = input.flows.map((flow) => ({
              uuid: flow.id,
              ruleId: rule.id,
              type: RuleTypes.flow,
            }));
            addFlows = await tx
              .insert(rule_flows)
              .values(flowValues)
              .returning();
          }
          // Insert condition groups table
          let addConditionGroups: any[] = [];
          if (addFlows && addFlows.length > 0) {
            let conditionGroupValues: any[] = [];
            input.flows.forEach((f) => {
              const flowId = addFlows.find((flow) => flow.uuid === f.id)?.id;
              f.childrenItems?.forEach((cg) => {
                conditionGroupValues.push({
                  uuid: cg.id,
                  ruleFlowId: flowId,
                  type: RuleTypes.conditionGroup,
                  logicalOperator: cg.logicalOperator,
                });
              });
            });
            addConditionGroups = await tx
              .insert(condition_groups)
              .values(conditionGroupValues)
              .returning();
          }
          // Insert condition table
          let addConditions: any[] = [];
          if (addConditionGroups && addConditionGroups.length > 0) {
            let conditionValues: any[] = [];
            input.flows.forEach((flow) => {
              flow.childrenItems?.forEach((cg) => {
                const conditionGroupId = addConditionGroups.find(
                  (conditionGroup) => conditionGroup.uuid === cg.id,
                )?.id;
                cg.childrenItems?.forEach((c) => {
                  conditionValues.push({
                    uuid: c.id,
                    conditionGroupId: conditionGroupId,
                    type: RuleTypes.condition,
                    field: c.field,
                    value: c.value,
                    operator: c.operator,
                    dataType: ConditionDataTypes.string,
                  });
                });
              });
            });
            addConditions = await tx
              .insert(conditions)
              .values(conditionValues)
              .returning();
          }
          // Insert flow actions table
          let addFlowActions: any[] = [];
          if (addFlows && addFlows.length > 0) {
            let flowActionValues: any[] = [];
            input.flows.forEach((f) => {
              const flowId = addFlows.find((flow) => flow.uuid === f.id)?.id;
              if (flowId) {
                flowActionValues.push({
                  uuid: f.action.id,
                  ruleFlowId: flowId,
                  type: f.action.type,
                  content: f.action.content,
                });
              }
            });
            addFlowActions = await tx
              .insert(rule_flow_actions)
              .values(flowActionValues)
              .returning();
          }
          return {
            rule: {
              ...rule,
              flows: addFlows,
              conditionGroups: addConditionGroups,
              conditions: addConditions,
              flowActions: addFlowActions,
            },
          };
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update rule",
        });
      }
    }),
  delete: publicProcedure
   .input(z.object({ id: z.string() }))
   .mutation(async ({ ctx, input }) => {
      try {
        await db.delete(rules).where(eq(rules.uuid, input.id));
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete rule",
        });
      }
    }),
});

const formatFlows = (flows: any) => {
  return flows.map((flow: any) => {
    return {
      id: flow.uuid,
      type: flow.type,
      childrenItems: flow.conditionGroups.map((group: any) => {
        return {
          id: group.uuid,
          type: group.type,
          logicalOperator: group.logicalOperator,
          childrenItems: group.conditions.map((condition: any) => {
            return {
              id: condition.uuid,
              type: condition.type,
              field: condition.field,
              value: condition.value,
              operator: condition.operator,
            };
          }),
        };
      }),
      action: {
        id: flow.ruleFlowActions[0].uuid,
        type: flow.ruleFlowActions[0].type,
        content: flow.ruleFlowActions[0].content,
      },
    };
  });
};

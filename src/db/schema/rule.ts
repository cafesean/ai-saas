import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  json,
  uniqueIndex,
  index,
  serial,
  text,
  integer,
  unique,
} from 'drizzle-orm/pg-core';
import { desc, relations } from 'drizzle-orm';
import { RuleStatus } from '@/constants/general';
import type {
  OperatorType,
  ConditionDataType,
  RuleFlowActionType,
} from '@/db/types/rule';

export const rules = pgTable(
  'rules',
  {
    id: serial('id').notNull().primaryKey(),
    uuid: uuid('uuid').notNull().defaultRandom(),
    name: varchar('name').notNull(),
    description: text('description'),
    status: varchar('status', { length: 100 })
      .notNull()
      .default(RuleStatus.ACTIVE),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('rule_id_idx').on(table.id),
    index('rule_uuid_idx').on(table.uuid),
  ],
);

export const rule_flows = pgTable(
  'rule_flows',
  {
    id: serial('id').notNull().primaryKey(),
    uuid: uuid('uuid').notNull().defaultRandom(),
    ruleId: integer('rule_id')
      .references(() => rules.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar("type", { length : 200 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('rule_flow_id_idx').on(table.id),
    index('rule_flow_uuid_idx').on(table.uuid),
  ],
);

export const condition_groups = pgTable(
  'condition_groups',
  {
    id: serial('id').notNull().primaryKey(),
    uuid: uuid('uuid').notNull().defaultRandom(),
    ruleFlowId: integer('rule_flow_id')
      .references(() => rule_flows.id, { onDelete: 'cascade' })
      .notNull(),
    parentGroupId: integer('parent_group_id'),
    type: varchar("type", { length : 200 }),
    logicalOperator: text('logical_operator').notNull().$type<OperatorType>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('condition_groups_id_idx').on(table.id),
    index('condition_groups_uuid_idx').on(table.uuid),
  ],
);

export const conditions = pgTable(
  'conditions',
  {
    id: serial('id').notNull().primaryKey(),
    uuid: uuid('uuid').notNull().defaultRandom(),
    conditionGroupId: integer('condition_group_id')
      .references(() => condition_groups.id, { onDelete: 'cascade' })
      .notNull(),
    field: text('field').notNull(),
    operator: text('operator').notNull(),
    value: text('value').notNull(),
    type: varchar("type", { length : 200 }),
    dataType: text('data_type').notNull().$type<ConditionDataType>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('condition_id_idx').on(table.id),
    index('condition_uuid_idx').on(table.uuid),
  ],
);

export const rule_flow_actions = pgTable(
  'rule_flow_actions',
  {
    id: serial('id').notNull().primaryKey(),
    uuid: uuid('uuid').notNull().defaultRandom(),
    ruleFlowId: integer('rule_flow_id')
      .references(() => rule_flows.id, { onDelete: 'cascade' })
      .notNull(),
    type: text('type').notNull().$type<RuleFlowActionType>(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('rule_flow_action_id_idx').on(table.id),
    index('rule_flow_action_uuid_idx').on(table.uuid),
  ],
);

// Relations
export const rulesRelations = relations(rules, ({ one, many }) => ({
  ruleFlows: many(rule_flows),
}));

export const ruleFlowsRelations = relations(rule_flows, ({ one, many }) => ({
  rule: one(rules, {
    fields: [rule_flows.ruleId],
    references: [rules.id],
  }),
  conditionGroups: many(condition_groups),
  ruleFlowActions: many(rule_flow_actions),
}));

export const conditionGroupsRelations = relations(
  condition_groups,
  ({ one, many }) => ({
    ruleFlow: one(rule_flows, {
      fields: [condition_groups.ruleFlowId],
      references: [rule_flows.id],
    }),
    parentGroup: one(condition_groups, {
      fields: [condition_groups.parentGroupId],
      references: [condition_groups.id],
    }),
    conditions: many(conditions),
  }),
);

export const conditionsRelations = relations(conditions, ({ one }) => ({
  conditionGroup: one(condition_groups, {
    fields: [conditions.conditionGroupId],
    references: [condition_groups.id],
  }),
}));

export const ruleFlowActionsRelations = relations(
  rule_flow_actions,
  ({ one }) => ({
    ruleFlow: one(rule_flows, {
      fields: [rule_flow_actions.ruleFlowId],
      references: [rule_flows.id],
    }),
  }),
);

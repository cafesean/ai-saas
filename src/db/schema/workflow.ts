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
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { WorkflowStatus, WorkflowRunHistoryStatus } from "@/constants/general";
import { endpoints } from "./endpoint";
import { widgets } from "./widget";

export const workflows = pgTable(
  "workflows",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    userInputs: json("user_inputs").$type<Record<string, unknown>>(),
    workflowJson: json("workflow_json").$type<Record<string, unknown>>(),
    flowId: varchar("flow_id", { length: 200 }),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(WorkflowStatus.DRAFT),
    type: varchar("type", { length: 100 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("workflow_id_idx").on(table.id),
    index("workflow_uuid_idx").on(table.uuid),
  ],
);

export const nodes = pgTable(
  "nodes",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    type: varchar("type", { length: 200 }),
    position: json("position").$type<Record<string, unknown>>(),
    data: json("data").$type<Record<string, unknown>>(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.uuid, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("node_id_idx").on(table.id),
    index("node_uuid_idx").on(table.uuid),
  ],
);

export const edges = pgTable(
  "edges",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.uuid, { onDelete: "cascade" }),
    source: varchar("source", { length: 200 }).notNull(),
    target: varchar("target", { length: 200 }).notNull(),
    animated: boolean("animated").default(false).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("edge_id_idx").on(table.id),
    index("edge_uuid_idx").on(table.uuid),
  ],
);

export const workflowRunHistory = pgTable(
  "workflow_run_history",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.uuid, { onDelete: "cascade" }),
    path: varchar("path", { length: 200 }),
    method: varchar("method", { length: 100 }),
    payload: json("payload").$type<Record<string, unknown>>(),
    response: json("response").$type<Record<string, unknown>>(),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(WorkflowRunHistoryStatus.RUNNING),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("workflow_run_history_id_idx").on(table.id),
    index("workflow_run_history_uuid_idx").on(table.uuid),
  ],
);

// Relations
export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  endpoint: one(endpoints, {
    fields: [workflows.uuid],
    references: [endpoints.workflowId],
  }),
  widgets: many(widgets),
  nodes: many(nodes),
  edges: many(edges),
  history: many(workflowRunHistory),
}));

export const nodesRelations = relations(nodes, ({ one }) => ({
  workflow: one(workflows, {
    fields: [nodes.workflowId],
    references: [workflows.uuid],
  }),
}));

export const edgesRelations = relations(edges, ({ one }) => ({
  workflow: one(workflows, {
    fields: [edges.workflowId],
    references: [workflows.uuid],
  }),
}));

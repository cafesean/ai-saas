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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { WorkflowStatus } from "@/constants/general";
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
    workflowJson: json("workflow_json")
      .$type<Record<string, unknown>>(),
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

export const nodes = pgTable("nodes", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  type: varchar("type", { length: 200 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  position: json("position").$type<Record<string, unknown>>(),
  data: json("data").$type<Record<string, unknown>>(),
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
});

export const edges = pgTable("edges", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  source: varchar("source", { length: 200 }).notNull(),
  target: varchar("target", { length: 200 }).notNull(),
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
});

export const workflow_nodes = pgTable("workflow_nodes", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.uuid, { onDelete: "cascade" }),
  nodeId: uuid("node_id").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }),
});

// Relations
export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  endpoint: one(endpoints, {
    fields: [workflows.uuid],
    references: [endpoints.workflowId],
  }),
  widgets: many(widgets),
}));

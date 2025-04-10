import { pgTable, uuid, varchar, timestamp, json, uniqueIndex, index, serial, text } from "drizzle-orm/pg-core";

import { TemplateStatus } from "@/constants/general";

export const templates = pgTable(
  "templates",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    flowId: varchar("flow_id", { length: 256 }).notNull(),
    provider: varchar("provider", { length: 256}),
    versionId: varchar("version_id", { length: 256 }),
    instanceId: varchar("instance_id", { length: 256 }),
    userInputs: json("user_inputs").$type<Record<string, unknown>>(),
    workflowJson: json("workflow_json").$type<Record<string, unknown>>(),
    status: varchar("status", { length: 100 }).notNull().default(TemplateStatus.ACTIVE),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("template_id_idx").on(table.id), index("template_uuid_idx").on(table.uuid)]
);

export const nodeTypes = pgTable(
  "node_types",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("id").notNull().defaultRandom(),
    type: varchar("type", { length: 256 }).notNull(),
    category: varchar("category", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("node_type_idx").on(table.type),
    index("node_type_category_idx").on(table.category),
    index("node_type_id_idx").on(table.id),
    index("node_type_uuid_idx").on(table.uuid),
  ]
);

// Types
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

export type NodeType = typeof nodeTypes.$inferSelect;
export type InsertNodeType = typeof nodeTypes.$inferInsert;

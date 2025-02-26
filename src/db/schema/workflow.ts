import { pgTable, uuid, varchar, timestamp, json, uniqueIndex, index, serial, text } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

import { WorkflowStatus } from "@/constants/general";
import { endpoints } from "./endpoint";

export const workflows = pgTable(
  "workflows",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    userInputs: json("user_inputs").$type<Record<string, unknown>>(),
    workflowJson: json("workflow_json").notNull().$type<Record<string, unknown>>(),
    flowId: varchar("flow_id", { length: 200 }),
    status: varchar("status", { length: 100 }).notNull().default(WorkflowStatus.ACTIVE),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("workflow_id_idx").on(table.id), index("workflow_uuid_idx").on(table.uuid)]
);

// Relations
export const workflowsRelations = relations(workflows, ({ one }) => ({
  endpoint: one(endpoints, {
    fields: [workflows.uuid],
    references: [endpoints.workflowId],
  }),
}));

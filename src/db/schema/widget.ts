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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workflows } from "./workflow";
import { WidgetStatus } from "@/constants/general";

export const widgets = pgTable(
  "widgets",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom(),
    name: varchar("name").notNull(),
    type: varchar("type", { length: 100}).notNull(),
    workflowId: uuid("workflow_id").notNull().unique(),
    status: varchar("status", { length: 100 }).notNull().default(WidgetStatus.ACTIVE),
    code: text("code").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("widget_id_idx").on(table.id), index("widget_uuid_idx").on(table.uuid)]
);

export const widgetsRelations = relations(widgets, ({ one }) => ({
  workflow: one(workflows, {
    fields: [widgets.workflowId],
    references: [workflows.uuid],
  }),
}));

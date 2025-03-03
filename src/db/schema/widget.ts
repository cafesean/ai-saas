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
    workflowId: uuid("workflowId").notNull().unique(),
    status: varchar("status", { length: 100 }).notNull().default(WidgetStatus.ACTIVE),
    scripts: text("scripts").notNull(),
    code: text("code").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("workflowId_widgets_unique").on(table.workflowId),
  ]
);

export const widgetsRelations = relations(widgets, ({ one }) => ({
  workflow: one(workflows, {
    fields: [widgets.workflowId],
    references: [workflows.uuid],
  }),
}));

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
import { EndpointStatus, HTTPMethod } from "@/constants/general";
import { workflows, workflowRunHistory } from "./workflow";

export const endpoints = pgTable(
  "endpoints",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.uuid, { onDelete: "cascade" }),
    uri: text("uri").notNull(),
    method: varchar("method", { length: 100 })
      .notNull()
      .default(HTTPMethod.POST),
    payload: json("payload"),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(EndpointStatus.ACTIVE),
    flowURI: text("flow_uri").notNull(),
    flowMethod: varchar("flow_method", { length: 100 })
      .notNull()
      .default(HTTPMethod.POST),
    clientId: text("client_id").notNull(),
    clientSecret: text("client_secret").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("endpoint_id_idx").on(table.id),
    index("endpoint_uuid_idx").on(table.uuid),
  ],
);

export const endpointsRelations = relations(endpoints, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [endpoints.workflowId],
    references: [workflows.uuid],
  }),
}));

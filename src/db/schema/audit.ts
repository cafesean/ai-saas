import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./org";
import { orgs } from "./org";

// Audit log table for tracking security events and permission denials
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    action: varchar("action", { length: 100 }).notNull(), // e.g., "PERMISSION_DENIED", "LOGIN_FAILED", "ROLE_CHANGED"
    resource: varchar("resource", { length: 100 }), // e.g., "tRPC:workflow.create", "API:/api/upload"
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    orgId: integer("org_id").references(() => orgs.id, { onDelete: "set null" }),
    ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
    userAgent: text("user_agent"),
    details: jsonb("details"), // Additional context data
    severity: varchar("severity", { length: 20 }).default("INFO").notNull(), // INFO, WARN, ERROR, CRITICAL
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_id_idx").on(table.id),
    index("audit_logs_uuid_idx").on(table.uuid),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_org_id_idx").on(table.orgId),
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_severity_idx").on(table.severity),
  ],
);

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  org: one(orgs, {
    fields: [auditLogs.orgId],
    references: [orgs.id],
  }),
})); 
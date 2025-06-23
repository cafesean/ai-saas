import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  index,
  serial,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orgs } from "./org";

// Variable Logic Types
export const VariableLogicTypes = {
  DIRECT_MAP: "direct_map",
  FORMULA: "formula", 
  LOOKUP: "lookup",
} as const;

// Variable Data Types  
export const VariableDataTypes = {
  STRING: "string",
  NUMBER: "number", 
  BOOLEAN: "boolean",
  DATE: "date",
} as const;

// Variable Status
export const VariableStatus = {
  DRAFT: "draft",
  PUBLISHED: "published", 
  DEPRECATED: "deprecated",
} as const;

export const variables = pgTable(
  "variables",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    dataType: varchar("data_type", { length: 50 }).notNull(),
    logicType: varchar("logic_type", { length: 50 }).notNull(),
    
    // Formula-specific fields
    formula: text("formula"), // For formula logic type
    
    // Lookup-specific fields  
    lookupTableId: uuid("lookup_table_id"), // Reference to lookup table
    
    // Direct map value (for simple direct mapping)
    defaultValue: text("default_value"),
    
    // Versioning and lifecycle
    version: integer("version").notNull().default(1),
    status: varchar("status", { length: 50 }).notNull().default(VariableStatus.DRAFT),
    
    // Publishing metadata
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedBy: integer("published_by"), // User ID who published
    
    // Multi-tenancy support
      orgId: integer("org_id")
      .notNull()
    .references(() => orgs.id, { onDelete: "restrict" }),
      
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("variable_id_idx").on(table.id),
    index("variable_uuid_idx").on(table.uuid), 
    index("variable_org_id_idx").on(table.orgId),
    index("variable_status_idx").on(table.status),
    index("variable_logic_type_idx").on(table.logicType),
    // Composite unique index for org + name combination
    unique("variable_org_name_unique").on(table.orgId, table.name),
  ],
);

// Relations
export const variablesRelations = relations(variables, ({ one }) => ({
  org: one(orgs, {
    fields: [variables.orgId],
    references: [orgs.id],
  }),
})); 
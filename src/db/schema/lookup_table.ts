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
  foreignKey,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenant";
import { variables } from "./variable";

// Lookup Table Status
export const LookupTableStatus = {
  DRAFT: "draft",
  PUBLISHED: "published", 
  DEPRECATED: "deprecated",
} as const;

export const lookup_tables = pgTable(
  "lookup_tables",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    
    // Input configuration - references a published variable
    inputVariableId: uuid("input_variable_id")
      .notNull()
      .references(() => variables.uuid, { onDelete: "restrict" }),
    
    // Output configuration
    outputName: varchar("output_name", { length: 255 }).notNull(),
    outputDataType: varchar("output_data_type", { length: 50 }).notNull(),
    
    // Default/catch-all value
    defaultValue: text("default_value"),
    
    // Versioning and lifecycle
    version: integer("version").notNull().default(1),
    status: varchar("status", { length: 50 }).notNull().default(LookupTableStatus.DRAFT),
    
    // Publishing metadata
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedBy: integer("published_by"), // User ID who published
    
    // Multi-tenancy support
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
      
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lookup_table_id_idx").on(table.id),
    index("lookup_table_uuid_idx").on(table.uuid), 
    index("lookup_table_tenant_id_idx").on(table.tenantId),
    index("lookup_table_status_idx").on(table.status),
    // Composite unique index for tenant + name combination
    unique("lookup_table_tenant_name_unique").on(table.tenantId, table.name),
  ],
);

// Lookup table rows (key-value mappings)
export const lookup_table_rows = pgTable(
  "lookup_table_rows",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    lookupTableId: uuid("lookup_table_id")
      .notNull()
      .references(() => lookup_tables.uuid, { onDelete: "cascade" }),
    
    // Input condition/key
    inputCondition: text("input_condition"), // e.g., ">=18", "ADMIN", "range:10-20"
    inputValue: text("input_value").notNull(), // The actual input value to match
    
    // Output result
    outputValue: text("output_value").notNull(),
    
    // Row order for evaluation priority
    order: integer("order").notNull().default(0),
    
    // Special flag for default/catch-all row
    isDefault: boolean("is_default").notNull().default(false),
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lookup_table_row_id_idx").on(table.id),
    index("lookup_table_row_uuid_idx").on(table.uuid),
    index("lookup_table_row_lookup_id_idx").on(table.lookupTableId),
    index("lookup_table_row_order_idx").on(table.order),
  ],
);

// Relations
export const lookupTablesRelations = relations(lookup_tables, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [lookup_tables.tenantId],
    references: [tenants.id],
  }),
  inputVariable: one(variables, {
    fields: [lookup_tables.inputVariableId],
    references: [variables.uuid],
  }),
  rows: many(lookup_table_rows),
}));

export const lookupTableRowsRelations = relations(lookup_table_rows, ({ one }) => ({
  lookupTable: one(lookup_tables, {
    fields: [lookup_table_rows.lookupTableId],
    references: [lookup_tables.uuid],
  }),
})); 
import {
  pgTable,
  integer,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { tenants } from "./tenant"
import { variables } from "./variable"

// N-Dimensional Matrix Lookup Tables - Supports unlimited inputs and outputs
export const lookup_tables = pgTable(
  "lookup_tables",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, published, deprecated
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: integer("created_by").notNull(),
    updatedBy: integer("updated_by").notNull(),
  },
  (table) => ({
    tenantNameIdx: uniqueIndex("lookup_tables_tenant_name_idx").on(table.tenantId, table.name),
    tenantIdIdx: index("lookup_tables_tenant_id_idx").on(table.tenantId),
  }),
)

// N input variables mapping (many-to-many with ordering)
export const lookup_table_inputs = pgTable(
  "lookup_table_inputs",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: integer("tenant_id").notNull(),
    lookupTableId: integer("lookup_table_id")
      .notNull()
      .references(() => lookup_tables.id, { onDelete: "cascade" }),
    variableId: integer("variable_id")
      .notNull()
      .references(() => variables.id, { onDelete: "restrict" }),
    dimensionOrder: integer("dimension_order").notNull(), // 1, 2, 3, etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    lookupTableIdx: index("lookup_inputs_lookup_table_idx").on(table.lookupTableId),
    tenantIdIdx: index("lookup_inputs_tenant_id_idx").on(table.tenantId),
    uniqueDimensionIdx: uniqueIndex("lookup_inputs_unique_dimension_idx").on(
      table.lookupTableId, 
      table.dimensionOrder
    ),
  }),
)

// N output variables mapping (many-to-many with ordering)
export const lookup_table_outputs = pgTable(
  "lookup_table_outputs",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: integer("tenant_id").notNull(),
    lookupTableId: integer("lookup_table_id")
      .notNull()
      .references(() => lookup_tables.id, { onDelete: "cascade" }),
    variableId: integer("variable_id")
      .notNull()
      .references(() => variables.id, { onDelete: "restrict" }),
    outputOrder: integer("output_order").notNull(), // 1, 2, 3, etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    lookupTableIdx: index("lookup_outputs_lookup_table_idx").on(table.lookupTableId),
    tenantIdIdx: index("lookup_outputs_tenant_id_idx").on(table.tenantId),
    uniqueOutputIdx: uniqueIndex("lookup_outputs_unique_output_idx").on(
      table.lookupTableId, 
      table.outputOrder
    ),
  }),
)

// Generic dimension bins for any number of dimensions
export const lookup_table_dimension_bins = pgTable(
  "lookup_table_dimension_bins",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: integer("tenant_id").notNull(),
    lookupTableId: integer("lookup_table_id")
      .notNull()
      .references(() => lookup_tables.id, { onDelete: "cascade" }),
    dimension: integer("dimension"), // DEPRECATED: Use dimensionOrder instead, kept for backward compatibility
    dimensionOrder: integer("dimension_order").notNull(), // matches lookup_table_inputs.dimensionOrder
    binIndex: integer("bin_index").notNull(), // Order within the dimension
    label: varchar("label", { length: 255 }).notNull(),
    binType: varchar("bin_type", { length: 50 }).notNull(), // 'exact', 'range'
    exactValue: text("exact_value"), // For categorical values
    rangeMin: decimal("range_min", { precision: 15, scale: 6 }), // For numeric ranges
    rangeMax: decimal("range_max", { precision: 15, scale: 6 }), // For numeric ranges
    isMinInclusive: boolean("is_min_inclusive").default(true),
    isMaxInclusive: boolean("is_max_inclusive").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    lookupTableIdx: index("dimension_bins_lookup_table_idx").on(table.lookupTableId),
    tenantIdIdx: index("dimension_bins_tenant_id_idx").on(table.tenantId),
    dimensionOrderIdx: index("dimension_bins_dimension_order_idx").on(
      table.lookupTableId, 
      table.dimensionOrder
    ),
  }),
)

// N-dimensional cell values using JSON coordinate mapping
export const lookup_table_cells = pgTable(
  "lookup_table_cells",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: integer("tenant_id").notNull(),
    lookupTableId: integer("lookup_table_id")
      .notNull()
      .references(() => lookup_tables.id, { onDelete: "cascade" }),
    // DEPRECATED: Legacy 2D columns, kept for backward compatibility
    row1BinId: integer("row_1_bin_id"), // DEPRECATED: Use inputCoordinates instead
    row2BinId: integer("row_2_bin_id"), // DEPRECATED: Use inputCoordinates instead
    outputValue: text("output_value"), // DEPRECATED: Use outputValues instead
    // NEW: JSON mapping for N-dimensional support
    inputCoordinates: json("input_coordinates"), // {"dim1": binId, "dim2": binId, "dim3": binId, ...}
    outputValues: json("output_values"), // {"output1": "value1", "output2": "value2", ...}
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    lookupTableIdx: index("cells_lookup_table_idx").on(table.lookupTableId),
    tenantIdIdx: index("cells_tenant_id_idx").on(table.tenantId),
  }),
)

// Relations for N-dimensional support
export const lookupTablesRelations = relations(lookup_tables, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [lookup_tables.tenantId],
    references: [tenants.id],
  }),
  inputs: many(lookup_table_inputs),
  outputs: many(lookup_table_outputs),
  dimensionBins: many(lookup_table_dimension_bins),
  cells: many(lookup_table_cells),
}))

export const lookupTableInputsRelations = relations(lookup_table_inputs, ({ one }) => ({
  lookupTable: one(lookup_tables, {
    fields: [lookup_table_inputs.lookupTableId],
    references: [lookup_tables.id],
  }),
  variable: one(variables, {
    fields: [lookup_table_inputs.variableId],
    references: [variables.id],
  }),
}))

export const lookupTableOutputsRelations = relations(lookup_table_outputs, ({ one }) => ({
  lookupTable: one(lookup_tables, {
    fields: [lookup_table_outputs.lookupTableId],
    references: [lookup_tables.id],
  }),
  variable: one(variables, {
    fields: [lookup_table_outputs.variableId],
    references: [variables.id],
  }),
}))

export const lookupTableDimensionBinsRelations = relations(lookup_table_dimension_bins, ({ one }) => ({
  lookupTable: one(lookup_tables, {
    fields: [lookup_table_dimension_bins.lookupTableId],
    references: [lookup_tables.id],
  }),
}))

export const lookupTableCellsRelations = relations(lookup_table_cells, ({ one }) => ({
  lookupTable: one(lookup_tables, {
    fields: [lookup_table_cells.lookupTableId],
    references: [lookup_tables.id],
  }),
}))

// Status enum for lookup tables
export const LookupTableStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  DEPRECATED: 'deprecated',
} as const

export type LookupTableStatus = typeof LookupTableStatus[keyof typeof LookupTableStatus]

// Export types for N-dimensional support
export type LookupTableInputCoordinates = Record<string, number> // {"dim1": binId, "dim2": binId}
export type LookupTableOutputValues = Record<string, any> // {"output1": "value", "output2": 123} 
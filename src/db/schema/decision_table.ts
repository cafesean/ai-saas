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
  foreignKey,
} from "drizzle-orm/pg-core";
import { desc, relations } from "drizzle-orm";
import { DecisionStatus } from "@/constants/decisionTable";

export const decision_tables = pgTable(
  "decision_tables",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    name: varchar("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(DecisionStatus.ACTIVE),
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
    index("dt_id_idx").on(table.id),
    index("dt_uuid_idx").on(table.uuid),
  ],
);

export const decision_table_rows = pgTable(
  "decision_table_rows",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    dt_id: uuid("dt_id")
      .notNull()
      .references(() => decision_tables.uuid, {
        onDelete: "cascade",
      }),
    order: integer("order").notNull(),
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
    index("dt_row_id_idx").on(table.id),
    index("dt_row_uuid_idx").on(table.uuid),
  ],
);

export const decision_table_inputs = pgTable(
  "decision_table_inputs",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    dt_id: uuid("dt_id")
      .notNull()
      .references(() => decision_tables.uuid, {
        onDelete: "cascade",
      }),
    name: varchar("name").notNull(),
    description: text("description"),
    dataType: varchar("dataType", { length: 100 }),
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
    index("dt_input_id_idx").on(table.id),
    index("dt_input_uuid_idx").on(table.uuid),
  ],
);

export const decision_table_outputs = pgTable(
  "decision_table_outputs",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    dt_id: uuid("dt_id")
      .notNull()
      .references(() => decision_tables.uuid, {
        onDelete: "cascade",
      }),
    name: varchar("name").notNull(),
    description: text("description"),
    dataType: varchar("dataType", { length: 100 }),
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
    index("dt_output_id_idx").on(table.id),
    index("dt_output_uuid_idx").on(table.uuid),
  ],
);

export const decision_table_input_conditions = pgTable(
  "decision_table_input_conditions",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    dt_row_id: uuid("dt_row_id").notNull(),
    dt_input_id: uuid("dt_input_id").notNull(),
    condition: text("condition"),
    value: text("value"),
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
    foreignKey({
      name: "dt_input_condition_dt_row_id_fkey",
      columns: [table.dt_row_id],
      foreignColumns: [decision_table_rows.uuid],
    }).onDelete("cascade"),
    foreignKey({
      name: "dt_input_condition_dt_input_id_fkey",
      columns: [table.dt_input_id],
      foreignColumns: [decision_table_inputs.uuid],
    }).onDelete("cascade"),
    index("dt_input_condition_id_idx").on(table.id),
    index("dt_input_condition_uuid_idx").on(table.uuid),
  ],
);

export const decision_table_output_results = pgTable(
  "decision_table_output_results",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    dt_row_id: uuid("dt_row_id").notNull(),
    dt_output_id: uuid("dt_output_id").notNull(),
    result: text("result"),
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
    foreignKey({
      name: "dt_output_result_dt_row_id_fkey",
      columns: [table.dt_row_id],
      foreignColumns: [decision_table_rows.uuid],
    }).onDelete("cascade"),
    foreignKey({
      name: "dt_output_result_dt_output_id_fkey",
      columns: [table.dt_output_id],
      foreignColumns: [decision_table_outputs.uuid],
    }).onDelete("cascade"),
    index("dt_output_result_id_idx").on(table.id),
    index("dt_output_result_uuid_idx").on(table.uuid),
  ],
);

// Relations
export const decisionTablesRelations = relations(
  decision_tables,
  ({ many }) => ({
    decisionTableRows: many(decision_table_rows),
    decisionTableInputs: many(decision_table_inputs),
    decisionTableOutputs: many(decision_table_outputs),
  }),
);

export const decisionTableRowsRelations = relations(
  decision_table_rows,
  ({ one, many }) => ({
    decisionTable: one(decision_tables, {
      fields: [decision_table_rows.dt_id],
      references: [decision_tables.uuid],
    }),
    decisionTableInputConditions: many(decision_table_input_conditions),
    decisionTableOutputResults: many(decision_table_output_results),
  }),
);

export const decisionTableInputsRelations = relations(
  decision_table_inputs,
  ({ one, many }) => ({
    decisionTable: one(decision_tables, {
      fields: [decision_table_inputs.dt_id],
      references: [decision_tables.uuid],
    }),
    decisionTableInputConditions: many(decision_table_input_conditions),
  }),
);

export const decisionTableOutputsRelations = relations(
  decision_table_outputs,
  ({ one, many }) => ({
    decisionTable: one(decision_tables, {
      fields: [decision_table_outputs.dt_id],
      references: [decision_tables.uuid],
    }),
    decisionTableOutputResults: many(decision_table_output_results),
  }),
);

export const decisionTableInputConditionsRelations = relations(
  decision_table_input_conditions,
  ({ one }) => ({
    decisionTableRow: one(decision_table_rows, {
      fields: [decision_table_input_conditions.dt_row_id],
      references: [decision_table_rows.uuid],
    }),
    decisionTableInput: one(decision_table_inputs, {
      fields: [decision_table_input_conditions.dt_input_id],
      references: [decision_table_inputs.uuid],
    }),
  }),
);

export const decisionTableOutputResultsRelations = relations(
  decision_table_output_results,
  ({ one }) => ({
    decisionTableRow: one(decision_table_rows, {
      fields: [decision_table_output_results.dt_row_id],
      references: [decision_table_rows.uuid],
    }),
    decisionTableOutput: one(decision_table_outputs, {
      fields: [decision_table_output_results.dt_output_id],
      references: [decision_table_outputs.uuid],
    }),
  }),
);

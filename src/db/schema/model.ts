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
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { ModelStatus } from "@/constants/general";
import { tenants } from "./tenant";

export const models = pgTable(
  "models",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    fileName: varchar("file_name", { length: 200 }).notNull(),
    fileKey: varchar("file_key", { length: 200 }).notNull(),
    metadataFileName: varchar("metadata_file_name", { length: 200 }),
    metadataFileKey: varchar("metadata_file_key", { length: 200 }),
    defineInputs: json("define_inputs"),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(ModelStatus.INACTIVE),
    type: varchar("type", { length: 100 }),
    framework: varchar("framework", { length: 100 }),
    // Multi-tenancy support (SAAS-32)
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
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
    index("model_id_idx").on(table.id),
    index("model_uuid_idx").on(table.uuid),
    index("model_tenant_id_idx").on(table.tenantId),
  ],
);

export const model_metrics = pgTable("model_metrics", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  modelId: integer("model_id")
    .references(() => models.id, { onDelete: "cascade" })
    .notNull(),
  version: varchar("version", { length: 100 }).notNull(),
  ks: varchar("ks", { length: 100 }),
  auroc: varchar("auroc", { length: 100 }),
  gini: varchar("gini", { length: 100 }),
  accuracy: varchar("accuracy", { length: 100 }),
  precision: varchar("precision", { length: 100 }),
  recall: varchar("recall", { length: 100 }),
  f1: varchar("f1", { length: 100 }),
  brier_score: varchar("brier_score", { length: 100 }),
  log_loss: varchar("log_loss", { length: 100 }),
  ksChart: text("ks_chart"),
  aurocChart: text("auroc_chart"),
  giniChart: text("gini_chart"),
  accuracyChart: text("accuracy_chart"),
  features: json("features"),
  outputs: json("outputs"),
  inference: json("inference"),
  // New SAAS-11 columns for enhanced model metadata
  charts_data: json("charts_data"), // For metrics.charts array
  feature_analysis: json("feature_analysis"), // For feature_analysis object  
  model_info_details: json("model_info_details"), // For complete model_info object
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
});

export const inferences = pgTable("inferences", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  modelId: integer("model_id")
    .references(() => models.id, { onDelete: "cascade" })
    .notNull(),
  input: json("input"),
  output: json("output"),
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
});

// Relations
export const modelsRelations = relations(models, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [models.tenantId],
    references: [tenants.id],
  }),
  metrics: many(model_metrics),
  inferences: many(inferences),
}));

export const model_metricsRelations = relations(model_metrics, ({ one }) => ({
  model: one(models, {
    fields: [model_metrics.modelId],
    references: [models.id],
  }),
}));

export const inferencesRelations = relations(inferences, ({ one }) => ({
  model: one(models, {
    fields: [inferences.modelId],
    references: [models.id],
  }),
}));

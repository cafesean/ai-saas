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
    version: varchar("version", { length: 100 }),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(ModelStatus.INACTIVE),
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
  ],
);

export const model_metrics = pgTable("model_metrics", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  modelId: integer("model_id")
    .references(() => models.id, { onDelete: "cascade" })
    .notNull(),
  ks: varchar("ks", { length: 100 }),
  auroc: varchar("auroc", { length: 100 }),
  gini: varchar("gini", { length: 100 }),
  accuracy: varchar("accuracy", { length: 100 }),
  ksChart: text("ks_chart"),
  aurocChart: text("auroc_chart"),
  giniChart: text("gini_chart"),
  accuracyChart: text("accuracy_chart"),
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
export const modelsRelations = relations(models, ({ one }) => ({
  metrics: one(model_metrics, {
    fields: [models.id],
    references: [model_metrics.modelId],
  }),
}));

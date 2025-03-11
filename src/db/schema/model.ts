import { pgTable, uuid, varchar, timestamp, json, uniqueIndex, index, serial, text } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

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
    metadataFileName: varchar("metadata_file_name", { length: 200 }).notNull(),
    metadataFileKey: varchar("metadata_file_key", { length: 200 }).notNull(),
    defineInputs: json("define_inputs"),
    status: varchar("status", { length: 100 }).notNull().default(ModelStatus.INACTIVE),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("model_id_idx").on(table.id), index("model_uuid_idx").on(table.uuid)]
);

// Relations

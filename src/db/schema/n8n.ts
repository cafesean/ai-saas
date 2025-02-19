import { 
  pgTable,
  uuid,
  varchar,
  timestamp,
  json,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';

import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: varchar('template_id', { length: 256 }).notNull(),
  versionId: varchar('version_id', { length: 256 }).notNull(),
  instanceId: varchar('instance_id', { length: 256 }).notNull(),
  userInputs: json('user_inputs').notNull().$type<Record<string, unknown>>(),
  workflowJson: json('workflow_json').notNull().$type<Record<string, unknown>>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  templateIdIdx: index('template_id_idx').on(table.templateId),
  instanceIdIdx: index('instance_id_idx').on(table.instanceId),
}));

export const nodeTypes = pgTable('node_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 256 }).notNull(),
  category: varchar('category', { length: 256 }).notNull(),
  description: varchar('description', { length: 1024 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  typeIdx: uniqueIndex('type_idx').on(table.type),
  categoryIdx: index('category_idx').on(table.category),
}));



export const insertTemplateSchema = createInsertSchema(templates);
export const selectTemplateSchema = createSelectSchema(templates);

export const insertNodeTypeSchema = createInsertSchema(nodeTypes);
export const selectNodeTypeSchema = createSelectSchema(nodeTypes);


// Types
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

export type NodeType = typeof nodeTypes.$inferSelect;
export type InsertNodeType = typeof nodeTypes.$inferInsert; 
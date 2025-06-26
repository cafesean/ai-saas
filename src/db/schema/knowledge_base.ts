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
  bigint,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import {
  KnowledgeBaseStatus,
  KnowledgeBaseDocumentStatus,
} from "@/constants/knowledgeBase";
import { orgs } from "./org";

export const knowledge_bases = pgTable(
  "knowledge_bases",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    vectorDB: varchar("vector_db", { length: 300 }).notNull(),
    embeddingModel: varchar("embedding_model", { length: 300 }).notNull(),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(KnowledgeBaseStatus.draft),
    // Multi-tenancy support (SAAS-32)
    orgId: integer("org_id")
      .references(() => orgs.id, { onDelete: "restrict" }),
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
    index("knowledge_base_id_idx").on(table.id),
    index("knowledge_base_uuid_idx").on(table.uuid),
    index("knowledge_base_org_id_idx").on(table.orgId),
  ],
);

export const knowledge_base_documents = pgTable(
  "knowledge_base_documents",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    kb_id: uuid("kb_id")
      .notNull()
      .references(() => knowledge_bases.uuid, {
        onDelete: "cascade",
      }),
    name: varchar("name", { length: 200 }).notNull(),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(KnowledgeBaseDocumentStatus.processing),
    size: bigint("size", { mode: "number" }).notNull(),
    path: text("path").notNull(),
    chunkSize: varchar("chunkSize", { length: 100 }).default("1000"),
    chunkOverlap: varchar("chunk_overlap", { length: 100 }).default("200"),
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
    index("kb_document_id_idx").on(table.id),
    index("kb_document_uuid_idx").on(table.uuid),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    kbId: uuid("kb_id")
      .notNull()
      .references(() => knowledge_bases.uuid, {
        onDelete: "cascade",
      }),
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
    index("conversations_id_idx").on(table.id),
    index("conversations_uuid_idx").on(table.uuid),
  ],
);

export const conversation_messages = pgTable("conversation_messages", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.uuid, {
      onDelete: "cascade",
    }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
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

export const knowledge_base_chunks = pgTable(
  "knowledge_base_chunks",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => knowledge_base_documents.uuid, {
        onDelete: "cascade",
      }),
    content: text("content").notNull(),
    metadata: json("metadata").$type<{
      chunkIndex: number;
      startChar: number;
      endChar: number;
      chunkingStrategy: string;
      pageNumber?: number;
      section?: string;
    }>(),
    embedding: json("embedding").$type<number[]>(),
    chunkingStrategy: varchar("chunking_strategy", { length: 100 }).notNull().default("fixed-length"),
    chunkSize: integer("chunk_size").notNull(),
    chunkOverlap: integer("chunk_overlap").notNull().default(0),
    isManual: boolean("is_manual").notNull().default(false),
    status: varchar("status", { length: 100 }).notNull().default("processed"),
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
    index("kb_chunk_id_idx").on(table.id),
    index("kb_chunk_uuid_idx").on(table.uuid),
    index("kb_chunk_document_id_idx").on(table.document_id),
    index("kb_chunk_strategy_idx").on(table.chunkingStrategy),
  ],
);

// Relations
export const knowledgeBaseRelations = relations(
  knowledge_bases,
  ({ one, many }) => ({
      org: one(orgs, {
    fields: [knowledge_bases.orgId],
    references: [orgs.id],
    }),
    documents: many(knowledge_base_documents),
    conversations: many(conversations),
  }),
);

export const knowledgeBaseDocumentRelations = relations(
  knowledge_base_documents,
  ({ one, many }) => ({
    knowledgeBase: one(knowledge_bases, {
      fields: [knowledge_base_documents.kb_id],
      references: [knowledge_bases.uuid],
    }),
    chunks: many(knowledge_base_chunks),
  }),
);

export const knowledgeBaseConversationRelations = relations(
  conversations,
  ({ one }) => ({
    knowledgeBase: one(knowledge_bases, {
      fields: [conversations.kbId],
      references: [knowledge_bases.uuid],
    }),
  }),
);

export const conversationRelations = relations(conversations, ({ many }) => ({
  messages: many(conversation_messages),
}));

export const conversationMessageRelations = relations(
  conversation_messages,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversation_messages.conversationId],
      references: [conversations.uuid],
    }),
  }),
);

export const knowledgeBaseChunkRelations = relations(
  knowledge_base_chunks,
  ({ one }) => ({
    document: one(knowledge_base_documents, {
      fields: [knowledge_base_chunks.document_id],
      references: [knowledge_base_documents.uuid],
    }),
  }),
);

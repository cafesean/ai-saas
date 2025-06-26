-- Migration: Add knowledge_base_chunks table for advanced chunking support
-- This enables fine-grained control over document chunking and chunk management

CREATE TABLE IF NOT EXISTS "knowledge_base_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"embedding" jsonb,
	"chunking_strategy" varchar(100) DEFAULT 'fixed-length' NOT NULL,
	"chunk_size" integer NOT NULL,
	"chunk_overlap" integer DEFAULT 0 NOT NULL,
	"is_manual" boolean DEFAULT false NOT NULL,
	"status" varchar(100) DEFAULT 'processed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_base_chunks_uuid_unique" UNIQUE("uuid")
);

-- Add foreign key constraint to reference knowledge_base_documents
ALTER TABLE "knowledge_base_chunks" ADD CONSTRAINT "knowledge_base_chunks_document_id_knowledge_base_documents_uuid_fk" FOREIGN KEY ("document_id") REFERENCES "knowledge_base_documents"("uuid") ON DELETE cascade ON UPDATE no action;

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS "kb_chunk_id_idx" ON "knowledge_base_chunks" ("id");
CREATE INDEX IF NOT EXISTS "kb_chunk_uuid_idx" ON "knowledge_base_chunks" ("uuid");
CREATE INDEX IF NOT EXISTS "kb_chunk_document_id_idx" ON "knowledge_base_chunks" ("document_id");
CREATE INDEX IF NOT EXISTS "kb_chunk_strategy_idx" ON "knowledge_base_chunks" ("chunking_strategy");

-- Create index for content search (full-text search support)
CREATE INDEX IF NOT EXISTS "kb_chunk_content_search_idx" ON "knowledge_base_chunks" USING gin(to_tsvector('english', "content"));

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS "kb_chunk_status_idx" ON "knowledge_base_chunks" ("status");

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS "kb_chunk_document_strategy_idx" ON "knowledge_base_chunks" ("document_id", "chunking_strategy");
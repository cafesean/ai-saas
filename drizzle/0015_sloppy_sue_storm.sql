CREATE TABLE "knowledge_base_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"embedding" json,
	"chunking_strategy" varchar(100) DEFAULT 'fixed-length' NOT NULL,
	"chunk_size" integer NOT NULL,
	"chunk_overlap" integer DEFAULT 0 NOT NULL,
	"is_manual" boolean DEFAULT false NOT NULL,
	"status" varchar(100) DEFAULT 'processed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_base_chunks_uuid_unique" UNIQUE("uuid")
);

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_base_documents') THEN
        BEGIN
            ALTER TABLE "knowledge_base_chunks" ADD CONSTRAINT "knowledge_base_chunks_document_id_knowledge_base_documents_uuid_fk" FOREIGN KEY ("document_id") REFERENCES "public"."knowledge_base_documents"("uuid") ON DELETE cascade ON UPDATE no action;
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "kb_chunk_id_idx" ON "knowledge_base_chunks" USING btree ("id");
CREATE INDEX IF NOT EXISTS "kb_chunk_uuid_idx" ON "knowledge_base_chunks" USING btree ("uuid");
CREATE INDEX IF NOT EXISTS "kb_chunk_document_id_idx" ON "knowledge_base_chunks" USING btree ("document_id");
CREATE INDEX IF NOT EXISTS "kb_chunk_strategy_idx" ON "knowledge_base_chunks" USING btree ("chunking_strategy");
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { knowledge_base_documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

import { KnowledgeBaseDocumentStatus } from "@/constants/knowledgeBase";

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    let payload = null;
    try {
      payload = await request.json();
    } catch (err) {
      console.warn("Body is not valid JSON or is empty.");
    }

    if (!payload?.documentId) {
      return createApiError("Document ID is required", 400);
    }

    const document = await db.query.knowledge_base_documents.findFirst({
      where: eq(knowledge_base_documents.uuid, payload.documentId),
    });

    if (!document) {
      return createApiError("Document not found", 404);
    }

    // Check if the document is already processed
    if (document.status == KnowledgeBaseDocumentStatus.processed) {
      return createApiSuccess({
        message: "Document already embedded.",
      });
    }

    // Update the document status to processed
    await db
      .update(knowledge_base_documents)
      .set({ status: KnowledgeBaseDocumentStatus.processed })
      .where(eq(knowledge_base_documents.uuid, payload.documentId));

    // Create sample chunks for demo purposes
    // In production, this would be replaced with actual document content processing
    const sampleContent = `This is a sample document chunk for document ${document.name}. 
    
This represents the first chunk of the processed document. In a real implementation, this would contain the actual extracted text content from the uploaded file.

The document was uploaded and processed successfully. Additional chunks would follow this pattern, each containing a portion of the original document text based on the selected chunking strategy.

This chunk demonstrates the chunking functionality working with the knowledge base system.`;

    try {
      // Import the knowledge_base_chunks schema
      const { knowledge_base_chunks } = await import('@/db/schema');
      
      // Create sample chunks
      const chunksToInsert = [
        {
          uuid: crypto.randomUUID(),
          document_id: payload.documentId,
          content: sampleContent,
          metadata: {
            chunkIndex: 0,
            startChar: 0,
            endChar: sampleContent.length,
            chunkingStrategy: "fixed-length",
          },
          chunkingStrategy: "fixed-length",
          chunkSize: sampleContent.length,
          chunkOverlap: 0,
          isManual: false,
          status: "processed",
        },
        {
          uuid: crypto.randomUUID(),
          document_id: payload.documentId,
          content: `Second chunk for ${document.name}. This demonstrates multiple chunks being created for a single document. Each chunk represents a portion of the original content.`,
          metadata: {
            chunkIndex: 1,
            startChar: sampleContent.length,
            endChar: sampleContent.length + 150,
            chunkingStrategy: "fixed-length",
          },
          chunkingStrategy: "fixed-length",
          chunkSize: 150,
          chunkOverlap: 0,
          isManual: false,
          status: "processed",
        },
      ];

      await db.insert(knowledge_base_chunks).values(chunksToInsert);
      
      console.log(`Created ${chunksToInsert.length} sample chunks for document ${payload.documentId}`);
    } catch (chunkError) {
      console.error('Error creating sample chunks:', chunkError);
      // Don't fail the callback if chunk creation fails
    }

    return createApiSuccess({
      documentId: payload.documentId,
    });
  } catch (error) {
    console.error("Callback processing error:", error);
    return createApiError("Callback processing failed", 500);
  }
}, {
  requireAuth: true,
  requiredPermission: 'knowledge_base:callback'
});

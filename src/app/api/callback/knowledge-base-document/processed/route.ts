import { NextRequest, NextResponse } from "next/server";
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

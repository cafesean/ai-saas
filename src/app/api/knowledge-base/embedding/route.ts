import { NextRequest, NextResponse } from "next/server";
import { EMBEDDING_DOCUMENT } from "@/constants/general";
import { eq, and } from "drizzle-orm";
import axios from "axios";

import { db } from "@/db";
import { knowledge_bases } from "@/db/schema";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kb_id = formData.get("kb_id") as string | undefined;
    const document_id = formData.get("document_id") as string | undefined;
    const chunk_size = formData.get("chunk_size") as string | undefined;
    const chunk_overlap = formData.get("chunk_overlap") as string | undefined;

    if (!file) {
      return createApiError("No file provided", 400);
    }
    
    if (!kb_id) {
      return createApiError("Knowledge Base ID is required", 400);
    }

    // Verify user has access to this knowledge base
    const knowledgeBase = await db.query.knowledge_bases.findFirst({
      where: eq(knowledge_bases.uuid, kb_id),
    });

    if (!knowledgeBase) {
      return createApiError("Knowledge Base not found or access denied", 404);
    }

    const fileSize = file.size;

    if (fileSize > EMBEDDING_DOCUMENT.maxSize) {
      return createApiError("File size exceeds limit", 400);
    }

    // Trigger n8n workflow
    const newFormData = new FormData();
    newFormData.append("data", file);
    newFormData.append("user_id", user.id.toString());
    newFormData.append("kb_id", kb_id);
    newFormData.append("document_id", document_id || "");
    newFormData.append("chunk_size", chunk_size || "1000");
    newFormData.append("chunk_overlap", chunk_overlap || "200");
    newFormData.append(
      "callback_url",
      process.env.KNOWLEDGE_BASE_DOCUMENT_CALLBACK_PROCESSED_URL || "",
    );

    const result = await axios.post(
      `${process.env.KNOWLEDGE_BASE_UPLOAD_URL}`,
      newFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Basic " + process.env.N8N_BASIC_AUTH_TOKEN,
        },
        timeout: 5 * 60 * 1000,
      },
    );

    if (!result.data.success) {
      return createApiError(result.data.error || "Upload failed", 500);
    }

    // Return successful upload information
    return createApiSuccess({
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("File upload processing error:", error);
    return createApiError("File upload processing failed", 500);
  }
}, {
  requireAuth: true,
  // Temporarily removed permission check until RBAC is fully configured
  // requiredPermission: 'knowledge_base:upload_document'
});

export const DELETE = withApiAuth(async (request: NextRequest, user) => {
  try {
    const { kbId, documents } = await request.json();
    if (!kbId || !documents) {
      return createApiError("KB ID and Document ID is required", 400);
    }

    // Verify user has access to this knowledge base
    const knowledgeBase = await db.query.knowledge_bases.findFirst({
      where: eq(knowledge_bases.uuid, kbId),
    });

    if (!knowledgeBase) {
      return createApiError("Knowledge Base not found or access denied", 404);
    }

    const result = await axios.delete(
      `${process.env.KNOWLEDGE_BASE_EMBEDDING_DELETE_URL}`,
      {
        data: {
          kb_id: kbId,
          documents: documents,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + process.env.N8N_BASIC_AUTH_TOKEN,
        },
        timeout: 5 * 60 * 1000,
      },
    );
    if (!result.data.success) {
      return createApiError(result.data.error || "Delete failed", 500);
    }

    return createApiSuccess({
      message: "Documents deleted successfully"
    });
  } catch (error) {
    console.error("File delete processing error:", error);
    return createApiError("File delete processing failed", 500);
  }
}, {
  requireAuth: true,
  // Temporarily removed permission check until RBAC is fully configured
  // requiredPermission: 'knowledge_base:delete'
});

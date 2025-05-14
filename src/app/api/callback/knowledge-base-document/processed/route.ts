import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/config";
import schema from "@/db/schema";
import { eq } from "drizzle-orm";

import { KnowledgeBaseDocumentStatus } from "@/constants/knowledgeBase";

export async function POST(request: NextRequest, res: NextResponse) {
  try {
    let payload = null;
    try {
      payload = await request.json();
    } catch (err) {
      console.warn("Body is not valid JSON or is empty.");
    }

    const document = await db.query.knowledge_base_documents.findFirst({
      where: eq(schema.knowledge_base_documents.uuid, payload.documentId),
    });
    // Check if the workflow in endpoint is published
    if (document && document.status == KnowledgeBaseDocumentStatus.processed) {
      return NextResponse.json(
        {
          success: true,
          message: "Document already embedded.",
        },
        { status: 200 },
      );
    }
    if (document) {
      // Update the document status to processed
      await db
        .update(schema.knowledge_base_documents)
        .set({ status: KnowledgeBaseDocumentStatus.processed })
        .where(eq(schema.knowledge_base_documents.uuid, payload.documentId));
      return NextResponse.json({
        success: true,
        data: {
          documentId: payload.documentId,
        },
      });
    } else {
      throw new Error("Document not found");
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}

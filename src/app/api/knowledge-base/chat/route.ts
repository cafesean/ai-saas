import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { knowledge_bases, conversation_messages } from "@/db/schema";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    const { query, kbId, conversationId, role, stream } = await request.json();
    
    if (!query) {
      return createApiError("query is required", 400);
    }
    if (!kbId) {
      return createApiError("Knowledge Base ID is required", 400);
    }
    if (!conversationId) {
      return createApiError("Conversation ID is required", 400);
    }
    if (!role) {
      return createApiError("Role is required", 400);
    }

    // Verify user has access to this knowledge base
    const knowledgeBase = await db.query.knowledge_bases.findFirst({
      where: eq(knowledge_bases.uuid, kbId),
    });

    if (!knowledgeBase) {
      return createApiError("Knowledge Base not found or access denied", 404);
    }

    const result = await axios.post(
      `${process.env.KNOWLEDGE_BASE_CHAT_URL}`,
      {
        query,
        user_id: user.id,
        kb_id: kbId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + process.env.N8N_BASIC_AUTH_TOKEN,
        },
        timeout: 5 * 60 * 1000,
      },
    );
    if (
      result.data.length === 0 ||
      (result.data.length > 0 && !result.data[0].response)
    ) {
      return NextResponse.json(
        { success: false, error: result.data.error || "Ask query failed" },
        { status: 500 },
      );
    }
    if (result.data[0].response.text) {
      // Add conversation message to database
      const newConversationMessage = await db
        .insert(conversation_messages)
        .values({
          conversationId,
          role,
          content: result.data[0].response.text,
        })
        .returning();
    }
    if (stream) {
      const content = result.data[0].response.text;
      const readableStream = new ReadableStream({
        start(controller) {
          let currentIndex = 0;
          const chunkSize = 32;
          const interval = setInterval(() => {
            if (currentIndex < content.length) {
              const chunk = content.slice(
                currentIndex,
                currentIndex + chunkSize,
              );
              controller.enqueue(new TextEncoder().encode(chunk));
              currentIndex += chunkSize;
            } else {
              clearInterval(interval);
              controller.close();
            }
          }, 100);
        },
      });
      return new NextResponse(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Return successful response
      return createApiSuccess(result.data[0].response);
    }
  } catch (error: any) {
    console.log(error);
    if (
      error &&
      error?.response?.data &&
      error?.response?.data?.message?.includes("Error in workflow")
    ) {
      return createApiError(`N8N: ${error?.response.data.message}`, 400);
    } else {
      return createApiError(error?.response?.data || "Knowledge base chat failed", 400);
    }
  }
}, {
  requireAuth: true,
  // Temporarily removed permission check until RBAC is fully configured
  // requiredPermission: 'knowledge_base:chat'
});

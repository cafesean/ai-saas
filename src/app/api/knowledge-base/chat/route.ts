import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

import { db } from "@/db/config";
import schema from "@/db/schema";

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json(
      {
        success: false,
        error: "Method not allowed",
      },
      { status: 405 },
    );
  }
  try {
    const { query, userId, kbId, conversationId, role, stream } =
      await request.json();
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "query is required",
        },
        { status: 400 },
      );
    }
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      );
    }
    if (!kbId) {
      return NextResponse.json(
        {
          success: false,
          error: "Knowledge Base ID is required",
        },
        { status: 400 },
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required",
        },
        { status: 400 },
      );
    }

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: "Role is required",
        },
        { status: 400 },
      );
    }

    const result = await axios.post(
      `${process.env.KNOWLEDGE_BASE_CHAT_URL}`,
      {
        query,
        user_id: userId,
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
        .insert(schema.conversation_messages)
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
      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream", // 设置响应头为 EventStream
          "Cache-Control": "no-cache", // 禁用缓存
          Connection: "keep-alive", // 保持连接
        },
      });
    } else {
      // Return successful upload information
      return NextResponse.json(
        {
          success: true,
          data: result.data[0].response,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Ask query error:", error);
    return NextResponse.json(
      { success: false, error: "Ask query failed" },
      { status: 500 },
    );
  }
}

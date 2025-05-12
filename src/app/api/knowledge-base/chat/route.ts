import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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
    const {
      data: { query, userId, kbId },
    } = await request.json();
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

    const result = await axios.post(`${process.env.KNOWLEDGE_BASE_CHAT_URL}`, {
      data: {
        query,
        user_id: userId,
        kb_id: kbId,
      },
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5 * 60 * 1000,
    });
    if (
      result.data.length === 0 ||
      (result.data.length > 0 && !result.data[0].response)
    ) {
      return NextResponse.json(
        { success: false, error: result.data.error || "Ask query failed" },
        { status: 500 },
      );
    }
    
    // Return successful upload information
    return NextResponse.json(
      {
        success: true,
        data: result.data[0].response,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Ask query error:", error);
    return NextResponse.json(
      { success: false, error: "Ask query failed" },
      { status: 500 },
    );
  }
}

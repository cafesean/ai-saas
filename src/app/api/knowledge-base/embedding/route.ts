import { NextRequest, NextResponse } from "next/server";
import { EMBEDDING_DOCUMENT } from "@/constants/general";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const user_id = formData.get("user_id") as string | undefined;
    const kb_id = formData.get("kb_id") as string | undefined;
    const document_id = formData.get("document_id") as string | undefined;
    const chunk_size = formData.get("chunk_size") as string | undefined;
    const chunk_overlap = formData.get("chunk_overlap") as string | undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    const fileSize = file.size;

    if (fileSize > EMBEDDING_DOCUMENT.maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds limit" },
        { status: 400 },
      );
    }

    // Trigger n8n workflow
    const newFormData = new FormData();
    newFormData.append("data", file);
    newFormData.append("user_id", user_id || "");
    newFormData.append("kb_id", kb_id || "");
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
      return NextResponse.json(
        { success: false, error: result.data.error || "Upload failed" },
        { status: 500 },
      );
    }

    // Return successful upload information
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("File upload processing error:", error);
    return NextResponse.json(
      { success: false, error: "File upload processing failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, res: NextResponse) {
  if (request.method !== "DELETE") {
    return NextResponse.json(
      {
        success: false,
        error: "Method not allowed",
      },
      { status: 405 },
    );
  }
  try {
    const { kbId, documents } = await request.json();
    if (!kbId || !documents) {
      return NextResponse.json(
        {
          success: false,
          error: "KB ID and Document ID is required",
        },
        { status: 400 },
      );
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
      return NextResponse.json(
        { success: false, error: result.data.error || "Delete failed" },
        { status: 500 },
      );
    }

    // Return successful upload information
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("File delete processing error:", error);
    return NextResponse.json(
      { error: "File delete processing failed" },
      { status: 500 },
    );
  }
}

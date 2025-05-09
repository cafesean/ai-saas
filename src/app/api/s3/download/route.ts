import { NextRequest, NextResponse } from "next/server";

import { downloadFileFromS3 } from "@/lib/aws-s3";

export async function POST(request: NextRequest, res: NextResponse) {
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
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: "File key is required",
        },
        { status: 400 },
      );
    }

    const { success, data } = await downloadFileFromS3(key);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "File not found",
        },
        { status: 404 },
      );
    }

    const response = new NextResponse(data?.buffer, {
      status: 200,
      headers: new Headers({
        "Content-Type": data?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          key.split("/").pop() || "file",
        )}"`,
      }),
    });

    return response;
  } catch (error) {
    console.error("File upload processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "File upload processing failed",
      },
      { status: 500 },
    );
  }
}

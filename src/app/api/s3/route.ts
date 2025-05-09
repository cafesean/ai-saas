import { NextRequest, NextResponse } from "next/server";

import { deleteMultipleFilesFromS3 } from "@/lib/aws-s3";

export async function DELETE(request: NextRequest) {
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
    const { keys } = await request.json();
    if (!keys) {
      return NextResponse.json(
        {
          success: false,
          error: "keys is required",
        },
        { status: 400 },
      );
    }

    // Upload file to S3
    const result = await deleteMultipleFilesFromS3(keys);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.errors || "Delete failed" },
        { status: 500 },
      );
    }

    // Return successful upload information
    return NextResponse.json(
      {
        success: true,
        data: {
          keys,
        },
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

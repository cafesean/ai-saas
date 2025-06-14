import { NextRequest, NextResponse } from "next/server";
import { downloadFileFromS3 } from "@/lib/aws-s3";
import { withApiAuth, createApiError } from "@/lib/api-auth";

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    const { key } = await request.json();

    if (!key) {
      return createApiError("File key is required", 400);
    }

    const { success, data } = await downloadFileFromS3(key);

    if (!success) {
      return createApiError("File not found", 404);
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
    console.error("File download processing error:", error);
    return createApiError("File download processing failed", 500);
  }
}, {
  requireAuth: true,
  requiredPermission: 'file:download'
});

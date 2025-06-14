import { NextRequest, NextResponse } from "next/server";

import { deleteMultipleFilesFromS3 } from "@/lib/aws-s3";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

export const DELETE = withApiAuth(async (request: NextRequest, user) => {
  try {
    const { keys } = await request.json();
    if (!keys) {
      return createApiError("keys is required", 400);
    }

    // Delete files from S3
    const result = await deleteMultipleFilesFromS3(keys);

    if (!result.success) {
      const errorMessage = Array.isArray(result.errors) 
        ? result.errors.map(e => e.error).join(', ')
        : result.errors || "Delete failed";
      return createApiError(errorMessage, 500);
    }

    // Return successful deletion information
    return createApiSuccess({ keys });
  } catch (error) {
    console.error("File deletion processing error:", error);
    return createApiError("File deletion processing failed", 500);
  }
}, {
  requireAuth: true,
  requiredPermission: 'file:manage_s3'
});

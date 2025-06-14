import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { uploadFileToS3 } from "@/lib/aws-s3";
import { S3_UPLOAD } from "@/constants/general";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createApiError("No file provided", 400);
    }

    const originalName = file.name;
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const fileType = file.type;
    const fileSize = file.size;

    if (fileSize > S3_UPLOAD.maxSize) {
      return createApiError("File size exceeds limit", 400);
    }

    const customPath = (formData.get("path") as string) || "";

    const fileBuffer = await file.arrayBuffer();

    // Upload file to S3
    const result = await uploadFileToS3({
      file: Buffer.from(fileBuffer),
      fileName: fileName,
      contentType: fileType,
      path: customPath,
      metadata: {
        originalName: encodeURIComponent(originalName),
        uploadedAt: new Date().toISOString(),
      },
    });

    if (!result.success) {
      return createApiError(result.error || "Upload failed", 500);
    }

    // Return successful upload information
    return createApiSuccess({
      uuid: uuidv4(),
      url: result.url,
      key: result.key,
      fileName: fileName,
      originalName: originalName,
      contentType: fileType,
      size: fileSize,
    });
  } catch (error) {
    console.error("File upload processing error:", error);
    return createApiError("File upload processing failed", 500);
  }
}, { 
  requireAuth: true,
  requiredPermission: 'file:upload' 
});

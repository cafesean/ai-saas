import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface UploadFileParams {
  file: File | Buffer;
  fileName: string;
  contentType?: string;
  path?: string;
  metadata?: Record<string, string>;
}

export interface UploadFileResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload file to AWS S3
 */
export async function uploadFileToS3({
  file,
  fileName,
  contentType,
  path = "",
  metadata = {},
}: UploadFileParams): Promise<UploadFileResponse> {
  try {
    const key = path ? `${path}/${fileName}` : fileName;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    };

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await upload.done();

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      success: true,
      url: fileUrl,
      key,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during upload",
    };
  }
}

/**
 * Download file from AWS S3 and return it in the same format as input[type=file] uploads
 */
export async function downloadFileFromS3(key: string) {
  try {
    // 1. Create GetObjectCommand (原代码错误使用了PutObjectCommand)
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: key,
    });

    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      return { success: false, error: "File not found" };
    }
    const content = await response.Body.transformToString("base64");
    const buffer = Buffer.from(content, "base64");

    return {
      success: true,
      data: {
        buffer,
        contentType: response.ContentType || "application/octet-stream",
        originalName: key.split("/").pop() || "file",
      },
    };
  } catch (error) {
    console.error("Error downloading file from S3:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during download",
    };
  }
}

/**
 * Delete file from AWS S3
 */
export async function deleteFileFromS3(
  key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: key,
      }),
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during deletion",
    };
  }
}

export async function deleteMultipleFilesFromS3(
  keys: string[],
): Promise<{
  success: boolean;
  deletedCount: number;
  errors?: Array<{ key: string; error: string }>;
}> {
  if (!keys.length) {
    return { success: true, deletedCount: 0 };
  }
  try {
    const response = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false,
        },
      }),
    );
    const errors =
      response.Errors?.map((error) => ({
        key: error.Key || "unknown",
        error: error.Message || "Unknown error",
      })) || [];

    return {
      success: errors.length === 0,
      deletedCount: response.Deleted?.length || 0,
      ...(errors.length > 0 && { errors }),
    };
  } catch (error) {
    console.error("Error deleting files from S3:", error);
    return {
      success: false,
      deletedCount: 0,
      errors: [
        {
          key: "batch",
          error:
            error instanceof Error
              ? error.message
              : "Unknown batch deletion error",
        },
      ],
    };
  }
}

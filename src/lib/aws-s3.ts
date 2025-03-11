import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
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
  path = '',
  metadata = {}
}: UploadFileParams): Promise<UploadFileResponse> {
  try {
    const key = path ? `${path}/${fileName}` : fileName;
  
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata
    };

    const upload = new Upload({
      client: s3Client,
      params: uploadParams
    });

    await upload.done();

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      success: true,
      url: fileUrl,
      key
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
    };
  }
}

/**
 * Delete file from AWS S3
 */
export async function deleteFileFromS3(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || '',
        Key: key,
        Body: ''
      })
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during deletion'
    };
  }
}
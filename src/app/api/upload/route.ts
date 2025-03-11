import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/aws-s3';
import { S3_UPLOAD } from '@/constants/general';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;

    if (fileSize > S3_UPLOAD.maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds limit' },
        { status: 400 }
      );
    }

    const customPath = formData.get('path') as string || '';

    const fileBuffer = await file.arrayBuffer();

    // Upload file to S3
    const result = await uploadFileToS3({
      file: Buffer.from(fileBuffer),
      fileName: fileName,
      contentType: fileType,
      path: customPath,
      metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString()
      }
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    // Return successful upload information
    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        fileName: fileName,
        originalName: fileName,
        contentType: fileType,
        size: fileSize
      }
    }, { status: 200 });

  } catch (error) {
    console.error('File upload processing error:', error);
    return NextResponse.json(
      { success: false, error: 'File upload processing failed' },
      { status: 500 }
    );
  }
}

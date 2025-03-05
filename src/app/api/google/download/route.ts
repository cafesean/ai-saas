import { NextRequest, NextResponse } from 'next/server';
import { GoogleDocTypes, GoogleDriveFileUrl } from '@/constants/google';

export async function GET(request: NextRequest) {
  try {
    // Get file ID
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const accessToken = searchParams.get('access_token');
    
    if (!fileId || !accessToken) {
      return NextResponse.json(
        { error: 'File ID and access token are required' },
        { status: 400 }
      );
    }

    // First get file metadata
    const metadataResponse = await fetch(
      `${GoogleDriveFileUrl}/${fileId}?fields=mimeType,name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      const errorData = await metadataResponse.json().catch(() => ({}));
      console.error('Google Drive metadata error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get file metadata from Google Drive' },
        { status: 500 }
      );
    }

    const metadata = await metadataResponse.json();
    const mimeType = metadata.mimeType;

    let fileResponse;
    if (mimeType in GoogleDocTypes) {
      // Export Google document
      fileResponse = await fetch(
        `${GoogleDriveFileUrl}/${fileId}/export?mimeType=${GoogleDocTypes[mimeType]?.type}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } else {
      // Download regular file
      fileResponse = await fetch(
        `${GoogleDriveFileUrl}/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }

    if (!fileResponse.ok) {
      const errorData = await fileResponse.json().catch(() => ({}));
      console.error('Google Drive download error:', errorData);
      return NextResponse.json(
        { error: 'Failed to download file from Google Drive' },
        { status: 500 }
      );
    }

    // Get file content
    const fileBlob = await fileResponse.blob();
    
    // Return file content
    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': fileResponse.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${metadata.name}"`,
      },
    });
  } catch (error) {
    console.error('Error in Google Drive download API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
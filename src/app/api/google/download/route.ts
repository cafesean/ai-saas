import { NextRequest, NextResponse } from 'next/server';
import { GoogleDocTypes, GoogleDriveFileUrl } from '@/constants/google';
import { withApiAuth, createApiError } from '@/lib/api-auth';

export const GET = withApiAuth(async (request: NextRequest, user) => {
  try {
    // Get file ID
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const accessToken = searchParams.get('access_token');

    if (!fileId || !accessToken) {
      return createApiError('File ID and access token are required', 400);
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
      return createApiError('Failed to get file metadata from Google Drive', 500);
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
      return createApiError('Failed to download file from Google Drive', 500);
    }

    // Get file content
    const fileBlob = await fileResponse.blob();

    // Encode the filename for Content-Disposition header
    const encodedFilename = encodeURIComponent(metadata.name).replace(/['()]/g, escape);

    // Return file content
    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': fileResponse.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error('Error in Google Drive download API:', error);
    return createApiError('Internal server error', 500);
  }
}, {
  requireAuth: true,
  requiredPermission: 'file:google_drive'
});

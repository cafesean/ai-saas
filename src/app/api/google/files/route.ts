import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveSource, GoogleTokenUrl, GoogleGrantType, CreateGetDriveFilesUrl } from '@/constants/google';
import { withApiAuth, createApiError, createApiSuccess } from '@/lib/api-auth';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

interface GoogleFilesResponse {
  files: GoogleFile[];
  nextPageToken?: string;
}

export const GET = withApiAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken');
    let accessToken = searchParams.get('accessToken');
    const code = searchParams.get('code');

    // Handle authorization code flow
    if (code) {
      // Exchange authorization code for access token
      const tokenResponse = await fetch(GoogleTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '',
          grant_type: GoogleGrantType.authorizationCode,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Google OAuth token error:', errorData);
        return createApiError('Failed to exchange authorization code', 500);
      }

      const tokenData: GoogleTokenResponse = await tokenResponse.json();
      accessToken = tokenData.access_token;
    }

    // Verify access token
    if (!accessToken) {
      return createApiError('Access token is required', 400);
    }

    // Get search query if provided
    const source = searchParams.get('source') || GoogleDriveSource[0]?.value;
    const name = searchParams.get('name');
    const parentId = searchParams.get('parentId');

    // Fetch files from Google Drive
    const filesResponse = await fetch(
      CreateGetDriveFilesUrl({
        pageToken,
        source,
        name,
        parentId,
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!filesResponse.ok) {
      const errorData = await filesResponse.json();
      console.error('Google Drive API error:', errorData);
      return createApiError('Failed to fetch files from Google Drive', 500);
    }

    const filesData: GoogleFilesResponse = await filesResponse.json();
    return createApiSuccess({
      files: filesData.files,
      ...(code && { access_token: accessToken }), // Only include access_token if code was provided
      nextPageToken: filesData.nextPageToken,
      hasMore: !!filesData.nextPageToken
    });
  } catch (error) {
    console.error('Error in Google Drive files API:', error);
    return createApiError('Internal server error', 500);
  }
}, {
  requireAuth: true,
  requiredPermission: 'file:google_drive'
});

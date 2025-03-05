export const PageSize = 50;

export const GoogleDocTypes: Record<string, { ext: string; type: string }> = {
  'application/vnd.google-apps.document': {
    ext: '.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  'application/vnd.google-apps.spreadsheet': {
    ext: '.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  'application/vnd.google-apps.presentation': {
    ext: '.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
};

export const GoogleAuthMessage = {
  success: 'GOOGLE_AUTH_SUCCESS',
};

export const GoogleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

export const GoogleTokenUrl = 'https://oauth2.googleapis.com/token';

export const GoogleDriveFileUrl = 'https://www.googleapis.com/drive/v3/files';

export const GoogleGrantType = {
  authorizationCode: 'authorization_code',
};

export const GoogleAuthScope = {
  drive: 'https://www.googleapis.com/auth/drive.readonly',
};

export const CreateDriveAuthUrl = ({ clientId, redirectUri } : { clientId: string; redirectUri: string }) =>
  `${GoogleAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${GoogleAuthScope.drive}&access_type=offline&prompt=consent`;

export const CreateGetDriveFilesUrl = ({ pageToken, searchParam }: { pageToken?: string | null; searchParam: string }) =>
  `${GoogleDriveFileUrl}?fields=files(id,name,mimeType,size,modifiedTime),nextPageToken&pageSize=${PageSize}${pageToken ? `&pageToken=${pageToken}` : ''}${searchParam}`;
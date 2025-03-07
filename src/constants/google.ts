export const PageSize = 50;

export const GoogleMimeTypes = {
  folder: 'application/vnd.google-apps.folder',
  document: 'application/vnd.google-apps.document',
  spreadsheet: 'application/vnd.google-apps.spreadsheet',
  presentation: 'application/vnd.google-apps.presentation',
};

export const GoogleDocTypes: Record<string, { ext: string; type: string }> = {
  [GoogleMimeTypes.document]: {
    ext: '.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  [GoogleMimeTypes.spreadsheet]: {
    ext: '.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  [GoogleMimeTypes.presentation]: {
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

export const GoogleDriveSource = [
  {
    label: 'My Drive',
    value: 'myDrive',
  },
  {
    label: 'Shared With Me',
    value:'sharedWithMe',
  },
  {
    label: 'Starred',
    value:'starred',
  },
];

export const CreateDriveAuthUrl = ({ clientId, redirectUri } : { clientId: string; redirectUri: string }) =>
  `${GoogleAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${GoogleAuthScope.drive}&access_type=offline&prompt=consent`;

export const CreateGetDriveFilesUrl = ({
  pageToken,
  name,
  parentId,
  source = GoogleDriveSource[0]?.value,
}: { pageToken?: string | null; name?: string | null; parentId?: string | null; source?: string | null }) => {
  // Base query parameters
  let query = '';
  const queryParams = [];

  // Add name filter if provided
  if (name) {
    queryParams.push(`name contains '${name}'`);
  }

  if (GoogleDriveSource.slice(1).some(s => s.value === source) && (!parentId || parentId === 'root')) {
    queryParams.push(source);
  } else if (parentId) {
    queryParams.push(`'${parentId}' in parents`);
  } else {
    queryParams.push(`'root' in parents`);
  }
  query = queryParams.join(' and ');

  return `${GoogleDriveFileUrl}?fields=files(id,name,mimeType,size,modifiedTime),nextPageToken&pageSize=${PageSize}&orderBy=folder,name${pageToken ? `&pageToken=${pageToken}` : ''}${query ? `&q=${query}` : ''}`;
};

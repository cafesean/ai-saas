"use client";

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/form/Button';
import { FileSelectDialog } from '@/components/ui/google-drive/FileSelectDialog';
import { GoogleDriveSource, GoogleDocTypes, GoogleAuthMessage, CreateDriveAuthUrl } from '@/constants/google';
import { Google_API } from '@/constants/api';
import { LocalStorageKeys } from '@/constants/general';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

interface GoogleDriveUploaderProps {
  setFileFetching: (isFetching: boolean) => void;
  onFilesSelected: (files: Array<{ name: string; type: string; base64file: string }>) => void;
}

export function GoogleDriveUploader({ onFilesSelected, setFileFetching }: GoogleDriveUploaderProps) {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreFiles, setHasMoreFiles] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentSource, setCurrentSource] = useState<string>(GoogleDriveSource[0]?.value || '');
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [currentPath, setCurrentPath] = useState<Array<{id: string; name: string}>>([]);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');

  // Event listener references
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const authWindowRef = useRef<Window | null>(null);
  const checkWindowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
    if (checkWindowIntervalRef.current) {
      clearInterval(checkWindowIntervalRef.current);
      checkWindowIntervalRef.current = null;
    }
    if (authWindowRef.current) {
      authWindowRef.current.close();
      authWindowRef.current = null;
    }
    setIsAuthenticating(false);
  };

  const handleGoogleDriveClick = async () => {
    if (isAuthenticating) return;

    try {
      setIsAuthenticating(true);

      cleanup(); // Clean up previous state

      // Open Google authentication window
      authWindowRef.current = window.open(
        CreateDriveAuthUrl({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '',
        }),
        '_blank',
        'width=600,height=600'
      );

      if (!authWindowRef.current) {
        throw new Error('Failed to open authentication window');
      }

      // Create new event handler
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === GoogleAuthMessage.success) {
          try {
            setFileFetching(true);
            const { code } = event.data;
            // Use authorization code to get file list
            const response = await fetch(`${Google_API.getFiles}?code=${code}&source=${currentSource}`);

            if (response.ok) {
              const data = await response.json();
              setGoogleDriveFiles(data.files);
              setNextPageToken(data.nextPageToken);
              setHasMoreFiles(!!data.nextPageToken);
              localStorage.setItem(LocalStorageKeys.googleAccessToken, data.access_token);
              setIsFileDialogOpen(true);
            } else {
              throw new Error('Failed to fetch Google Drive files');
            }
          } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to fetch Google Drive files');
          } finally {
            setFileFetching(false);
            cleanup();
          }
        }
      };

      // Save event handler reference and add listener
      messageHandlerRef.current = handleMessage;
      window.addEventListener('message', handleMessage);

      // Monitor authentication window close
      checkWindowIntervalRef.current = setInterval(() => {
        if (authWindowRef.current?.closed) {
          cleanup();
        }
      }, 1000);

      // Set timeout to prevent long hanging
      setTimeout(cleanup, 300000); // 5 minutes timeout

    } catch (error) {
      console.error('Google Drive auth error:', error);
      toast.error('Failed to authenticate with Google Drive');
      setIsAuthenticating(false);
      cleanup();
    }
  };

  const handleGoogleDriveClose = () => {
    setCurrentSource(GoogleDriveSource[0]?.value || '');
    setCurrentPath([]);
    setCurrentFolderId('root');
    setCurrentSearchQuery('');
    setIsFileDialogOpen(false);
    localStorage.removeItem(LocalStorageKeys.googleAccessToken);
  };

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={handleGoogleDriveClick}
      >
        <img src="/ui/google.svg" alt="Google" className="w-5 h-5" />
        Select Google Drive File
      </Button>

      <FileSelectDialog
        isOpen={isFileDialogOpen}
        onClose={handleGoogleDriveClose}
        files={googleDriveFiles}
        hasMore={hasMoreFiles}
        isLoading={isLoadingMore}
        currentSource={currentSource}
        currentPath={currentPath}
        onChangeSource={async (source) => {
          try {
            setIsLoadingMore(true);
            setCurrentSource(source);
            setCurrentPath([]);
            setCurrentFolderId('root');
            setCurrentSearchQuery('');
            const response = await fetch(`${Google_API.getFiles}?accessToken=${localStorage.getItem(LocalStorageKeys.googleAccessToken)}&source=${source}`);
            if (response.ok) {
              const data = await response.json();
              setGoogleDriveFiles(data.files);
              setNextPageToken(data.nextPageToken);
              setHasMoreFiles(!!data.nextPageToken);
            }
          } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to fetch Google Drive files');
          } finally {
            setIsLoadingMore(false);
          }
        }}
        onFilter={async (query) => {
          try {
            setIsLoadingMore(true);
            setCurrentSearchQuery(query); // Save current search query
            const response = await fetch(`${Google_API.getFiles}?accessToken=${localStorage.getItem(LocalStorageKeys.googleAccessToken)}&name=${query}&parentId=${currentFolderId}&source=${currentSource}`);

            if (response.ok) {
              const data = await response.json();
              setGoogleDriveFiles(data.files);
              setNextPageToken(data.nextPageToken);
              setHasMoreFiles(!!data.nextPageToken);
            } else {
              throw new Error('Failed to search files');
            }
          } catch (error) {
            console.error('Error searching files:', error);
            toast.error('Failed to search files');
          } finally {
            setIsLoadingMore(false);
          }
        }}
        onFolderClick={async (folderId, folderName) => {
          try {
            setIsLoadingMore(true);
            setCurrentSearchQuery(''); // Reset search query

            // Handle returning to root directory
            if (folderId === 'root') {
              setCurrentPath([]);
              setCurrentFolderId('root');
            } else {
              // If clicking a folder in breadcrumbs
              const existingIndex = currentPath.findIndex(p => p.id === folderId);
              if (existingIndex >= 0) {
                // Slice the path up to this position
                setCurrentPath(currentPath.slice(0, existingIndex + 1));
              } else {
                // Add to current path
                setCurrentPath([...currentPath, { id: folderId, name: folderName }]);
              }
              setCurrentFolderId(folderId);
            }

            const response = await fetch(`${Google_API.getFiles}?accessToken=${localStorage.getItem(LocalStorageKeys.googleAccessToken)}&parentId=${folderId}&source=${currentSource}`);

            if (response.ok) {
              const data = await response.json();
              setGoogleDriveFiles(data.files);
              setNextPageToken(data.nextPageToken);
              setHasMoreFiles(!!data.nextPageToken);
            } else {
              throw new Error('Failed to fetch folder contents');
            }
          } catch (error) {
            console.error('Error navigating to folder:', error);
            toast.error('Failed to open folder');
          } finally {
            setIsLoadingMore(false);
          }
        }}
        onLoadMore={async () => {
          if (!nextPageToken || isLoadingMore) return;

          try {
            setIsLoadingMore(true);
            const nameParam = currentSearchQuery ? `&name=${currentSearchQuery}` : '';
            const response = await fetch(`${Google_API.getFiles}?accessToken=${localStorage.getItem(LocalStorageKeys.googleAccessToken)}&pageToken=${nextPageToken}&parentId=${currentFolderId}${nameParam}&source=${currentSource}`);

            if (response.ok) {
              const data = await response.json();
              setGoogleDriveFiles(prev => [...prev, ...data.files]);
              setNextPageToken(data.nextPageToken);
              setHasMoreFiles(!!data.nextPageToken);
            } else {
              throw new Error('Failed to fetch more files');
            }
          } catch (error) {
            console.error('Error loading more files:', error);
            toast.error('Failed to load more files');
          } finally {
            setIsLoadingMore(false);
          }
        }}
        onSelect={async (selectedFiles) => {
          try {
            setFileFetching(true);
            // Process selected files
            const filePromises = selectedFiles.map(async (file) => {
              const response = await fetch(`${Google_API.downloadFile}?fileId=${file.id}&access_token=${localStorage.getItem(LocalStorageKeys.googleAccessToken)}`);
              if (!response.ok) throw new Error('Failed to download file');
              const blob = await response.blob();
              const returnExt = GoogleDocTypes[file.mimeType]?.ext || '';
              return {
                name: file.name + returnExt,
                type: GoogleDocTypes[file.mimeType]?.type || file.mimeType,
                base64file: await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                }),
              };
            });

            const downloadedFiles = await Promise.all(filePromises);
            onFilesSelected(downloadedFiles);
            setIsFileDialogOpen(false);
          } catch (error) {
            console.error('Error downloading files:', error);
            toast.error('Failed to download selected files');
          } finally {
            setFileFetching(false);
          }
        }}
      />
    </div>
  );
}

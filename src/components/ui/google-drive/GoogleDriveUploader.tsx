"use client";

import { toast } from 'sonner';
import { Button } from "@/components/form/Button";
import { FileSelectDialog } from "@/components/ui/google-drive/FileSelectDialog";
import React, { useState, useRef } from "react";
import { googleDocTypes } from '@/constants/google';

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
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`,
        '_blank',
        'width=600,height=600'
      );

      if (!authWindowRef.current) {
        throw new Error('Failed to open authentication window');
      }

      // Create new event handler
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          try {
            setFileFetching(true);
            const { code } = event.data;
            // Use authorization code to get file list
            const response = await fetch(`/api/google/files?code=${code}`);
            setFileFetching(false);

            if (response.ok) {
              const data = await response.json();
              setGoogleDriveFiles(data.files);
              setNextPageToken(data.nextPageToken);
              setHasMoreFiles(!!data.nextPageToken);
              localStorage.setItem('google_access_token', data.access_token);
              setIsFileDialogOpen(true);
            } else {
              throw new Error('Failed to fetch Google Drive files');
            }
          } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Failed to fetch Google Drive files');
          } finally {
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
        onClose={() => setIsFileDialogOpen(false)}
        files={googleDriveFiles}
        hasMore={hasMoreFiles}
        isLoading={isLoadingMore}
        onLoadMore={async () => {
          if (!nextPageToken || isLoadingMore) return;
          
          try {
            setIsLoadingMore(true);
            const response = await fetch(`/api/google/files?accessToken=${localStorage.getItem('google_access_token')}&pageToken=${nextPageToken}`);

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
              const response = await fetch(`/api/google/download?fileId=${file.id}&access_token=${localStorage.getItem('google_access_token')}`);
              if (!response.ok) throw new Error('Failed to download file');
              const blob = await response.blob();
              return {
                name: file.name + googleDocTypes[file.mimeType]?.ext,
                type: googleDocTypes[file.mimeType]?.type || '',
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
            setFileFetching(false);
          } catch (error) {
            console.error('Error downloading files:', error);
            toast.error('Failed to download selected files');
          }
        }}
      />
    </div>
  );
}
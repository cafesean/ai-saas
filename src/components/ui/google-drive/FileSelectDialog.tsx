"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/form/Button";
import { Input } from "@/components/form/Input";
import { GoogleMimeTypes, GoogleDriveSource } from '@/constants/google';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

interface FileSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: GoogleDriveFile[]) => void;
  files: GoogleDriveFile[];
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  onChangeSource: (source: string) => Promise<void>;
  currentSource: string;
  onFolderClick?: (folderId: string, folderName: string) => void;
  currentPath?: { id: string; name: string }[];
  onFilter?: (query: string) => Promise<void>;
}

export function FileSelectDialog({
  isOpen,
  onClose,
  onSelect,
  files,
  onLoadMore,
  hasMore,
  isLoading = false,
  onChangeSource,
  currentSource,
  onFolderClick,
  currentPath = [],
  onFilter
}: FileSelectDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Debounce search query processing
  const debouncedFilter = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (onFilter) {
        await onFilter(query);
      }
    }, 500);
  }, [onFilter]);

  const handleSelect = (file: GoogleDriveFile) => {
    // If it's a folder, navigate to that folder
    if (file.mimeType === GoogleMimeTypes.folder && onFolderClick) {
      onFolderClick(file.id, file.name);
      setSearchQuery('');
      return;
    }

    // If it's a file, toggle selection
    const isSelected = selectedFiles.some(f => f.id === file.id);
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedFiles);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="mb-4">
          <DialogTitle>Select Google Drive Files</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex rounded-md shadow-sm">
            {GoogleDriveSource.map(source => (
              <button
                key={source.value}
                onClick={() => {
                  setSearchQuery('');
                  onChangeSource(source.value);
                }}
                className={`px-4 py-2 text-sm font-medium ${currentSource === source.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${source.value === GoogleDriveSource[0]?.value ? 'rounded-l-md' : ''} ${source.value === GoogleDriveSource[GoogleDriveSource.length-1]?.value ? 'rounded-r-md' : ''} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
              >
                {source.label}
              </button>
            ))}
          </div>
        </div>
        {currentPath.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 text-sm">
            <button
              onClick={() => {
                setSearchQuery('');
                onFolderClick && onFolderClick('root', 'Root');
              }}
              className="text-blue-600 hover:underline"
            >
              Root
            </button>
            {currentPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span className="text-gray-500">/</span>
                {index === currentPath.length - 1 ? (
                  <span className="font-medium">{folder.name}</span>
                ) : (
                  <button
                    onClick={() => onFolderClick && onFolderClick(folder.id, folder.name)}
                    className="text-blue-600 hover:underline"
                  >
                    {folder.name}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="space-y-4">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value;
              setSearchQuery(query);
              debouncedFilter(query);
            }}
          />
          <div className="max-h-[400px] overflow-y-auto border rounded-lg">
            {files.map((file, index) => (
              <div
                key={`${file.id}_${index}`}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${
                  selectedFiles.some(f => f.id === file.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelect(file)}
              >
                <div className="flex items-center space-x-3">
                  {file.mimeType === GoogleMimeTypes.folder ? (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <img src="/ui/folder.svg" alt="Folder" className="w-16 h-16" />
                    </div>
                  ) : (
                    <input
                      type="checkbox"
                      checked={selectedFiles.some(f => f.id === file.id)}
                      onChange={() => handleSelect(file)}
                      className="h-4 w-4 text-blue-600"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {file.name}
                      {file.mimeType === GoogleMimeTypes.folder && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Folder</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {file.mimeType !== GoogleMimeTypes.folder && file.size && `Size: ${file.size} • `}
                      {file.modifiedTime && `Modified: ${new Date(file.modifiedTime).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="p-4 text-center">
                <Button
                  variant="secondary"
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selectedFiles.length === 0}
          >
            Select ({selectedFiles.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

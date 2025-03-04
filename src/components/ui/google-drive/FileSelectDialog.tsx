"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/form/Button";
import { Input } from "@/components/form/Input";

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
}

export function FileSelectDialog({
  isOpen,
  onClose,
  onSelect,
  files,
  onLoadMore,
  hasMore,
  isLoading = false
}: FileSelectDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (file: GoogleDriveFile) => {
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
        <DialogHeader>
          <DialogTitle>Select Google Drive Files</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="max-h-[400px] overflow-y-auto border rounded-lg">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${
                  selectedFiles.some(f => f.id === file.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelect(file)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.some(f => f.id === file.id)}
                    onChange={() => handleSelect(file)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {file.size && `Size: ${file.size} • `}
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
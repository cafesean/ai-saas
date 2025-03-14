"use client";

import React from "react";
import { toast } from "sonner";

interface FileUploadProps {
  uploaderId?: string;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  supportedFormats?: string[];
  maxSize?: number;
  className?: string;
  errorMessage?: string;
  defaultUploadText?: string
}

export function FileUpload({
  uploaderId,
  selectedFile,
  onFileSelect,
  supportedFormats = [],
  maxSize,
  className = "",
  errorMessage = "Unsupported file format",
  defaultUploadText = "Upload file"
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);

  const validateFile = (file: File): boolean => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (supportedFormats.length > 0 && (!fileExtension || !supportedFormats.includes(fileExtension))) {
      toast.error(errorMessage);
      return false;
    }

    if (maxSize && file.size > maxSize) {
      toast.error(`File size cannot exceed ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileSelect(null);
    const fileInput = document.getElementById(`file-upload_${uploaderId}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div
      className={`border-2 border-dashed ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"} rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${className}`}
      onClick={() => document.getElementById(`file-upload_${uploaderId}`)?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="text-blue-600">
          <svg width="40" height="41" viewBox="0 0 40 41" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7594 11.5327H18.2172V27.1487C18.2172 27.3518 18.3857 27.518 18.5916 27.518H21.3991C21.6049 27.518 21.7734 27.3518 21.7734 27.1487V11.5327H25.2406C25.5541 11.5327 25.7273 11.1772 25.5354 10.9372L20.2948 4.39169C20.2598 4.34755 20.215 4.31186 20.164 4.28731C20.1129 4.26276 20.0568 4.25 20 4.25C19.9432 4.25 19.8871 4.26276 19.836 4.28731C19.785 4.31186 19.7402 4.34755 19.7052 4.39169L14.4646 10.9326C14.2727 11.1772 14.4459 11.5327 14.7594 11.5327ZM37.1257 25.7639H34.3182C34.1123 25.7639 33.9439 25.93 33.9439 26.1332V33.2418H6.05615V26.1332C6.05615 25.93 5.8877 25.7639 5.68182 25.7639H2.87433C2.66845 25.7639 2.5 25.93 2.5 26.1332V35.2729C2.5 36.0899 3.16912 36.75 3.99733 36.75H36.0027C36.8309 36.75 37.5 36.0899 37.5 35.2729V26.1332C37.5 25.93 37.3316 25.7639 37.1257 25.7639Z" />
          </svg>
        </div>
        <div className="text-sm text-gray-600">
          <div className="relative font-bold text-[20px] leading-[28px] text-black cursor-pointer">
            <div className="flex items-center gap-2">
              <span>{selectedFile ? selectedFile.name : defaultUploadText}</span>
              {selectedFile && (
                <button
                  onClick={handleClearFile}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title="Clear file"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <input
              id={`file-upload_${uploaderId}`}
              name="file-upload"
              type="file"
              className="sr-only"
              accept={supportedFormats.map((format) => `.${format}`).join(",")}
              onChange={handleFileChange}
            />
          </div>
        </div>
        {supportedFormats.length > 0 && (
          <p className="text-xs text-gray-500">
            Supported formats: {supportedFormats.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

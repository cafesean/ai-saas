"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { S3_UPLOAD } from "@/constants/general";
import { S3_API } from "@/constants/api";
import { FileUpload } from "./FileUpload";

interface S3FileUploadProps {
  uploaderId?: string;
  onUploadComplete?: (fileData: S3UploadResult) => void;
  onUploadError?: (error: string) => void;
  supportedFormats?: string[];
  maxSize?: number;
  className?: string;
  uploadPath?: string;
  defaultUploadText?: string;
  showProgress?: boolean;
}

export interface S3UploadResult {
  url?: string;
  key: string;
  fileName: string;
  originalName: string;
  contentType?: string;
  size?: number;
}

export function S3FileUpload({
  uploaderId,
  onUploadComplete,
  onUploadError,
  supportedFormats = [],
  maxSize = S3_UPLOAD.maxSize,
  className = "",
  uploadPath = "",
  defaultUploadText = "Upload file to S3",
  showProgress = true
}: S3FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    // Reset upload status
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Initial progress

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("file", selectedFile);

      // If custom upload path is provided
      if (uploadPath) {
        formData.append("path", uploadPath);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > S3_UPLOAD.maxProgressingBar ? S3_UPLOAD.maxProgressingBar : newProgress;
        });
      }, 300);

      // Send upload request
      const response = await fetch(S3_API.upload, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadProgress(S3_UPLOAD.completeProgressBar);
      toast.success("File uploaded successfully");

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(result.data);
      }

      // Clear selected file
      setSelectedFile(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "File upload failed";
      toast.error(errorMessage);

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        uploaderId={uploaderId}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        supportedFormats={supportedFormats}
        maxSize={maxSize}
        className={className}
        defaultUploadText={defaultUploadText}
      />

      {showProgress && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isUploading ? "Uploading..." : "Upload to S3"}
      </button>
    </div>
  );
}

"use client";

import type React from "react";
import { useState } from "react";
import { Upload } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModelInputType } from "@/constants/model";

interface ImportModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesChange?: (files: File[]) => void;
  onImport: (modelData: any) => void;
}

const ImportModelDialog = ({
  open,
  onOpenChange,
  onFilesChange,
  onImport,
}: ImportModelDialogProps) => {
  const [activeTab, setActiveTab] = useState<
    ModelInputType.upload | ModelInputType.path
  >(ModelInputType.upload);
  const [modelName, setModelName] = useState("");
  const [modelVersion, setModelVersion] = useState("");
  const [modelPath, setModelPath] = useState("");
  const [modelFormat, setModelFormat] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleImport = () => {
    if (activeTab === ModelInputType.upload) {
      onImport({
        name: modelName,
        version: modelVersion,
        files,
        importType: ModelInputType.upload,
      });
    } else {
      onImport({
        name: modelName,
        version: modelVersion,
        path: modelPath,
        format: modelFormat,
        importType: ModelInputType.path,
      });
    }
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setModelName("");
    setModelVersion("");
    setModelPath("");
    setModelFormat("");
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onFilesChange) {
        onFilesChange(Array.from(e.target.files));
      }
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        onOpenChange(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Existing Model</DialogTitle>
          <DialogDescription>
            Upload your model files or provide a path to import an existing
            model.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="upload"
          onValueChange={(value) => setActiveTab(value as ModelInputType)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="path">Import from Path</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                placeholder="Enter model name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-version">Version (optional)</Label>
              <Input
                id="model-version"
                placeholder="e.g., 1.0.0"
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Model Files</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept=".pkl,.h5,.onnx,.pb,.json"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag and drop your model files here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports .pkl, .h5, .onnx, .pb, .json files
                  </p>
                  {files.length > 0 ? (
                    <div className="mt-4 text-sm text-left">
                      <p className="font-medium">Selected files:</p>
                      <ul className="list-disc pl-5 mt-1">
                        {files.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <SampleButton
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        const fileInput = document.getElementById(
                          "file-upload",
                        ) as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                    >
                      Browse Files
                    </SampleButton>
                  )}
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="path" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="path-model-name">Model Name</Label>
              <Input
                id="path-model-name"
                placeholder="Enter model name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="path-model-version">Version (optional)</Label>
              <Input
                id="path-model-version"
                placeholder="e.g., 1.0.0"
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-path">Model Path</Label>
              <Input
                id="model-path"
                placeholder="e.g., /path/to/model or s3://bucket/model"
                value={modelPath}
                onChange={(e) => setModelPath(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-format">Model Format</Label>
              <Input
                id="model-format"
                placeholder="e.g., ONNX, TensorFlow, PyTorch"
                value={modelFormat}
                onChange={(e) => setModelFormat(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <SampleButton
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancel
          </SampleButton>
          <SampleButton
            onClick={handleImport}
            disabled={
              !modelName ||
              (activeTab === ModelInputType.upload && files.length === 0) ||
              (activeTab === ModelInputType.path && !modelPath)
            }
          >
            {activeTab === "upload" ? "Import Model" : "Import from Path"}
          </SampleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModelDialog;

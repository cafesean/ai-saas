"use client";

import React, { useState, Suspense, memo } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Brain, RefreshCw, Download, Plus } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { useModalState } from "@/framework/hooks/useModalState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImportModelDialog from "@/components/import-model-dialog";
import { BuildModelDialog } from "@/components/build-model-dialog";
import { ConnectExternalModelDialog } from "@/components/connect-external-model-dialog";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { ModelInputType } from "@/constants/model";
import { ModelStatus, S3_UPLOAD } from "@/constants/general";
import { S3_API } from "@/constants/api";
import { ViewToggle } from "@/components/view-toggle";
import { useViewToggle } from "@/framework/hooks/useViewToggle";
import { Separator } from "@/components/ui/separator";
import { ModelsSummary } from "./components/ModelSummary";
import { ModelsList } from "./components/ModelList";
import { useModels } from "@/framework/hooks/useModels";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageError } from "@/components/page-error";
import { ModelsSkeleton } from "@/components/skeletions/models-skeleton";
import { DefaultSkeleton } from "@/components/skeletions/default-skeleton";

type ModelView = {
  uuid: string;
  name: string;
  description: string | null;
  status: string | null;
};

const ModelsPage = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [challengerGroups, setChallengerGroups] = useState<any[]>([]);
  const [isImportModelDialogOpen, setIsImportModelDialogOpen] = useState(false);
  const {
    deleteConfirmOpen,
    selectedItem: selectedModel,
    openDeleteConfirm,
    closeDeleteConfirm,
  } = useModalState<ModelView>();
  const [metadata, setMetadata] = useState<any>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const { viewMode, setViewMode } = useViewToggle("medium-grid");

  // tRPC hooks
  const { models, createModel, deleteModel, isLoading } = useModels({
    all: true,
  });

  const handleDelete = (model: ModelView) => {
    openDeleteConfirm(model);
  };

  const extractMetadata = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const metadataContent = event.target?.result as string;
      try {
        const metadata = JSON.parse(metadataContent);
        setMetadata(metadata);
      } catch (error) {
        console.error("parse error:", error);
      }
    };
    reader.onerror = (error) => {
      console.error("parse error:", error);
    };
    reader.readAsText(file);
  };

  const handleImportModel = async ({
    name,
    version,
    files,
    importType,
  }: {
    name: string;
    version: string;
    files: File[];
    importType: string;
  }) => {
    if (!name || !version || !files || files.length === 0) {
      toast.error("Please fill all required fields and upload files.");
      return;
    } else if (files.length > 2) {
      toast.error("You can only upload 2 files at a time.");
      return;
    } else if (files.length === 1 && files[0]?.name?.endsWith(".json")) {
      toast.error("Please upload a model file.");
      return;
    }
    setImporting(true);
    let modelFileName = "";
    let modelFilePath = "";
    let metadataFileName = "";
    let metadataFilePath = "";
    if (importType === ModelInputType.upload) {
      // Upload files to S3
      const uploadPath = `${S3_UPLOAD.modelsPath}/${uuidv4()}`;
      const uploadPromises = files.map((file) => {
        return new Promise(async (resolve, reject) => {
          const formData = new FormData();
          formData.append("path", uploadPath);
          formData.append("file", file);
          try {
            // Upload file
            const response = await fetch(S3_API.upload, {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const result = await response.json();

              resolve(result);
            } else {
              reject(new Error(`File upload failed: ${response.statusText}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      // Send upload request
      try {
        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);
        const allSuccess = results.every((result: any) => {
          if (result.data.fileName.endsWith(".json")) {
            metadataFileName = result.data.fileName;
            metadataFilePath = result.data.key;
          } else {
            modelFileName = result.data.fileName;
            modelFilePath = result.data.key;
          }
          return result.success;
        });
        if (allSuccess) {
          let framework = "PyTorch";
          let metrics = metadata?.performance_metrics || null;
          let modelType = metadata?.model_type || "Classification";
          if (metrics) {
            metrics = {
              ...metrics,
              ks: `${metrics.ks}`,
              accuracy: `${metrics.accuracy}`,
              auroc: `${metrics.auroc}`,
              gini: `${metrics.gini}`,
              ksChart: metrics.ks_chart,
              accuracyChart: metrics.accuracy_chart,
              aurocChart: metrics.auroc_chart,
              giniChart: metrics.gini_chart,
            };
          }
          // Create model
          await createModel({
            uuid: uuidv4(),
            name,
            description: null,
            version,
            fileName: modelFileName,
            fileKey: modelFilePath,
            metadataFileName: metadataFileName || null,
            metadataFileKey: metadataFilePath || null,
            status: ModelStatus.ACTIVE,
            type: modelType,
            framework,
            defineInputs: null,
            metrics: metrics,
          });
        } else {
          console.error("Some files failed to upload.");
        }
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
    setMetadata(null);
    setImporting(false);
  };

  const confirmDelete = async () => {
    if (selectedModel) {
      try {
        await deleteModel(selectedModel.uuid);
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting model:", error);
      }
    }
  };

  return (
    <div className="flex flex-col grow max-w-[100vw] p-4 md:p-4">
      <ErrorBoundary>
        <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Models</h1>
              <p className="text-muted-foreground">
                Manage your machine learning models and run predictions
              </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-2 w-full md:w-auto">
              <SampleButton
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </SampleButton>
              <SampleButton
                onClick={() => setBuildDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Build Model
              </SampleButton>
              <SampleButton
                onClick={() => setConnectDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Brain className="mr-2 h-4 w-4" />
                Connect External
              </SampleButton>
              <SampleButton
                onClick={() => setIsImportModelDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Import
              </SampleButton>
              {/* Add ViewToggle here */}
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
          </div>
          <Separator className="my-6" />
          {!isLoading ? (
            <>
              <div className="mb-6">
                <ModelsSummary models={models} />
              </div>
              <Dialog
                open={deleteConfirmOpen}
                onOpenChange={closeDeleteConfirm}
              >
                <DialogContent className="modal-content">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">
                      Delete Model
                    </DialogTitle>
                    <DialogDescription>
                      Delete the selected model.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="modal-section">
                    <p className="modal-text">
                      Are you sure you want to delete this model? This action
                      cannot be undone.
                    </p>
                  </div>
                  <DialogFooter className="modal-footer">
                    <SampleButton
                      type="button"
                      variant="secondary"
                      className="modal-button"
                      onClick={() => closeDeleteConfirm()}
                    >
                      Cancel
                    </SampleButton>
                    <SampleButton
                      type="button"
                      variant="danger"
                      className="modal-button"
                      onClick={confirmDelete}
                    >
                      Delete
                    </SampleButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <ModelsList
                models={models}
                viewMode={viewMode}
                onDelete={handleDelete}
              />
              <ImportModelDialog
                open={isImportModelDialogOpen}
                onOpenChange={setIsImportModelDialogOpen}
                onFilesChange={(files) => {
                  const jsonFile = files.find((file) =>
                    file.name.endsWith(".json"),
                  );
                  if (jsonFile) {
                    extractMetadata(jsonFile);
                  }
                }}
                onImport={handleImportModel}
              />
              <BuildModelDialog
                open={buildDialogOpen}
                onOpenChange={setBuildDialogOpen}
                onBuild={() => {}}
              />
              <ConnectExternalModelDialog
                open={connectDialogOpen}
                onOpenChange={setConnectDialogOpen}
                onConnect={() => {}}
              />
            </>
          ) : (
            <ModelsSkeleton count={5} className="m-6" />
          )}
          {importing && <FullScreenLoading />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default memo(ModelsPage);

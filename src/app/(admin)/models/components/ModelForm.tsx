"use client";

import React, { useState, useEffect } from "react";
import { Route } from "next";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { api, useUtils } from "@/utils/trpc";
import { ModelStatus, S3_UPLOAD } from "@/constants/general";
import { Button } from "@/components/form/Button";
import { Input } from "@/components/form/Input";
import { Textarea } from "@/components/form/Textarea";
import Select from "@/components/form/Select";
import { S3FileUpload, S3UploadResult } from "@/components/form/S3FileUpload";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { AdminRoutes } from "@/constants/routes";

export default function ModelForm() {
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const isEditMode = params?.slug && params.slug !== "create";
  const slug = isEditMode ? params.slug as string : "";

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>(ModelStatus.INACTIVE);
  const [modelUuid, setModelUuid] = useState("");
  const [modelFileResult, setModelFileResult] = useState<S3UploadResult | null>(null);
  const [metadataFileResult, setMetadataFileResult] = useState<S3UploadResult | null>(null);
  const [defineInputs, setDefineInputs] = useState('');

  // tRPC hooks
  const utils = useUtils();
  const model = isEditMode ? api.model.getByUUID.useQuery(slug) : { data: null, isLoading: false, error: null };

  const create = api.model.create.useMutation({
    onSuccess: (data) => {
      utils.model.getAll.invalidate();
      toast.success("Model created successfully");
      router.push(AdminRoutes.models as Route);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const update = api.model.update.useMutation({
    onSuccess: (data) => {
      utils.model.getAll.invalidate();
      utils.model.getByUUID.invalidate(slug);
      toast.success("Model updated successfully");
      router.push(AdminRoutes.models as Route);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  React.useEffect(() => {
    setIsClient(true);

    // Generate UUID for new models
    if (!isEditMode) {
      setModelUuid(uuidv4());
    }
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode && model && !model.isLoading && model.data) {
      const modelData = model.data;
      if (modelData) {
        setName(modelData.name ?? "");
        setDescription(modelData.description ?? "");
        setStatus(modelData.status ?? ModelStatus.INACTIVE);
        setModelUuid(modelData.uuid);
        setModelFileResult({
          key: modelData.fileKey ?? '',
          fileName: modelData.fileName,
          originalName: modelData.fileName,
        });
        setMetadataFileResult({
          key: modelData.metadataFileKey?? '',
          fileName: modelData.metadataFileName,
          originalName: modelData.metadataFileName,
        });
        if (modelData.defineInputs) {
          setDefineInputs(JSON.stringify(modelData.defineInputs, null, 2))
        }
      }
    }
  }, [isEditMode, model?.isLoading, model?.data]);

  const handleModelFileUpload = (fileData: S3UploadResult) => {
    setModelFileResult(fileData);
    // toast.success("Model file uploaded successfully");
  };

  const handleMetadataFileUpload = (fileData: S3UploadResult) => {
    setMetadataFileResult(fileData);
    // toast.success("Metadata file uploaded successfully");
  };

  const handleSubmit = () => {
    let defineInputsJson = null;
    if (!name) {
      toast.error("Name is required!");
      return;
    }
    if (!modelFileResult) {
      toast.error("Model file is required!");
      return;
    }
    if (!metadataFileResult) {
      toast.error("Metadata file is required!");
      return;
    }
    if (defineInputs) {
      try {
        defineInputsJson = JSON.parse(defineInputs);
      } catch (error) {
        toast.error("Define Inputs must be valid JSON format!");
        return;
      }
    }

    if (isEditMode) {
      update.mutate({
        uuid: slug,
        name,
        description,
        status,
        fileName: modelFileResult?.originalName?? '',
        fileKey: modelFileResult?.key?? '',
        metadataFileName: metadataFileResult?.originalName?? '',
        metadataFileKey: metadataFileResult?.key?? '',
        defineInputs: defineInputsJson,
      });
    } else {
      create.mutate({
        uuid: modelUuid,
        name,
        description,
        status,
        fileName: modelFileResult?.originalName?? '',
        fileKey: modelFileResult?.key?? '',
        metadataFileName: metadataFileResult?.originalName?? '',
        metadataFileKey: metadataFileResult?.key?? '',
        defineInputs: defineInputsJson,
      });
    }
  };

  if (isEditMode && model?.isLoading) {
    return <FullScreenLoading />;
  }

  if (isEditMode && model?.error) {
    console.error("Model query error:", model.error);
    return (
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">Error loading Model.</h2>
        <p className="mb-2">{model.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {model.error.data && JSON.stringify(model.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? "Edit Model" : "Create Model"}
        </h1>
      </div>

      {isClient && (
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Model Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Select
                label="Status"
                value={status}
                onValueChange={(value: string) => setStatus(value)}
                options={Object.entries(ModelStatus).map(([_, value]) => ({
                  value: value,
                  label: value
                }))}
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model UUID (for AWS path)</label>
              <div className="p-3 bg-gray-100 rounded-md text-sm font-mono break-all">
                {modelUuid}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Model File</label>
              <S3FileUpload
                uploaderId="model-file"
                onUploadComplete={handleModelFileUpload}
                supportedFormats={['pkl', 'pt', 'pth', 'h5']}
                uploadPath={`${S3_UPLOAD.modelsPath}/${modelUuid}`}
                defaultUploadText="Upload Model File"
              />
              {modelFileResult && (
                <div className="mt-2 text-sm text-green-600">
                  File uploaded: {modelFileResult.originalName}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Metadata File</label>
              <S3FileUpload
                uploaderId="metadata-file"
                onUploadComplete={handleMetadataFileUpload}
                supportedFormats={['json']}
                uploadPath={`${S3_UPLOAD.modelsPath}/${modelUuid}`}
                defaultUploadText="Upload Metadata File"
              />
              {metadataFileResult && (
                <div className="mt-2 text-sm text-green-600">
                  File uploaded: {metadataFileResult.originalName}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Define Inputs"
                value={defineInputs}
                onChange={(e) => setDefineInputs(e.target.value)}
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rules</label>
              <div className="text-gray-400">Coming soon</div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={create.isLoading || update.isLoading}
            >
              {isEditMode ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(AdminRoutes.models as Route)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(create.isLoading || update.isLoading) && <FullScreenLoading />}
    </div>
  );
}

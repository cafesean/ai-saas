"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Route } from "next";
import { useRouter } from "next/navigation";
import * as z from "zod";

import { Download, ExternalLink, Plus, Search, Upload } from "lucide-react";
import { SampleInput } from "@/components/ui/sample-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/form/Button";
import { SampleButton } from "@/components/ui/sample-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTableColumns } from "@/framework/hooks/useTableColumn";
import { api, useUtils } from "@/utils/trpc";
import { useModalState } from "@/framework/hooks/useModalState";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminRoutes } from "@/constants/routes";
import { FileUpload } from "@/components/form/FileUpload";
import ModelCard from "./components/ModelCard/ModelCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const modelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type ModelFormData = z.infer<typeof modelSchema>;

type ModelView = {
  uuid: string;
  name: string;
  description: string | null;
  status: string | null;
};

export default function ModelsPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [challengerGroups, setChallengerGroups] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    isModalOpen,
    deleteConfirmOpen,
    isConfirming,
    selectedItem: selectedModel,
    openModal,
    closeModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    selectItem,
  } = useModalState<ModelView>();

  // tRPC hooks
  const utils = useUtils();
  const models = api.model.getAll.useQuery();
  const createModel = api.model.create.useMutation({
    onSuccess: () => utils.model.getAll.invalidate(),
  });
  const updateModel = api.model.update.useMutation({
    onSuccess: () => utils.model.getAll.invalidate(),
  });
  const deleteModel = api.model.delete.useMutation({
    onSuccess: () => utils.model.getAll.invalidate(),
  });

  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId],
    );
  };

  const handleDelete = (model: ModelView) => {
    openDeleteConfirm(model);
  };

  const confirmDelete = async () => {
    if (selectedModel) {
      try {
        await deleteModel.mutateAsync(selectedModel.uuid);
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting model:", error);
      }
    }
  };

  if (models.isLoading) {
    return (
      <div className="flex flex-col grow">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (models.error) {
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">Error loading models</h2>
          <p className="mb-2">{models.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow space-y-4 max-w-[100vw] px-0 md:px-4">
      <div className="flex flex-col gap-4 justify-between items-start md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Models Library</h2>
          <p className="text-muted-foreground">
            Manage your models, compare metrics, and organize challenger groups
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <SampleInput
              type="search"
              placeholder="Search models..."
              className="w-full pl-8"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SampleButton>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Model
                </SampleButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    router.push(`${AdminRoutes.models}/create` as Route);
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Existing Model
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect External Model
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Build from Library
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SampleButton variant="outline" disabled={true} onClick={() => {}}>
              Create Challenger Group
            </SampleButton>
          </div>
        </div>
      </div>

      {isClient && (
        <>
          <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Delete Role</DialogTitle>
              </DialogHeader>
              <div className="modal-section">
                <p className="modal-text">
                  Are you sure you want to delete this model? This action
                  cannot be undone.
                </p>
              </div>
              <DialogFooter className="modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  className="modal-button"
                  onClick={() => closeDeleteConfirm()}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="modal-button"
                  onClick={confirmDelete}
                  disabled={deleteModel.isLoading}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Models</TabsTrigger>
              <TabsTrigger value="champions">Champions</TabsTrigger>
              <TabsTrigger value="challengers">Challengers</TabsTrigger>
              <TabsTrigger value="groups">Challenger Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4">
                {selectedModels.length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">
                        {selectedModels.length}
                      </span>{" "}
                      models selected
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedModels([])}
                    >
                      Clear selection
                    </Button>
                  </div>
                )}

                <div className="grid gap-4 grid-cols-1">
                  {models.data.length > 0 ? (
                    models.data.map((model) => (
                      <ModelCard
                        key={model.uuid}
                        model={model}
                        isSelected={selectedModels.includes(model.uuid)}
                        onToggleSelect={() => toggleModelSelection(model.uuid)}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No models created yet.</p>
                      <p className="text-sm mt-1">
                        Click "Add Model" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="champions" className="mt-4">
              <div className="grid gap-4 grid-cols-1">
                {models.data.length > 0 &&
                models.data.filter((model) => model.status === "champion")
                  .length > 0 ? (
                  models.data
                    .filter((model) => model.status === "champion")
                    .map((model) => (
                      <ModelCard
                        key={model.uuid}
                        model={model}
                        isSelected={selectedModels.includes(model.uuid)}
                        onToggleSelect={() => toggleModelSelection(model.uuid)}
                        onDelete={handleDelete}
                      />
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No models created yet.</p>
                    <p className="text-sm mt-1">
                      Click "Add Model" to get started.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="challengers" className="mt-4">
              <div className="grid gap-4 grid-cols-1">
                {models.data.length > 0 &&
                models.data.filter((model) => model.status === "challenger")
                  .length > 0 ? (
                  models.data
                    .filter((model) => model.status === "challenger")
                    .map((model) => (
                      <ModelCard
                        key={model.uuid}
                        model={model}
                        isSelected={selectedModels.includes(model.uuid)}
                        onToggleSelect={() => toggleModelSelection(model.uuid)}
                        onDelete={handleDelete}
                      />
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No models created yet.</p>
                    <p className="text-sm mt-1">
                      Click "Add Model" to get started.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="mt-4">
              {challengerGroups.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {challengerGroups.map((group) => (
                    <></>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No challenger groups created yet.</p>
                  <p className="text-sm mt-1">
                    Select multiple models and click "Create Challenger Group"
                    to get started.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

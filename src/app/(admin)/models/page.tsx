"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Route } from "next";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { Button } from "@/components/form/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/table/DataTable";
import { useTableColumns } from "@/framework/hooks/useTableColumn";
import { api, useUtils } from "@/utils/trpc";
import { useModalState } from "@/framework/hooks/useModalState";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminRoutes } from "@/constants/routes";
import { FileUpload } from "@/components/form/FileUpload";

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
  const [isClient, setIsClient] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
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

  const columns = useTableColumns<ModelView>({
    columns: [
      {
        key: "name",
        header: "Name",
        cell: ({ getValue }) => {
          const name = getValue() as string;
          return (
            <span className="text-sm font-medium text-gray-900">{name}</span>
          );
        },
      },
      {
        key: "description",
        header: "Description",
        cell: ({ getValue }) => {
          const description = getValue() as string;
          return (
            <span className="text-sm text-gray-500">{description || "-"}</span>
          );
        },
      },
      {
        key: "uuid",
        header: "",
        cell: ({ getValue }) => {
          const uuid = getValue() as string;
          const data = models.data?.find(v => v.uuid === uuid);
          if (!data) return null;
          return (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => router.push(`${AdminRoutes.models}/${uuid}` as Route)}
                variant="secondary"
                className="modal-button"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(data)}
                variant="danger"
                className="modal-button"
              >
                Delete
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
  });

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
    <div className="flex flex-col grow space-y-4 max-w-[100vw] px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Model Management</h1>
        {isClient && (
          <Button onClick={() => router.push(`${AdminRoutes.models}/create` as Route)} variant="primary">
            Create Model
          </Button>
        )}
      </div>

      {isClient && (
        <>
          <DataTable
            data={models.data ?? []}
            columns={columns}
            searchPlaceholder="Search models..."
            searchableColumns={["name"]}
            enableSearch={true}
            enableFilters={true}
            filename="models"
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
          />
        </>
      )}
    </div>
  );
}
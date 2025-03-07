"use client";

import { Button } from "@/components/form/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/table/DataTable";
import { useTableColumns } from "@/framework/hooks/useTableColumn";
import type { WorkflowView } from "@/framework/types/workflow";
import { dbToWorkflow } from "@/framework/types/workflow";
import { api, useUtils } from "@/utils/trpc";
import React from "react";
import { useRouter } from "next/navigation";
import { Route } from "next";
import { AdminRoutes } from "@/constants/routes";
import { useModalState } from "@/framework/hooks/useModalState";

export default function WorkflowsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const {
    isModalOpen,
    deleteConfirmOpen,
    isConfirming,
    selectedItem: selectedWorkflow,
    viewingItem: viewingRole,
    openModal,
    closeModal,
    startConfirming,
    stopConfirming,
    openDeleteConfirm,
    closeDeleteConfirm,
    selectItem,
    viewItem,
  } = useModalState<WorkflowView>();
  const router = useRouter();
  // tRPC hooks
  const workflows = api.workflow.getAll.useQuery();
  const utils = useUtils();
  const deleteWorkflow = api.workflow.delete.useMutation({
    onSuccess: (data) => {
      utils.workflow.getAll.invalidate();
      console.log(data);
    },
  });
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (workflow: WorkflowView) => {
    openDeleteConfirm(workflow);
  };

  const confirmDelete = async () => {
    if (selectedWorkflow) {
      try {
        await deleteWorkflow.mutateAsync({ uuid: selectedWorkflow.uuid, flowId: selectedWorkflow.flowId });
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const columns = useTableColumns<WorkflowView>({
    columns: [
      {
        key: "name",
        header: "Name",
        cell: ({ getValue }) => {
          const name = getValue() as string;
          const workflow = workflows.data?.find((w) => w.name === name);
          return (
            <button
              onClick={() => {}}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {name}
            </button>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const workflow = workflows.data?.find((w) => w.status === status);
          if (!workflow) return null;
          return (
            <button
              onClick={() => {}}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {status}
            </button>
          );
        },
      },
      {
        key: "uuid",
        header: "Actions",
        cell: ({ getValue }) => {
          const uuid = getValue() as string;
          const workflow = workflows.data?.find((w) => w.uuid === uuid);
          if (!workflow) return null;
          return (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => router.push(`${AdminRoutes.workflows}/${workflow.uuid}` as Route)}
                variant="secondary"
                className="modal-button"
              >
                Edit
              </Button>
              <Button onClick={() => handleDelete(workflow)} variant="danger" className="modal-button">
                Delete
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
  });

  if (workflows.isLoading) {
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

  if (workflows.error) {
    console.error("Roles query error:", workflows.error);
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">Error loading worflows</h2>
          <p className="mb-2">{workflows.error.message}</p>
          <div className="text-sm bg-red-50 p-4 rounded">
            {workflows.error.data && JSON.stringify(workflows.error.data.zodError, null, 2)}
          </div>
        </div>
      </div>
    );
  }

  const handleCreateWorkflow = () => {
    const route = AdminRoutes.selectTemplate;
    router.push(route as Route);
  };

  return (
    <div className="flex flex-col grow space-y-4 max-w-[100vw] px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Workflows Management</h1>
        {isClient && (
          <Button onClick={handleCreateWorkflow} variant="primary">
            Create Workflow
          </Button>
        )}
      </div>

      {isClient && (
        <>
          <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Delete Role</DialogTitle>
              </DialogHeader>
              <div className="modal-section">
                <p className="modal-text">Are you sure you want to delete this role? This action cannot be undone.</p>
              </div>
              <DialogFooter className="modal-footer">
                <Button type="button" variant="secondary" className="modal-button" onClick={() => closeDeleteConfirm()}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="modal-button"
                  onClick={confirmDelete}
                  disabled={deleteWorkflow.isLoading}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DataTable
            data={(workflows.data ?? []).map(dbToWorkflow)}
            columns={columns}
            searchPlaceholder="Search workflows..."
            searchableColumns={["name"]}
            enableSearch={true}
            enableFilters={true}
            filename="workflows"
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
          />
        </>
      )}
    </div>
  );
}

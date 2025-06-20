"use client";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Route } from "next";

import { Button } from "@/components/form/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/table/DataTable";
import { useTableColumns } from "@/framework/hooks/useTableColumn";
import type { RuleView } from "@/framework/types/rule";
import { dbToRule } from "@/framework/types/rule";
import { api, useUtils } from "@/utils/trpc";
import { AppRoutes } from "@/constants/routes";
import { useModalState } from "@/framework/hooks/useModalState";
import SkeletonLoading from "@/components/ui/skeleton-loading/SkeletonLoading";
  import { RouteGuard } from "@/components/auth/RouteGuard";

export default function RulesPage() {
  const [isClient, setIsClient] = React.useState(false);
  const {
    deleteConfirmOpen,
    selectedItem: selectedRule,
    openDeleteConfirm,
    closeDeleteConfirm,
  } = useModalState<RuleView>();
  const router = useRouter();
  // tRPC hooks
  const rules = api.rule.getAll.useQuery();
  const utils = useUtils();
  const deleteRule = api.rule.delete.useMutation({
    onSuccess: (data) => {
      utils.rule.getAll.invalidate();
      toast.success("Rule deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (rule: RuleView) => {
    openDeleteConfirm(rule);
  };

  const confirmDelete = async () => {
    if (selectedRule) {
      try {
        await deleteRule.mutateAsync({ id: selectedRule.uuid });
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const columns = useTableColumns<RuleView>({
    columns: [
      {
        key: "name",
        header: "Name",
        cell: ({ getValue }) => {
          const name = getValue() as string;
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
          const rule = rules.data?.find((w) => w.uuid === uuid);
          if (!rule) return null;
          return (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => router.push(`${AppRoutes.rules}/${rule.uuid}` as Route)}
                variant="secondary"
                className="modal-button"
              >
                Edit
              </Button>
              <Button onClick={() => handleDelete(rule)} variant="danger" className="modal-button">
                Delete
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
  });

  if (rules.isLoading) {
    return (
      <SkeletonLoading />
    );
  }

  if (rules.error) {
    console.error("Roles query error:", rules.error);
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">Error loading worflows</h2>
          <p className="mb-2">{rules.error.message}</p>
          <div className="text-sm bg-red-50 p-4 rounded">
            {rules.error.data && JSON.stringify(rules.error.data.zodError, null, 2)}
          </div>
        </div>
      </div>
    );
  }

  const handleCreateRule= () => {
    const route = AppRoutes.createRule;
    router.push(route as Route);
  };

  return (
    <RouteGuard permission="rules:read" showAccessDenied={true}>
      <div className="flex flex-col grow space-y-4 max-w-[100vw] px-4 md:px-6">
        <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Rules Management</h1>
        {isClient && (
          <Button onClick={handleCreateRule} variant="primary">
            Add Rule
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
                <p className="modal-text">Are you sure you want to delete this rule? This action cannot be undone.</p>
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
                  // disabled={deleteWorkflow.isLoading}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DataTable
            data={(rules.data ?? []).map(dbToRule)}
            columns={columns}
            searchPlaceholder="Search RulesPage..."
            searchableColumns={["name"]}
            enableSearch={true}
            enableFilters={true}
            filename="rules"
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
          />
        </>
      )}
      </div>
    </RouteGuard>
  );
}

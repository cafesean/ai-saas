"use client";

import { useState, Suspense } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, useUtils } from "@/utils/trpc";
import {
  DecisionStatus,
  DefaultDecisionTableRows,
  DefaultDecisionTableInputs,
  DefaultDecisionTableOutputs,
  DefaultDecisionTableInputCondition,
  DefaultDecisionTableOutputResult,
} from "@/constants/decisionTable";
import DecisionTableCard from "./components/DecisionTableCard";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { useModalState } from "@/framework/hooks/useModalState";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";

type DecisionTableView = {
  uuid: string;
  name: string;
  description: string | null;
  status: string | null;
};

const DecisionTablesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableDescription, setNewTableDescription] = useState("");
  const [newTableStatus, setNewTableStatus] = useState(DecisionStatus.ACTIVE);
  const [creating, setCreating] = useState(false);
  const {
    deleteConfirmOpen,
    openDeleteConfirm,
    selectedItem: selectDecisionTable,
    closeDeleteConfirm,
  } = useModalState<DecisionTableView>();

  // tRPC hooks
  const utils = useUtils();
  const decisionTables = api.decisionTable.getAll.useQuery();
  const createModel = api.decisionTable.create.useMutation({
    onSuccess: (data) => {
      utils.decisionTable.getAll.invalidate();
      utils.decisionTable.getByStatus.refetch();
      toast.success("Decision Table created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteDecisionTable = api.decisionTable.delete.useMutation({
    onSuccess: () => {
      utils.decisionTable.getAll.invalidate();
      utils.decisionTable.getByStatus.refetch();
      toast.success("Decision Table deleted successfully");
    },
  });

  const handleDelete = (decisionTable: DecisionTableView) => {
    openDeleteConfirm(decisionTable);
  };

  const confirmDelete = async () => {
    if (selectDecisionTable) {
      try {
        await deleteDecisionTable.mutateAsync(selectDecisionTable.uuid);
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting decision table:", error);
      }
    }
  };

  const resetForm = () => {
    setNewTableName("");
    setNewTableDescription("");
    setNewTableStatus(DecisionStatus.ACTIVE);
  };

  const createDecisionTable = async () => {
    // In a real app, this would create a new decision table and redirect to it
    // For now, we'll just close the dialog
    if (!newTableName) {
      toast.error("Table name is required");
      return;
    }
    setIsCreateDialogOpen(false);
    resetForm();
    setCreating(true);
    try {
      await createModel.mutate({
        uuid: uuidv4(),
        name: newTableName,
        description: newTableDescription,
        status: newTableStatus,
        decisionTableInputs: [],
        decisionTableOutputs: [],
        decisionTableRows: [
          {
            uuid: uuidv4(),
            ...DefaultDecisionTableRows,
            decisionTableInputConditions: [
              {
                uuid: uuidv4(),
                ...DefaultDecisionTableInputCondition,
              },
            ],
            decisionTableOutputResults: [
              {
                uuid: uuidv4(),
                ...DefaultDecisionTableOutputResult,
              },
            ],
          },
        ],
      });
      setCreating(false);
    } catch (error) {
      console.error("Error creating decision table:", error);
    }
  };

  if (decisionTables.error) {
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">
            Error loading decision tables
          </h2>
          <p className="mb-2">{decisionTables.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Breadcrumbs
            items={[
              {
                label: "Back to Dashboard",
                link: "/",
              },
            ]}
            title="Decisioning"
            rightChildren={
              <>
                <SampleButton
                  variant="outline"
                  size="sm"
                  onClick={() => utils.decisionTable.getAll.invalidate()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </SampleButton>
                <SampleButton variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </SampleButton>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={(open: boolean) => {
                    resetForm();
                    setIsCreateDialogOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <SampleButton>
                      <Plus className="mr-2 h-4 w-4" />
                      New Decision Table
                    </SampleButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Decision Table</DialogTitle>
                      <DialogDescription>
                        Create a new decision table to use in your workflows for
                        validating connections and making decisions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Table Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter table name"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Enter table description"
                          value={newTableDescription}
                          onChange={(e) =>
                            setNewTableDescription(e.target.value)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="decisionTableStatus">Active</Label>
                        <Switch
                          id="decisionTableStatus"
                          defaultChecked
                          onCheckedChange={(checked) => {
                            setNewTableStatus(
                              checked
                                ? DecisionStatus.ACTIVE
                                : DecisionStatus.INACTIVE,
                            );
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <SampleButton
                        variant="outline"
                        onClick={() => {
                          resetForm();
                          setIsCreateDialogOpen(false);
                        }}
                      >
                        Cancel
                      </SampleButton>
                      <SampleButton
                        onClick={createDecisionTable}
                        disabled={!newTableName}
                      >
                        Create Table
                      </SampleButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            }
          />

          <div className="flex-1 p-4 md:p-6 space-y-6">
            {!decisionTables.isLoading ? (
              <>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Decision Tables
                    </h2>
                    <p className="text-muted-foreground">
                      Manage decision rules and validations for your workflows
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search tables..."
                        className="w-full pl-8"
                      />
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Tables</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {decisionTables &&
                      decisionTables.data &&
                      decisionTables.data?.length > 0 ? (
                        decisionTables.data.map((table) => (
                          <DecisionTableCard
                            key={table.uuid}
                            table={table}
                            onDelete={handleDelete}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground md:col-span-2 lg:col-span-3">
                          <p>No models created yet.</p>
                          <p className="text-sm mt-1">
                            Click "New Decision Table" to get started.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="active" className="mt-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {decisionTables &&
                      decisionTables.data &&
                      decisionTables.data?.filter(
                        (table) => table.status === DecisionStatus.ACTIVE,
                      ).length > 0 ? (
                        decisionTables.data
                          .filter(
                            (table) => table.status === DecisionStatus.ACTIVE,
                          )
                          .map((table) => (
                            <DecisionTableCard
                              key={table.id}
                              table={table}
                              onDelete={handleDelete}
                            />
                          ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground md:col-span-2 lg:col-span-3">
                          <p>No models created yet.</p>
                          <p className="text-sm mt-1">
                            Click "New Decision Table" to get started.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="inactive" className="mt-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {decisionTables &&
                      decisionTables.data &&
                      decisionTables.data?.filter(
                        (table: any) => table.status !== DecisionStatus.ACTIVE,
                      ).length > 0 ? (
                        decisionTables.data
                          .filter(
                            (table: any) =>
                              table.status !== DecisionStatus.ACTIVE,
                          )
                          .map((table: any) => (
                            <DecisionTableCard
                              key={table.id}
                              table={table}
                              onDelete={handleDelete}
                            />
                          ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground md:col-span-2 lg:col-span-3">
                          <p>No models created yet.</p>
                          <p className="text-sm mt-1">
                            Click "New Decision Table" to get started.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <TableSkeleton />
            )}
          </div>

          <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Delete Role</DialogTitle>
              </DialogHeader>
              <div className="modal-section">
                <p className="modal-text">
                  Are you sure you want to delete this decision table? This
                  action cannot be undone.
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
          {creating && <FullScreenLoading />}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default DecisionTablesPage;

"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  FileSpreadsheet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Route } from "next";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { api, useUtils } from "@/utils/trpc";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { WorkflowStatus, WorkflowTypes } from "@/constants/general";
import { NodeTypes } from "@/constants/nodes";
import { useModalState } from "@/framework/hooks/useModalState";
import { WorkflowView } from "@/framework/types/workflow";
import { getTimeAgo } from "@/utils/func";
import { AdminRoutes } from "@/constants/routes";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { WorkflowsSkeleton } from "@/components/skeletons/workflows-skeleton";
import { ViewToggle } from "@/components/view-toggle";
import { useViewToggle } from "@/framework/hooks/useViewToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowCardProps } from "@/types/Workflow";
import { WorkflowList } from "./components/WorkflowList";

const WorkflowsGrid = ({
  workflows,
  onDelete,
  onChangeStatus,
  viewMode,
}: {
  workflows: WorkflowCardProps[];
  onDelete: (workflow: any) => void;
  onChangeStatus: (workflow: any) => void;
  viewMode?: string;
}) => {
  const gridColsClass =
    viewMode === "large-grid"
      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      : "grid gap-4 md:grid-cols-3 lg:grid-cols-4"; // Default to medium/smaller grid
  return (
    <div className={gridColsClass}>
      {workflows.map((workflow) => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
        />
      ))}
    </div>
  );
};
const WorkflowsList = ({
  workflows,
  onDelete,
  onChangeStatus,
}: {
  workflows: WorkflowCardProps[];
  onDelete: (workflow: any) => void;
  onChangeStatus: (workflow: any) => void;
}) => (
  <WorkflowList
    workflows={workflows}
    onDelete={onDelete}
    onChangeStatus={onChangeStatus}
  />
);

export default function WorkflowsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowType, setNewWorkflowType] = useState("");
  const [newDescriptioin, setNewDescriptioin] = useState("");
  const {
    deleteConfirmOpen,
    selectedItem: selectedWorkflow,
    openDeleteConfirm,
    closeDeleteConfirm,
  } = useModalState<WorkflowView>();
  const {
    deleteConfirmOpen: changeStatusConfirmOpen,
    selectedItem: updateStatusWorkflow,
    openDeleteConfirm: openChangeStatusConfirm,
    closeDeleteConfirm: closeChangeStatusConfirm,
  } = useModalState<WorkflowView>();
  const { viewMode, setViewMode } = useViewToggle("large-grid");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // tRPC hooks
  const utils = useUtils();
  const { data: workflows, isLoading, error } = api.workflow.getAll.useQuery();
  const create = api.workflow.create.useMutation({
    onSuccess: () => {
      utils.workflow.getAll.invalidate();
      toast.success("Workflow created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteWorkflow = api.workflow.delete.useMutation({
    onSuccess: () => {
      utils.workflow.getAll.invalidate();
      toast.success("Workflow deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateWorkflowStatus = api.workflow.updateStatus.useMutation({
    onSuccess: () => {
      utils.workflow.getAll.invalidate();
      toast.success("Workflow status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  const createWorkflow = async () => {
    // In a real app, this would create a new workflow and redirect to it
    // For now, we'll just close the dialog
    if (!newWorkflowName) {
      toast.error("Workflow name is required");
      return;
    }
    setIsCreateDialogOpen(false);
    resetForm();
    await create.mutateAsync({
      name: newWorkflowName,
      type: newWorkflowType,
      description: newDescriptioin,
    });
  };

  const onCloseCreate = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewWorkflowName("");
    setNewWorkflowType("standard");
    setNewDescriptioin("");
  };

  const confirmDelete = async () => {
    closeDeleteConfirm();
    if (selectedWorkflow) {
      try {
        await deleteWorkflow.mutateAsync({
          uuid: selectedWorkflow.uuid,
        });
      } catch (error) {
        console.error("Error deleting model:", error);
      }
    }
  };

  const filteredWorkflows = useMemo(() => {
    if (!workflows) return [];

    return workflows.filter(
      (workflow) =>
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [workflows, searchQuery]);

  // Filter workflows by status
  const publishedWorkflows = useMemo(
    () =>
      filteredWorkflows.filter(
        (workflow) => workflow.status === WorkflowStatus.PUBLISHED,
      ),
    [filteredWorkflows],
  );

  const draftWorkflows = useMemo(
    () =>
      filteredWorkflows.filter(
        (workflow) => workflow.status === WorkflowStatus.DRAFT,
      ),
    [filteredWorkflows],
  );

  const pausedWorkflows = useMemo(
    () =>
      filteredWorkflows.filter(
        (workflow) => workflow.status === WorkflowStatus.PAUSED,
      ),
    [filteredWorkflows],
  );

  const renderWorkflows = (
    workflowsData: WorkflowCardProps[],
    emptyMessage: string,
    onDelete: (workflow: any) => void,
    onChangeStatus: (workflow: any) => void,
  ) => {
    if (isLoading) {
      // Adjust skeleton count based on list vs grid view
      return <WorkflowsSkeleton count={viewMode === "list" ? 5 : 3} />;
    }

    if (workflowsData.length > 0) {
      // Render list or grid based on viewMode
      return viewMode === "list" ? (
        <WorkflowsList
          workflows={workflowsData}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
        />
      ) : (
        <WorkflowsGrid
          workflows={workflowsData}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
          viewMode={viewMode}
        />
      ); // Assume WorkflowsGrid handles different grid sizes if needed, or defaults to one
    }

    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  };

  const confirmChangeStatus = async () => {
    closeChangeStatusConfirm();
    if (updateStatusWorkflow) {
      await updateWorkflowStatus.mutateAsync({
        uuid: updateStatusWorkflow.uuid,
        status:
          updateStatusWorkflow.status === WorkflowStatus.PUBLISHED
            ? WorkflowStatus.PAUSED
            : WorkflowStatus.PUBLISHED,
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">Error loading models</h2>
          <p className="mb-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ErrorBoundary>
        <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
          <Breadcrumbs
            items={[
              {
                label: "Back to Dashboard",
                link: "/",
              },
            ]}
            title="Workflows"
          />
          {isClient && (
            <>
              <Dialog
                open={deleteConfirmOpen}
                onOpenChange={closeDeleteConfirm}
              >
                <DialogContent className="modal-content">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">
                      Delete Role
                    </DialogTitle>
                  </DialogHeader>
                  <div className="modal-section">
                    <p className="modal-text">
                      Are you sure you want to delete this workflow? This action
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
              <div className="flex-1 p-4 md:p-4 space-y-6">
                {!isLoading ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">
                          Workflows
                        </h2>
                        <p className="text-muted-foreground">
                          Create, manage, and monitor your automated workflows
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <SampleInput
                            type="search"
                            placeholder="Search workflows..."
                            className="w-full pl-8"
                          />
                        </div>
                        <ViewToggle
                          viewMode={viewMode}
                          onChange={setViewMode}
                        />
                        <Dialog
                          open={isCreateDialogOpen}
                          onOpenChange={(open: boolean) => {
                            setIsCreateDialogOpen(open);
                            if (!open) {
                              resetForm();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <SampleButton>
                              <Plus className="mr-2 h-4 w-4" />
                              New Workflow
                            </SampleButton>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Workflow</DialogTitle>
                              <DialogDescription>
                                Create a new workflow to automate processes
                                using AI models and other components.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Workflow Name</Label>
                                <SampleInput
                                  id="name"
                                  placeholder="Enter workflow name"
                                  value={newWorkflowName}
                                  onChange={(e) =>
                                    setNewWorkflowName(e.target.value)
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="type">Workflow Type</Label>
                                <Select
                                  value={newWorkflowType}
                                  onValueChange={setNewWorkflowType}
                                >
                                  <SelectTrigger id="type">
                                    <SelectValue placeholder="Select workflow type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value={WorkflowTypes.STANDARD.value}
                                    >
                                      {WorkflowTypes.STANDARD.label}
                                    </SelectItem>
                                    <SelectItem
                                      value={WorkflowTypes.SCHEDULED.value}
                                    >
                                      {WorkflowTypes.SCHEDULED.label}
                                    </SelectItem>
                                    <SelectItem
                                      value={WorkflowTypes.EVENT_DRIVEN.value}
                                    >
                                      {WorkflowTypes.EVENT_DRIVEN.label}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="description">
                                  Description (Optional)
                                </Label>
                                <SampleInput
                                  id="description"
                                  placeholder="Enter workflow description"
                                  value={newDescriptioin}
                                  onChange={(e) =>
                                    setNewDescriptioin(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <SampleButton
                                variant="outline"
                                onClick={() => {
                                  setIsCreateDialogOpen(false);
                                  resetForm();
                                }}
                              >
                                Cancel
                              </SampleButton>
                              <SampleButton
                                onClick={createWorkflow}
                                disabled={!newWorkflowName}
                              >
                                Create Workflow
                              </SampleButton>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <Tabs defaultValue="all">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="published">Published</TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                        <TabsTrigger value="paused">Paused</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-6">
                        {renderWorkflows(
                          filteredWorkflows,
                          "No workflows found. Create one to get started.",
                          openDeleteConfirm,
                          openChangeStatusConfirm,
                        )}
                      </TabsContent>

                      <TabsContent value="published" className="mt-6">
                        {renderWorkflows(
                          publishedWorkflows,
                          "No published workflows found.",
                          openDeleteConfirm,
                          openChangeStatusConfirm,
                        )}
                      </TabsContent>

                      <TabsContent value="draft" className="mt-6">
                        {renderWorkflows(
                          draftWorkflows,
                          "No draft workflows found.",
                          openDeleteConfirm,
                          openChangeStatusConfirm,
                        )}
                      </TabsContent>

                      <TabsContent value="paused" className="mt-6">
                        {renderWorkflows(
                          pausedWorkflows,
                          "No paused workflows found.",
                          openDeleteConfirm,
                          openChangeStatusConfirm,
                        )}
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <WorkflowsSkeleton count={viewMode === "list" ? 5 : 3} />
                )}
              </div>
              <Dialog
                open={changeStatusConfirmOpen}
                onOpenChange={closeChangeStatusConfirm}
              >
                <DialogContent className="modal-content">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">
                      {updateStatusWorkflow?.status === WorkflowStatus.PUBLISHED
                        ? "Pause Workflow"
                        : "Publish Workflow"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="modal-section">
                    <p className="modal-text">
                      Are you sure you want to{" "}
                      {updateStatusWorkflow?.status === WorkflowStatus.PUBLISHED
                        ? "Pause"
                        : "Publish"}{" "}
                      this workflow?
                    </p>
                  </div>
                  <DialogFooter className="modal-footer">
                    <SampleButton
                      type="button"
                      variant="secondary"
                      className="modal-button"
                      onClick={() => closeChangeStatusConfirm()}
                    >
                      Cancel
                    </SampleButton>
                    <SampleButton
                      type="button"
                      variant="default"
                      className="modal-button"
                      onClick={confirmChangeStatus}
                    >
                      {updateStatusWorkflow?.status === WorkflowStatus.PUBLISHED
                        ? "Pause"
                        : "Publish"}
                    </SampleButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {(create.isPending ||
            deleteWorkflow.isPending ||
            updateWorkflowStatus.isPending) && <FullScreenLoading />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// In the WorkflowCard component, add a section showing decision tables used
function WorkflowCard({
  workflow,
  onDelete,
  onChangeStatus,
}: {
  workflow: WorkflowCardProps;
  onDelete: (workflow: any) => void;
  onChangeStatus: (workflow: any) => void;
}) {
  // Find decision tables used in the workflow
  const decisionTablesUsed = workflow.nodes?.filter(
    (node) => node.type === NodeTypes.decisionTable,
  );
  const getStatusBadge = () => {
    switch (workflow.status) {
      case WorkflowStatus.PUBLISHED:
        return (
          <Badge variant="default" className="text-xs h-5">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Published
          </Badge>
        );
      case WorkflowStatus.PAUSED:
        return (
          <Badge variant="secondary" className="text-xs h-5">
            <XCircle className="mr-1 h-3 w-3" /> Paused
          </Badge>
        );
      case WorkflowStatus.DRAFT:
        return (
          <Badge variant="outline" className="text-xs h-5">
            <Clock className="mr-1 h-3 w-3" /> Draft
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs h-5">
            <AlertCircle className="mr-1 h-3 w-3" /> {workflow.status}
          </Badge>
        );
    }
  };
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/workflows/${workflow.uuid}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="font-medium">{workflow.name}</h3>
            </Link>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SampleButton variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">More Options</span>
                </SampleButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    href={`${
                      AdminRoutes.workflowDetail.replace(
                        ":uuid",
                        workflow.uuid,
                      ) as Route
                    }`}
                    className="flex items-center gap-2 w-full h-full"
                  >
                    Edit Workflow
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onChangeStatus(workflow)}
                >
                  {workflow.status === WorkflowStatus.PUBLISHED
                    ? "Pause Workflow"
                    : "Publish Workflow"}
                </DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => onDelete(workflow)}
                >
                  Delete Workflow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {workflow.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <Zap className="mr-1 h-3 w-3" />
            <span>{workflow.type}</span>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Play className="mr-1 h-3 w-3" />
            <span>{workflow.runs?.count} runs</span>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>
              {workflow.runs?.lastRunAt
                ? `Last run: ${getTimeAgo(workflow.runs?.lastRunAt)}`
                : "Never run"}
            </span>
          </div>
        </div>

        {/* Add decision tables section if the workflow uses any */}
        {decisionTablesUsed && decisionTablesUsed.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Decision Tables:
              </span>
              <span className="text-xs text-muted-foreground">
                {decisionTablesUsed.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {decisionTablesUsed.slice(0, 2).map((table) => (
                <Badge
                  key={table.data.decisionTable.uuid}
                  variant="outline"
                  className="text-xs flex items-center"
                >
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  {table.data.decisionTable.name}
                </Badge>
              ))}
              {decisionTablesUsed.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{decisionTablesUsed.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

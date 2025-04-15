"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Database,
  Webhook,
  FileCode,
  BrainCircuit,
  GitBranch,
  Cog,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { Route } from "next";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/form/Button";
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
import Breadcrumbs from "@/components/breadcrambs";
import { api, useUtils } from "@/utils/trpc";
import SkeletonLoading from "@/components/ui/skeleton-loading/SkeletonLoading";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import { WorkflowStatus } from "@/constants/general";
import { useModalState } from "@/framework/hooks/useModalState";
import { WorkflowView } from "@/framework/types/workflow";
import { getTimeAgo } from "@/utils/func";
import { AdminRoutes } from "@/constants/routes";

export default function WorkflowsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowType, setNewWorkflowType] = useState("standard");
  const [newDescriptioin, setNewDescriptioin] = useState("");
  const {
    isModalOpen,
    deleteConfirmOpen,
    isConfirming,
    selectedItem: selectedWorkflow,
    openModal,
    closeModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    selectItem,
  } = useModalState<WorkflowView>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // tRPC hooks
  const utils = useUtils();
  const workflows = api.workflow.getAll.useQuery();
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
    if (selectedWorkflow) {
      try {
        await deleteWorkflow.mutateAsync({
          uuid: selectedWorkflow.uuid,
        });
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting model:", error);
      }
    }
  };

  if (workflows.isLoading) {
    return <SkeletonLoading />;
  }

  if (workflows.error) {
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">Error loading models</h2>
          <p className="mb-2">{workflows.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Breadcrumbs
        items={[
          {
            label: "Back to Dashboard",
            link: "/",
          },
        ]}
        title="Workflows"
        rightChildren={
          <>
            <SampleButton variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </SampleButton>
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
                    Create a new workflow to automate processes using AI models
                    and other components.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Workflow Name</Label>
                    <SampleInput
                      id="name"
                      placeholder="Enter workflow name"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
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
                        <SelectItem value="standard">
                          Standard Workflow
                        </SelectItem>
                        <SelectItem value="scheduled">
                          Scheduled Workflow
                        </SelectItem>
                        <SelectItem value="event-driven">
                          Event-Driven Workflow
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <SampleInput
                      id="description"
                      placeholder="Enter workflow description"
                      value={newDescriptioin}
                      onChange={(e) => setNewDescriptioin(e.target.value)}
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
          </>
        }
      />
      {isClient && (
        <>
          <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Delete Role</DialogTitle>
              </DialogHeader>
              <div className="modal-section">
                <p className="modal-text">
                  Are you sure you want to delete this workflow? This action
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
                  disabled={deleteWorkflow.isLoading}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex-1 p-4 md:p-4 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  Workflow Management
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
              </div>
            </div>
            {workflows.data.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {workflows.data.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onDelete={openDeleteConfirm}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No models created yet.</p>
                <p className="text-sm mt-1">
                  Click "Add Workflow" to get started.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      {create.isLoading && <FullScreenLoading />}
    </div>
  );
}

interface WorkflowCardProps {
  workflow: {
    id?: number | string;
    uuid: string;
    name: string;
    description: string | null;
    type: string | null;
    status: string;
    runs?: number;
    created?: string;
    lastRun?: string | null;
    nodes?: string[];
    decisionTables?: { id: string; name: string }[];
    updatedAt: Date;
  };
  onDelete: (workflow: any) => void;
}

// In the WorkflowCard component, add a section showing decision tables used
function WorkflowCard({ workflow, onDelete }: WorkflowCardProps) {
  const timeAgo = getTimeAgo(workflow.updatedAt);
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
            <Badge
              variant={
                workflow.status === WorkflowStatus.PUBLISHED
                  ? "default"
                  : workflow.status === WorkflowStatus.DRAFT
                  ? "secondary"
                  : "outline"
              }
              className="text-xs h-5"
            >
              {workflow.status === WorkflowStatus.PUBLISHED ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                </>
              ) : workflow.status === WorkflowStatus.DRAFT ? (
                <>
                  <Clock className="mr-1 h-3 w-3" /> Draft
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" /> Paused
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {workflow.status === WorkflowStatus.PUBLISHED ? (
              <SampleButton variant="outline" size="icon" className="h-7 w-7">
                <Pause className="h-3.5 w-3.5" />
                <span className="sr-only">Pause Workflow</span>
              </SampleButton>
            ) : (
              <SampleButton variant="outline" size="icon" className="h-7 w-7">
                <Play className="h-3.5 w-3.5" />
                <span className="sr-only">Start Workflow</span>
              </SampleButton>
            )}
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
                  >
                    Edit Workflow
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>View Run History</DropdownMenuItem>
                <DropdownMenuItem>Duplicate Workflow</DropdownMenuItem>
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
          <div className="flex -space-x-2">
            {workflow.nodes &&
              workflow.nodes.map((node, index) => (
                <div
                  key={index}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-background ${getNodeColor(
                    node,
                  )}`}
                  title={`${node} Node`}
                >
                  {getNodeIcon(node)}
                </div>
              ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {timeAgo}
            </div>
            <div className="flex items-center">
              <Zap className="mr-1 h-3 w-3" />
              {workflow.runs ? workflow.runs.toLocaleString() : 0} runs
            </div>
          </div>
        </div>

        {/* Add decision tables section if the workflow uses any */}
        {workflow.decisionTables && workflow.decisionTables.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Decision Tables:
              </span>
              <span className="text-xs text-muted-foreground">
                {workflow.decisionTables.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {workflow.decisionTables.slice(0, 2).map((table) => (
                <Badge
                  key={table.id}
                  variant="outline"
                  className="text-xs flex items-center"
                >
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  {table.name}
                </Badge>
              ))}
              {workflow.decisionTables.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.decisionTables.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Add these helper functions after the WorkflowCard function

function getNodeColor(nodeType: string): string {
  switch (nodeType) {
    case "trigger":
      return "bg-primary/10 text-primary";
    case "aiModel":
      return "bg-blue-100 text-blue-600";
    case "rules":
      return "bg-amber-100 text-amber-600";
    case "logic":
      return "bg-purple-100 text-purple-600";
    case "database":
      return "bg-green-100 text-green-600";
    case "webhook":
      return "bg-red-100 text-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getNodeIcon(nodeType: string): React.ReactNode {
  switch (nodeType) {
    case "trigger":
      return <Zap className="h-3 w-3" />;
    case "aiModel":
      return <BrainCircuit className="h-3 w-3" />;
    case "rules":
      return <FileCode className="h-3 w-3" />;
    case "logic":
      return <GitBranch className="h-3 w-3" />;
    case "database":
      return <Database className="h-3 w-3" />;
    case "webhook":
      return <Webhook className="h-3 w-3" />;
    default:
      return <Cog className="h-3 w-3" />;
  }
}

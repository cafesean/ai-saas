"use client";
import type React from "react";
import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  type Connection,
  type NodeTypes,
  type NodeChange,
  type EdgeChange,
  ReactFlowProvider,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Save,
  Play,
  Pause,
  Plus,
  Settings,
  X,
  MoreHorizontal,
} from "lucide-react";
import axios from "axios";

import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TriggerNode } from "@/components/nodes/TriggerNode";
import { AIModelNode } from "@/components/nodes/AIModelNode";
import { RulesNode } from "@/components/nodes/RulesNode";
import { LogicNode } from "@/components/nodes/LogicNode";
import { DatabaseNode } from "@/components/nodes/DatabaseNode";
import { WebhookNode } from "@/components/nodes/WebhookNode";
import { DecisionTableNode } from "@/components/nodes/DecisionTableNode";
import { WhatsAppNode } from "@/components/nodes/WhatsAppNode";
import { SplitOutNode } from "@/components/nodes/SplitOutNode";
import { LoopNode } from "@/components/nodes/LoopNode";
import { api, useUtils } from "@/utils/trpc";
import Breadcrumbs from "@/components/breadcrambs";
import { AdminRoutes } from "@/constants/routes";
import { WorkflowStatus, WorkflowTypes } from "@/constants/general";
import NodePropertiesPanel from "./components/NodePropertiesPanel";
import AddNode from "./components/AddNode";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import {
  WorkflowNodeDataActions,
  TriggerTypes,
  TriggerHTTPMethods,
} from "@/constants/general";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import WorkflowDetailLoading from "./components/LoadingSkelenton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModalState } from "@/framework/hooks/useModalState";
import { WorkflowTestRunDialog } from "@/components/workflow-test-run-dialog";

// Import the decision service for connection validation
import { decisionService } from "@/lib/decision-service";
import {
  NodeTypes as WorkflowNodeTypes,
  WhatsAppSendTypes,
} from "@/constants/nodes";
import { WorkflowView } from "@/framework/types/workflow";
import { TWILIO_API } from "@/constants/api";

// Define node types
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  aiModel: AIModelNode,
  rules: RulesNode,
  logic: LogicNode,
  database: DatabaseNode,
  webhook: WebhookNode,
  decisionTable: DecisionTableNode,
  whatsApp: WhatsAppNode,
  splitOut: SplitOutNode,
  loop: LoopNode,
};

const getDefaultDataForNodeType = (type: string) => {
  switch (type) {
    case WorkflowNodeTypes.trigger:
      const uri = uuidv4();
      const triggerHost = `${process.env.NEXT_PUBLIC_AI_SAAS_ENDPOINT_BASE_URL}`;
      return {
        label: "New Trigger",
        type: TriggerTypes[1],
        method: TriggerHTTPMethods[1],
        triggerHost: `${triggerHost}`,
        path: uri,
      };
    case WorkflowNodeTypes.aiModel:
      return {
        label: "New AI Model",
        model: {
          name: "Select Model",
          uuid: "",
        },
        temperature: 0.7,
        maxTokens: 1024,
      };
    case WorkflowNodeTypes.rules:
      return { label: "New Rules", ruleCount: 0 };
    case WorkflowNodeTypes.logic:
      return {
        label: "New Logic",
        type: "Branch",
        batchSize: 1,
      };
    case WorkflowNodeTypes.database:
      return { label: "New Database", operation: "Query" };
    case WorkflowNodeTypes.webhook:
      return {
        label: "New Webhook",
        endpoint: "https://",
        method: "POST",
        parameters: [],
        headers: [],
        body: [],
      };
    case WorkflowNodeTypes.decisionTable:
      return {
        label: "New Decision Table",
        decisionTable: {
          name: "New Decision Table",
          uuid: "",
        },
      };
    case WorkflowNodeTypes.whatsApp:
      return {
        label: "New WhatsApp",
        from: `${process.env.NEXT_PUBLIC_N8N_WHATSAPP_SENDER}`,
        sendType: WhatsAppSendTypes[0]?.value,
        body: {
          value: "",
          valueType: "Fixed",
        },
        contentSid: "",
        contentVariables: [],
      };
    case WorkflowNodeTypes.splitOut:
      return { label: "New Split Out", fieldToSplitOut: "" };
    case WorkflowNodeTypes.loop:
      return {
        label: "New Loop",
        batchSize: 1,
        sourceHandle: [
          {
            id: uuidv4(),
            type: "source",
            position: Position.Right,
            style: {
              display: "flex",
              position: "absolute",
              right: "-4px",
              top: "30%",
            },
            label: {
              name: "done",
              style: {
                position: "absolute",
                marginLeft: 10,
                fontSize: "6px",
                top: "-5px",
                width: "50px",
              },
            },
          },
          {
            id: uuidv4(),
            type: "source",
            position: Position.Right,
            style: {
              display: "flex",
              position: "absolute",
              right: "-4px",
              top: "70%",
            },
            label: {
              name: "loop",
              style: {
                position: "absolute",
                marginLeft: 10,
                fontSize: "6px",
                top: "-5px",
                width: "50px",
              },
            },
          },
        ],
        targetHandle: [
          {
            id: uuidv4(),
            type: "target",
            position: Position.Left,
          },
        ],
      };
    default:
      return { label: "New Node" };
  }
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [workflowItem, setWorkflowItem] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTestRunDialogOpen, setIsTestRunDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const {
    deleteConfirmOpen: changeStatusConfirmOpen,
    selectedItem: selectedWorkflow,
    openDeleteConfirm: openChangeStatusConfirm,
    closeDeleteConfirm: closeChangeStatusConfirm,
  } = useModalState<WorkflowView>();

  // tRPC hooks
  const utils = useUtils();
  const workflow = api.workflow.getByUUID.useQuery({ uuid: slug });
  const updateWorkflowSettings = api.workflow.updateSettings.useMutation({
    onSuccess: () => {
      utils.workflow.getByUUID.invalidate({ uuid: slug });
      toast.success("Workflow settings updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateWorkflow = api.workflow.update.useMutation({
    onSuccess: () => {
      utils.workflow.getByUUID.invalidate({ uuid: slug });
      toast.success("Workflow updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateWorkflowStatus = api.workflow.updateStatus.useMutation({
    onSuccess: () => {
      utils.workflow.getByUUID.invalidate({ uuid: slug });
      toast.success("Workflow status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    getTemplates();
  }, []);

  const getTemplates = async () => {
    try {
      const res = await axios.get(TWILIO_API.getTemplates, {
        params: {
          pageSize: 200,
          page: 0,
        },
      });
      setTemplates(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (workflow.data) {
      setWorkflowItem(workflow.data);
      if (workflow.data?.nodes && workflow.data?.nodes.length > 0) {
        const updatedNodes = workflow.data.nodes.map((node: any) => {
          const { uuid, ...rest } = node;
          return { ...rest, id: uuid };
        });
        setNodes(updatedNodes);
      }
      if (workflow.data?.edges && workflow.data?.edges.length > 0) {
        const updatedEdges = workflow.data.edges.map((edge: any) => {
          const { uuid, ...rest } = edge;
          return { ...rest, id: uuid };
        });
        setEdges(updatedEdges);
      }
    }
  }, [workflow.data]);

  const setWorkflowItemChanges = (key: string, value: any) => {
    if (workflowItem) {
      setWorkflowItem((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const saveSettings = async () => {
    setIsSettingsOpen(false);
    if (workflowItem) {
      const { name, description, type } = workflowItem;
      await updateWorkflowSettings.mutateAsync({
        uuid: slug,
        name,
        description,
        type,
      });
    }
  };

  const saveWorkflowChanges = async () => {
    if (workflowItem) {
      let passedValidation = true;
      // Filter out the nodes don't have type
      let finalNodes = nodes.filter((node: any) => node.type);
      // Validate decision table node whether select one decision table or not
      const decisionTableNodes = finalNodes.filter(
        (node: any) => node.type === WorkflowNodeTypes.decisionTable,
      );
      if (decisionTableNodes.length > 0) {
        decisionTableNodes.forEach((node: any) => {
          if (!node.data.decisionTable?.uuid) {
            toast.error(
              "Please select a decision table for decision table node",
            );
            passedValidation = false;
          }
        });
      }
      // Validate ai model node whether select one model or not
      const aiModelNodes = finalNodes.filter(
        (node: any) => node.type === WorkflowNodeTypes.aiModel,
      );
      if (aiModelNodes.length > 0) {
        aiModelNodes.forEach((node: any) => {
          if (!node.data.model?.uuid) {
            toast.error("Please select a model for ai model node");
            passedValidation = false;
          }
        });
      }
      if (passedValidation) {
        await updateWorkflow.mutateAsync({
          uuid: slug,
          nodes: finalNodes,
          edges,
        });
      }
    }
  };

  // Update the existing isValidConnection function in the onConnect callback
  const onConnect = useCallback(
    (connection: Connection) => {
      // Add the connection if it's valid
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
          },
          eds,
        ),
      );
    },
    [nodes, setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    const target = event.target as HTMLButtonElement;
    const type = target.dataset.type;
    switch (type) {
      case WorkflowNodeDataActions.settings: {
        // Show the node properties panel
        setSelectedNode(node.id);
        break;
      }
      case WorkflowNodeDataActions.delete: {
        // Delete the node
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        // Delete related edges
        setEdges((eds) =>
          eds.filter((e) => e.source !== node.id && e.target !== node.id),
        );
        setSelectedNode(null);
        break;
      }
      default:
        setSelectedNode(null);
        break;
    }
  }, []);

  const addNode = (type: string) => {
    const newNode = {
      id: uuidv4(),
      type,
      position: { x: 250, y: 250 },
      data: getDefaultDataForNodeType(type),
    };

    setNodes((nds) => [...nds, newNode]);
    setIsAddNodeDialogOpen(false);
  };

  const handleOnNodesChange = (changes: NodeChange[]) => {
    if (changes.length > 0) {
      // Find type equal remove
      const removedNode = changes.find(
        (change: any) => change.type === "remove",
      );
      if (removedNode) {
        setSelectedNode(null);
      }
    }
    onNodesChange(changes);
  };

  const handleOnEdgesChange = (changes: EdgeChange[]) => {
    if (changes.length > 0) {
      // Find type equal remove
    }
    onEdgesChange(changes);
  };

  const confirmChangeStatus = async () => {
    closeChangeStatusConfirm();
    if (selectedWorkflow) {
      await updateWorkflowStatus.mutateAsync({
        uuid: selectedWorkflow.uuid,
        status:
          selectedWorkflow.status === WorkflowStatus.PUBLISHED
            ? WorkflowStatus.PAUSED
            : WorkflowStatus.PUBLISHED,
      });
    }
  };

  if (workflow.error) {
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">Error loading models</h2>
          <p className="mb-2">{workflow.error.message}</p>
        </div>
      </div>
    );
  }

  if (workflow.isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <WorkflowDetailLoading />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <ErrorBoundary>
          <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
            <Breadcrumbs
              items={[
                {
                  label: "Back to Workflows",
                  link: AdminRoutes.workflows,
                },
              ]}
              title={workflowItem?.name}
              badge={
                <Badge
                  variant={
                    workflowItem?.status === WorkflowStatus.PUBLISHED
                      ? "default"
                      : workflowItem?.status === WorkflowStatus.DRAFT
                      ? "secondary"
                      : "outline"
                  }
                >
                  {workflowItem?.status}
                </Badge>
              }
              rightChildren={
                <>
                  <SampleButton
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </SampleButton>
                  <SampleButton
                    variant="outline"
                    size="sm"
                    onClick={() => openChangeStatusConfirm(workflowItem)}
                  >
                    {workflowItem?.status === WorkflowStatus.PUBLISHED ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Publish
                      </>
                    )}
                  </SampleButton>
                  <SampleButton
                    size="sm"
                    onClick={saveWorkflowChanges}
                    disabled={workflowItem?.status === WorkflowStatus.PUBLISHED}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </SampleButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SampleButton
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        <span className="sr-only">More Options</span>
                      </SampleButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsTestRunDialogOpen(true)}
                        className="cursor-pointer"
                      >
                        Test Run
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              }
            />
            <div className="flex flex-1">
              <div className="flex-1 h-[calc(100vh-4rem)]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleOnNodesChange}
                  onEdgesChange={handleOnEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  defaultEdgeOptions={{ type: "smoothstep" }}
                  fitView
                  proOptions={{ hideAttribution: true }}
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                  <Panel
                    position="top-right"
                    className="bg-background border rounded-md shadow-sm p-2"
                  >
                    <AddNode
                      isAddNodeDialogOpen={isAddNodeDialogOpen}
                      setIsAddNodeDialogOpen={(open: boolean) =>
                        setIsAddNodeDialogOpen(open)
                      }
                      addNode={addNode}
                    />
                  </Panel>
                </ReactFlow>
              </div>

              {selectedNode && (
                <div className="w-80 border-l bg-background overflow-auto h-[calc(100vh-4rem)]">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Node Properties</h3>
                      <SampleButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedNode(null)}
                      >
                        <X className="h-4 w-4" />
                      </SampleButton>
                    </div>
                    <NodePropertiesPanel
                      nodeId={selectedNode}
                      nodes={nodes}
                      setNodes={setNodes}
                      templates={templates}
                    />
                  </div>
                </div>
              )}
            </div>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Workflow Settings</DialogTitle>
                  <DialogDescription>
                    Configure general settings for your workflow.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="general">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="execution">Execution</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="workflow-name">Workflow Name</Label>
                      <SampleInput
                        id="workflow-name"
                        value={workflowItem?.name}
                        onChange={(e) =>
                          setWorkflowItemChanges("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="workflow-description">Description</Label>
                      <SampleInput
                        id="workflow-description"
                        value={workflowItem?.description || ""}
                        onChange={(e) =>
                          setWorkflowItemChanges("description", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="workflow-type">Workflow Type</Label>
                      <Select
                        value={workflowItem?.type}
                        onValueChange={(value) =>
                          setWorkflowItemChanges("type", value)
                        }
                      >
                        <SelectTrigger id="workflow-type">
                          <SelectValue placeholder="Select workflow type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={WorkflowTypes.STANDARD.value}>
                            {WorkflowTypes.STANDARD.label}
                          </SelectItem>
                          <SelectItem value={WorkflowTypes.SCHEDULED.value}>
                            {WorkflowTypes.SCHEDULED.label}
                          </SelectItem>
                          <SelectItem value={WorkflowTypes.EVENT_DRIVEN.value}>
                            {WorkflowTypes.EVENT_DRIVEN.label}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="workflow-tags">Tags</Label>
                      <SampleInput
                        id="workflow-tags"
                        placeholder="Enter tags separated by commas"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="execution" className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Timeout</Label>
                        <p className="text-sm text-muted-foreground">
                          Maximum execution time
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <SampleInput className="w-20" defaultValue="60" />
                        <span>seconds</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Retry on Failure</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically retry failed executions
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Concurrency Limit</Label>
                        <p className="text-sm text-muted-foreground">
                          Maximum concurrent executions
                        </p>
                      </div>
                      <SampleInput className="w-20" defaultValue="5" />
                    </div>
                  </TabsContent>
                  <TabsContent value="permissions" className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Access Control</Label>
                      <Select defaultValue="team">
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">
                            Private (Only me)
                          </SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="organization">
                            Organization
                          </SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Team Members</Label>
                      <div className="border rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              SC
                            </div>
                            <div>
                              <p className="text-sm font-medium">Sarah Chen</p>
                              <p className="text-xs text-muted-foreground">
                                sarah@example.com
                              </p>
                            </div>
                          </div>
                          <Badge>Owner</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              AM
                            </div>
                            <div>
                              <p className="text-sm font-medium">Alex Morgan</p>
                              <p className="text-xs text-muted-foreground">
                                alex@example.com
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">Editor</Badge>
                        </div>
                      </div>
                      <SampleButton
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Team Member
                      </SampleButton>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <SampleButton
                    variant="outline"
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Cancel
                  </SampleButton>
                  <SampleButton
                    onClick={saveSettings}
                    disabled={workflowItem?.status === WorkflowStatus.PUBLISHED}
                  >
                    Save Changes
                  </SampleButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog
              open={changeStatusConfirmOpen}
              onOpenChange={closeChangeStatusConfirm}
            >
              <DialogContent className="modal-content">
                <DialogHeader className="modal-header">
                  <DialogTitle className="modal-title">
                    {workflowItem?.status === WorkflowStatus.PUBLISHED
                      ? "Pause Workflow"
                      : "Publish Workflow"}
                  </DialogTitle>
                  <DialogDescription />
                </DialogHeader>
                <div className="modal-section">
                  <p className="modal-text">
                    Are you sure you want to{" "}
                    {workflowItem?.status === WorkflowStatus.PUBLISHED
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
                    {workflowItem?.status === WorkflowStatus.PUBLISHED
                      ? "Pause"
                      : "Publish"}
                  </SampleButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {isTestRunDialogOpen && (
              <WorkflowTestRunDialog
                open={isTestRunDialogOpen}
                onOpenChange={(open) => setIsTestRunDialogOpen(open)}
                workflow={workflowItem}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
      {(updateWorkflowSettings.isPending ||
        updateWorkflow.isPending ||
        updateWorkflowStatus.isPending) && <FullScreenLoading />}
    </ReactFlowProvider>
  );
}

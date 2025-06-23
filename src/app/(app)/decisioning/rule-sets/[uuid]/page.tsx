"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, useUtils } from "@/utils/trpc";
import { Route } from "next";
import { toast } from "sonner";

import { 
  Settings, 
  AlertCircle, 
  Edit, 
  Save, 
  X,
  CheckCircle,
  Archive,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Clock
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SampleButton } from "@/components/ui/sample-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RuleSetStatus } from "@/db/schema/rule_set";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";

interface RuleSetStep {
  id: number;
  uuid: string;
  ruleSetId: string;
  stepOrder: number;
  stepName: string;
  artifactType: string;
  artifactId: string;
  inputMapping: any;
  outputMapping: any;
  executionCondition: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RuleSet {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  inputSchema: any[] | null;
  outputSchema: any[] | null;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  orgId: number;
  createdAt: Date;
  updatedAt: Date;
  steps: RuleSetStep[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case RuleSetStatus.DRAFT:
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>;
    case RuleSetStatus.PUBLISHED:
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Published</Badge>;
    case RuleSetStatus.DEPRECATED:
      return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">Deprecated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case RuleSetStatus.DRAFT:
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case RuleSetStatus.PUBLISHED:
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case RuleSetStatus.DEPRECATED:
      return <Archive className="h-4 w-4 text-gray-600" />;
    default:
      return <Settings className="h-4 w-4 text-gray-600" />;
  }
};

const formatDate = (date: Date | null) => {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const RuleSetDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const utils = useUtils();
  const uuid = params.uuid as string;

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });
  const [stepForm, setStepForm] = useState({
    stepName: "",
    artifactType: "",
    artifactId: "",
    stepOrder: 1,
  });

  // tRPC hooks
  const ruleSetQuery = api.ruleSet.getByUuid.useQuery(uuid);
  const updateRuleSet = api.ruleSet.update.useMutation({
    onSuccess: () => {
      utils.ruleSet.getByUuid.invalidate(uuid);
      toast.success("Rule set updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const publishRuleSet = api.ruleSet.publish.useMutation({
    onSuccess: () => {
      utils.ruleSet.getByUuid.invalidate(uuid);
      toast.success("Rule set published successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deprecateRuleSet = api.ruleSet.deprecate.useMutation({
    onSuccess: () => {
      utils.ruleSet.getByUuid.invalidate(uuid);
      toast.success("Rule set deprecated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const ruleSet = ruleSetQuery.data;

  useEffect(() => {
    if (ruleSet) {
      setEditForm({
        name: ruleSet.name,
        description: ruleSet.description || "",
      });
    }
  }, [ruleSet]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!ruleSet) return;

    try {
      await updateRuleSet.mutateAsync({
        uuid: ruleSet.uuid,
        name: editForm.name,
        description: editForm.description || undefined,
      });
    } catch (error) {
      console.error("Error updating rule set:", error);
    }
  };

  const handleCancel = () => {
    if (ruleSet) {
      setEditForm({
        name: ruleSet.name,
        description: ruleSet.description || "",
      });
    }
    setIsEditing(false);
  };

  const handlePublish = async () => {
    if (!ruleSet) return;

    try {
      await publishRuleSet.mutateAsync({ uuid: ruleSet.uuid });
    } catch (error) {
      console.error("Error publishing rule set:", error);
    }
  };

  const handleDeprecate = async () => {
    if (!ruleSet) return;

    try {
      await deprecateRuleSet.mutateAsync(ruleSet.uuid);
    } catch (error) {
      console.error("Error deprecating rule set:", error);
    }
  };

  const handleAddStep = () => {
    setIsAddingStep(true);
    setStepForm({
      stepName: "",
      artifactType: "",
      artifactId: "",
      stepOrder: (ruleSet?.steps?.length || 0) + 1,
    });
  };

  if (ruleSetQuery.isLoading) {
    return <DefaultSkeleton count={5} className="m-6" />;
  }

  if (ruleSetQuery.isError || !ruleSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Rule Set Not Found</h3>
          <p className="text-muted-foreground">
            The rule set you're looking for doesn't exist or you don't have permission to view it.
          </p>
        </div>
        <SampleButton onClick={() => router.push("/decisioning/rule-sets" as Route)}>
          Back to Rule Sets
        </SampleButton>
      </div>
    );
  }

  const canEdit = ruleSet.status === RuleSetStatus.DRAFT;
  const canPublish = ruleSet.status === RuleSetStatus.DRAFT && ruleSet.steps.length > 0;
  const canDeprecate = ruleSet.status === RuleSetStatus.PUBLISHED;

  return (
    <div className="flex flex-col grow max-w-[100vw] p-4 md:p-4">
      <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            {
              label: "Rule Sets",
              link: "/decisioning/rule-sets",
            },
          ]}
          title={ruleSet.name}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getStatusIcon(ruleSet.status)}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{ruleSet.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(ruleSet.status)}
                <span className="text-sm text-muted-foreground">v{ruleSet.version}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            {canEdit && !isEditing && (
              <SampleButton onClick={handleEdit} variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </SampleButton>
            )}
            {canPublish && (
              <SampleButton onClick={handlePublish} size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish
              </SampleButton>
            )}
            {canDeprecate && (
              <SampleButton onClick={handleDeprecate} variant="outline" size="sm">
                <Archive className="mr-2 h-4 w-4" />
                Deprecate
              </SampleButton>
            )}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="steps">Steps ({ruleSet.steps.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rule Set Information</CardTitle>
                  {isEditing && (
                    <div className="flex gap-2">
                      <SampleButton onClick={handleSave} size="sm" disabled={updateRuleSet.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {updateRuleSet.isPending ? "Saving..." : "Save"}
                      </SampleButton>
                      <SampleButton onClick={handleCancel} variant="outline" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </SampleButton>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Rule set name"
                      />
                    ) : (
                      <p className="text-sm">{ruleSet.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div>{getStatusBadge(ruleSet.status)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Rule set description"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{ruleSet.description || "No description provided"}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <p className="text-sm">v{ruleSet.version}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <p className="text-sm">{formatDate(ruleSet.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <p className="text-sm">{formatDate(ruleSet.updatedAt)}</p>
                  </div>
                </div>

                {ruleSet.publishedAt && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Published</Label>
                      <p className="text-sm">{formatDate(ruleSet.publishedAt)}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Published By</Label>
                      <p className="text-sm">User ID: {ruleSet.publishedBy}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rule Set Steps</CardTitle>
                    <CardDescription>
                      Define the sequence of decision logic steps
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <SampleButton onClick={handleAddStep} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Step
                    </SampleButton>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {ruleSet.steps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Steps Defined</h3>
                    <p className="mb-4">Add steps to define the decision logic for this rule set.</p>
                    {canEdit && (
                      <SampleButton onClick={handleAddStep}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Step
                      </SampleButton>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ruleSet.steps
                      .sort((a, b) => a.stepOrder - b.stepOrder)
                      .map((step, index) => (
                        <Card key={step.uuid} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                                  {step.stepOrder}
                                </div>
                                <div>
                                  <CardTitle className="text-base">{step.stepName}</CardTitle>
                                  <CardDescription>
                                    {step.artifactType.replace('_', ' ').toUpperCase()}
                                  </CardDescription>
                                </div>
                              </div>
                              {canEdit && (
                                <div className="flex gap-1">
                                  <SampleButton variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </SampleButton>
                                  <SampleButton variant="ghost" size="sm">
                                    <ArrowUp className="h-4 w-4" />
                                  </SampleButton>
                                  <SampleButton variant="ghost" size="sm">
                                    <ArrowDown className="h-4 w-4" />
                                  </SampleButton>
                                  <SampleButton variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </SampleButton>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Artifact ID:</span>
                                <span className="font-mono text-xs">{step.artifactId}</span>
                              </div>
                              {step.executionCondition && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Condition:</span>
                                  <span className="font-mono text-xs">{step.executionCondition}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Step Dialog */}
        <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
          <DialogContent className="modal-content max-w-2xl">
            <DialogHeader className="modal-header">
              <DialogTitle className="modal-title">Add New Step</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="stepName">Step Name *</Label>
                <Input
                  id="stepName"
                  placeholder="Enter step name"
                  value={stepForm.stepName}
                  onChange={(e) => setStepForm({ ...stepForm, stepName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="artifactType">Artifact Type *</Label>
                <Select
                  value={stepForm.artifactType}
                  onValueChange={(value) => setStepForm({ ...stepForm, artifactType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select artifact type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="decision_table">Decision Table</SelectItem>
                    <SelectItem value="lookup_table">Lookup Table</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                    <SelectItem value="formula">Formula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="artifactId">Artifact ID *</Label>
                <Input
                  id="artifactId"
                  placeholder="Enter artifact UUID"
                  value={stepForm.artifactId}
                  onChange={(e) => setStepForm({ ...stepForm, artifactId: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stepOrder">Step Order</Label>
                <Input
                  id="stepOrder"
                  type="number"
                  min="1"
                  value={stepForm.stepOrder}
                  onChange={(e) => setStepForm({ ...stepForm, stepOrder: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <DialogFooter className="modal-footer">
              <SampleButton
                type="button"
                variant="outline"
                className="modal-button"
                onClick={() => setIsAddingStep(false)}
              >
                Cancel
              </SampleButton>
              <SampleButton
                type="button"
                className="modal-button"
                onClick={() => {
                  // TODO: Implement step creation
                  toast.info("Step creation will be implemented in the next phase");
                  setIsAddingStep(false);
                }}
                disabled={!stepForm.stepName || !stepForm.artifactType || !stepForm.artifactId}
              >
                Add Step
              </SampleButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Suspense>
    </div>
  );
};

export default RuleSetDetailPage; 
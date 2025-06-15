"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, useUtils } from "@/utils/trpc";
import { Route } from "next";
import { toast } from "sonner";

import { 
  Calculator, 
  Database, 
  FileCode, 
  Settings, 
  AlertCircle, 
  Edit, 
  Save, 
  X,
  CheckCircle,
  Archive
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VariableStatus, VariableLogicTypes, VariableDataTypes } from "@/db/schema/variable";
import { getTimeAgo } from "@/utils/func";

const VariableDetail = () => {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;
  const utils = useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDeprecateDialog, setShowDeprecateDialog] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    dataType: "",
    logicType: "",
    formula: "",
    lookupTableId: "",
    defaultValue: "",
  });

  // tRPC hooks
  const variable = api.variable.getByUuid.useQuery(uuid);
  const updateVariable = api.variable.update.useMutation({
    onSuccess: () => {
      utils.variable.getByUuid.invalidate(uuid);
      utils.variable.getAll.invalidate();
      toast.success("Variable updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const publishVariable = api.variable.publish.useMutation({
    onSuccess: () => {
      utils.variable.getByUuid.invalidate(uuid);
      utils.variable.getAll.invalidate();
      toast.success("Variable published successfully");
      setShowPublishDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deprecateVariable = api.variable.deprecate.useMutation({
    onSuccess: () => {
      utils.variable.getByUuid.invalidate(uuid);
      utils.variable.getAll.invalidate();
      toast.success("Variable deprecated successfully");
      setShowDeprecateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (variable.data) {
      setEditData({
        name: variable.data.name,
        description: variable.data.description || "",
        dataType: variable.data.dataType,
        logicType: variable.data.logicType,
        formula: variable.data.formula || "",
        lookupTableId: variable.data.lookupTableId || "",
        defaultValue: variable.data.defaultValue || "",
      });
    }
  }, [variable.data]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (variable.data) {
      setEditData({
        name: variable.data.name,
        description: variable.data.description || "",
        dataType: variable.data.dataType,
        logicType: variable.data.logicType,
        formula: variable.data.formula || "",
        lookupTableId: variable.data.lookupTableId || "",
        defaultValue: variable.data.defaultValue || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!variable.data) return;

    try {
      const payload: any = {
        uuid: variable.data.uuid,
        name: editData.name,
        description: editData.description || undefined,
        dataType: editData.dataType as any,
        logicType: editData.logicType as any,
      };

      // Add logic-specific fields
      if (editData.logicType === VariableLogicTypes.FORMULA) {
        payload.formula = editData.formula;
      } else if (editData.logicType === VariableLogicTypes.LOOKUP) {
        payload.lookupTableId = editData.lookupTableId;
      } else if (editData.logicType === VariableLogicTypes.DIRECT_MAP) {
        payload.defaultValue = editData.defaultValue;
      }

      await updateVariable.mutateAsync(payload);
    } catch (error) {
      console.error("Error updating variable:", error);
    }
  };

  const handlePublish = async () => {
    if (!variable.data) return;
    try {
      await publishVariable.mutateAsync({ uuid: variable.data.uuid });
    } catch (error) {
      console.error("Error publishing variable:", error);
    }
  };

  const handleDeprecate = async () => {
    if (!variable.data) return;
    try {
      await deprecateVariable.mutateAsync(variable.data.uuid);
    } catch (error) {
      console.error("Error deprecating variable:", error);
    }
  };

  const getLogicTypeIcon = (logicType: string) => {
    switch (logicType) {
      case VariableLogicTypes.FORMULA:
        return <Calculator className="h-4 w-4" />;
      case VariableLogicTypes.LOOKUP:
        return <Database className="h-4 w-4" />;
      case VariableLogicTypes.DIRECT_MAP:
        return <FileCode className="h-4 w-4" />;
      default:
        return <FileCode className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case VariableStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case VariableStatus.PUBLISHED:
        return <Badge variant="default">Published</Badge>;
      case VariableStatus.DEPRECATED:
        return <Badge variant="destructive">Deprecated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (variable.error) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Variable Not Found</AlertTitle>
          <AlertDescription>
            The requested variable could not be found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <SampleButton onClick={() => router.push("/decisioning/variables" as Route)}>
          Return to Variables
        </SampleButton>
      </div>
    );
  }

  if (variable.isLoading) {
    return <DefaultSkeleton count={5} className="m-6" />;
  }

  const variableData = variable.data;
  if (!variableData) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Variable Not Found</AlertTitle>
          <AlertDescription>
            The requested variable could not be found.
          </AlertDescription>
        </Alert>
        <SampleButton onClick={() => router.push("/decisioning/variables" as Route)}>
          Return to Variables
        </SampleButton>
      </div>
    );
  }

  const isDraft = variableData.status === VariableStatus.DRAFT;
  const isPublished = variableData.status === VariableStatus.PUBLISHED;
  const canEdit = isDraft && !isEditing;
  const canPublish = isDraft;
  const canDeprecate = isPublished;

  return (
    <ErrorBoundary>
      <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Breadcrumbs
            items={[{ label: "Back to Variables", link: "/decisioning/variables" }]}
          />
          <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center gap-3">
                {getLogicTypeIcon(variableData.logicType)}
                <div>
                  <h1 className="text-3xl font-bold">{variableData.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(variableData.status)}
                    <span className="text-sm text-muted-foreground">
                      v{variableData.version}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                {isEditing ? (
                  <>
                    <SampleButton 
                      onClick={handleSave}
                      disabled={updateVariable.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateVariable.isPending ? "Saving..." : "Save"}
                    </SampleButton>
                    <SampleButton 
                      onClick={handleCancelEdit}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </SampleButton>
                  </>
                ) : (
                  <>
                    {canEdit && (
                      <SampleButton onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </SampleButton>
                    )}
                    {canPublish && (
                      <SampleButton 
                        onClick={() => setShowPublishDialog(true)}
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish
                      </SampleButton>
                    )}
                    {canDeprecate && (
                      <SampleButton 
                        onClick={() => setShowDeprecateDialog(true)}
                        variant="outline"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Deprecate
                      </SampleButton>
                    )}
                    <SampleButton variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </SampleButton>
                  </>
                )}
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-2 md:w-[400px] mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Variable Information</CardTitle>
                    <CardDescription>
                      Basic details about this variable
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        {isEditing ? (
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Variable name"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{variableData.name}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Data Type</Label>
                        {isEditing ? (
                          <Select
                            value={editData.dataType}
                            onValueChange={(value) => setEditData({ ...editData, dataType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={VariableDataTypes.STRING}>String</SelectItem>
                              <SelectItem value={VariableDataTypes.NUMBER}>Number</SelectItem>
                              <SelectItem value={VariableDataTypes.BOOLEAN}>Boolean</SelectItem>
                              <SelectItem value={VariableDataTypes.DATE}>Date</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground capitalize">{variableData.dataType}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      {isEditing ? (
                        <Textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          placeholder="Variable description"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {variableData.description || "No description provided"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Logic Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getLogicTypeIcon(variableData.logicType)}
                      Logic Configuration
                    </CardTitle>
                    <CardDescription>
                      How this variable calculates its value
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Logic Type</Label>
                      {isEditing ? (
                        <Select
                          value={editData.logicType}
                          onValueChange={(value) => setEditData({ ...editData, logicType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={VariableLogicTypes.DIRECT_MAP}>Direct Map</SelectItem>
                            <SelectItem value={VariableLogicTypes.FORMULA}>Formula</SelectItem>
                            <SelectItem value={VariableLogicTypes.LOOKUP}>Lookup</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground capitalize">
                          {variableData.logicType.replace('_', ' ')}
                        </p>
                      )}
                    </div>

                    {/* Logic-specific fields */}
                    {(isEditing ? editData.logicType : variableData.logicType) === VariableLogicTypes.FORMULA && (
                      <div>
                        <Label className="text-sm font-medium">Formula</Label>
                        {isEditing ? (
                          <Textarea
                            value={editData.formula}
                            onChange={(e) => setEditData({ ...editData, formula: e.target.value })}
                            placeholder="Enter formula expression"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                            {variableData.formula || "No formula defined"}
                          </p>
                        )}
                      </div>
                    )}

                    {(isEditing ? editData.logicType : variableData.logicType) === VariableLogicTypes.LOOKUP && (
                      <div>
                        <Label className="text-sm font-medium">Lookup Table</Label>
                        {isEditing ? (
                          <Input
                            value={editData.lookupTableId}
                            onChange={(e) => setEditData({ ...editData, lookupTableId: e.target.value })}
                            placeholder="Lookup table ID"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {variableData.lookupTableId || "No lookup table assigned"}
                          </p>
                        )}
                      </div>
                    )}

                    {(isEditing ? editData.logicType : variableData.logicType) === VariableLogicTypes.DIRECT_MAP && (
                      <div>
                        <Label className="text-sm font-medium">Default Value</Label>
                        {isEditing ? (
                          <Input
                            value={editData.defaultValue}
                            onChange={(e) => setEditData({ ...editData, defaultValue: e.target.value })}
                            placeholder="Default value"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {variableData.defaultValue || "No default value"}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                    <CardDescription>
                      Creation and publishing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {getTimeAgo(variableData.createdAt)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Updated</Label>
                        <p className="text-sm text-muted-foreground">
                          {getTimeAgo(variableData.updatedAt)}
                        </p>
                      </div>
                      {variableData.publishedAt && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Published</Label>
                            <p className="text-sm text-muted-foreground">
                              {getTimeAgo(variableData.publishedAt)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Published By</Label>
                            <p className="text-sm text-muted-foreground">
                              User {variableData.publishedBy}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Configuration</CardTitle>
                    <CardDescription>
                      Advanced settings and configuration options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Advanced configuration options will be available in future versions.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Publish Dialog */}
          <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish Variable</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to publish "{variableData.name}"? 
                  Once published, this variable will be available for use in other decision artifacts 
                  and cannot be edited until deprecated.
                </p>
              </div>
              <DialogFooter>
                <SampleButton
                  variant="outline"
                  onClick={() => setShowPublishDialog(false)}
                >
                  Cancel
                </SampleButton>
                <SampleButton
                  onClick={handlePublish}
                  disabled={publishVariable.isPending}
                >
                  {publishVariable.isPending ? "Publishing..." : "Publish"}
                </SampleButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Deprecate Dialog */}
          <Dialog open={showDeprecateDialog} onOpenChange={setShowDeprecateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deprecate Variable</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to deprecate "{variableData.name}"? 
                  This will mark the variable as deprecated and it will no longer be available 
                  for use in new decision artifacts.
                </p>
              </div>
              <DialogFooter>
                <SampleButton
                  variant="outline"
                  onClick={() => setShowDeprecateDialog(false)}
                >
                  Cancel
                </SampleButton>
                <SampleButton
                  variant="destructive"
                  onClick={handleDeprecate}
                  disabled={deprecateVariable.isPending}
                >
                  {deprecateVariable.isPending ? "Deprecating..." : "Deprecate"}
                </SampleButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default VariableDetail; 
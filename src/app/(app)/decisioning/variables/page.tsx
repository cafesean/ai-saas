"use client";

import { useState, Suspense, memo } from "react";
import { Search, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { SampleButton } from "@/components/ui/sample-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { api, useUtils } from "@/utils/trpc";
import { useModalState } from "@/framework/hooks/useModalState";
import { ViewToggle } from "@/components/view-toggle";
import { useViewToggle } from "@/framework/hooks/useViewToggle";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { VariableStatus, VariableLogicTypes, VariableDataTypes } from "@/db/schema/variable";
import { VariablesList, VariablesSummary } from "./components";

interface Variable {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  dataType: string;
  logicType: string;
  formula: string | null;
  lookupTableId: string | null;
  defaultValue: string | null;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

const VariablesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { viewMode, setViewMode } = useViewToggle("medium-grid");
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    dataType: typeof VariableDataTypes[keyof typeof VariableDataTypes];
    logicType: typeof VariableLogicTypes[keyof typeof VariableLogicTypes];
    formula: string;
    lookupTableId: string;
    defaultValue: string;
  }>({
    name: "",
    description: "",
    dataType: VariableDataTypes.STRING,
    logicType: VariableLogicTypes.DIRECT_MAP,
    formula: "",
    lookupTableId: "",
    defaultValue: "",
  });

  const {
    deleteConfirmOpen,
    openDeleteConfirm,
    selectedItem: selectedVariable,
    closeDeleteConfirm,
  } = useModalState<Variable>();

  // tRPC hooks
  const utils = useUtils();
  const variables = api.variable.getAll.useQuery();
  const createVariable = api.variable.create.useMutation({
    onSuccess: () => {
      utils.variable.getAll.invalidate();
      toast.success("Variable created successfully");
      resetForm();
      setIsCreateDialogOpen(false);
      setIsConfirming(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setCreating(false);
    },
  });
  const deleteVariable = api.variable.delete.useMutation({
    onSuccess: () => {
      utils.variable.getAll.invalidate();
      toast.success("Variable deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (variable: Variable) => {
    openDeleteConfirm(variable);
  };

  const confirmDelete = async () => {
    if (selectedVariable) {
      try {
        await deleteVariable.mutateAsync(selectedVariable.uuid);
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting variable:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      dataType: VariableDataTypes.STRING,
      logicType: VariableLogicTypes.DIRECT_MAP,
      formula: "",
      lookupTableId: "",
      defaultValue: "",
    });
    setCreating(false);
  };

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
    setIsConfirming(false);
  };

  const handleNext = () => {
    if (!formData.name.trim()) {
      toast.error("Variable name is required");
      return;
    }
    setIsConfirming(true);
  };

  const handleBack = () => {
    setIsConfirming(false);
  };

  const handleConfirm = async () => {
    setCreating(true);
    try {
      const payload: {
        name: string;
        description?: string;
        dataType: typeof VariableDataTypes[keyof typeof VariableDataTypes];
        logicType: typeof VariableLogicTypes[keyof typeof VariableLogicTypes];
        formula?: string;
        lookupTableId?: string;
        defaultValue?: string;
      } = {
        name: formData.name,
        description: formData.description || undefined,
        dataType: formData.dataType,
        logicType: formData.logicType,
      };

      // Add logic-specific fields
      if (formData.logicType === VariableLogicTypes.FORMULA) {
        payload.formula = formData.formula;
      } else if (formData.logicType === VariableLogicTypes.LOOKUP) {
        payload.lookupTableId = formData.lookupTableId;
      } else if (formData.logicType === VariableLogicTypes.DIRECT_MAP) {
        payload.defaultValue = formData.defaultValue;
      }

      await createVariable.mutateAsync(payload);
    } catch (error) {
      console.error("Error creating variable:", error);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsCreateDialogOpen(false);
    setIsConfirming(false);
  };

  // Filter variables based on search term
  const filteredVariables = variables.data?.filter((variable) =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (variable.description && variable.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const draftVariables = filteredVariables.filter(v => v.status === VariableStatus.DRAFT);
  const publishedVariables = filteredVariables.filter(v => v.status === VariableStatus.PUBLISHED);
  const deprecatedVariables = filteredVariables.filter(v => v.status === VariableStatus.DEPRECATED);

  return (
    <div className="flex flex-col grow max-w-[100vw] p-4 md:p-4">
      <ErrorBoundary>
        <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Variables</h1>
              <p className="text-muted-foreground">
                Manage reusable variables for your decision logic
              </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-2 w-full md:w-auto">
              <SampleButton
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </SampleButton>
              <SampleButton onClick={handleCreateClick} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Variable
              </SampleButton>
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
          </div>
          
          <Separator className="my-6" />

          {!variables.isLoading ? (
            <>
              {/* Summary */}
              <div className="mb-6">
                <VariablesSummary variables={filteredVariables} />
              </div>

              {/* Search */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search variables..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabs for filtering */}
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Variables ({filteredVariables.length})</TabsTrigger>
                  <TabsTrigger value="draft">Draft ({draftVariables.length})</TabsTrigger>
                  <TabsTrigger value="published">Published ({publishedVariables.length})</TabsTrigger>
                  <TabsTrigger value="deprecated">Deprecated ({deprecatedVariables.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <VariablesList
                    variables={filteredVariables}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>

                <TabsContent value="draft" className="mt-4">
                  <VariablesList
                    variables={draftVariables}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>

                <TabsContent value="published" className="mt-4">
                  <VariablesList
                    variables={publishedVariables}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>

                <TabsContent value="deprecated" className="mt-4">
                  <VariablesList
                    variables={deprecatedVariables}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>
              </Tabs>

              {/* Create Variable Dialog */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="modal-content max-w-2xl">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">
                      {isConfirming ? "Confirm Variable Details" : "Create New Variable"}
                    </DialogTitle>
                  </DialogHeader>

                  {isConfirming ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label className="text-sm font-medium">Name</Label>
                          <p className="text-sm text-muted-foreground">{formData.name}</p>
                        </div>
                        {formData.description && (
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm text-muted-foreground">{formData.description}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Data Type</Label>
                            <p className="text-sm text-muted-foreground capitalize">{formData.dataType}</p>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Logic Type</Label>
                            <p className="text-sm text-muted-foreground capitalize">{formData.logicType.replace('_', ' ')}</p>
                          </div>
                        </div>
                        {formData.logicType === VariableLogicTypes.FORMULA && formData.formula && (
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Formula</Label>
                            <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">{formData.formula}</p>
                          </div>
                        )}
                        {formData.logicType === VariableLogicTypes.DIRECT_MAP && formData.defaultValue && (
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Default Value</Label>
                            <p className="text-sm text-muted-foreground">{formData.defaultValue}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Variable Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter variable name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter variable description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="dataType">Data Type *</Label>
                          <Select
                            value={formData.dataType}
                            onValueChange={(value) => setFormData({ ...formData, dataType: value as typeof VariableDataTypes[keyof typeof VariableDataTypes] })}
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
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="logicType">Logic Type *</Label>
                          <Select
                            value={formData.logicType}
                            onValueChange={(value) => setFormData({ ...formData, logicType: value as typeof VariableLogicTypes[keyof typeof VariableLogicTypes] })}
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
                        </div>
                      </div>

                      {/* Logic-specific fields */}
                      {formData.logicType === VariableLogicTypes.FORMULA && (
                        <div className="grid gap-2">
                          <Label htmlFor="formula">Formula *</Label>
                          <Textarea
                            id="formula"
                            placeholder="Enter formula (e.g., price * 0.1)"
                            value={formData.formula}
                            onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                          />
                        </div>
                      )}

                      {formData.logicType === VariableLogicTypes.LOOKUP && (
                        <div className="grid gap-2">
                          <Label htmlFor="lookupTableId">Lookup Table *</Label>
                          <Select
                            value={formData.lookupTableId}
                            onValueChange={(value) => setFormData({ ...formData, lookupTableId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select lookup table" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placeholder">No lookup tables available</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {formData.logicType === VariableLogicTypes.DIRECT_MAP && (
                        <div className="grid gap-2">
                          <Label htmlFor="defaultValue">Default Value</Label>
                          <Input
                            id="defaultValue"
                            placeholder="Enter default value"
                            value={formData.defaultValue}
                            onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter className="modal-footer">
                    {isConfirming ? (
                      <>
                        <SampleButton
                          type="button"
                          variant="outline"
                          className="modal-button"
                          onClick={handleBack}
                          disabled={creating}
                        >
                          Back
                        </SampleButton>
                        <SampleButton
                          type="button"
                          className="modal-button"
                          onClick={handleConfirm}
                          disabled={creating}
                        >
                          {creating ? "Creating..." : "Create Variable"}
                        </SampleButton>
                      </>
                    ) : (
                      <>
                        <SampleButton
                          type="button"
                          variant="outline"
                          className="modal-button"
                          onClick={handleCancel}
                        >
                          Cancel
                        </SampleButton>
                        <SampleButton
                          type="button"
                          className="modal-button"
                          onClick={handleNext}
                        >
                          Next
                        </SampleButton>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Confirmation Dialog */}
              <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
                <DialogContent className="modal-content">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">Delete Variable</DialogTitle>
                  </DialogHeader>
                  <div className="modal-section">
                    <p className="modal-text">
                      Are you sure you want to delete the variable &ldquo;{selectedVariable?.name}&rdquo;? 
                      This action cannot be undone.
                    </p>
                  </div>
                  <DialogFooter className="modal-footer">
                    <SampleButton
                      type="button"
                      variant="outline"
                      className="modal-button"
                      onClick={closeDeleteConfirm}
                    >
                      Cancel
                    </SampleButton>
                    <SampleButton
                      type="button"
                      variant="destructive"
                      className="modal-button"
                      onClick={confirmDelete}
                      disabled={deleteVariable.isPending}
                    >
                      {deleteVariable.isPending ? "Deleting..." : "Delete"}
                    </SampleButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <DefaultSkeleton count={5} className="m-6" />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default memo(VariablesPage); 
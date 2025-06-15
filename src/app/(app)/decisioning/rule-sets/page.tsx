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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { api, useUtils } from "@/utils/trpc";
import { useModalState } from "@/framework/hooks/useModalState";
import { ViewToggle } from "@/components/view-toggle";
import { useViewToggle } from "@/framework/hooks/useViewToggle";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { RuleSetStatus } from "@/db/schema/rule_set";
import { RuleSetsList, RuleSetsSummary } from "./components";

interface RuleSet {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  inputSchema: unknown;
  outputSchema: unknown;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

const RuleSetsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { viewMode, setViewMode } = useViewToggle("medium-grid");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    inputSchema: [] as any[],
    outputSchema: [] as any[],
  });

  const {
    deleteConfirmOpen,
    openDeleteConfirm,
    selectedItem: selectedRuleSet,
    closeDeleteConfirm,
  } = useModalState<RuleSet>();

  // tRPC hooks
  const utils = useUtils();
  const ruleSets = api.ruleSet.getAll.useQuery();
  const createRuleSet = api.ruleSet.create.useMutation({
    onSuccess: () => {
      utils.ruleSet.getAll.invalidate();
      toast.success("Rule set created successfully");
      resetForm();
      setIsCreateDialogOpen(false);
      setIsConfirming(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setCreating(false);
    },
  });
  const deleteRuleSet = api.ruleSet.delete.useMutation({
    onSuccess: () => {
      utils.ruleSet.getAll.invalidate();
      toast.success("Rule set deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (ruleSet: RuleSet) => {
    openDeleteConfirm(ruleSet);
  };

  const confirmDelete = async () => {
    if (selectedRuleSet) {
      try {
        await deleteRuleSet.mutateAsync(selectedRuleSet.uuid);
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting rule set:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      inputSchema: [],
      outputSchema: [],
    });
    setCreating(false);
  };

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
    setIsConfirming(false);
  };

  const handleNext = () => {
    if (!formData.name.trim()) {
      toast.error("Rule set name is required");
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
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
      };

      // Add schemas if provided
      if (formData.inputSchema.length > 0) {
        payload.inputSchema = formData.inputSchema;
      }
      if (formData.outputSchema.length > 0) {
        payload.outputSchema = formData.outputSchema;
      }

      await createRuleSet.mutateAsync(payload);
    } catch (error) {
      console.error("Error creating rule set:", error);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsCreateDialogOpen(false);
    setIsConfirming(false);
  };

  // Filter rule sets based on search term
  const filteredRuleSets = ruleSets.data?.filter((ruleSet) =>
    ruleSet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ruleSet.description && ruleSet.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const draftRuleSets = filteredRuleSets.filter(rs => rs.status === RuleSetStatus.DRAFT);
  const publishedRuleSets = filteredRuleSets.filter(rs => rs.status === RuleSetStatus.PUBLISHED);
  const deprecatedRuleSets = filteredRuleSets.filter(rs => rs.status === RuleSetStatus.DEPRECATED);

  return (
    <div className="flex flex-col grow max-w-[100vw] p-4 md:p-4">
      <ErrorBoundary>
        <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Rule Sets</h1>
              <p className="text-muted-foreground">
                Manage complex decision logic with sequential rule execution
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
                New Rule Set
              </SampleButton>
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
          </div>
          
          <Separator className="my-6" />

          {!ruleSets.isLoading ? (
            <>
              {/* Summary */}
              <div className="mb-6">
                <RuleSetsSummary ruleSets={filteredRuleSets} />
              </div>

              {/* Search */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search rule sets..."
                    className="w-full pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabs for filtering */}
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Rule Sets ({filteredRuleSets.length})</TabsTrigger>
                  <TabsTrigger value="draft">Draft ({draftRuleSets.length})</TabsTrigger>
                  <TabsTrigger value="published">Published ({publishedRuleSets.length})</TabsTrigger>
                  <TabsTrigger value="deprecated">Deprecated ({deprecatedRuleSets.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <RuleSetsList
                    ruleSets={filteredRuleSets}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>

                <TabsContent value="draft" className="mt-4">
                  <RuleSetsList
                    ruleSets={draftRuleSets}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>

                <TabsContent value="published" className="mt-4">
                  <RuleSetsList
                    ruleSets={publishedRuleSets}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>

                <TabsContent value="deprecated" className="mt-4">
                  <RuleSetsList
                    ruleSets={deprecatedRuleSets}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                </TabsContent>
              </Tabs>

              {/* Create Rule Set Dialog */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="modal-content max-w-2xl">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">
                      {isConfirming ? "Confirm Rule Set Creation" : "Create New Rule Set"}
                    </DialogTitle>
                  </DialogHeader>

                  {isConfirming ? (
                    <div className="modal-section">
                      <h3 className="text-lg font-medium mb-4">Review Rule Set Details</h3>
                      <div className="space-y-4">
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
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Rule Set Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter rule set name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter rule set description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
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
                          {creating ? "Creating..." : "Create Rule Set"}
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
                    <DialogTitle className="modal-title">Delete Rule Set</DialogTitle>
                  </DialogHeader>
                  <div className="modal-section">
                    <p className="modal-text">
                      Are you sure you want to delete the rule set "{selectedRuleSet?.name}"? 
                      This action cannot be undone and will also delete all associated steps.
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
                      disabled={deleteRuleSet.isPending}
                    >
                      {deleteRuleSet.isPending ? "Deleting..." : "Delete"}
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

export default memo(RuleSetsPage); 
"use client";

import { useState, Suspense, memo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Grid, List, Filter } from "lucide-react";
import { toast } from "sonner";

import { SampleButton } from "@/components/ui/sample-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { api, useUtils } from "@/utils/trpc";
import { useModalState } from "@/framework/hooks/useModalState";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { LookupTablesList, LookupTablesSummary } from "./components";
import { LookupTableStatus } from "@/db/schema/lookup_table";

interface LookupTable {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  inputVariableId: string;
  inputVariableName: string | null;
  outputName: string;
  outputDataType: string;
  defaultValue: string | null;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

const LookupTablesPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    inputVariableId: "",
    outputName: "",
    outputDataType: "string" as const,
    defaultValue: "",
  });

  const {
    deleteConfirmOpen,
    openDeleteConfirm,
    selectedItem: selectedLookupTable,
    closeDeleteConfirm,
  } = useModalState<LookupTable>();

  // tRPC hooks
  const utils = useUtils();
  const lookupTables = api.lookupTable.getAll.useQuery();
  const publishedVariables = api.variable.getAll.useQuery();
  const createLookupTable = api.lookupTable.create.useMutation({
    onSuccess: (data) => {
      utils.lookupTable.getAll.invalidate();
      toast.success("Lookup table created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      // Navigate to the new lookup table in edit mode
      router.push(`/decisioning/lookup-tables/${data?.uuid}?mode=edit`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteLookupTable = api.lookupTable.delete.useMutation({
    onSuccess: () => {
      utils.lookupTable.getAll.invalidate();
      toast.success("Lookup table deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      inputVariableId: "",
      outputName: "",
      outputDataType: "string",
      defaultValue: "",
    });
  };

  const handleCreate = async () => {
    try {
      await createLookupTable.mutateAsync(formData);
    } catch (error) {
      console.error("Error creating lookup table:", error);
    }
  };

  const handleDelete = (lookupTable: LookupTable) => {
    openDeleteConfirm(lookupTable);
  };

  const confirmDelete = async () => {
    if (selectedLookupTable) {
      try {
        await deleteLookupTable.mutateAsync(selectedLookupTable.uuid);
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting lookup table:", error);
      }
    }
  };

  // Filter and search logic
  const filteredLookupTables = lookupTables.data?.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.outputName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || table.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const availableVariables = publishedVariables.data?.filter(v => v.status === "published") || [];

  if (lookupTables.isLoading) {
    return <DefaultSkeleton count={5} className="m-6" />;
  }

  return (
    <div className="flex flex-col grow max-w-[100vw] p-4 md:p-4">
      <ErrorBoundary>
        <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Lookup Tables</h1>
              <p className="text-muted-foreground">
                Manage lookup tables for data transformation and mapping
              </p>
            </div>
            <SampleButton onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Lookup Table
            </SampleButton>
          </div>

          <Separator className="mb-6" />

          {/* Summary Cards */}
          <div className="mb-6">
            <LookupTablesSummary lookupTables={lookupTables.data || []} />
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search lookup tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={LookupTableStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={LookupTableStatus.PUBLISHED}>Published</SelectItem>
                  <SelectItem value={LookupTableStatus.DEPRECATED}>Deprecated</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <SampleButton
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </SampleButton>
                <SampleButton
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </SampleButton>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredLookupTables.length} of {lookupTables.data?.length || 0} lookup tables
              </p>
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="capitalize">
                  {statusFilter}
                </Badge>
              )}
            </div>
          </div>

          {/* Lookup Tables List */}
          <LookupTablesList
            lookupTables={filteredLookupTables}
            viewMode={viewMode}
            onDelete={handleDelete}
          />

          {/* Create Lookup Table Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="modal-content max-w-2xl">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Create New Lookup Table</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter lookup table name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this lookup table does"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inputVariableId">Input Variable *</Label>
                  <Select
                    value={formData.inputVariableId}
                    onValueChange={(value) => setFormData({ ...formData, inputVariableId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select input variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVariables.map((variable) => (
                        <SelectItem key={variable.uuid} value={variable.uuid}>
                          {variable.name} ({variable.dataType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The variable that will be used as input for this lookup table
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="outputName">Output Name *</Label>
                    <Input
                      id="outputName"
                      placeholder="e.g., risk_score, category"
                      value={formData.outputName}
                      onChange={(e) => setFormData({ ...formData, outputName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="outputDataType">Output Data Type *</Label>
                    <Select
                      value={formData.outputDataType}
                      onValueChange={(value) => setFormData({ ...formData, outputDataType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="defaultValue">Default Value</Label>
                  <Input
                    id="defaultValue"
                    placeholder="Value to return when no match is found"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional default value when no lookup rows match
                  </p>
                </div>
              </div>
              <DialogFooter className="modal-footer">
                <SampleButton
                  type="button"
                  variant="outline"
                  className="modal-button"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </SampleButton>
                <SampleButton
                  type="button"
                  className="modal-button"
                  onClick={handleCreate}
                  disabled={!formData.name || !formData.inputVariableId || !formData.outputName || createLookupTable.isPending}
                >
                  {createLookupTable.isPending ? "Creating..." : "Create Lookup Table"}
                </SampleButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Delete Lookup Table</DialogTitle>
              </DialogHeader>
              <div className="modal-section">
                <p className="modal-text">
                  Are you sure you want to delete this lookup table? This action cannot be undone.
                </p>
                {selectedLookupTable && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="font-medium">{selectedLookupTable.name}</p>
                    {selectedLookupTable.description && (
                      <p className="text-sm text-muted-foreground">{selectedLookupTable.description}</p>
                    )}
                  </div>
                )}
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
                  disabled={deleteLookupTable.isPending}
                >
                  {deleteLookupTable.isPending ? "Deleting..." : "Delete"}
                </SampleButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default memo(LookupTablesPage); 
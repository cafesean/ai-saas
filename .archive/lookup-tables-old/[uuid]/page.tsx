"use client";

import { useState, useEffect, Suspense, memo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Upload, Download, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

import { api, useUtils } from "@/utils/trpc";
import { useModalState } from "@/framework/hooks/useModalState";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { LookupTableStatus } from "@/db/schema/lookup_table";
import { formatDistanceToNow } from "date-fns";

interface LookupTableRow {
  id: number;
  uuid: string;
  lookupTableId: string;
  inputCondition: string | null;
  inputValue: string;
  outputValue: string;
  order: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LookupTableDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = params.uuid as string;
  const isEditMode = searchParams.get("mode") === "edit";

  const [editMode, setEditMode] = useState(isEditMode);
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<LookupTableRow | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    inputVariableId: "",
    outputName: "",
    outputDataType: "string" as const,
    defaultValue: "",
  });

  const [rowFormData, setRowFormData] = useState({
    inputCondition: "",
    inputValue: "",
    outputValue: "",
    order: 0,
    isDefault: false,
  });

  const {
    deleteConfirmOpen,
    openDeleteConfirm,
    selectedItem: selectedRow,
    closeDeleteConfirm,
  } = useModalState<LookupTableRow>();

  // tRPC hooks
  const utils = useUtils();
  const lookupTable = api.lookupTable.getByUuid.useQuery(uuid);
  const publishedVariables = api.variable.getAll.useQuery();
  const updateLookupTable = api.lookupTable.update.useMutation({
    onSuccess: () => {
      utils.lookupTable.getByUuid.invalidate(uuid);
      utils.lookupTable.getAll.invalidate();
      toast.success("Lookup table updated successfully");
      setEditMode(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const publishLookupTable = api.lookupTable.publish.useMutation({
    onSuccess: () => {
      utils.lookupTable.getByUuid.invalidate(uuid);
      utils.lookupTable.getAll.invalidate();
      toast.success("Lookup table published successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deprecateLookupTable = api.lookupTable.deprecate.useMutation({
    onSuccess: () => {
      utils.lookupTable.getByUuid.invalidate(uuid);
      utils.lookupTable.getAll.invalidate();
      toast.success("Lookup table deprecated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const createRow = api.lookupTable.rows.create.useMutation({
    onSuccess: () => {
      utils.lookupTable.getByUuid.invalidate(uuid);
      toast.success("Row added successfully");
      resetRowForm();
      setIsAddRowDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateRow = api.lookupTable.rows.update.useMutation({
    onSuccess: () => {
      utils.lookupTable.getByUuid.invalidate(uuid);
      toast.success("Row updated successfully");
      setEditingRow(null);
      resetRowForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteRow = api.lookupTable.rows.delete.useMutation({
    onSuccess: () => {
      utils.lookupTable.getByUuid.invalidate(uuid);
      toast.success("Row deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Initialize form data when lookup table loads
  useEffect(() => {
    if (lookupTable.data) {
      setFormData({
        name: lookupTable.data.name || "",
        description: lookupTable.data.description || "",
        inputVariableId: lookupTable.data.inputVariableId || "",
        outputName: lookupTable.data.outputName || "",
        outputDataType: lookupTable.data.outputDataType as any,
        defaultValue: lookupTable.data.defaultValue || "",
      });
    }
  }, [lookupTable.data]);

  const resetRowForm = () => {
    setRowFormData({
      inputCondition: "",
      inputValue: "",
      outputValue: "",
      order: 0,
      isDefault: false,
    });
  };

  const handleSave = async () => {
    try {
      await updateLookupTable.mutateAsync({
        uuid,
        ...formData,
      });
    } catch (error) {
      console.error("Error updating lookup table:", error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishLookupTable.mutateAsync({ uuid });
    } catch (error) {
      console.error("Error publishing lookup table:", error);
    }
  };

  const handleDeprecate = async () => {
    try {
      await deprecateLookupTable.mutateAsync(uuid);
    } catch (error) {
      console.error("Error deprecating lookup table:", error);
    }
  };

  const handleAddRow = async () => {
    try {
      await createRow.mutateAsync({
        lookupTableId: uuid,
        ...rowFormData,
      });
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  const handleEditRow = (row: LookupTableRow) => {
    setEditingRow(row);
    setRowFormData({
      inputCondition: row.inputCondition || "",
      inputValue: row.inputValue,
      outputValue: row.outputValue,
      order: row.order,
      isDefault: row.isDefault,
    });
  };

  const handleUpdateRow = async () => {
    if (!editingRow) return;
    try {
      await updateRow.mutateAsync({
        uuid: editingRow.uuid,
        ...rowFormData,
      });
    } catch (error) {
      console.error("Error updating row:", error);
    }
  };

  const handleDeleteRow = (row: LookupTableRow) => {
    openDeleteConfirm(row);
  };

  const confirmDeleteRow = async () => {
    if (selectedRow) {
      try {
        await deleteRow.mutateAsync(selectedRow.uuid);
        closeDeleteConfirm();
      } catch (error) {
        console.error("Error deleting row:", error);
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case LookupTableStatus.DRAFT:
        return "secondary";
      case LookupTableStatus.PUBLISHED:
        return "default";
      case LookupTableStatus.DEPRECATED:
        return "outline";
      default:
        return "secondary";
    }
  };

  const availableVariables = publishedVariables.data?.filter(v => v.status === "published") || [];

  if (lookupTable.isLoading) {
    return <DefaultSkeleton count={5} className="m-6" />;
  }

  if (!lookupTable.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Lookup Table Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The lookup table you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => router.push("/decisioning/lookup-tables")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lookup Tables
        </Button>
      </div>
    );
  }

  const table = lookupTable.data;
  const isDraft = table.status === LookupTableStatus.DRAFT;
  const isPublished = table.status === LookupTableStatus.PUBLISHED;

  return (
    <div className="flex flex-col grow max-w-[100vw] p-4 md:p-4">
      <ErrorBoundary>
        <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/decisioning/lookup-tables")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{table.name || "Unnamed Table"}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusBadgeVariant(table.status || "unknown")} className="capitalize">
                    {table.status || "Unknown Status"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">v{table.version || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isDraft && !editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {editMode && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateLookupTable.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateLookupTable.isPending ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
              {isDraft && !editMode && (
                <Button size="sm" onClick={handlePublish} disabled={publishLookupTable.isPending}>
                  {publishLookupTable.isPending ? "Publishing..." : "Publish"}
                </Button>
              )}
              {isPublished && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeprecate}
                  disabled={deprecateLookupTable.isPending}
                >
                  {deprecateLookupTable.isPending ? "Deprecating..." : "Deprecate"}
                </Button>
              )}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rows">Lookup Rows ({table.rows?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Name</Label>
                          <p className="text-sm text-muted-foreground">{table.name}</p>
                        </div>
                        {table.description && (
                          <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm text-muted-foreground">{table.description}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="inputVariableId">Input Variable</Label>
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="outputName">Output Name</Label>
                            <Input
                              id="outputName"
                              value={formData.outputName}
                              onChange={(e) => setFormData({ ...formData, outputName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="outputDataType">Output Data Type</Label>
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
                        <div className="space-y-2">
                          <Label htmlFor="defaultValue">Default Value</Label>
                          <Input
                            id="defaultValue"
                            value={formData.defaultValue}
                            onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Input Variable</Label>
                          <p className="text-sm text-muted-foreground">
                            {table.inputVariableName || "Unknown Variable"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Output Name</Label>
                            <p className="text-sm text-muted-foreground">{table.outputName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Output Data Type</Label>
                            <p className="text-sm text-muted-foreground capitalize">{table.outputDataType}</p>
                          </div>
                        </div>
                        {table.defaultValue && (
                          <div>
                            <Label className="text-sm font-medium">Default Value</Label>
                            <p className="text-sm text-muted-foreground">{table.defaultValue}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {table.createdAt ? formatDistanceToNow(new Date(table.createdAt), { addSuffix: true }) : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {table.updatedAt ? formatDistanceToNow(new Date(table.updatedAt), { addSuffix: true }) : "Unknown"}
                      </p>
                    </div>
                    {table.publishedAt && (
                      <div>
                        <Label className="text-sm font-medium">Published</Label>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(table.publishedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Version</Label>
                      <p className="text-sm text-muted-foreground">v{table.version}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rows" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lookup Rows</h3>
                {isDraft && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddRowDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Row
                    </Button>
                  </div>
                )}
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Input Value</TableHead>
                        <TableHead>Input Condition</TableHead>
                        <TableHead>Output Value</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Default</TableHead>
                        {isDraft && <TableHead className="w-[100px]">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.rows && table.rows.length > 0 ? (
                        table.rows
                          .sort((a, b) => a.order - b.order)
                          .map((row) => (
                            <TableRow key={row.uuid}>
                              <TableCell className="font-medium">{row.inputValue}</TableCell>
                              <TableCell>{row.inputCondition || "-"}</TableCell>
                              <TableCell>{row.outputValue}</TableCell>
                              <TableCell>{row.order}</TableCell>
                              <TableCell>
                                {row.isDefault ? (
                                  <Badge variant="secondary">Default</Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              {isDraft && (
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditRow(row)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteRow(row)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={isDraft ? 6 : 5} className="text-center py-8 text-muted-foreground">
                            No lookup rows found. Add some rows to define the mapping logic.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add/Edit Row Dialog */}
          <Dialog open={isAddRowDialogOpen || !!editingRow} onOpenChange={(open) => {
            if (!open) {
              setIsAddRowDialogOpen(false);
              setEditingRow(null);
              resetRowForm();
            }
          }}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">
                  {editingRow ? "Edit Lookup Row" : "Add Lookup Row"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="inputValue">Input Value *</Label>
                  <Input
                    id="inputValue"
                    placeholder="Enter input value to match"
                    value={rowFormData.inputValue}
                    onChange={(e) => setRowFormData({ ...rowFormData, inputValue: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inputCondition">Input Condition</Label>
                  <Input
                    id="inputCondition"
                    placeholder="e.g., >=18, ADMIN, range:10-20 (optional)"
                    value={rowFormData.inputCondition}
                    onChange={(e) => setRowFormData({ ...rowFormData, inputCondition: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional condition for more complex matching logic
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="outputValue">Output Value *</Label>
                  <Input
                    id="outputValue"
                    placeholder="Enter output value to return"
                    value={rowFormData.outputValue}
                    onChange={(e) => setRowFormData({ ...rowFormData, outputValue: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min="0"
                      value={rowFormData.order}
                      onChange={(e) => setRowFormData({ ...rowFormData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={rowFormData.isDefault}
                      onChange={(e) => setRowFormData({ ...rowFormData, isDefault: e.target.checked })}
                    />
                    <Label htmlFor="isDefault">Default row</Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  className="modal-button"
                  onClick={() => {
                    setIsAddRowDialogOpen(false);
                    setEditingRow(null);
                    resetRowForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="modal-button"
                  onClick={editingRow ? handleUpdateRow : handleAddRow}
                  disabled={!rowFormData.inputValue || !rowFormData.outputValue || createRow.isPending || updateRow.isPending}
                >
                  {editingRow
                    ? updateRow.isPending ? "Updating..." : "Update Row"
                    : createRow.isPending ? "Adding..." : "Add Row"
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Row Confirmation Dialog */}
          <Dialog open={deleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
            <DialogContent className="modal-content">
              <DialogHeader className="modal-header">
                <DialogTitle className="modal-title">Delete Lookup Row</DialogTitle>
              </DialogHeader>
              <div className="modal-section">
                <p className="modal-text">
                  Are you sure you want to delete this lookup row? This action cannot be undone.
                </p>
                {selectedRow && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      <strong>Input:</strong> {selectedRow.inputValue}
                      {selectedRow.inputCondition && ` (${selectedRow.inputCondition})`}
                    </p>
                    <p className="text-sm">
                      <strong>Output:</strong> {selectedRow.outputValue}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  className="modal-button"
                  onClick={closeDeleteConfirm}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="modal-button"
                  onClick={confirmDeleteRow}
                  disabled={deleteRow.isPending}
                >
                  {deleteRow.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default memo(LookupTableDetailPage);
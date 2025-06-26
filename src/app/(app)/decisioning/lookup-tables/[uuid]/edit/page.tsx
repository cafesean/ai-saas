"use client";

import { useState, use, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Download, Upload, FileSpreadsheet, ExternalLink, Check, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LookupTableEditor } from "../../components/lookup-table-editor";
import { api } from "@/utils/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { backendToFrontend, frontendToBackend } from "../../lib/data-transformers";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { toast } from "sonner";
import { getTimeAgo } from "@/utils/func";

// Import shared styles
import {
  pageStyles,
  headerStyles,
  tabStyles,
  buttonStyles,
  getStatusColor,
} from "@/lib/shared-styles";
import { cn } from "@/lib/utils";

export default function EditLookupTablePage({ params }: { params: Promise<{ uuid: string; }>; }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testInputs, setTestInputs] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isEditingVariables, setIsEditingVariables] = useState(false);
  const [currentFrontendData, setCurrentFrontendData] = useState<any>(null);
  const { uuid } = use(params);

  // Fetch available variables
  const { data: variables } = api.variable.getAll.useQuery();

  // Fetch lookup table from API
  const {
    data: lookupTable,
    isLoading: isFetching,
    error,
    refetch,
  } = api.lookupTable.getByUuid.useQuery({ uuid });

  // Track original data for change detection
  useEffect(() => {
    if (lookupTable) {
      const frontendData = backendToFrontend(lookupTable as any);
      setOriginalData(frontendData);
      setCurrentFrontendData(frontendData);
    }
  }, [lookupTable]);

  // Update mutation - keeping existing save flow
  const updateMutation = api.lookupTable.update.useMutation({
    onSuccess: () => {
      toast.success("Lookup table saved successfully");
      refetch(); // Refetch the data to get latest changes
      setHasChanges(false);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Failed to update lookup table:", error);
      toast.error("Failed to save lookup table");
      setIsLoading(false);
    },
  });

  // Publish mutation
  const publishMutation = api.lookupTable.publish.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Table published successfully");
    },
    onError: (error: any) => {
      console.error("Failed to publish table:", error);
      toast.error("Failed to publish table");
    },
  });

  // Deprecate mutation  
  const deprecateMutation = api.lookupTable.deprecate.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Table deprecated successfully");
    },
    onError: (error: any) => {
      console.error("Failed to deprecate table:", error);
      toast.error("Failed to deprecate table");
    },
  });

  // Update name mutation - we'll need to use the full update with current data
  const updateNameMutation = api.lookupTable.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditingName(false);
      toast.success("Table name updated successfully");
    },
    onError: (error: any) => {
      console.error("Failed to update table name:", error);
      toast.error("Failed to update table name");
    },
  });

  // Save handler that tracks changes
  const handleSave = async (data: any) => {
    if (!lookupTable || !hasChanges) return;

    setIsLoading(true);
    try {
      // Convert frontend data to backend format
      const backendData = frontendToBackend(data);

      await updateMutation.mutateAsync({
        id: lookupTable.id,
        ...backendData,
      });
    } catch (error) {
      console.error("Error saving lookup table:", error);
      setIsLoading(false);
    }
  };

  // Handler to detect changes in the editor - memoized to prevent infinite re-renders
  const handleEditorChange = useCallback((newData: any) => {
    setCurrentFrontendData(newData);
    if (originalData) {
      const hasDataChanged = JSON.stringify(newData) !== JSON.stringify(originalData);
      setHasChanges(hasDataChanged);
    }
  }, [originalData]);

  const handleTest = (data: any) => {
    setIsTestDialogOpen(true);
    // Initialize test inputs based on current data structure
    if (data.inputVariable1) {
      setTestInputs({
        [data.inputVariable1.name]: data.inputVariable1.dataType === 'number' ? 0 : '',
        ...(data.inputVariable2 ? { [data.inputVariable2.name]: data.inputVariable2.dataType === 'number' ? 0 : '' } : {})
      });
    }
    setTestResult(null);
  };

  const runTest = async (data: any) => {
    if (!data || Object.keys(testInputs).length === 0) return;

    setIsRunningTest(true);
    try {
      // Simulate lookup logic
      const input1Value = testInputs[data.inputVariable1.name];
      const input2Value = data.inputVariable2 ? testInputs[data.inputVariable2.name] : null;

      // Find matching bins
      let matchingRow = null;
      let matchingCol = null;

      // Find row bin
      for (const bin of data.dimension1Bins) {
        if (bin.binType === 'exact') {
          if (bin.exactValue === input1Value.toString()) {
            matchingRow = bin.id;
            break;
          }
        } else if (bin.binType === 'range') {
          const numValue = Number(input1Value);
          if (numValue >= bin.rangeMin && numValue < bin.rangeMax) {
            matchingRow = bin.id;
            break;
          }
        }
      }

      // Find column bin if 2D
      if (data.inputVariable2 && input2Value !== null) {
        for (const bin of data.dimension2Bins) {
          if (bin.binType === 'exact') {
            if (bin.exactValue === input2Value.toString()) {
              matchingCol = bin.id;
              break;
            }
          } else if (bin.binType === 'range') {
            const numValue = Number(input2Value);
            if (numValue >= bin.rangeMin && numValue < bin.rangeMax) {
              matchingCol = bin.id;
              break;
            }
          }
        }
      }

      // Get result from cells
      const cellKey = matchingCol ? `${matchingRow}-${matchingCol}` : matchingRow;
      const result = cellKey && data.cells[cellKey] ? data.cells[cellKey] : 'No match found';

      setTestResult({
        inputs: { ...testInputs },
        output: result,
        matchedRow: matchingRow,
        matchedCol: matchingCol,
        timestamp: new Date().toISOString()
      });

      // TODO: Save to test history
      toast.success("Test completed successfully");
    } catch (error) {
      console.error("Test failed:", error);
      toast.error("Test failed");
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleStatusToggle = (checked: boolean) => {
    if (!lookupTable) return;
    if (checked) {
      publishMutation.mutate({ id: lookupTable.id });
    } else {
      deprecateMutation.mutate({ id: lookupTable.id });
    }
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handleImport = () => {
    toast.info("Import functionality coming soon");
  };

  // Variable update handlers
  const updateVariable = (type: 'input1' | 'input2' | 'output', variableId: string | null) => {
    if (!currentFrontendData) return;

    const updatedData = { ...currentFrontendData };

    if (type === 'input1' && variableId) {
      const variable = variables?.find(v => v.id.toString() === variableId);
      if (variable) {
        updatedData.inputVariable1 = {
          id: variable.id,
          name: variable.name,
          dataType: variable.dataType
        };
        // Reset dimension1Bins when changing input variable
        updatedData.dimension1Bins = updatedData.dimension1Bins.map((bin: any) => ({
          ...bin,
          binType: variable.dataType === "number" ? "range" : "exact",
          exactValue: variable.dataType === "string" ? "" : undefined,
          rangeMin: variable.dataType === "number" ? 0 : undefined,
          rangeMax: variable.dataType === "number" ? 100 : undefined,
          isValid: false,
          validationError: "Reconfigure after variable change",
        }));
        // Clear cells as they may no longer be valid
        updatedData.cells = {};
      }
    } else if (type === 'input2') {
      if (variableId === null || variableId === 'none') {
        // Remove secondary variable (switch to 1D)
        updatedData.inputVariable2 = undefined;
        updatedData.dimension2Bins = [];
        // Convert 2D cells to 1D
        const newCells: Record<string, string> = {};
        Object.entries(updatedData.cells).forEach(([key, value]: [string, any]) => {
          const rowKey = key.split('-')[0];
          if (rowKey) {
            newCells[rowKey] = value;
          }
        });
        updatedData.cells = newCells;
      } else {
        const variable = variables?.find(v => v.id.toString() === variableId);
        if (variable) {
          updatedData.inputVariable2 = {
            id: variable.id,
            name: variable.name,
            dataType: variable.dataType
          };
          // Add default column if none exist
          if (updatedData.dimension2Bins.length === 0) {
            updatedData.dimension2Bins = [{
              id: `col-${Date.now()}`,
              label: "Column 1",
              binType: variable.dataType === "number" ? "range" : "exact",
              exactValue: variable.dataType === "string" ? "" : undefined,
              rangeMin: variable.dataType === "number" ? 0 : undefined,
              rangeMax: variable.dataType === "number" ? 100 : undefined,
              isMinInclusive: true,
              isMaxInclusive: false,
              isValid: false,
              validationError: "Configuration required",
            }];
          } else {
            // Update existing bins for new data type
            updatedData.dimension2Bins = updatedData.dimension2Bins.map((bin: any) => ({
              ...bin,
              binType: variable.dataType === "number" ? "range" : "exact",
              exactValue: variable.dataType === "string" ? "" : undefined,
              rangeMin: variable.dataType === "number" ? 0 : undefined,
              rangeMax: variable.dataType === "number" ? 100 : undefined,
              isValid: false,
              validationError: "Reconfigure after variable change",
            }));
          }
          // Clear cells as they may no longer be valid
          updatedData.cells = {};
        }
      }
    } else if (type === 'output' && variableId) {
      const variable = variables?.find(v => v.id.toString() === variableId);
      if (variable) {
        updatedData.outputVariable = {
          id: variable.id,
          name: variable.name,
          dataType: variable.dataType
        };
      }
    }

    setCurrentFrontendData(updatedData);
    setHasChanges(true);
    toast.success(`${type === 'input1' ? 'Row input' : type === 'input2' ? 'Column input' : 'Output'} variable updated`);
  };

  const handleNameClick = () => {
    if (!lookupTable) return;
    setEditedName(lookupTable.name);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!lookupTable || !editedName.trim()) return;

    // Convert current data to backend format and update only the name
    const frontendData = backendToFrontend(lookupTable as any);
    const backendData = frontendToBackend({
      ...frontendData,
      name: editedName.trim(),
    });

    await updateNameMutation.mutateAsync({
      id: lookupTable.id,
      ...backendData,
    });
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  if (error) {
    return (
      <div className={pageStyles.container}>
        <Breadcrumbs
          items={[
            {
              label: "Back to Lookup Tables",
              link: "/decisioning/lookup-tables",
            },
          ]}
          title="Edit Lookup Table"
          rightChildren={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className={buttonStyles.iconWithMargin} />
              Back
            </Button>
          }
        />
        <div className={pageStyles.content}>
          <Alert variant="destructive">
            <AlertCircle className={buttonStyles.icon} />
            <AlertDescription>
              Failed to load lookup table: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className={pageStyles.container}>
        <Breadcrumbs
          items={[
            {
              label: "Back to Lookup Tables",
              link: "/decisioning/lookup-tables",
            },
          ]}
          title="Edit Lookup Table"
          rightChildren={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className={buttonStyles.iconWithMargin} />
              Back
            </Button>
          }
        />
        <div className={pageStyles.content}>
          <div className={pageStyles.loadingContainer}>
            <Loader2 className={buttonStyles.spinner} />
            <span className="ml-2">Loading lookup table...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lookupTable) {
    return (
      <div className={pageStyles.container}>
        <Breadcrumbs
          items={[
            {
              label: "Back to Lookup Tables",
              link: "/decisioning/lookup-tables",
            },
          ]}
          title="Edit Lookup Table"
          rightChildren={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className={buttonStyles.iconWithMargin} />
              Back
            </Button>
          }
        />
        <div className={pageStyles.content}>
          <Alert>
            <AlertCircle className={buttonStyles.icon} />
            <AlertDescription>
              Lookup table not found
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Convert backend data to frontend format for editing
  const frontendData = backendToFrontend(lookupTable as any);
  const displayData = currentFrontendData || frontendData;
  const is2D = displayData.inputVariable2 !== undefined;

  return (
    <div className={pageStyles.container}>
      {/* Breadcrumbs with Actions */}
      <Breadcrumbs
        items={[
          {
            label: "Back to Lookup Tables",
            link: "/decisioning/lookup-tables",
          },
        ]}
        rightChildren={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className={buttonStyles.iconWithMargin} />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                <Download className={buttonStyles.iconWithMargin} />
                Export Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImport}>
                <Upload className={buttonStyles.iconWithMargin} />
                Import Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className={buttonStyles.iconWithMargin} />
                View as Spreadsheet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ExternalLink className={buttonStyles.iconWithMargin} />
                Open API Reference
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Header Section */}
      <div className={headerStyles.section}>
        <div className={headerStyles.container}>
          <div className={headerStyles.layout}>
            <div>
              <div className={headerStyles.titleWithIcon}>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleNameKeyDown}
                      onBlur={handleNameCancel}
                      autoFocus
                      className="text-2xl font-bold border-none p-0 h-auto bg-transparent focus:ring-0 focus:border-none"
                    />
                    <Button size="sm" variant="outline" onClick={handleNameSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleNameCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <h2
                    className={cn(headerStyles.title, "cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1")}
                    onClick={handleNameClick}
                  >
                    {lookupTable.name}
                  </h2>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("px-2 py-1 rounded text-xs", getStatusColor(lookupTable.status))}>
                  {lookupTable.status}
                </Badge>
                <Badge variant="outline">v{lookupTable.version}</Badge>
                {is2D ? (
                  <Badge variant="outline">2D Matrix</Badge>
                ) : (
                  <Badge variant="outline">1D Lookup</Badge>
                )}
              </div>
              <div className={headerStyles.subtitle}>
                {lookupTable.description && (
                  <span className="text-muted-foreground">{lookupTable.description} • </span>
                )}
                {lookupTable.dimensionBins?.length || 0} dimensions • Last updated{" "}
                {lookupTable.updatedAt ? getTimeAgo(lookupTable.updatedAt) : ""}
              </div>
            </div>

            <div className={headerStyles.actions}>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleTest(displayData)}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </Button>
                <div className={headerStyles.statusToggle}>
                  <Label htmlFor="table-active">Active</Label>
                  <Switch
                    id="table-active"
                    checked={lookupTable.status === "published"}
                    onCheckedChange={handleStatusToggle}
                    disabled={publishMutation.isPending || deprecateMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={pageStyles.main}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={tabStyles.list}>
            <TabsTrigger value="editor">Table Editor</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className={tabStyles.content}>
            <LookupTableEditor
              initialData={frontendData}
              currentData={currentFrontendData}
              onSave={handleSave}
              onTest={handleTest}
              onChange={handleEditorChange}
              isLoading={isLoading}
              hasChanges={hasChanges}
            />
          </TabsContent>

          <TabsContent value="versions" className={tabStyles.content}>
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Track changes and versions of this lookup table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{lookupTable.version}</span>
                        <span className={cn("px-2 py-1 rounded text-xs", getStatusColor(lookupTable.status))}>
                          {lookupTable.status}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {lookupTable.updatedAt ? getTimeAgo(lookupTable.updatedAt) : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current version • {Object.keys(frontendData.cells).length} cells configured
                    </p>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    Additional version history will appear here as changes are made
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className={tabStyles.content}>
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <CardDescription>View test results and performance metrics for different versions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Test history will appear here when you run tests on this lookup table
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Run Test</DialogTitle>
            <DialogDescription>
              Enter input values to test your lookup table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Input fields based on variables */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="input1">{frontendData.inputVariable1?.name} ({frontendData.inputVariable1?.dataType})</Label>
                <Input
                  id="input1"
                  type={frontendData.inputVariable1?.dataType === 'number' ? 'number' : 'text'}
                  value={testInputs[frontendData.inputVariable1?.name] || ''}
                  onChange={(e) => setTestInputs(prev => ({
                    ...prev,
                    [frontendData.inputVariable1?.name]: frontendData.inputVariable1?.dataType === 'number'
                      ? Number(e.target.value)
                      : e.target.value
                  }))}
                  placeholder={`Enter ${frontendData.inputVariable1?.name}`}
                />
              </div>
              {frontendData.inputVariable2 && (
                <div>
                  <Label htmlFor="input2">{frontendData.inputVariable2.name} ({frontendData.inputVariable2.dataType})</Label>
                  <Input
                    id="input2"
                    type={frontendData.inputVariable2.dataType === 'number' ? 'number' : 'text'}
                    value={testInputs[frontendData.inputVariable2.name] || ''}
                    onChange={(e) => setTestInputs(prev => ({
                      ...prev,
                      [frontendData.inputVariable2!.name]: frontendData.inputVariable2!.dataType === 'number'
                        ? Number(e.target.value)
                        : e.target.value
                    }))}
                    placeholder={`Enter ${frontendData.inputVariable2.name}`}
                  />
                </div>
              )}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className="border rounded-lg p-3 bg-muted/50">
                <Label className="text-sm font-medium">Result</Label>
                <div className="mt-1">
                  <div className="text-lg font-semibold">{testResult.output}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tested at {new Date(testResult.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => runTest(frontendData)} disabled={isRunningTest}>
                {isRunningTest ? "Running..." : "Run Test"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

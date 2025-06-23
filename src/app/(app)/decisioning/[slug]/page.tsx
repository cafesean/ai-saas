"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import {
  ExternalLink,
  FileSpreadsheet,
  MoreHorizontal,
  Plus,
  Save,
  Download,
  Upload,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { api, useUtils } from "@/utils/trpc";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { SampleButton } from "@/components/ui/sample-button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { AppRoutes } from "@/constants/routes";
import FullScreenLoading from "@/components/ui/FullScreenLoading";
import {
  DecisionStatus,
  DecisionTableRowTypes,
} from "@/constants/decisionTable";
import { getTimeAgo } from "@/utils/func";
import DecisionRuleTable from "../components/DecisionRuleTable";
import {
  InputColumn,
  OutputColumn,
  DecisionTable,
  DecisionTableRow,
} from "@/types/DecisionTable";
import {
  DefaultDecisionTableInputCondition,
  DefaultDecisionTableOutputResult,
} from "@/constants/decisionTable";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import LoadingSkelenton from "./components/LoadingSkelenton";

const DefaultRowOrder = 999;

const DecisionTableDetailPage = () => {
  // Find the table based on the ID
  const params = useParams();
  const slug = params.slug as string;
  const [table, setTable] = useState<DecisionTable | null>(null);
  const [rows, setRows] = useState<DecisionTableRow[]>([]);
  const [inputs, setInputs] = useState<InputColumn[]>([]);
  const [outputs, setOutputs] = useState<OutputColumn[]>([]);
  const [updating, setUpdating] = useState(false);

  // tRPC hooks
  const utils = useUtils();
  const publishedVariables = api.variable.getPublished.useQuery();
  const decisionTable = api.decisionTable.getByUUID.useQuery(slug);
  const updateStatus = api.decisionTable.updateStatus.useMutation({
    onSuccess: () => {
      utils.decisionTable.getByUUID.invalidate();
      utils.decisionTable.getByStatus.refetch();
    },
  });
  const updateDecisionTable = api.decisionTable.update.useMutation({
    onSuccess: () => {
      utils.decisionTable.getByUUID.invalidate();
      toast.success("Decision table updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Load the table data
  useEffect(() => {
    if (decisionTable && !decisionTable.isLoading && decisionTable.data) {
      const decisionTableData: any = decisionTable.data;
      if (decisionTableData) {
        setTable(decisionTableData);
        setInputs(
          decisionTableData.inputs?.map((input: any) => ({
            ...input,
            dt_id: decisionTableData.uuid,
          })) || [],
        );
        setOutputs(decisionTableData.outputs || []);
        setRows(
          decisionTableData.rows?.map((row: any) => ({
            ...row,
            decisionTableInputConditions: row.inputConditions || [],
            decisionTableOutputResults: row.outputResults || [],
          })) || [],
        );
      }
    }
  }, [decisionTable?.isLoading, decisionTable?.data]);

  const haveDefaultRow = useMemo(() => {
    // Find whether have type is Default row
    const defaultRows = rows.find(
      (row) => row.type === DecisionTableRowTypes.DEFAULT,
    );
    return !!defaultRows;
  }, [rows]);

  const addNewInput = (newInput: InputColumn) => {
    // Add new Input
    setInputs([
      ...inputs,
      {
        ...newInput,
        dt_id: table?.id,
      },
    ]);
    // Add new InputCondition for each row
    setRows(
      rows.map((row) => {
        return {
          ...row,
          decisionTableInputConditions: [
            ...row.decisionTableInputConditions,
            {
              uuid: uuidv4(),
              ...DefaultDecisionTableInputCondition,
              dt_input_id: newInput.uuid,
              dt_row_id: row.uuid,
            },
          ],
        };
      }),
    );
  };

  const removeInput = (inputId: string | undefined) => {
    // Remove Input
    setInputs(inputs.filter((input) => input.uuid !== inputId));
    // Remove InputCondition for each row
    setRows(
      rows.map((row) => {
        return {
          ...row,
          decisionTableInputConditions: row.decisionTableInputConditions.filter(
            (condition) => condition.dt_input_id !== inputId,
          ),
        };
      }),
    );
  };

  const addNewOutput = (newOutput: OutputColumn) => {
    // Add new Output
    setOutputs([
      ...outputs,
      {
        ...newOutput,
        dt_id: table?.id,
      },
    ]);
    // Add new OutputResult for each row
    setRows(
      rows.map((row) => {
        return {
          ...row,
          decisionTableOutputResults: [
            ...row.decisionTableOutputResults,
            {
              uuid: uuidv4(),
              ...DefaultDecisionTableOutputResult,
              dt_output_id: newOutput.uuid,
              dt_row_id: row.uuid,
            },
          ],
        };
      }),
    );
  };

  const removeOutput = (outputId: string | undefined) => {
    setOutputs(outputs.filter((output) => output.uuid !== outputId));
    setRows(
      rows.map((row) => {
        return {
          ...row,
          decisionTableOutputResults: row.decisionTableOutputResults.filter(
            (outputResult) => outputResult.dt_output_id !== outputId,
          ),
        };
      }),
    );
  };

  const addNewRow = () => {
    // Find the highest order value in rows except 999
    const highestOrder = rows.reduce(
      (max, row) =>
        row.order === DefaultRowOrder ? max : Math.max(max, row.order || 1),
      0,
    );
    const newRowID = uuidv4();
    const newRow: DecisionTableRow = {
      uuid: newRowID,
      order: highestOrder + 1,
      type: DecisionTableRowTypes.NORMAL,
      dt_id: table?.id,
      decisionTableInputConditions: inputs.map((input) => {
        return {
          uuid: uuidv4(),
          ...DefaultDecisionTableInputCondition,
          dt_input_id: input.uuid,
          dt_row_id: newRowID,
        };
      }),
      decisionTableOutputResults: outputs.map((output) => {
        return {
          uuid: uuidv4(),
          ...DefaultDecisionTableOutputResult,
          dt_output_id: output.uuid,
          dt_row_id: newRowID,
        };
      }),
    };
    if (haveDefaultRow) {
      // Insert the new row before the Default row
      const defaultRow = rows.find(
        (row) => row.type === DecisionTableRowTypes.DEFAULT,
      );
      setRows([
        ...rows.slice(0, rows.indexOf(defaultRow!)),
        newRow,
        ...rows.slice(rows.indexOf(defaultRow!)),
      ]);
    } else {
      setRows([...rows, newRow]);
    }
  };

  const addDefaultRow = () => {
    const newRowID = uuidv4();
    const newRow: DecisionTableRow = {
      uuid: newRowID,
      order: DefaultRowOrder,
      dt_id: table?.id,
      type: DecisionTableRowTypes.DEFAULT,
      decisionTableInputConditions: inputs.map((input) => {
        return {
          uuid: uuidv4(),
          ...DefaultDecisionTableInputCondition,
          dt_input_id: input.uuid,
          dt_row_id: newRowID,
        };
      }),
      decisionTableOutputResults: outputs.map((output) => {
        return {
          uuid: uuidv4(),
          ...DefaultDecisionTableOutputResult,
          dt_output_id: output.uuid,
          dt_row_id: newRowID,
        };
      }),
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (rowUUID: string | undefined) => {
    setRows(rows.filter((row) => row.uuid !== rowUUID));
  };

  const updateCondition = (
    rowUUID: string | undefined,
    inputId: number | string | undefined,
    field: string,
    value: string,
  ) => {
    setRows(
      rows.map((row) => {
        if (row.uuid === rowUUID) {
          return {
            ...row,
            decisionTableInputConditions: row.decisionTableInputConditions.map(
              (condition) => {
                if (condition.dt_input_id === inputId) {
                  return {
                    ...condition,
                    [field]: value,
                  };
                }
                return condition;
              },
            ),
          };
        }
        return row;
      }),
    );
  };

  const updateOutputResult = (
    rowUUID: string | undefined,
    outputId: number | string | undefined,
    field: string,
    value: string,
  ) => {
    setRows(
      rows.map((row) => {
        if (row.uuid === rowUUID) {
          return {
            ...row,
            decisionTableOutputResults: row.decisionTableOutputResults.map(
              (outputResult) => {
                if (outputResult.dt_output_id === outputId) {
                  return {
                    ...outputResult,
                    [field]: value,
                  };
                }
                return outputResult;
              },
            ),
          };
        }
        return row;
      }),
    );
  };

  const doUpdateStatus = (status: string) => {
    if (!table || !table.uuid) return;
    updateStatus.mutate({
      uuid: table.uuid,
      status: status,
    });
  };

  const doUpdateDecisionTable = async () => {
    if (!table || !table.uuid) return;
    setUpdating(true);
    await updateDecisionTable.mutate({
      uuid: table.uuid,
      name: table.name || "",
      description: table.description || "",
      status: table.status || "",
      decisionTableInputs: inputs,
      decisionTableOutputs: outputs,
      decisionTableRows: rows,
    });
    setUpdating(false);
  };

  const handleRowOrderUpdate = (newOrder: DecisionTableRow[]) => {
    setRows(newOrder);
  };

  if (decisionTable?.error) {
    console.error("Model query error:", decisionTable.error);
    return (
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">
          Error loading Decision Table.
        </h2>
        <p className="mb-2">{decisionTable.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {decisionTable.error.data &&
            JSON.stringify(decisionTable.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }
  return (
    <ErrorBoundary>
      <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
        {!decisionTable.isLoading ? (
          <div className="flex min-h-screen w-full flex-col bg-background">
            <Breadcrumbs
              items={[
                {
                  label: "Back to Decisioning",
                  link: AppRoutes.decisionTables,
                },
              ]}
              rightChildren={
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SampleButton variant="outline" size="sm">
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Actions
                      </SampleButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export Table
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Rules
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        View as Spreadsheet
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open API Reference
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <SampleButton onClick={doUpdateDecisionTable}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </SampleButton>
                </>
              }
            />

            <div className="border-b">
              <div className="py-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{table?.name}</h2>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {table?.decisionTableRows?.length} rows • Last updated{" "}
                      {table?.updatedAt ? getTimeAgo(table?.updatedAt) : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="table-active">Active</Label>
                      <Switch
                        id="table-active"
                        checked={table?.status === DecisionStatus.ACTIVE}
                        onCheckedChange={(checked: boolean) => {
                          setTable((prev: any) => ({
                            ...prev,
                            status: checked
                              ? DecisionStatus.ACTIVE
                              : DecisionStatus.INACTIVE,
                          }));
                          doUpdateStatus(
                            checked
                              ? DecisionStatus.ACTIVE
                              : DecisionStatus.INACTIVE,
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <main className="flex-1 p-6 space-y-8">
              <Tabs defaultValue="editor">
                <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-none md:flex">
                  <TabsTrigger value="editor">Table Editor</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="space-y-6 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Decision Table Rules
                    </h3>
                    <div className="space-x-2">
                      <SampleButton
                        disabled={haveDefaultRow}
                        onClick={addDefaultRow}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Default Rule
                      </SampleButton>
                      <SampleButton onClick={addNewRow}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rule
                      </SampleButton>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <DecisionRuleTable
                      inputs={inputs}
                      outputs={outputs}
                      rows={rows}
                      updateCondition={updateCondition}
                      updateOutputResult={updateOutputResult}
                      removeRow={removeRow}
                      updateRowOrder={handleRowOrderUpdate}
                      variables={publishedVariables.data || []}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="schema" className="space-y-6 pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Inputs Section */}
                    <InputPanel
                      inputs={inputs}
                      addNewInput={addNewInput}
                      removeInput={removeInput}
                      variables={publishedVariables.data || []}
                    />

                    {/* Outputs Section */}
                    <OutputPanel
                      outputs={outputs}
                      addNewOutput={addNewOutput}
                      removeOutput={removeOutput}
                      variables={publishedVariables.data || []}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </main>
            {updating && <FullScreenLoading />}
          </div>
        ) : (
          <LoadingSkelenton />
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default DecisionTableDetailPage;

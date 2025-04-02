import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { SampleInput } from "@/components/ui/sample-input";
import { SampleButton } from "@/components/ui/sample-button";
import {
  InputColumn,
  OutputColumn,
  DecisionTableRow,
} from "@/types/DecisionTable";

const DecisionRuleTable = ({
  inputs,
  outputs,
  rows,
  updateCondition,
  updateOutputResult,
  removeRow,
}: {
  inputs: InputColumn[];
  outputs: OutputColumn[];
  rows: DecisionTableRow[];
  updateCondition: (
    rowUUID: string | undefined,
    inputId: number | string | undefined,
    field: string,
    value: string,
  ) => void;
  updateOutputResult: (
    rowUUID: string | undefined,
    outputId: number | string | undefined,
    field: string,
    value: string,
  ) => void;
  removeRow: (rowUUID: string | undefined) => void;
}) => {
  return (
    <ScrollArea className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px] border-r">Rule #</TableHead>

            {/* Input Column Headers */}
            {inputs.map((input) => (
              <TableHead key={input.uuid} className="border-r min-w-[200px]">
                <div className="flex flex-col">
                  <div className="font-medium">{input.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {input.dataType}
                  </div>
                </div>
              </TableHead>
            ))}

            {/* Output Column Headers */}
            {outputs.map((output) => (
              <TableHead key={output.uuid} className="border-r min-w-[200px]">
                <div className="flex flex-col">
                  <div className="font-medium">{output.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {output.dataType}
                  </div>
                </div>
              </TableHead>
            ))}

            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.uuid}>
              <TableCell className="border-r font-medium text-center">
                {index + 1}
              </TableCell>

              {/* Input Condition Cells */}
              {inputs.map((input) => {
                const condition = row.decisionTableInputConditions.find(
                  (c) => c.dt_input_id === input.uuid,
                );
                return (
                  <TableCell
                    key={`input-${row.uuid}-${input.uuid}`}
                    className="border-r p-0"
                  >
                    <div className="flex items-center">
                      <Select
                        value={condition?.condition || "equals"}
                        onValueChange={(value) =>
                          updateCondition(
                            row.uuid,
                            input.uuid,
                            "condition",
                            value,
                          )
                        }
                      >
                        <SelectTrigger className="w-32 border-0 bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not-equals">not equals</SelectItem>
                          <SelectItem value="greater-than">
                            greater than
                          </SelectItem>
                          <SelectItem value="less-than">less than</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="starts-with">
                            starts with
                          </SelectItem>
                          <SelectItem value="ends-with">ends with</SelectItem>
                        </SelectContent>
                      </Select>

                      <SampleInput
                        value={condition?.value || ""}
                        onChange={(e) =>
                          updateCondition(
                            row.uuid,
                            input.uuid,
                            "value",
                            e.target.value,
                          )
                        }
                        className="flex-1 border-0 border-l"
                        placeholder="Enter value"
                      />
                    </div>
                  </TableCell>
                );
              })}

              {/* Output Value Cells */}
              {outputs.map((output) => {
                const outputResult = row.decisionTableOutputResults.find(
                  (o) => o.dt_output_id === output.uuid,
                );
                return (
                  <TableCell
                    key={`output-${row.uuid}-${output.uuid}`}
                    className="border-r p-2"
                  >
                    <SampleInput
                      value={outputResult?.result || ""}
                      onChange={(e) =>
                        updateOutputResult(
                          row.uuid,
                          output.uuid,
                          "result",
                          e.target.value,
                        )
                      }
                      className="w-full"
                      placeholder="Enter value"
                    />
                  </TableCell>
                );
              })}

              <TableCell>
                <SampleButton
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(row.uuid)}
                  className="h-7 w-7 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Row</span>
                </SampleButton>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={inputs.length + outputs.length + 2}
                className="text-center py-6 text-muted-foreground"
              >
                No rules defined yet. Click "Add Rule" to create your first
                decision rule.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default DecisionRuleTable;

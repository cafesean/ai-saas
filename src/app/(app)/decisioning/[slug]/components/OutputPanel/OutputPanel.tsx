import { useState } from "react";
import { FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OutputColumn } from "@/types/DecisionTable";
import { DecisionDataTypes } from "@/constants/decisionTable";

const DefaultOutput: OutputColumn = {
  variable_id: "",
  uuid: "",
};

const OutputPanel = ({
  outputs,
  variables,
  addNewOutput,
  removeOutput,
}: {
  outputs: OutputColumn[];
  variables: any[];
  addNewOutput: (newOutput: OutputColumn) => void;
  removeOutput: (outputId: string | undefined) => void;
}) => {
  const [isAddOutputDialogOpen, setIsAddOutputDialogOpen] = useState(false);
  const [newOutput, setNewOutput] = useState<OutputColumn>(DefaultOutput);
  const [nameError, setNameError] = useState<string | null>(null);

  const validateVariable = (variableId: string) => {
    if (!variableId) return "Variable is required";
    return null;
  };

  const handleVariableChange = (rawValue: string) => {
    setNewOutput({ ...newOutput, variable_id: rawValue });
    setNameError(validateVariable(rawValue));
  };

  const doAddNewOutput = () => {
    const error = validateVariable(newOutput.variable_id);
    if (error) {
      setNameError(error);
      return;
    }
    // Check whether have same name
    const isSameName = outputs.some(
      (output) => output.variable_id === newOutput.variable_id,
    );
    if (isSameName) {
      toast.error("Output variable already exists.");
      return;
    }
    addNewOutput({
      ...newOutput,
      uuid: uuidv4(),
    });
    setIsAddOutputDialogOpen(false);
    resetForm();
  };

  const doOpenChange = (isOpen: boolean) => {
    setIsAddOutputDialogOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setNewOutput(DefaultOutput);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Outputs</h3>
        <Dialog open={isAddOutputDialogOpen} onOpenChange={doOpenChange}>
          <DialogTrigger asChild>
            <SampleButton size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Output
            </SampleButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Output Column</DialogTitle>
              <DialogDescription>
                Define a new output column for your decision table
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="output-name">Name</Label>
                <Select
                  value={newOutput.variable_id || ""}
                  onValueChange={handleVariableChange}
                >
                  <SelectTrigger id="input-name">
                    <SelectValue placeholder="Select variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {variables.map((va) => (
                      <SelectItem
                        key={`input-variable-${va.uuid}`}
                        value={va.uuid}
                      >
                        {va.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <SampleButton
                variant="outline"
                onClick={() => doOpenChange(false)}
              >
                Cancel
              </SampleButton>
              <SampleButton
                onClick={doAddNewOutput}
                disabled={!newOutput.variable_id}
              >
                Add Output
              </SampleButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        {outputs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outputs.map((output) => {
                const variable = variables.find(
                  (va) => va.uuid === output.variable_id,
                );
                return (
                  <TableRow key={`output-${output.uuid}`}>
                    <TableCell>
                      <div className="font-medium">{variable.name}</div>
                      {variable.description && (
                        <div className="text-xs text-muted-foreground">
                          {variable.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{variable.dataType}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SampleButton
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeOutput(output.uuid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </SampleButton>
                          </TooltipTrigger>
                          <TooltipContent>Delete Output</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <FileSpreadsheet className="h-8 w-8 mx-auto mb-2" />
            <p>No outputs defined</p>
            <p className="text-sm">
              Add outputs to define your decision results
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;

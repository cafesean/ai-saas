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
import { InputColumn } from "@/types/DecisionTable";
import { VariableDataTypes } from "@/db/schema/variable";

const DefaultInput: InputColumn = {
  variable_id: "",
  uuid: "",
};

const InputPanel = ({
  inputs,
  variables,
  addNewInput,
  removeInput,
}: {
  inputs: InputColumn[];
  variables: any[];
  addNewInput: (newInput: InputColumn) => void;
  removeInput: (inputId: string | undefined) => void;
}) => {
  const [isAddInputDialogOpen, setIsAddInputDialogOpen] = useState(false);
  const [newInput, setNewInput] = useState<InputColumn>(DefaultInput);
  const [nameError, setNameError] = useState<string | null>(null);

  const validateVariable = (variableId: string) => {
    if (!variableId) return "Variable is required";
    return null;
  };

  const handleVariableChange = (rawValue: string) => {
    // Find dataType from variables;
    setNewInput({ ...newInput, variable_id: rawValue });
    setNameError(validateVariable(rawValue));
  };

  const doAddNewInput = () => {
    const error = validateVariable(newInput.variable_id);
    if (error) {
      setNameError(error);
      return;
    }
    // Check whether have same name
    const isSameName = inputs.some(
      (input) => input.variable_id === newInput.variable_id,
    );
    if (isSameName) {
      toast.error("Input variable already exists.");
      return;
    }
    addNewInput({
      ...newInput,
      uuid: uuidv4(),
    });
    setIsAddInputDialogOpen(false);
    resetForm();
  };

  const doOpenChange = (isOpen: boolean) => {
    setIsAddInputDialogOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setNewInput(DefaultInput);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Inputs</h3>
        <Dialog open={isAddInputDialogOpen} onOpenChange={doOpenChange}>
          <DialogTrigger asChild>
            <SampleButton size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Input
            </SampleButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Input Column</DialogTitle>
              <DialogDescription>
                Define a new input column for your decision table
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="input-name">Variable</Label>
                <Select
                  value={newInput.variable_id || ""}
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
                onClick={doAddNewInput}
                disabled={!newInput.variable_id}
              >
                Add Input
              </SampleButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        {inputs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inputs.map((input) => {
                const variable = variables.find(
                  (va) => va.uuid === input.variable_id,
                );
                return (
                  <TableRow key={`input-${input.uuid}`}>
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
                              onClick={() => removeInput(input.uuid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </SampleButton>
                          </TooltipTrigger>
                          <TooltipContent>Delete Input</TooltipContent>
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
            <p>No inputs defined</p>
            <p className="text-sm">
              Add inputs to define your decision conditions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;

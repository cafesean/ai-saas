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
import { InputColumn } from "@/types/DecisionTable";
import { DecisionDataTypes } from "@/constants/decisionTable";

const DefaultInput: InputColumn = {
  name: "",
  dataType: "",
  description: "",
  uuid: "",
};

const InputPanel = ({
  inputs,
  addNewInput,
  removeInput,
}: {
  inputs: InputColumn[];
  addNewInput: (newInput: InputColumn) => void;
  removeInput: (inputId: string | undefined) => void;
}) => {
  const [isAddInputDialogOpen, setIsAddInputDialogOpen] = useState(false);
  const [newInput, setNewInput] = useState<InputColumn>(DefaultInput);

  const doAddNewInput = () => {
    // Check whether have same name
    const isSameName = inputs.some((input) => input.name === newInput.name);
    if (isSameName) {
      toast.error("Input name already exists.");
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
                <Label htmlFor="input-name">Name</Label>
                <SampleInput
                  id="input-name"
                  placeholder="Enter input name"
                  value={newInput.name || ""}
                  onChange={(e) =>
                    setNewInput({ ...newInput, name: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input-type">Data Type</Label>
                <Select
                  value={newInput.dataType || ""}
                  onValueChange={(value) =>
                    setNewInput({ ...newInput, dataType: value })
                  }
                >
                  <SelectTrigger id="input-type">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DecisionDataTypes.map((dataType) => (
                      <SelectItem
                        key={`dataType-${dataType.value}`}
                        value={dataType.value}
                      >
                        {dataType.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input-description">
                  Description (Optional)
                </Label>
                <SampleInput
                  id="input-description"
                  placeholder="Enter description"
                  value={newInput.description || ""}
                  onChange={(e) =>
                    setNewInput({
                      ...newInput,
                      description: e.target.value,
                    })
                  }
                />
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
                disabled={!newInput.name || !newInput.dataType}
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
              {inputs.map((input) => (
                <TableRow key={`input-${input.uuid}`}>
                  <TableCell>
                    <div className="font-medium">{input.name}</div>
                    {input.description && (
                      <div className="text-xs text-muted-foreground">
                        {input.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{input.dataType}</TableCell>
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
              ))}
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

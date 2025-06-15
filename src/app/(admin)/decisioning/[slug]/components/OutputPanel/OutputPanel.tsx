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
  name: "",
  dataType: "",
  description: "",
  uuid: "",
};

const OutputPanel = ({
  outputs,
  addNewOutput,
  removeOutput,
}: {
  outputs: OutputColumn[];
  addNewOutput: (newOutput: OutputColumn) => void;
  removeOutput: (outputId: string | undefined) => void;
}) => {
  const [isAddOutputDialogOpen, setIsAddOutputDialogOpen] = useState(false);
  const [newOutput, setNewOutput] = useState<OutputColumn>(DefaultOutput);
  const [nameError, setNameError] = useState<string | null>(null);

  const validateName = (name: string) => {
    if (!name) return "Name is required";
    if (!/^[a-z0-9_]+$/.test(name))
      return "Only lowercase letters, numbers and underscores are allowed";
    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = rawValue
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    setNewOutput({ ...newOutput, name: formattedValue });
    setNameError(validateName(formattedValue));
  };

  const doAddNewOutput = () => {
    const error = validateName(newOutput.name);
    if (error) {
      setNameError(error);
      return;
    }
    // Check whether have same name
    const isSameName = outputs.some((output) => output.name === newOutput.name);
    if (isSameName) {
      toast.error("Output name already exists.");
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
                <SampleInput
                  id="output-name"
                  placeholder="Enter output name"
                  value={newOutput.name || ""}
                  onChange={handleNameChange}
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers and underscores are allowed
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="output-type">Data Type</Label>
                <Select
                  value={newOutput.dataType || ""}
                  onValueChange={(value) =>
                    setNewOutput({ ...newOutput, dataType: value })
                  }
                >
                  <SelectTrigger id="output-type">
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
                <Label htmlFor="output-description">
                  Description (Optional)
                </Label>
                <SampleInput
                  id="output-description"
                  placeholder="Enter description"
                  value={newOutput.description || ""}
                  onChange={(e) =>
                    setNewOutput({
                      ...newOutput,
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
                onClick={doAddNewOutput}
                disabled={!newOutput.name || !newOutput.dataType}
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
              {outputs.map((output) => (
                <TableRow key={`output-${output.uuid}`}>
                  <TableCell>
                    <div className="font-medium">{output.name}</div>
                    {output.description && (
                      <div className="text-xs text-muted-foreground">
                        {output.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{output.dataType}</TableCell>
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
              ))}
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

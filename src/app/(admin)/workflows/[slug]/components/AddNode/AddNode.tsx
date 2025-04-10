import {
  Plus,
  Zap,
  Database,
  Webhook,
  FileCode,
  BrainCircuit,
  GitBranch,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { SampleButton } from "@/components/ui/sample-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AddNode = ({
  isAddNodeDialogOpen,
  setIsAddNodeDialogOpen,
  addNode,
}: {
  isAddNodeDialogOpen: boolean;
  setIsAddNodeDialogOpen: (open: boolean) => void;
  addNode: (type: string) => void;
}) => {
  return (
    <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
      <DialogTrigger asChild>
        <SampleButton size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Node
        </SampleButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
          <DialogDescription>
            Select a node type to add to your workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => addNode("trigger")}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Trigger</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start your workflow with various trigger types
              </CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => addNode("aiModel")}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">AI Model</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Use AI models for predictions and analysis
              </CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => addNode("rules")}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <FileCode className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Define business rules and conditions
              </CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => addNode("logic")}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <GitBranch className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Logic</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Control flow with branches and loops
              </CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => addNode("database")}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Database className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Database</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interact with databases and storage
              </CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => addNode("webhook")}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Webhook className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Send data to external services</CardDescription>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <SampleButton
            variant="outline"
            onClick={() => setIsAddNodeDialogOpen(false)}
          >
            Cancel
          </SampleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNode;

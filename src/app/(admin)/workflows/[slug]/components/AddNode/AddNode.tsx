import {
  Plus,
  Zap,
  Database,
  Webhook,
  FileCode,
  BrainCircuit,
  Recycle,
  FileSpreadsheet,
  MessageCircle,
  Split,
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
import { NodeTypes as WorkflowNodeTypes } from "@/constants/nodes";

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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
          <DialogDescription>
            Select a node type to add to your workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.trigger)}
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
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.aiModel)}
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
          {/* <Card
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.rules)}
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
          </Card> */}
          <Card
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.splitOut)}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Split className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Split Out</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Separate a single data item.</CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.loop)}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Recycle className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Loop</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Control flow with loops</CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.database)}
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
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.webhook)}
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
          <Card
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.decisionTable)}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">Decision Table</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Use decision tables for complex rules
              </CardDescription>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors animate-scale"
            onClick={() => addNode(WorkflowNodeTypes.whatsApp)}
          >
            <CardHeader className="pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
                <MessageCircle className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Use wahtsapp to send messages</CardDescription>
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

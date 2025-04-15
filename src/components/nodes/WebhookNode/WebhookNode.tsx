import { type NodeProps, Handle, Position, NodeToolbar } from "reactflow";

import { Trash2, Settings, Webhook } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { WorkflowNodeDataActions } from "@/constants/general";

export const WebhookNode = ({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeToolbar className="flex gap-2">
        <SampleButton
          data-type={WorkflowNodeDataActions.settings}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </SampleButton>
        <SampleButton
          data-type={WorkflowNodeDataActions.delete}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </SampleButton>
      </NodeToolbar>
      <div
        className={`rounded-md border-2 ${
          selected ? "border-primary" : "border-border"
        } bg-background p-3 shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Webhook className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{data.label}</p>
            <p className="text-xs text-muted-foreground">{data.endpoint}</p>
          </div>
        </div>
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-primary !border-primary"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-primary !border-primary"
        />
      </div>
    </>
  );
};

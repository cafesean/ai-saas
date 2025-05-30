import { type NodeProps, Handle, Position, NodeToolbar } from "reactflow";
import { Trash2, Settings, TextSearch } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { WorkflowNodeDataActions } from "@/constants/general";

export const RAGNode = ({ data, selected }: NodeProps) => {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <TextSearch className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{data.label}</p>
            <p className="text-xs text-muted-foreground">{data.model?.name}</p>
          </div>
        </div>
        {data.targetHandle &&
          data.targetHandle.length > 0 &&
          data.targetHandle.map((t: any, ti: number) => (
            <Handle
              id={t.id}
              key={`targetHandle-${ti}`}
              type="target"
              position={t.position}
              className="!bg-primary !border-primary"
            />
          ))}
        {data.sourceHandle &&
          data.sourceHandle.length > 0 &&
          data.sourceHandle.map((s: any, si: number) => (
            <Handle
              id={s.id}
              key={`sourceHandle-${si}`}
              type="source"
              position={s.position}
              className="!bg-primary !border-primary"
            />
          ))}
      </div>
    </>
  );
};

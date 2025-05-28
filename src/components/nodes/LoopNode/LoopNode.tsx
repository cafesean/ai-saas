import { type NodeProps, Handle, NodeToolbar } from "reactflow";
import { Trash2, Settings, Recycle } from "lucide-react";

import { SampleButton } from "@/components/ui/sample-button";
import { WorkflowNodeDataActions } from "@/constants/general";

export const LoopNode = ({ data, selected }: NodeProps) => {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Recycle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{data.label}</p>
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
          data.sourceHandle.map((s: any, si: number) => {
            if (s.label) {
              return (
                <div style={{ ...s.style }} key={`sourceHandle-${si}`}>
                  <span style={{ ...s.label.style }}>{s.label.name}</span>
                  <Handle
                    id={s.id}
                    type="source"
                    position={s.position}
                    style={{ position: "relative", left: "0" }}
                    className="!bg-primary !border-primary"
                  />
                </div>
              );
            }
            return (
              <Handle
                id={s.id}
                key={`source-${si}`}
                type="source"
                position={s.position}
                className="!bg-primary!border-primary"
              />
            );
          })}
      </div>
    </>
  );
};

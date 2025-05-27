import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";

export const LoopNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loop-label">Label</Label>
        <SampleInput
          id="loop-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="batch-size">Batch Size</Label>
        <SampleInput
          id="batch-size"
          placeholder=""
          value={node.data.batchSize}
          onChange={(e) => updateNodeData("batchSize", e.target.value)}
        />
      </div>
    </div>
  );
};

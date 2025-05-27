import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";

export const SplitOutNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="split-out-label">Label</Label>
        <SampleInput
          id="trigger-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="split-out-fields-to-split-out">
          Fields To Split Out
        </Label>
        <SampleInput
          id="split-out-fields-to-split-out"
          placeholder=""
          value={node.data.fieldToSplitOut}
          onChange={(e) => updateNodeData("fieldToSplitOut", e.target.value)}
        />
      </div>
    </div>
  );
};

import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";

export const DecisionTableNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="decisionTable-label">Label</Label>
        <SampleInput
          id="decisionTable-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="decisionTable-tableName">Table Name</Label>
        <SampleInput
          id="decisionTable-tableName"
          value={node.data.tableName}
          onChange={(e) => updateNodeData("tableName", e.target.value)}
        />
      </div>
    </div>
  );
};

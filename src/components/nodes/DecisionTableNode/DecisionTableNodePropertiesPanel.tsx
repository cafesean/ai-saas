import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";

export const DecisionTableNodePropertiesPanel = ({
  node,
  updateNodeData,
  decisionTables,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
  decisionTables: any[];
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
        <Select
          value={node.data.decisionTable?.uuid}
          onValueChange={(value) => {
            if (value) {
              const selectDecisionTable = decisionTables.find(
                (table) => table.uuid === value,
              );
              if (selectDecisionTable) {
                updateNodeData("decisionTable", {
                  name: selectDecisionTable.name,
                  uuid: value,
                });
              }
            }
          }}
        >
          <SelectTrigger id="model-name">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            {decisionTables.map((decisionTable) => (
              <SelectItem key={decisionTable.uuid} value={decisionTable.uuid}>
                {decisionTable.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

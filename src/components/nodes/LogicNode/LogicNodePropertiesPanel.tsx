import { Plus, Trash2 } from "lucide-react";
import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { SampleButton } from "@/components/ui/sample-button";

const LogicTypes = [
  { value: "Branch", label: "Branch" },
  { value: "Loop", label: "Loop" },
  { value: "Switch", label: "Switch" },
  { value: "Merge", label: "Merge" },
];

export const LogicNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="logic-label">Label</Label>
        <SampleInput
          id="logic-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logic-type">Logic Type</Label>
        <Select
          value={node.data.type}
          onValueChange={(value) => updateNodeData("type", value)}
        >
          <SelectTrigger id="logic-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LogicTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {node.data.type === LogicTypes[0]?.value && (
        <div className="space-y-2">
          <Label htmlFor="branch-condition">Branch Condition</Label>
          <div className="flex items-center gap-2">
            <Select defaultValue="confidence">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confidence">confidence</SelectItem>
                <SelectItem value="score">score</SelectItem>
                <SelectItem value="category">category</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="greaterThan">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">equals</SelectItem>
                <SelectItem value="greaterThan">greater than</SelectItem>
                <SelectItem value="lessThan">lessThan</SelectItem>
              </SelectContent>
            </Select>
            <SampleInput defaultValue="0.5" className="w-24" />
          </div>
        </div>
      )}

      {node.data.type === LogicTypes[1]?.value && (
        <div className="space-y-2">
          <Label htmlFor="loop-type">Loop Type</Label>
          <Select defaultValue="forEach">
            <SelectTrigger id="loop-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="forEach">For Each</SelectItem>
              <SelectItem value="while">While</SelectItem>
              <SelectItem value="doWhile">Do While</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="loop-collection" className="mt-2">
            Collection
          </Label>
          <SampleInput id="loop-collection" placeholder="items" />
        </div>
      )}

      {node.data.type === LogicTypes[2]?.value && (
        <div className="space-y-2">
          <Label htmlFor="switch-expression">Switch Expression</Label>
          <SampleInput id="switch-expression" placeholder="result.category" />
          <div className="border rounded-md mt-2">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Cases</div>
                <SampleButton variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </SampleButton>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="text-sm">"high"</div>
              <SampleButton variant="ghost" size="icon" className="h-6 w-6">
                <Trash2 className="h-4 w-4" />
              </SampleButton>
            </div>
            <div className="p-3 flex items-center justify-between border-t">
              <div className="text-sm">"medium"</div>
              <SampleButton variant="ghost" size="icon" className="h-6 w-6">
                <Trash2 className="h-4 w-4" />
              </SampleButton>
            </div>
            <div className="p-3 flex items-center justify-between border-t">
              <div className="text-sm">"low"</div>
              <SampleButton variant="ghost" size="icon" className="h-6 w-6">
                <Trash2 className="h-4 w-4" />
              </SampleButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

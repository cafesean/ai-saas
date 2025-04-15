import { Plus, ChevronRight } from "lucide-react";
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

const OperationTypes = [
  { value: "Query", label: "Query" },
  { value: "Insert Record", label: "Insert Record" },
  { value: "Update Record", label: "Update Record" },
  { value: "Delete Record", label: "Delete Record" },
];

const ConnectionTypes = [
  { value: "main", label: "Main Database" },
  { value: "analytics", label: "Analytics Database" },
  { value: "archive", label: "Archive Database" },
];

export const DatabaseNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="db-label">Label</Label>
        <SampleInput
          id="db-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="db-operation">Operation</Label>
        <Select
          value={node.data.operation}
          onValueChange={(value) => updateNodeData("operation", value)}
        >
          <SelectTrigger id="db-operation">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OperationTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="db-connection">Database Connection</Label>
        <Select
          value={node.data.connection}
          onValueChange={(value) => updateNodeData("connection", value)}
        >
          <SelectTrigger id="db-connection">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ConnectionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {node.data.operation === OperationTypes[0]?.value && (
        <div className="space-y-2">
          <Label htmlFor="db-query">SQL Query</Label>
          <div className="border rounded-md bg-muted/50 p-2">
            <pre className="text-xs whitespace-pre-wrap">
              SELECT * FROM customers WHERE risk_score &gt; :threshold
            </pre>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Label htmlFor="db-params">Parameters</Label>
            <SampleButton variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </SampleButton>
          </div>
          <div className="border rounded-md">
            <div className="p-3 flex items-center justify-between">
              <div className="text-sm">threshold</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              <SampleInput defaultValue="input.threshold" className="w-40" />
            </div>
          </div>
        </div>
      )}

      {(node.data.operation === OperationTypes[1]?.value ||
        node.data.operation === OperationTypes[2]?.value) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Fields</Label>
            <SampleButton variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </SampleButton>
          </div>
          <div className="border rounded-md">
            <div className="p-3 flex items-center justify-between">
              <SampleInput defaultValue="customer_id" className="w-32" />
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              <SampleInput defaultValue="input.customerId" className="w-40" />
            </div>
            <div className="p-3 flex items-center justify-between border-t">
              <SampleInput defaultValue="risk_score" className="w-32" />
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              <SampleInput defaultValue="input.riskScore" className="w-40" />
            </div>
            <div className="p-3 flex items-center justify-between border-t">
              <SampleInput defaultValue="timestamp" className="w-32" />
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              <SampleInput defaultValue="NOW()" className="w-40" />
            </div>
          </div>
        </div>
      )}

      {node.data.operation === OperationTypes[3]?.value && (
        <div className="space-y-2">
          <Label htmlFor="db-table">Table</Label>
          <SampleInput id="db-table" defaultValue="customers" />

          <Label htmlFor="db-condition" className="mt-2">
            Condition
          </Label>
          <SampleInput id="db-condition" defaultValue="customer_id = :id" />

          <div className="flex items-center justify-between mt-2">
            <Label htmlFor="db-params">Parameters</Label>
            <SampleButton variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </SampleButton>
          </div>
          <div className="border rounded-md">
            <div className="p-3 flex items-center justify-between">
              <div className="text-sm">id</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              <SampleInput defaultValue="input.customerId" className="w-40" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

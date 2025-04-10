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
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SampleButton } from "@/components/ui/sample-button";

const HttpMethods = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
  { value: "PATCH", label: "PATCH" },
  { value: "HEAD", label: "HEAD" },
  { value: "OPTIONS", label: "OPTIONS" },
];

export const WebhookNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhook-label">Label</Label>
        <SampleInput
          id="webhook-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="webhook-endpoint">Endpoint URL</Label>
        <SampleInput
          id="webhook-endpoint"
          value={node.data.endpoint}
          onChange={(e) => updateNodeData("endpoint", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-method">HTTP Method</Label>
        <Select
          value={node.data.method}
          onValueChange={(value) => updateNodeData("method", value)}
        >
          <SelectTrigger id="webhook-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HttpMethods.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Headers</Label>
          <SampleButton variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </SampleButton>
        </div>
        <div className="border rounded-md">
          <div className="p-3 flex items-center justify-between">
            <SampleInput defaultValue="Content-Type" className="w-32" />
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
            <SampleInput defaultValue="application/json" className="w-40" />
          </div>
          <div className="p-3 flex items-center justify-between border-t">
            <SampleInput defaultValue="Authorization" className="w-32" />
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
            <SampleInput
              defaultValue="Bearer ${env.API_KEY}"
              className="w-40"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-body">Request Body</Label>
        <div className="border rounded-md bg-muted/50 p-2">
          <pre className="text-xs whitespace-pre-wrap">
            {`{
  "customerId": "{{input.customerId}}",
  "riskScore": "{{input.riskScore}}",
  "timestamp": "{{NOW()}}"
}`}
          </pre>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-timeout">Timeout (seconds)</Label>
                <SampleInput
                  id="webhook-timeout"
                  className="w-20"
                  defaultValue="30"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="webhook-retry">Retry on Failure</Label>
                </div>
                <Switch id="webhook-retry" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

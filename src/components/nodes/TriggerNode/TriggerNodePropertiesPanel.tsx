import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { TriggerTypes, TriggerHTTPMethods } from "@/constants/general";

export const TriggerNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trigger-label">Label</Label>
        <SampleInput
          id="trigger-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      {(node.data.type === TriggerTypes[0] ||
        node.data.type === TriggerTypes[1]) && (
        <div className="space-y-2">
          <Label htmlFor="trigger-label">Trigger URL</Label>
          <div className="text-xs">
            {`${node.data.triggerHost}${node.data.path}`}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="trigger-type">Trigger Type</Label>
        <Select
          value={node.data.type}
          onValueChange={(value) => updateNodeData("type", value)}
        >
          <SelectTrigger id="trigger-type">
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            {TriggerTypes.map((type) => (
              <SelectItem key={`trigger-type-${type}`} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(node.data.type === TriggerTypes[0] ||
        node.data.type === TriggerTypes[1]) && (
        <div className="space-y-2">
          <Label htmlFor="http-method">HTTP Method</Label>
          <Select
            value={node.data.method}
            onValueChange={(value) => updateNodeData("method", value)}
          >
            <SelectTrigger id="http-method">
              <SelectValue placeholder="Select HTTP method" />
            </SelectTrigger>
            <SelectContent>
              {TriggerHTTPMethods.map((method) => (
                <SelectItem key={`trigger-method-${method}`} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {node.data.type === TriggerTypes[1] && (
        <div className="space-y-2">
          <Label htmlFor="webhook-path">Path</Label>
          <SampleInput
            id="webhook-path"
            placeholder=""
            value={node.data.path}
            onChange={(e) => updateNodeData("path", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Webhook URL path, e.g., /api/webhook
          </p>
        </div>
      )}

      {node.data.type === TriggerTypes[2] && (
        <div className="space-y-2">
          <Label htmlFor="schedule-expression">Schedule Expression</Label>
          <SampleInput id="schedule-expression" placeholder="0 * * * *" />
          <p className="text-xs text-muted-foreground">
            Cron expression format
          </p>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="trigger-timeout">Timeout (seconds)</Label>
                <SampleInput
                  id="trigger-timeout"
                  className="w-20"
                  defaultValue="30"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trigger-retry">Retry on Failure</Label>
                </div>
                <Switch id="trigger-retry" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

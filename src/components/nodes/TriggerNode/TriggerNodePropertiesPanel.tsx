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
            <SelectItem value="HTTP Request">HTTP Request</SelectItem>
            <SelectItem value="Webhook">Webhook</SelectItem>
            <SelectItem value="Schedule">Schedule</SelectItem>
            <SelectItem value="Event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {node.data.type === "HTTP Request" && (
        <div className="space-y-2">
          <Label htmlFor="http-method">HTTP Method</Label>
          <Select defaultValue="POST">
            <SelectTrigger id="http-method">
              <SelectValue placeholder="Select HTTP method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {node.data.type === "Schedule" && (
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


import { Plus, ChevronRight, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const AIModelNodePropertiesPanel = ({
  node,
  updateNodeData,
  models,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
  models: any[];
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="model-label">Label</Label>
        <SampleInput
          id="model-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="model-name">Model</Label>
        <Select
          value={node.data.model?.uuid}
          onValueChange={(value) => {
            if (value) {
              const selectedModel = models.find(
                (model) => model.uuid === value,
              );
              if (selectedModel) {
                updateNodeData("model", {
                  name: selectedModel.name,
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
            {models.map((model) => (
              <SelectItem key={model.uuid} value={model.uuid}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* <div className="space-y-2">
        <Label>Input Mapping</Label>
        <div className="border rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">input.text</div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">prompt</div>
          </div>
        </div>
        <SampleButton variant="outline" size="sm" className="w-full mt-1">
          <Plus className="mr-2 h-4 w-4" />
          Add Input Mapping
        </SampleButton>
      </div>

      <div className="space-y-2">
        <Label>Output Mapping</Label>
        <div className="border rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">completion</div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">output.result</div>
          </div>
        </div>
        <SampleButton variant="outline" size="sm" className="w-full mt-1">
          <Plus className="mr-2 h-4 w-4" />
          Add Output Mapping
        </SampleButton>
      </div> */}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="model-temperature">Temperature</Label>
                <div className="flex items-center gap-2">
                  <SampleInput id="model-temperature" defaultValue="0.7" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Controls randomness: 0 is deterministic, 1 is creative
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-max-tokens">Max Tokens</Label>
                <SampleInput
                  id="model-max-tokens"
                  value={node.data.maxTokens}
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/[^0-9]/g, "");
                    updateNodeData("maxTokens", filteredValue);
                  }}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

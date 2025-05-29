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
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SampleCodeInput } from "@/components/ui/sample-code-input";
import { ModelTypes, ThirdPartyModels } from "@/constants/model";

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
        <Label htmlFor="model-type">Type</Label>
        <Select
          value={node.data.type || "Owned"}
          onValueChange={(value) => updateNodeData("type", value)}
        >
          <SelectTrigger id="model-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ModelTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {node.data.type === ModelTypes[0]?.value ? (
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
      ) : (
        <div className="space-y-2">
          <Label htmlFor="model-name">Model</Label>
          <Select
            value={node.data.model?.uuid}
            onValueChange={(value) => {
              if (value) {
                const selectedModel = ThirdPartyModels.find(
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
              {ThirdPartyModels.map((model) => (
                <SelectItem key={model.uuid} value={model.uuid}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {node.data.type === ModelTypes[1]?.value && (
        <>
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Tabs
              value={`${node.data.systemPrompt?.valueType || "Fixed"}`}
              onValueChange={(value) => {
                if (value) {
                  updateNodeData("systemPrompt", {
                    ...node.data.systemPrompt,
                    valueType: value,
                  });
                }
              }}
            >
              <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-none md:flex p-1 h-8">
                <TabsTrigger className="text-xs p-1" value="Fixed">
                  Fixed
                </TabsTrigger>
                <TabsTrigger className="text-xs p-1" value="Expression">
                  Expression
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Fixed" className="space-y-2 pt-0 mt-0">
                <Textarea
                  onChange={(e) =>
                    updateNodeData("systemPrompt", {
                      ...node.data.systemPrompt,
                      value: e.target.value,
                    })
                  }
                  value={node.data.systemPrompt?.value || ""}
                />
              </TabsContent>
              <TabsContent value="Expression" className="space-y-2 pt-0 mt-0">
                <SampleCodeInput
                  doc={node.data.systemPrompt?.value || ""}
                  parent={document.body}
                  onChange={(value) => {
                    updateNodeData("systemPrompt", {
                      ...node.data.systemPrompt,
                      value: value,
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-prompt">User Prompt</Label>
            <Tabs
              value={`${node.data.userPrompt?.valueType || "Fixed"}`}
              onValueChange={(value) => {
                if (value) {
                  updateNodeData("userPrompt", {
                    ...node.data.userPrompt,
                    valueType: value,
                  });
                }
              }}
            >
              <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-none md:flex p-1 h-8">
                <TabsTrigger className="text-xs p-1" value="Fixed">
                  Fixed
                </TabsTrigger>
                <TabsTrigger className="text-xs p-1" value="Expression">
                  Expression
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Fixed" className="space-y-2 pt-0 mt-0">
                <Textarea
                  onChange={(e) =>
                    updateNodeData("userPrompt", {
                      ...node.data.userPrompt,
                      value: e.target.value,
                    })
                  }
                  value={node.data.userPrompt?.value || ""}
                />
              </TabsContent>
              <TabsContent value="Expression" className="space-y-2 pt-0 mt-0">
                <SampleCodeInput
                  doc={node.data.userPrompt?.value || ""}
                  parent={document.body}
                  onChange={(value) => {
                    updateNodeData("userPrompt", {
                      ...node.data.userPrompt,
                      value: value,
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

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

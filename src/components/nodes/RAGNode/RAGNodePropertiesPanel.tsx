import { Plus, ChevronRight, Info } from "lucide-react";
import { SampleInput } from "@/components/ui/sample-input";
import { SampleCodeInput } from "@/components/ui/sample-code-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const RAGNodePropertiesPanel = ({
  node,
  updateNodeData,
  knowledgeBases,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
  knowledgeBases: any[];
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rag-label">Label</Label>
        <SampleInput
          id="rag-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="model-name">Knowledge Base</Label>
        <Select
          value={node.data.kb.uuid}
          onValueChange={(value) => {
            if (value) {
              const selectedKB = knowledgeBases.find((kb) => kb.uuid === value);
              if (selectedKB) {
                updateNodeData("kb", {
                  name: selectedKB.name,
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
            {knowledgeBases.map((kb) => (
              <SelectItem key={kb.uuid} value={kb.uuid}>
                {kb.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`question`}>Question</Label>
        <Tabs
          value={`${node.data.question.valueType || "Fixed"}`}
          onValueChange={(value) => {
            updateNodeData("question", {
              ...node.data.question,
              valueType: value,
            });
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
                updateNodeData("question", {
                  ...node.data.question,
                  value: e.target.value,
                })
              }
              value={node.data.systemPrompt?.value || ""}
            />
          </TabsContent>
          <TabsContent value="Expression" className="space-y-2 pt-0 mt-0">
            <SampleCodeInput
              doc={node.data.question.value}
              parent={document.body}
              onChange={(value) => {
                updateNodeData("question", {
                  ...node.data.question,
                  value: value,
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

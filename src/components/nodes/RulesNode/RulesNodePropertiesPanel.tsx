import { Plus, Check } from "lucide-react";
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
import { SampleButton } from "@/components/ui/sample-button";
import { Badge } from "@/components/ui/badge";

export const RulesNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rules-label">Label</Label>
        <SampleInput
          id="rules-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Rules</Label>
          <Badge>{node.data.ruleCount} defined</Badge>
        </div>

        <div className="border rounded-md">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="rule1">
              <AccordionTrigger className="px-3">
                <div className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>High Confidence Score</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-2">
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
                        <SelectItem value="greaterThan">
                          greater than
                        </SelectItem>
                        <SelectItem value="lessThan">lessThan</SelectItem>
                      </SelectContent>
                    </Select>
                    <SampleInput defaultValue="0.8" className="w-24" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rule2">
              <AccordionTrigger className="px-3">
                <div className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Valid Category</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Select defaultValue="category">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confidence">confidence</SelectItem>
                        <SelectItem value="score">score</SelectItem>
                        <SelectItem value="category">category</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="in">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="notIn">not in</SelectItem>
                      </SelectContent>
                    </Select>
                    <SampleInput defaultValue="A,B,C" className="w-24" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="p-3 border-t">
            <SampleButton variant="outline" size="sm" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </SampleButton>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules-action">Default Action</Label>
        <Select defaultValue="continue">
          <SelectTrigger id="rules-action">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="continue">Continue</SelectItem>
            <SelectItem value="stop">Stop Execution</SelectItem>
            <SelectItem value="error">Raise Error</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

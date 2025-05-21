import { useEffect, useState, useRef } from "react";

import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { WhatsAppSendTypes } from "@/constants/nodes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const WhatsAppNodePropertiesPanel = ({
  node,
  updateNodeData,
  templates = [],
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
  templates?: any[];
}) => {
  const [initialized, setInitialized] = useState(false);
  const initialedContendSid = useRef<string>("");
  const initialedContendVariables = useRef<any[]>([]);
  useEffect(() => {
    if (node.data.contentSid) {
      initialedContendSid.current = node.data.contentSid;
    }
    if (node.data.contentVariables && node.data.contentVariables.length > 0) {
      initialedContendVariables.current = node.data.contentVariables;
    }
    setInitialized(true);
  }, []);
  useEffect(() => {
    if (initialized) {
      if (node.data.contentSid !== initialedContendSid.current) {
        updateNodeData(
          "contentVariables",
          getTemplateVariables(node.data.contentSid),
        );
      } else {
        updateNodeData("contentVariables", initialedContendVariables.current);
      }
    }
  }, [node.data.contentSid, initialized]);

  const getTemplateVariables = (templateId: string) => {
    const template = templates.find((t) => t.sid === templateId);
    if (!template) return [];
    return Object.keys(template.variables).map((key) => {
      return {
        label: key,
        placeholder: template.variables[key],
        value: "",
      };
    });
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="whatsapp-label">Label</Label>
        <SampleInput
          id="whatsapp-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp-from">From</Label>
        <SampleInput
          id="whatsapp-from"
          value={node.data.from}
          onChange={(e) => updateNodeData("from", e.target.value)}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp-send-type">Send Type</Label>
        <Select
          value={node.data.sendType || WhatsAppSendTypes[0]?.value}
          onValueChange={(value) => updateNodeData("sendType", value)}
        >
          <SelectTrigger id="whatsapp-send-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WhatsAppSendTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {node.data.sendType === WhatsAppSendTypes[0]?.value ||
      !node.data.sendType ? (
        <div className="space-y-2">
          <Label htmlFor="whatsapp-message-field">Message Filed Name</Label>
          <SampleInput
            id="whatsapp-message-field"
            value={node.data.msgFieldName}
            onChange={(e) => updateNodeData("msgFieldName", e.target.value)}
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="whatsapp-send-type">Templates</Label>
            <Select
              value={node.data.contentSid}
              onValueChange={(value) => updateNodeData("contentSid", value)}
            >
              <SelectTrigger id="whatsapp-send-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.sid} value={template.sid}>
                    {template.friendly_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {node.data.contentVariables &&
            node.data.contentVariables.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-send-type">Variables</Label>
                  <div className="space-y-2">
                    {node.data.contentVariables.map((variable: any) => (
                      <div
                        key={`variable-${variable.label}`}
                        className="space-y-2"
                      >
                        <Label htmlFor={variable.label}>{variable.label}</Label>
                        <Tabs
                          value={`${variable.valueType || "Fixed"}`}
                          onValueChange={(value) => {
                            const newVariables = node.data.contentVariables.map(
                              (v: any) => {
                                if (v.label === variable.label) {
                                  return {
                                    ...v,
                                    valueType: value,
                                  };
                                }
                                return v;
                              },
                            );
                            updateNodeData("contentVariables", newVariables);
                          }}
                        >
                          <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-none md:flex">
                            <TabsTrigger value="Fixed">Fixed</TabsTrigger>
                            <TabsTrigger value="Expression">
                              Expression
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="Fixed" className="space-y-6 pt-4">
                            <SampleInput
                              id={variable.label}
                              value={variable.value}
                              onChange={(e) => {
                                const newVariables =
                                  node.data.contentVariables.map((v: any) => {
                                    if (v.label === variable.label) {
                                      return {
                                        ...v,
                                        value: e.target.value,
                                      };
                                    }
                                    return v;
                                  });
                                updateNodeData(
                                  "contentVariables",
                                  newVariables,
                                );
                              }}
                            />
                          </TabsContent>
                          <TabsContent
                            value="Expression"
                            className="space-y-6 pt-4"
                          >
                            <SampleInput
                              id={variable.label}
                              value={variable.value}
                              onChange={(e) => {
                                const newVariables =
                                  node.data.contentVariables.map((v: any) => {
                                    if (v.label === variable.label) {
                                      return {
                                        ...v,
                                        value: e.target.value,
                                      };
                                    }
                                    return v;
                                  });
                                updateNodeData(
                                  "contentVariables",
                                  newVariables,
                                );
                              }}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
        </>
      )}
    </div>
  );
};

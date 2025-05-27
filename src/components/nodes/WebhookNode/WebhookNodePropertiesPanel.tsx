import { Plus, Trash } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <Label>Parameters</Label>
          <SampleButton
            variant="ghost"
            size="sm"
            onClick={() => {
              updateNodeData("parameters", [
                ...node.data.parameters,
                {
                  name: "",
                  value: "",
                  valueType: "Fixed",
                },
              ]);
            }}
          >
            <Plus className="h-4 w-4" />
          </SampleButton>
        </div>
        {node.data.parameters.map((param: any, i: number) => (
          <div key={`param-${i}`} className="ml-4 flex flex-row">
            <div>
              <SampleButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateNodeData("parameters", [
                    ...node.data.parameters.slice(0, i),
                    ...node.data.parameters.slice(i + 1),
                  ]);
                }}
              >
                <Trash className="h-4 w-4" />
              </SampleButton>
            </div>
            <div className="space-y-2">
              <div className="space-y-0">
                <Label htmlFor={`param-name-${i}`}>Name</Label>
                <SampleInput
                  id={`param-name-${i}`}
                  value={param.name}
                  onChange={(e) => {
                    const newParameters = node.data.parameters.map(
                      (p: any, pi: number) => {
                        if (i === pi) {
                          return {
                            ...p,
                            name: e.target.value,
                          };
                        }
                        return p;
                      },
                    );
                    updateNodeData("parameters", newParameters);
                  }}
                />
              </div>
              <div className="space-y-0">
                <Label htmlFor={`param-value-${i}`}>Value</Label>
                <Tabs
                  value={`${param.valueType || "Fixed"}`}
                  onValueChange={(value) => {
                    const newParameters = node.data.parameters.map(
                      (p: any, pi: number) => {
                        if (i === pi) {
                          return {
                            ...p,
                            valueType: value,
                          };
                        }
                        return p;
                      },
                    );
                    updateNodeData("parameters", newParameters);
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
                    <SampleInput
                      id={`param-value-${i}`}
                      value={param.value}
                      onChange={(e) => {
                        const newParameters = node.data.parameters.map(
                          (p: any, pi: number) => {
                            if (i === pi) {
                              return {
                                ...p,
                                value: e.target.value,
                              };
                            }
                            return p;
                          },
                        );
                        updateNodeData("parameters", newParameters);
                      }}
                    />
                  </TabsContent>
                  <TabsContent
                    value="Expression"
                    className="space-y-2 pt-0 mt-0"
                  >
                    <SampleInput
                      id={`param-value-${i}`}
                      value={param.value}
                      onChange={(e) => {
                        const newParameters = node.data.parameters.map(
                          (p: any, pi: number) => {
                            if (i === pi) {
                              return {
                                ...p,
                                value: e.target.value,
                              };
                            }
                            return p;
                          },
                        );
                        updateNodeData("parameters", newParameters);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Headers</Label>
          <SampleButton
            variant="ghost"
            size="sm"
            onClick={() => {
              updateNodeData("headers", [
                ...node.data.headers,
                {
                  name: "",
                  value: "",
                  valueType: "Fixed",
                },
              ]);
            }}
          >
            <Plus className="h-4 w-4" />
          </SampleButton>
        </div>
        {node.data.headers.map((header: any, i: number) => (
          <div key={`header-${i}`} className="ml-4 flex flex-row">
            <div>
              <SampleButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateNodeData("headers", [
                    ...node.data.headers.slice(0, i),
                    ...node.data.headers.slice(i + 1),
                  ]);
                }}
              >
                <Trash className="h-4 w-4" />
              </SampleButton>
            </div>
            <div className="space-y-2">
              <div className="space-y-0">
                <Label htmlFor={`header-name-${i}`}>Name</Label>
                <SampleInput
                  id={`header-name-${i}`}
                  value={header.name}
                  onChange={(e) => {
                    const newHeaders = node.data.headers.map(
                      (h: any, hi: number) => {
                        if (i === hi) {
                          return {
                            ...h,
                            name: e.target.value,
                          };
                        }
                        return h;
                      },
                    );
                    updateNodeData("headers", newHeaders);
                  }}
                />
              </div>
              <div className="space-y-0">
                <Label htmlFor={`header-value-${i}`}>Value</Label>
                <Tabs
                  value={`${header.valueType || "Fixed"}`}
                  onValueChange={(value) => {
                    const newHeaders = node.data.headers.map(
                      (h: any, hi: number) => {
                        if (i === hi) {
                          return {
                            ...h,
                            valueType: value,
                          };
                        }
                        return h;
                      },
                    );
                    updateNodeData("headers", newHeaders);
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
                    <SampleInput
                      id={`header-value-${i}`}
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = node.data.headers.map(
                          (h: any, hi: number) => {
                            if (i === hi) {
                              return {
                                ...h,
                                value: e.target.value,
                              };
                            }
                            return h;
                          },
                        );
                        updateNodeData("headers", newHeaders);
                      }}
                    />
                  </TabsContent>
                  <TabsContent
                    value="Expression"
                    className="space-y-2 pt-0 mt-0"
                  >
                    <SampleInput
                      id={`header-value-${i}`}
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = node.data.headers.map(
                          (h: any, hi: number) => {
                            if (i === hi) {
                              return {
                                ...h,
                                value: e.target.value,
                              };
                            }
                            return h;
                          },
                        );
                        updateNodeData("headers", newHeaders);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Body</Label>
          <SampleButton
            variant="ghost"
            size="sm"
            onClick={() => {
              updateNodeData("body", [
                ...node.data.body,
                {
                  name: "",
                  value: "",
                  valueType: "Fixed",
                },
              ]);
            }}
          >
            <Plus className="h-4 w-4" />
          </SampleButton>
        </div>
        {node.data.body.map((body: any, i: number) => (
          <div key={`param-${i}`} className="ml-4 flex flex-row">
            <div>
              <SampleButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateNodeData("body", [
                    ...node.data.body.slice(0, i),
                    ...node.data.body.slice(i + 1),
                  ]);
                }}
              >
                <Trash className="h-4 w-4" />
              </SampleButton>
            </div>
            <div className="space-y-2">
              <div className="space-y-0">
                <Label htmlFor={`body-name-${i}`}>Name</Label>
                <SampleInput
                  id={`body-name-${i}`}
                  value={body.name}
                  onChange={(e) => {
                    const newBody = node.data.body.map((b: any, bi: number) => {
                      if (i === bi) {
                        return {
                          ...b,
                          name: e.target.value,
                        };
                      }
                      return b;
                    });
                    updateNodeData("body", newBody);
                  }}
                />
              </div>
              <div className="space-y-0">
                <Label htmlFor={`body-value-${i}`}>Value</Label>
                <Tabs
                  value={`${body.valueType || "Fixed"}`}
                  onValueChange={(value) => {
                    const newBody = node.data.body.map((b: any, bi: number) => {
                      if (i === bi) {
                        return {
                          ...b,
                          valueType: value,
                        };
                      }
                      return b;
                    });
                    updateNodeData("body", newBody);
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
                    <SampleInput
                      id={`body-value-${i}`}
                      value={body.value}
                      onChange={(e) => {
                        const newBody = node.data.body.map(
                          (b: any, bi: number) => {
                            if (i === bi) {
                              return {
                                ...b,
                                value: e.target.value,
                              };
                            }
                            return b;
                          },
                        );
                        updateNodeData("body", newBody);
                      }}
                    />
                  </TabsContent>
                  <TabsContent
                    value="Expression"
                    className="space-y-2 pt-0 mt-0"
                  >
                    <SampleInput
                      id={`body-value-${i}`}
                      value={body.value}
                      onChange={(e) => {
                        const newBody = node.data.body.map(
                          (b: any, bi: number) => {
                            if (i === bi) {
                              return {
                                ...b,
                                value: e.target.value,
                              };
                            }
                            return b;
                          },
                        );
                        updateNodeData("body", newBody);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        ))}
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

"use client";

import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Save,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react"; // Import React

export default function WidgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Assume params is a Promise
  // Resolve the params promise using React.use()
  // Note: This might imply the component should ideally be a Server Component,
  // but we'll keep 'use client' for now as it uses useState.
  // If this causes issues, the component might need refactoring.
  const resolvedParams = React.use(params);
  const widgetId = resolvedParams.id; // Use the resolved ID

  const [isEditing, setIsEditing] = useState(false);
  const [widgetName, setWidgetName] = useState("Loan Decision Widget"); // Placeholder data
  const [widgetDescription, setWidgetDescription] = useState(
    // Placeholder data
    "Displays loan decision information for a specific loan application",
  );
  const [widgetTheme, setWidgetTheme] = useState("light");
  const [showDetails, setShowDetails] = useState(true);
  const [allowActions, setAllowActions] = useState(true);
  const [displayMetrics, setDisplayMetrics] = useState(true);

  const handleSave = () => {
    // In a real app, this would save the changes to the server
    setIsEditing(false);
  };

  const copyEmbedCode = () => {
    // Use resolved widgetId
    const code = `<script src="https://ai-hub.example.com/widgets/${widgetId}/embed.js"></script>
<div id="ai-widget" data-widget-id="${widgetId}" data-theme="${widgetTheme}"></div>`;
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/widgets"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Widgets</span>
        </Link>
        <h1 className="text-xl font-semibold">{widgetName}</h1>
        <div className="ml-auto flex items-center gap-2">
          {isEditing ? (
            <SampleButton onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </SampleButton>
          ) : (
            <SampleButton onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Widget
            </SampleButton>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Widget Preview</CardTitle>
                  <CardDescription>
                    This is how your widget will appear to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-6 h-96 flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">
                        {widgetName}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {widgetDescription}
                      </div>
                      <div className="flex justify-center">
                        <Badge variant="outline">decision</Badge>
                      </div>
                      {showDetails && (
                        <div className="mt-6 p-4 border rounded-md bg-background">
                          <div className="text-sm font-medium mb-2">
                            Loan Decision
                          </div>
                          <div className="text-2xl font-bold text-green-600 mb-4">
                            Approved
                          </div>
                          {displayMetrics && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">
                                Score:
                              </div>
                              <div className="font-medium">720</div>
                              <div className="text-muted-foreground">
                                Risk Level:
                              </div>
                              <div className="font-medium">Low</div>
                              <div className="text-muted-foreground">
                                Interest Rate:
                              </div>
                              <div className="font-medium">5.2%</div>
                            </div>
                          )}
                          {allowActions && (
                            <div className="mt-4 flex justify-center gap-2">
                              <SampleButton size="sm" variant="outline">
                                View Details
                              </SampleButton>
                              <SampleButton size="sm">
                                Accept Offer
                              </SampleButton>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Widget Information</CardTitle>
                  <CardDescription>Details about this widget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Widget ID
                      </div>
                      {/* Use resolved widgetId */}
                      <div className="font-medium">{widgetId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Type</div>
                      <div className="font-medium">Decision</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div className="font-medium">2 days ago</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Last Updated
                      </div>
                      <div className="font-medium">2 hours ago</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Usage</div>
                      <div className="font-medium">1,243 views</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Settings</CardTitle>
                <CardDescription>
                  Configure how your widget looks and behaves
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="widget-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="widget-name"
                      value={widgetName}
                      onChange={(e) => setWidgetName(e.target.value)}
                      className="col-span-3"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="widget-description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="widget-description"
                      value={widgetDescription}
                      onChange={(e) => setWidgetDescription(e.target.value)}
                      className="col-span-3"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="widget-theme" className="text-right">
                      Theme
                    </Label>
                    <Select
                      value={widgetTheme}
                      onValueChange={setWidgetTheme}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="widget-theme" className="col-span-3">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Show Details</Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        checked={showDetails}
                        onCheckedChange={setShowDetails}
                        disabled={!isEditing}
                        id="show-details"
                      />
                      <Label htmlFor="show-details">
                        Enable detailed information
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Allow Actions</Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        checked={allowActions}
                        onCheckedChange={setAllowActions}
                        disabled={!isEditing}
                        id="allow-actions"
                      />
                      <Label htmlFor="allow-actions">Enable user actions</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Display Metrics</Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        checked={displayMetrics}
                        onCheckedChange={setDisplayMetrics}
                        disabled={!isEditing}
                        id="display-metrics"
                      />
                      <Label htmlFor="display-metrics">
                        Show performance metrics
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                {isEditing ? (
                  <SampleButton onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </SampleButton>
                ) : (
                  <SampleButton onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Settings
                  </SampleButton>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>
                  Copy this code to embed the widget in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-md p-4 relative">
                    <SampleButton
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={copyEmbedCode}
                    >
                      <Copy className="h-4 w-4" />
                    </SampleButton>
                    <pre className="text-sm overflow-auto whitespace-pre-wrap">
                      {/* Use resolved widgetId */}
                      {`<script src="https://ai-hub.example.com/widgets/${widgetId}/embed.js"></script>
<div id="ai-widget" data-widget-id="${widgetId}" data-theme="${widgetTheme}"></div>`}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Configuration Options
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        The widget can be configured with the following data
                        attributes:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>
                          <code>data-theme</code>: Set to "light", "dark", or
                          "system" (default: "light")
                        </li>
                        <li>
                          <code>data-show-details</code>: Set to "true" or
                          "false" (default: "true")
                        </li>
                        <li>
                          <code>data-allow-actions</code>: Set to "true" or
                          "false" (default: "true")
                        </li>
                        <li>
                          <code>data-display-metrics</code>: Set to "true" or
                          "false" (default: "true")
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <SampleButton
                  variant="outline"
                  className="mr-2"
                  onClick={copyEmbedCode}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </SampleButton>
                <SampleButton asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Test Widget
                  </a>
                </SampleButton>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Analytics</CardTitle>
                <CardDescription>
                  View usage statistics for this widget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                          Total Views
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">1,243</div>
                        <div className="text-xs text-muted-foreground">
                          +12% from last month
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                          Unique Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">876</div>
                        <div className="text-xs text-muted-foreground">
                          +8% from last month
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">
                          Avg. Time on Widget
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">1m 42s</div>
                        <div className="text-xs text-muted-foreground">
                          -5% from last month
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="h-64 border rounded-md flex items-center justify-center bg-muted/30">
                    <div className="text-center text-muted-foreground">
                      <div className="mb-2">Usage Over Time</div>
                      <div className="text-xs">
                        Chart showing widget usage over the past 30 days
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-48 border rounded-md flex items-center justify-center bg-muted/30">
                      <div className="text-center text-muted-foreground">
                        <div className="mb-2">Top Referrers</div>
                        <div className="text-xs">
                          Chart showing top referring domains
                        </div>
                      </div>
                    </div>
                    <div className="h-48 border rounded-md flex items-center justify-center bg-muted/30">
                      <div className="text-center text-muted-foreground">
                        <div className="mb-2">User Interactions</div>
                        <div className="text-xs">
                          Chart showing user interaction metrics
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <SampleButton variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </SampleButton>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

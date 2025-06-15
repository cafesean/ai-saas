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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ViewToggle } from "@/components/view-toggle"; // Import component
import { useViewToggle, type ViewMode } from "@/framework/hooks/useViewToggle"; // Import hook AND type
import {
  ArrowLeft,
  Code,
  Copy,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Settings,
} from "lucide-react"; // Consolidate imports
import Link from "next/link";
import { useState } from "react";

// Sample data for widgets (Keep using sample data for now)
const widgets = [
  {
    id: "widget_1",
    name: "Loan Decision Widget",
    description:
      "Displays loan decision information for a specific loan application",
    type: "decision",
    status: "active",
    usageCount: 1243,
    lastUpdated: "2 days ago",
    creator: "Sarah Chen",
    version: "1.2.0",
    settings: {
      theme: "light",
      showDetails: true,
      allowActions: true,
      displayMetrics: true,
    },
  },
  {
    id: "widget_2",
    name: "Document Viewer Widget",
    description:
      "Displays a list of AI documents associated with a loan application",
    type: "document",
    status: "active",
    usageCount: 876,
    lastUpdated: "1 week ago",
    creator: "Mohammed Al-Otaibi",
    version: "1.0.3",
    settings: {
      theme: "system",
      showDetails: true,
      allowActions: true,
      displayMetrics: false,
    },
  },
  {
    id: "widget_3",
    name: "Credit Score Visualizer",
    description: "Visualizes credit score and key factors affecting it",
    type: "visualization",
    status: "draft",
    usageCount: 0,
    lastUpdated: "3 days ago",
    creator: "Fatima Al-Zahrani",
    version: "0.9.1",
    settings: {
      theme: "dark",
      showDetails: true,
      allowActions: false,
      displayMetrics: true,
    },
  },
  {
    id: "widget_4",
    name: "Model Explanation Widget",
    description: "Explains AI model decisions in simple terms for end-users",
    type: "explanation",
    status: "active",
    usageCount: 542,
    lastUpdated: "5 days ago",
    creator: "Ahmed Al-Mansouri",
    version: "1.1.2",
    settings: {
      theme: "light",
      showDetails: true,
      allowActions: false,
      displayMetrics: true,
    },
  },
];

// Widget templates
const widgetTemplates = [
  {
    id: "template_1",
    name: "Loan Decision Widget",
    description:
      "Displays loan decision information for a specific loan application",
    type: "decision",
    preview: "/placeholder.svg?height=120&width=240",
  },
  {
    id: "template_2",
    name: "Document Viewer Widget",
    description:
      "Displays a list of AI documents associated with a loan application",
    type: "document",
    preview: "/placeholder.svg?height=120&width=240",
  },
  {
    id: "template_3",
    name: "Credit Score Visualizer",
    description: "Visualizes credit score and key factors affecting it",
    type: "visualization",
    preview: "/placeholder.svg?height=120&width=240",
  },
  {
    id: "template_4",
    name: "Model Explanation Widget",
    description: "Explains AI model decisions in simple terms for end-users",
    type: "explanation",
    preview: "/placeholder.svg?height=120&width=240",
  },
  {
    id: "template_5",
    name: "Application Form Widget",
    description: "Embeddable application form with real-time validation",
    type: "form",
    preview: "/placeholder.svg?height=120&width=240",
  },
];

export function WidgetsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<any>(null);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { viewMode, setViewMode } = useViewToggle("medium-grid"); // Use hook

  const filteredWidgets = widgets.filter(
    (widget) =>
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConfigureWidget = (widget: any) => {
    setSelectedWidget(widget);
    setIsConfigureDialogOpen(true);
  };

  const handleShowCode = (widget: any) => {
    setSelectedWidget(widget);
    setIsCodeDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-xl font-semibold">Web Widgets</h1>
        <div className="ml-auto flex items-center gap-2">
          <SampleButton variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </SampleButton>
          {/* Add ViewToggle here */}
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Embeddable Web Widgets
            </h2>
            <p className="text-muted-foreground">
              Create and manage widgets that can be embedded in client
              applications
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search widgets..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Add ViewToggle next to Create button */}
            {/* <ViewToggle viewMode={viewMode} onChange={setViewMode} />  <- Moved to header */}
            <SampleButton onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Widget
            </SampleButton>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Widgets</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          {/* Render based on viewMode */}
          <TabsContent value="all" className="mt-4">
            {viewMode === "list" ? (
              <WidgetListView
                widgets={filteredWidgets}
                onConfigure={handleConfigureWidget}
                onShowCode={handleShowCode}
              />
            ) : (
              <WidgetGridView
                widgets={filteredWidgets}
                viewMode={viewMode}
                onConfigure={handleConfigureWidget}
                onShowCode={handleShowCode}
              />
            )}
            {filteredWidgets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No widgets found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            {viewMode === "list" ? (
              <WidgetListView
                widgets={filteredWidgets.filter((w) => w.status === "active")}
                onConfigure={handleConfigureWidget}
                onShowCode={handleShowCode}
              />
            ) : (
              <WidgetGridView
                widgets={filteredWidgets.filter((w) => w.status === "active")}
                viewMode={viewMode}
                onConfigure={handleConfigureWidget}
                onShowCode={handleShowCode}
              />
            )}
            {filteredWidgets.filter((w) => w.status === "active").length ===
              0 && (
              <div className="text-center py-12 text-muted-foreground">
                No active widgets found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="mt-4">
            {viewMode === "list" ? (
              <WidgetListView
                widgets={filteredWidgets.filter((w) => w.status === "draft")}
                onConfigure={handleConfigureWidget}
                onShowCode={handleShowCode}
              />
            ) : (
              <WidgetGridView
                widgets={filteredWidgets.filter((w) => w.status === "draft")}
                viewMode={viewMode}
                onConfigure={handleConfigureWidget}
                onShowCode={handleShowCode}
              />
            )}
            {filteredWidgets.filter((w) => w.status === "draft").length ===
              0 && (
              <div className="text-center py-12 text-muted-foreground">
                No draft widgets found.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs remain the same */}
      {/* ... Create Widget Dialog ... */}
      {/* ... Configure Widget Dialog ... */}
      {/* ... Create Widget Dialog ... */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Widget</DialogTitle>
            <DialogDescription>
              Choose a widget template to get started
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {widgetTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-3 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedWidget(template); // Use template data for initial config
                    setIsCreateDialogOpen(false);
                    setIsConfigureDialogOpen(true);
                  }}
                >
                  <div className="aspect-video bg-muted rounded-md mb-2 overflow-hidden">
                    <img
                      src={template.preview || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ... Configure Widget Dialog ... */}
      <Dialog
        open={isConfigureDialogOpen}
        onOpenChange={setIsConfigureDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configure Widget</DialogTitle>
            <DialogDescription>
              {selectedWidget?.name ||
                "Customize the widget settings and appearance"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form fields for configuration */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="widget-name" className="text-right">
                Name
              </Label>
              <Input
                id="widget-name"
                defaultValue={selectedWidget?.name || ""}
                className="col-span-3"
                placeholder="Enter widget name"
              />
            </div>
            {/* ... other config fields ... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="widget-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="widget-description"
                defaultValue={selectedWidget?.description || ""}
                className="col-span-3"
                placeholder="Enter widget description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="widget-theme" className="text-right">
                Theme
              </Label>
              <Select defaultValue={selectedWidget?.settings?.theme || "light"}>
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
            {/* ... other switches ... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Show Details</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  defaultChecked={selectedWidget?.settings?.showDetails ?? true}
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
                  defaultChecked={
                    selectedWidget?.settings?.allowActions ?? true
                  }
                  id="allow-actions"
                />
                <Label htmlFor="allow-actions">Enable user actions</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Display Metrics</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  defaultChecked={
                    selectedWidget?.settings?.displayMetrics ?? true
                  }
                  id="display-metrics"
                />
                <Label htmlFor="display-metrics">
                  Show performance metrics
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsConfigureDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton onClick={() => setIsConfigureDialogOpen(false)}>
              Save Widget
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ... Widget Code Dialog ... */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Embed Widget Code</DialogTitle>
            <DialogDescription>
              Copy this code snippet to embed the widget in your application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-muted rounded-md p-4 relative">
              <SampleButton
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  const code = `<script src="https://ai-hub.example.com/widgets/${
                    selectedWidget?.id
                  }/embed.js"></script>
<div id="ai-widget" data-widget-id="${selectedWidget?.id}" data-theme="${
                    selectedWidget?.settings?.theme || "light"
                  }"></div>`;
                  navigator.clipboard.writeText(code);
                }}
              >
                <Copy className="h-4 w-4" />
              </SampleButton>
              <pre className="text-sm overflow-auto whitespace-pre-wrap">
                {`<script src="https://ai-hub.example.com/widgets/${
                  selectedWidget?.id
                }/embed.js"></script>
<div id="ai-widget" data-widget-id="${selectedWidget?.id}" data-theme="${
                  selectedWidget?.settings?.theme || "light"
                }"></div>`}
              </pre>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Preview</h4>
              <div className="border rounded-md p-4 h-64 flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">
                    {selectedWidget?.name}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    {selectedWidget?.description}
                  </div>
                  <div className="flex justify-center">
                    <Badge variant="outline">{selectedWidget?.type}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsCodeDialogOpen(false)}
            >
              Close
            </SampleButton>
            <SampleButton asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Test Widget
              </a>
            </SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------ Helper Components (Moved Outside) ------------------

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "draft":
      return "bg-yellow-500";
    case "archived":
      return "bg-gray-500"; // Assuming archived might exist
    default:
      return "bg-blue-500";
  }
};

// New List View Component
interface WidgetListViewProps {
  widgets: any[];
  onConfigure: (widget: any) => void;
  onShowCode: (widget: any) => void;
}

function WidgetListView({
  widgets,
  onConfigure,
  onShowCode,
}: WidgetListViewProps) {
  return (
    <div className="space-y-3">
      {widgets.map((widget) => (
        <Card
          key={widget.id}
          className="flex items-center p-4 justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor(
                widget.status,
              )}`}
            ></div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/widgets/${widget.id}`}
                className="font-medium hover:underline truncate block"
              >
                {widget.name}
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {widget.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0 mx-4">
            <Badge variant="outline" className="capitalize">
              {widget.type}
            </Badge>
            <span>Usage: {widget.usageCount}</span>
            <span>v{widget.version}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <SampleButton
              variant="ghost"
              size="sm"
              onClick={() => onConfigure(widget)}
            >
              <Settings className="h-4 w-4" />
            </SampleButton>
            <SampleButton
              variant="ghost"
              size="sm"
              onClick={() => onShowCode(widget)}
            >
              <Code className="h-4 w-4" />
            </SampleButton>
          </div>
        </Card>
      ))}
    </div>
  );
}

// New Grid View Component (Refactored from previous inline code)
interface WidgetGridViewProps {
  widgets: any[];
  viewMode: ViewMode; // Pass viewMode for grid size adjustment
  onConfigure: (widget: any) => void;
  onShowCode: (widget: any) => void;
}

function WidgetGridView({
  widgets,
  viewMode,
  onConfigure,
  onShowCode,
}: WidgetGridViewProps) {
  const gridColsClass =
    viewMode === "large-grid" ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${gridColsClass}`}>
      {widgets.map((widget) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          onConfigure={() => onConfigure(widget)} // Pass handler correctly
          onShowCode={() => onShowCode(widget)} // Pass handler correctly
        />
      ))}
    </div>
  );
}

// Widget Card Component (Remains largely the same, used by GridView)
interface WidgetCardProps {
  widget: any;
  onConfigure: () => void;
  onShowCode: () => void;
}

function WidgetCard({ widget, onConfigure, onShowCode }: WidgetCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {/* Wrap CardTitle content with Link */}
          <CardTitle className="text-base">
            <Link href={`/widgets/${widget.id}`} className="hover:underline">
              {widget.name}
            </Link>
          </CardTitle>
          <Badge variant={widget.status === "active" ? "default" : "secondary"}>
            {widget.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {widget.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>Type: {widget.type}</div>
          <div>v{widget.version}</div>
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
          <div>Usage: {widget.usageCount.toLocaleString()}</div>
          <div>Updated: {widget.lastUpdated}</div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 py-2">
        <div className="flex justify-between w-full">
          <SampleButton variant="ghost" size="sm" onClick={onConfigure}>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </SampleButton>
          <SampleButton variant="ghost" size="sm" onClick={onShowCode}>
            <Code className="mr-2 h-4 w-4" />
            Embed
          </SampleButton>
        </div>
      </CardFooter>
    </Card>
  );
}

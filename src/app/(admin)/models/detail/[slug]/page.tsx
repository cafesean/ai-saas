"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { useParams } from "next/navigation";
import { api, useUtils } from "@/utils/trpc";

import { DialogTrigger } from "@/components/ui/dialog";
import {
  BarChart3,
  Brain,
  Clock,
  Download,
  FileEdit,
  Filter,
  History,
  LineChart,
  MoreHorizontal,
  Play,
  RefreshCw,
  Rocket,
  Search,
  Share2,
  Sparkles,
  BarChart,
  PieChart,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SampleButton } from "@/components/ui/sample-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
import Link from "next/link";

// Import our new components
import {
  FineTuneModelDialog,
  type FineTuneData,
} from "@/components/fine-tune-model-dialog";
import {
  UpdateModelDialog,
  type UpdateModelData,
} from "@/components/update-model-dialog";
import { InferenceDetailDialog } from "@/components/inference-detail-dialog";
import { FeatureImportanceDetail } from "@/components/feature-importance-detail";
import { ModelVersions } from "@/components/model-versions";
import { AllKPIsDialog } from "@/components/all-kpis-dialog";
import MetricDisplay from "./components/MetricDisplay";
import MetricCard from "./components/MetricCard";
import SkeletonLoading from "@/components/ui/skeleton-loading";
import Breadcrumbs from "@/components/breadcrambs";
import { ModelMetric } from "@/constants/model";

// Define the Inference type before using it
interface Inference {
  id: string;
  timestamp: string;
  source: string;
  latency: number;
  prediction: number;
  confidence: number;
  input: any;
  output: any;
  featureContributions: any[];
}

// Type for params
type PageParams = {
  id: string;
};

const ModelDetail = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [isClient, setIsClient] = useState(false);
  let modelItem = api.model.getByUUID.useQuery(slug);
  // State for our new dialogs
  const [isFineTuneDialogOpen, setIsFineTuneDialogOpen] = useState(false);
  const [isUpdateModelDialogOpen, setIsUpdateModelDialogOpen] = useState(false);
  const [isAllKPIsDialogOpen, setIsAllKPIsDialogOpen] = useState(false);
  const [selectedInference, setSelectedInference] = useState<Inference | null>(
    null,
  );
  const [isInferenceDetailOpen, setIsInferenceDetailOpen] = useState(false);

  // State for model versions
  const [model, setModel] = useState<any | null>(null);
  const [modelVersions, setModelVersions] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log(modelItem.data);
    if (modelItem && !modelItem.isLoading && modelItem.data) {
      const modelData = modelItem.data;
      if (modelData) {
        setModel(modelData);
      }
    }
  }, [modelItem?.isLoading, modelItem?.data]);

  // Handlers for our new functionality
  const handleFineTune = (data: FineTuneData) => {
    console.log("Fine-tuning model with:", data);
    // In a real app, this would call an API to start the fine-tuning process
  };

  const handleUpdateModel = (data: UpdateModelData) => {
    console.log("Updating model with:", data);
    // In a real app, this would call an API to update the model
  };

  const handleViewInferenceDetail = (inference: Inference) => {
    setSelectedInference(inference);
    setIsInferenceDetailOpen(true);
  };

  const handleSelectVersion = (id: string, selected: boolean) => {
    setModelVersions((pre: any) =>
      pre.map((v: any) => (v.id === id ? { ...v, selected } : v)),
    );
  };

  const handleCompareVersions = () => {
    // const selectedVersions = modelVersions.filter((v) => v.selected);
    // console.log("Comparing versions:", selectedVersions);
    // In a real app, this would open a comparison view
  };

  if (modelItem.isLoading) {
    return <SkeletonLoading />;
  }

  if (modelItem.error) {
    return (
      <div className="flex flex-col grow">
        <div className="text-red-500">
          <h2 className="text-lg font-semibold mb-2">Error loading models</h2>
          <p className="mb-2">{modelItem.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Breadcrumbs
        items={[{ label: "Back to Models", link: "/models" }]}
        rightChildren={
          <>
            <Dialog>
              <DialogTrigger asChild>
                <SampleButton variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </SampleButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Model</DialogTitle>
                  <DialogDescription>
                    Share this model with your team or generate a public link.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Model Link</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={``} className="flex-1" />
                      <SampleButton variant="outline" size="sm">
                        Copy
                      </SampleButton>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Share with Team</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data-science">
                          Data Science
                        </SelectItem>
                        <SelectItem value="ml-engineers">
                          ML Engineers
                        </SelectItem>
                        <SelectItem value="product">Product Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <SampleButton variant="outline">Cancel</SampleButton>
                  <SampleButton>Share</SampleButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <SampleButton
              variant="outline"
              size="sm"
              onClick={() => setIsUpdateModelDialogOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Model
            </SampleButton>

            <SampleButton onClick={() => setIsFineTuneDialogOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Fine-tune
            </SampleButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SampleButton variant="outline" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </SampleButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy to Production
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit Model Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export Model
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Archive Model
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {isClient && (
        <>
          <div className="border-b">
            <div className="py4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{model?.name}</h1>
                    <Badge
                      variant={
                        model?.status === "champion" ? "default" : "secondary"
                      }
                    >
                      {model?.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Version {model?.version} • Last updated{" "}
                    {String(model?.updatedAt)} •{" "}
                    {model?.inferences
                      ? model?.inferences?.toLocaleString() + "inferences"
                      : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SampleButton variant="outline" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Test Inference
                  </SampleButton>
                  <SampleButton variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    View History
                  </SampleButton>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-8">
            <Tabs defaultValue="performance">
              <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-none md:flex">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="challengers">Challengers</TabsTrigger>
                <TabsTrigger value="inferences">Inferences</TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Key Metrics</h3>
                  <SampleButton
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAllKPIsDialogOpen(true)}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    View All KPIs
                  </SampleButton>
                </div>

                {model?.metrics && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricDisplay
                      title="K-S Score"
                      value={model?.metrics.ks}
                      trend={"+2.3% from last version"}
                      trendPositive={true}
                      icon={
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                      }
                      chartData={
                        model.metrics
                          ? {
                              ...ModelMetric.ks.chart,
                              data: model.metrics.ksChart,
                            }
                          : { ...ModelMetric.ks.chart }
                      }
                    />
                    <MetricDisplay
                      title="Accuracy"
                      value={model?.metrics.accuracy}
                      trend={"+0.8% from last version"}
                      trendPositive={true}
                      icon={
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      }
                      chartData={
                        model.metrics
                          ? {
                              ...ModelMetric.accuracy.chart,
                              data: model.metrics.accuracyChart,
                            }
                          : { ...ModelMetric.accuracy.chart }
                      }
                    />
                    <MetricDisplay
                      title="Gini Coefficient"
                      value={model?.metrics.gini}
                      trend={"+0.03 from last version"}
                      trendPositive={true}
                      icon={
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                      }
                      chartData={
                        model.metrics
                          ? {
                              ...ModelMetric.gini.chart,
                              data: model.metrics.giniChart,
                            }
                          : { ...ModelMetric.gini.chart }
                      }
                    />
                    <MetricDisplay
                      title="AUC-ROC"
                      value={model?.metrics.auroc}
                      trend={"+0.01 from last version"}
                      trendPositive={true}
                      icon={
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                      }
                      chartData={
                        model.metrics
                          ? {
                              ...ModelMetric.aucroc.chart,
                              data: model.metrics.aurocChart,
                            }
                          : { ...ModelMetric.aucroc.chart }
                      }
                    />
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Over Time</CardTitle>
                      <CardDescription>
                        Key metrics tracked across model versions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <div className="mb-2">Performance Line Chart</div>
                          <div className="text-xs">
                            Showing metrics across 5 versions
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle>Feature Importance</CardTitle>
                        <CardDescription>
                          Top contributing features to model predictions
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SampleButton
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </SampleButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <PieChart className="mr-2 h-4 w-4" />
                            View as Pie Chart
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart className="mr-2 h-4 w-4" />
                            View as Bar Chart
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            View Trends
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Confusion Matrix</CardTitle>
                    <CardDescription>
                      Evaluation of prediction accuracy across classes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="mb-2">
                          Confusion Matrix Visualization
                        </div>
                        <div className="text-xs">
                          Showing true vs predicted values
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Training Tab */}
              <TabsContent value="training" className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Training Time"
                    value="4h 32m"
                    trend={"23% faster than v2"}
                    trendPositive={true}
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  />
                  <MetricCard
                    title="Training Samples"
                    value="1.2M"
                    trend={"+200K from last version"}
                    trendPositive={true}
                    icon={<Brain className="h-4 w-4 text-muted-foreground" />}
                  />
                  <MetricCard
                    title="Validation Loss"
                    value="0.0342"
                    trend={"-0.0056 from last version"}
                    trendPositive={true}
                    icon={
                      <LineChart className="h-4 w-4 text-muted-foreground" />
                    }
                  />
                  <MetricCard
                    title="Training Cost"
                    value="$128.45"
                    trend={"-$32.10 from last version"}
                    trendPositive={true}
                    icon={
                      <LineChart className="h-4 w-4 text-muted-foreground" />
                    }
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Training & Validation Loss</CardTitle>
                      <CardDescription>
                        Loss curves during model training
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <div className="mb-2">Loss Curve Chart</div>
                          <div className="text-xs">
                            Training and validation loss over epochs
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Training Dataset</CardTitle>
                      <CardDescription>
                        Information about training data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Data Source
                            </div>
                            <div className="font-medium">
                              Customer Transactions DB
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Date Range
                            </div>
                            <div className="font-medium">
                              Jan 2022 - Mar 2023
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Features
                            </div>
                            <div className="font-medium">42</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Target Variable
                            </div>
                            <div className="font-medium">Default (Binary)</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Class Distribution
                            </div>
                            <div className="font-medium">92.3% / 7.7%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Preprocessing
                            </div>
                            <div className="font-medium">Standard + SMOTE</div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <div className="text-sm font-medium mb-2">
                            Data Split
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-muted/50 p-3 rounded-md text-center">
                              <div className="text-sm text-muted-foreground">
                                Training
                              </div>
                              <div className="font-medium">70%</div>
                            </div>
                            <div className="flex-1 bg-muted/50 p-3 rounded-md text-center">
                              <div className="text-sm text-muted-foreground">
                                Validation
                              </div>
                              <div className="font-medium">15%</div>
                            </div>
                            <div className="flex-1 bg-muted/50 p-3 rounded-md text-center">
                              <div className="text-sm text-muted-foreground">
                                Test
                              </div>
                              <div className="font-medium">15%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Hyperparameters</CardTitle>
                    <CardDescription>
                      Configuration used for model training
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t pt-4">
                    <SampleButton variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export Configuration
                    </SampleButton>
                  </CardFooter>
                </Card>

                {/* Model Versions Section */}
                <div className="mt-8">
                  <ModelVersions
                    versions={modelVersions}
                    onSelectVersion={handleSelectVersion}
                    onCompareVersions={handleCompareVersions}
                  />
                </div>
              </TabsContent>

              {/* Inferences Tab */}
              <TabsContent value="inferences" className="space-y-6 pt-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div>
                    <h3 className="text-lg font-medium">Recent Inferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Showing recent model predictions and inputs
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search inferences..."
                        className="w-full pl-8"
                      />
                    </div>

                    <SampleButton variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </SampleButton>
                  </div>
                </div>
                <div className="flex justify-center">
                  <SampleButton variant="outline">Load More</SampleButton>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      {/* Fine-tune Model Dialog */}
      <FineTuneModelDialog
        open={isFineTuneDialogOpen}
        onOpenChange={setIsFineTuneDialogOpen}
        onFineTune={handleFineTune}
        modelName={model?.name}
      />

      {/* Update Model Dialog */}
      <UpdateModelDialog
        open={isUpdateModelDialogOpen}
        onOpenChange={setIsUpdateModelDialogOpen}
        onUpdate={handleUpdateModel}
        currentVersion={model?.version}
      />

      {/* Inference Detail Dialog */}
      <InferenceDetailDialog
        open={isInferenceDetailOpen}
        onOpenChange={setIsInferenceDetailOpen}
        inference={selectedInference}
      />

      {/* All KPIs Dialog */}
      <AllKPIsDialog
        open={isAllKPIsDialogOpen}
        onOpenChange={setIsAllKPIsDialogOpen}
        model={model}
      />
    </div>
  );
};

export default ModelDetail;

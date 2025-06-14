"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { api, useUtils } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { Route } from "next";

import { BarChart3, Settings, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SampleButton } from "@/components/ui/sample-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our new components
import { FineTuneModelDialog } from "@/components/dialog/FineTune";
import InferenceDetailDialog from "@/components/dialog/InferenceDetail";
import ImportanceDetail from "@/components/feature/ImportanceDetail";
import ModelVersions from "@/components/model/Versions";
import { AllKPIsDialog } from "@/components/dialog/AllKpis";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { ModelDetailSkeleton } from "@/components/skeletons/model-detail-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdminRoutes } from "@/constants/routes";
import { ConfusionMatrix } from "@/components/model";
import FeaturesViewer from "@/components/model/FeaturesViewer";
import InfoCard from "@/components/model/InfoCard";
import { RunInferenceDialog } from "@/components/dialog/RunInference";
import InputSchema from "@/components/model/InputSchema";
import OutputSchema from "@/components/model/OutputSchema";
import { ChartGrid } from "@/components/model";
import NumericalDetail from "@/components/feature/NumericalDetail";
import {
  capitalizeFirstLetterLowercase,
  toPercent,
  getTimeAgo,
} from "@/utils/func";

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
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [isClient, setIsClient] = useState(false);
  const modelItem = api.model.getByUUID.useQuery(slug);

  const [showRunInference, setShowRunInference] = useState(false);
  const [showInferenceDetail, setShowInferenceDetail] = useState(false);
  const [showAllKPIs, setShowAllKPIs] = useState(false);
  const [showFineTune, setShowFineTune] = useState(false);

  // State for model versions
  const [model, setModel] = useState<any | null>(null);
  const [modelVersions, setModelVersions] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (modelItem && !modelItem.isLoading && modelItem.data) {
      const modelData = modelItem.data;
      if (modelData) {
        setModel(modelData);
      }
    }
  }, [modelItem?.isLoading, modelItem?.data]);

  if (modelItem.error) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Model Not Found</AlertTitle>
          <AlertDescription>
            The requested model could not be found or you don't have permission
            to view it.
          </AlertDescription>
        </Alert>

        <SampleButton onClick={() => router.push(AdminRoutes.models as Route)}>
          Return to Models
        </SampleButton>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<DefaultSkeleton count={5} className="m-6" />}>
        <div className="flex min-h-screen w-full flex-col bg-background">
          {!modelItem.isLoading ? (
            <>
              <Breadcrumbs
                items={[{ label: "Back to Models", link: "/models" }]}
              />
              <div className="container mx-auto p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">{model?.name}</h1>
                    <p className="text-muted-foreground">
                      {model?.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    <SampleButton onClick={() => setShowRunInference(true)}>
                      Run Inference
                    </SampleButton>
                    <SampleButton
                      onClick={() => setShowFineTune(true)}
                      variant="outline"
                    >
                      Fine-tune
                    </SampleButton>
                    <SampleButton onClick={() => {}} variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </SampleButton>
                  </div>
                </div>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4 md:w-[600px] mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                    <TabsTrigger value="documentation">
                      Documentation
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Enhanced Model Information Card */}
                    <InfoCard 
                      modelInfo={model?.metrics[0]?.model_info_details}
                      className="mb-6"
                    />

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Model Type</CardTitle>
                          <CardDescription>
                            Classification type and framework
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium">
                            {capitalizeFirstLetterLowercase(model?.type) ||
                              "Classification"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {model?.framework || "PyTorch"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Accuracy</CardTitle>
                          <CardDescription>
                            Overall model performance
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {model?.metrics[0]?.accuracy
                              ? toPercent(model?.metrics[0]?.accuracy, 2)
                              : "0.00%"}
                          </p>
                          <SampleButton
                            variant="link"
                            className="p-0"
                            onClick={() => setShowAllKPIs(true)}
                          >
                            View all metrics
                          </SampleButton>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Last Updated</CardTitle>
                          <CardDescription>
                            Model version information
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{getTimeAgo(model?.updatedAt) || "2 days ago"}</p>
                          <p className="text-sm text-muted-foreground">
                            Version {model?.metrics[0]?.version}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Confusion Matrix */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Confusion Matrix</CardTitle>
                        <CardDescription>
                          Prediction accuracy visualization
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ConfusionMatrix
                          matrix={(() => {
                            const confusionChart = model?.metrics[0]?.charts_data?.find(
                              (chart: any) => chart.name === "Confusion Matrix"
                            );
                            
                            if (confusionChart) {
                              return {
                                raw: confusionChart.matrix,
                                labels: confusionChart.labels,
                              };
                            }
                            
                            // Fallback data
                            return {
                              raw: [
                                [85, 15],
                                [10, 90],
                              ],
                              labels: ["Negative", "Positive"],
                            };
                          })()}
                        />
                      </CardContent>
                    </Card>

                    <FeaturesViewer
                      features={model?.metrics[0]?.features?.features || []}
                      globalImportance={model?.metrics[0]?.feature_analysis?.global_importance || []}
                      modelName={model?.name}
                      numericalStats={model?.metrics[0]?.feature_analysis?.numerical_stats || {}}
                      categoricalAnalysis={model?.metrics[0]?.feature_analysis?.categorical_analysis || {}}
                    />

                    {/* Numerical Feature Analysis */}
                    {model?.metrics[0]?.feature_analysis?.numerical_stats?.credit_score && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Numerical Feature Analysis</h3>
                        <NumericalDetail
                          feature={{
                            name: "Credit Score",
                            stats: {
                              count: 1000,
                              mean: model.metrics[0].feature_analysis.numerical_stats.credit_score.good_class?.mean || 0,
                              std: 75,
                              min: model.metrics[0].feature_analysis.numerical_stats.credit_score.good_class?.min || 0,
                              max: model.metrics[0].feature_analysis.numerical_stats.credit_score.good_class?.max || 0,
                              q25: 600,
                              q50: model.metrics[0].feature_analysis.numerical_stats.credit_score.good_class?.median || 0,
                              q75: 720
                            },
                            importance: {
                              coefficient: 0.35,
                              abs_coefficient: 0.35,
                              rank: 1
                            }
                          }}
                        />
                      </div>
                    )}

                  </TabsContent>

                  <TabsContent value="performance" className="space-y-6">
                    {/* Dynamic Charts Section */}
                    {model?.metrics[0]?.charts_data && model.metrics[0].charts_data.length > 0 ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Charts</CardTitle>
                          <CardDescription>
                            Comprehensive model performance visualization
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartGrid 
                            charts={model.metrics[0].charts_data}
                            className="mt-4"
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Metrics</CardTitle>
                          <CardDescription>
                            Detailed model performance analysis
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No performance charts available
                            </p>
                            <SampleButton
                              variant="outline"
                              className="mt-4"
                              onClick={() => setShowAllKPIs(true)}
                            >
                              View All Metrics
                            </SampleButton>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Inferences</CardTitle>
                        <CardDescription>
                          Latest model predictions and their outcomes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(model?.recentInferences || []).length > 0 ? (
                            model.recentInferences.map(
                              (inference: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center border-b pb-2"
                                >
                                  <div>
                                    <p className="font-medium">
                                      Inference #{inference.id || index + 1}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {inference.timestamp || "2 hours ago"}
                                    </p>
                                  </div>
                                  <SampleButton
                                    variant="ghost"
                                    onClick={() => setShowInferenceDetail(true)}
                                  >
                                    View Details
                                  </SampleButton>
                                </div>
                              ),
                            )
                          ) : (
                            <p className="text-muted-foreground text-center py-4">
                              No recent inferences available
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="versions" className="space-y-6">
                    <ModelVersions versions={model?.metrics || []} />
                  </TabsContent>

                  <TabsContent value="documentation" className="space-y-6">
                    {/* API Documentation */}
                    <Card>
                      <CardHeader>
                        <CardTitle>API Usage</CardTitle>
                        <CardDescription>
                          How to integrate and use this model in your applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none dark:prose-invert">
                          <h3>Usage Guidelines</h3>
                          <p>
                            This model provides real-time predictions via REST API endpoints. 
                            It accepts JSON input and returns prediction results with confidence scores.
                          </p>
                          
                          <h4>Best Practices</h4>
                          <ul>
                            <li>Always validate input data before sending requests</li>
                            <li>Handle prediction confidence scores appropriately</li>
                            <li>Implement proper error handling for failed requests</li>
                            <li>Monitor model performance metrics regularly</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Input Schema Component */}
                    <InputSchema
                      inputSchema={model?.metrics[0]?.inference.inference?.input_schema}
                      modelName={model?.name}
                    />

                    {/* Output Schema Component */}
                    <OutputSchema
                      outputSchema={model?.metrics[0]?.inference.inference?.output}
                      modelName={model?.name}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Dialogs */}
              {showRunInference && (
                <RunInferenceDialog
                  open={showRunInference}
                  onOpenChange={setShowRunInference}
                  model={model}
                />
              )}

              {showInferenceDetail && (
                <InferenceDetailDialog
                  open={showInferenceDetail}
                  onOpenChange={setShowInferenceDetail}
                  inference={{
                    id: "inf_123",
                    timestamp: "2023-05-10T14:30:00Z",
                    inputs: { feature1: 0.5 },
                    result: "Positive",
                    confidence: 0.92,
                  }}
                />
              )}

              {showAllKPIs && (
                <AllKPIsDialog
                  open={showAllKPIs}
                  onOpenChange={setShowAllKPIs}
                  model={model}
                />
              )}

              {showFineTune && (
                <FineTuneModelDialog
                  open={showFineTune}
                  onOpenChange={setShowFineTune}
                />
              )}
            </>
          ) : (
            <ModelDetailSkeleton />
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ModelDetail;

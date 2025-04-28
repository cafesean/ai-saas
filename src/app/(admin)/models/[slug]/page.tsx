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
import { FineTuneModelDialog } from "@/components/fine-tune-model-dialog";
import { InferenceDetailDialog } from "@/components/inference-detail-dialog";
import { FeatureImportanceDetail } from "@/components/feature-importance-detail";
import { ModelVersions } from "@/components/model-versions";
import { AllKPIsDialog } from "@/components/all-kpis-dialog";
import Breadcrumbs from "@/components/breadcrambs";
import { ErrorBoundary } from "@/components/error-boundary";
import { DefaultSkeleton } from "@/components/skeletons/default-skeleton";
import { ModelDetailSkeleton } from "@/components/skeletons/model-detail-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdminRoutes } from "@/constants/routes";
import { ConfusionMatrix } from "@/components/confusion-matrix";
import { ModelFeaturesViewer } from "@/components/model-features-viewer";
import { RunInferenceDialog } from "@/components/run-inference-dialog";
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
  let modelItem = api.model.getByUUID.useQuery(slug);

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
                            {toPercent(model?.metrics[0]?.accuracy, 2) || "0.00%"}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="md:col-span-1">
                        <CardHeader>
                          <CardTitle>Feature Importance</CardTitle>
                          <CardDescription>
                            Top features influencing model predictions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <FeatureImportanceDetail
                            feature={{
                              name:
                                model?.metrics[0]?.features?.features?.[0]?.name ||
                                "Feature",
                              importance: model?.metrics[0]?.features
                                ?.features?.[0]?.importance
                                ? model?.metrics[0]?.features?.features?.[0]?.importance.toFixed(
                                    2,
                                  ) * 100
                                : 0,
                              description: "",
                              impact:
                                model?.metrics[0]?.features?.features[0]
                                  ?.importance > 0
                                  ? "positive"
                                  : "negative",
                            }}
                          />
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-1">
                        <CardHeader>
                          <CardTitle>Confusion Matrix</CardTitle>
                          <CardDescription>
                            Prediction accuracy visualization
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ConfusionMatrix
                            matrix={{
                              raw: [
                                [85, 15],
                                [10, 90],
                              ],
                              normalized: [
                                [0.85, 0.15],
                                [0.1, 0.9],
                              ],
                              labels: ["Negative", "Positive"],
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Model Features</CardTitle>
                        <CardDescription>
                          Input features and their descriptions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ModelFeaturesViewer
                          features={model?.metrics[0]?.features?.features || []}
                          modelName={model?.name}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-6">
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
                            Detailed performance metrics visualization
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
                    <Card>
                      <CardHeader>
                        <CardTitle>Model Versions</CardTitle>
                        <CardDescription>
                          Version history and performance comparison
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ModelVersions
                          versions={model?.metrics || []}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documentation" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Model Documentation</CardTitle>
                        <CardDescription>
                          Usage guidelines and technical specifications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none dark:prose-invert">
                          <h3>Overview</h3>
                          <p>
                            This model is designed to perform{" "}
                            {model?.type || "classification"} tasks using a{" "}
                            {model?.framework || "PyTorch"} framework. It was
                            trained on a proprietary dataset with{" "}
                            {model?.features?.length || 0} key features.
                          </p>

                          <h3>Input Format</h3>
                          <p>
                            The model accepts input data in JSON format with the
                            following structure:
                          </p>
                          <pre>{`{
  ${
    model?.features
      ?.map((f: any) => `"${f.name}": <${f.type || "value"}>`)
      .join(",\n  ") || '"feature": <value>'
  }
}`}</pre>

                          <h3>Output Format</h3>
                          <p>
                            The model returns predictions in the following
                            format:
                          </p>
                          <pre>{`{
  "prediction": "<class>",
  "confidence": <value between 0 and 1>,
  "timestamp": "<ISO date>"
}`}</pre>

                          <h3>Training Methodology</h3>
                          <p>
                            This model was trained using supervised learning
                            techniques on a dataset of 10,000 examples. It uses
                            optimization algorithms to minimize cross-entropy
                            loss.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
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

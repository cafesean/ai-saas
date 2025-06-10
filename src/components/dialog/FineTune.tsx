"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, FileUp, Upload, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getModels } from "@/lib/model-service";

interface FineTuneModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FineTuneModelDialog({
  open,
  onOpenChange,
}: FineTuneModelDialogProps) {
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [mappedFields, setMappedFields] = useState<{ [key: string]: string }>(
    {},
  );
  const [algorithm, setAlgorithm] = useState("xgboost");
  const [hyperParams, setHyperParams] = useState({
    learningRate: 0.1,
    maxDepth: 6,
    numEstimators: 100,
    l1Regularization: 0,
    l2Regularization: 1,
  });
  const [trainingStatus, setTrainingStatus] = useState<
    "idle" | "preparing" | "training" | "evaluating" | "complete" | "error"
  >("idle");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [baseModels, setBaseModels] = useState<any[]>([]);
  const [selectedBaseModel, setSelectedBaseModel] = useState("");
  const [modelFeatures, setModelFeatures] = useState<string[]>([]);
  const [testSplitRatio, setTestSplitRatio] = useState(20);
  const [validationSplitRatio, setValidationSplitRatio] = useState(10);
  const [useStratifiedSplit, setUseStratifiedSplit] = useState(true);

  // Sample dataset fields (would come from the uploaded file)
  const datasetFields = [
    "customer_id",
    "age",
    "income",
    "employment_length",
    "debt_to_income",
    "credit_score",
    "num_credit_lines",
    "num_late_payments_30d",
    "num_late_payments_60d",
    "num_late_payments_90d",
    "loan_amount",
    "loan_term",
    "loan_purpose",
    "interest_rate",
    "default",
  ];

  // Mock feature fields for the model (would come from the selected model)
  const modelFeatureFields = [
    "age",
    "income",
    "employment_years",
    "dti_ratio",
    "fico_score",
    "credit_lines",
    "late_30",
    "late_60",
    "late_90",
    "loan_amount",
    "term_months",
    "purpose_code",
    "rate",
    "target",
  ];

  useEffect(() => {
    // Fetch base models when dialog opens
    if (open) {
      const fetchModels = async () => {
        try {
          const models = await getModels();
          // Filter models that can be used as base models (have weights and artifacts)
          const availableBaseModels = models.filter(
            (model) => model.status === "published",
          );
          setBaseModels(availableBaseModels);
        } catch (error) {
          console.error("Failed to fetch base models:", error);
        }
      };

      fetchModels();
    }
  }, [open]);

  useEffect(() => {
    // When a base model is selected, fetch its features
    if (selectedBaseModel) {
      // In a real app, this would be an API call to get the model's features
      // For now, we'll simulate it with a timeout
      const fetchModelFeatures = async () => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Set model features (this would come from the API)
          setModelFeatures(modelFeatureFields);
        } catch (error) {
          console.error("Failed to fetch model features:", error);
        }
      };

      fetchModelFeatures();
    }
  }, [selectedBaseModel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate file upload with progress
    const totalTime = 2000;
    const interval = 100;
    const steps = totalTime / interval;

    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      setUploadProgress(Math.min(100, Math.round((i / steps) * 100)));
    }

    // Simulate successful upload
    setUploading(false);

    // Auto-generate field mappings based on name similarity
    const generatedMappings: { [key: string]: string } = {};

    datasetFields.forEach((dataField) => {
      // Find the closest match in model fields
      const match = modelFeatureFields.find(
        (modelField) =>
          dataField.toLowerCase().includes(modelField.toLowerCase()) ||
          modelField.toLowerCase().includes(dataField.toLowerCase()),
      );

      if (match) {
        generatedMappings[dataField] = match;
      }
    });

    setMappedFields(generatedMappings);
    setTab("map");
  };

  const handleStartTraining = () => {
    setTrainingStatus("preparing");
    setTrainingProgress(0);

    // Simulate the training process
    simulateTraining();
  };

  const simulateTraining = async () => {
    // Preparing data
    setTrainingStatus("preparing");
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setTrainingProgress(i);
    }

    // Training model
    setTrainingStatus("training");
    setTrainingProgress(0);
    for (let i = 0; i <= 100; i += 2) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setTrainingProgress(i);
    }

    // Evaluating model
    setTrainingStatus("evaluating");
    setTrainingProgress(0);
    for (let i = 0; i <= 100; i += 4) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      setTrainingProgress(i);
    }

    // Complete
    setTrainingStatus("complete");
    setTrainingProgress(100);
  };

  const renderTrainingStatus = () => {
    switch (trainingStatus) {
      case "idle":
        return null;
      case "preparing":
        return "Preparing data and splitting into train/validation/test sets...";
      case "training":
        return `Training model using ${algorithm}...`;
      case "evaluating":
        return "Evaluating model performance...";
      case "complete":
        return "Training complete! Model is ready for review.";
      case "error":
        return "An error occurred during training. Please try again.";
    }
  };

  const handleMapField = (dataField: string, modelField: string) => {
    setMappedFields({
      ...mappedFields,
      [dataField]: modelField,
    });
  };

  const handleUpdateHyperParam = (
    param: keyof typeof hyperParams,
    value: number,
  ) => {
    setHyperParams({
      ...hyperParams,
      [param]: value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Fine-tune Model</DialogTitle>
          <DialogDescription>
            Create a new model by fine-tuning an existing model with your data.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="base">1. Select Base Model</TabsTrigger>
            <TabsTrigger value="upload" disabled={!selectedBaseModel}>
              2. Upload Data
            </TabsTrigger>
            <TabsTrigger value="map" disabled={!file}>
              3. Map Fields
            </TabsTrigger>
            <TabsTrigger
              value="train"
              disabled={Object.keys(mappedFields).length === 0}
            >
              4. Train
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="base"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="base-model">
                  Select a base model to fine-tune
                </Label>
                <Select
                  value={selectedBaseModel}
                  onValueChange={setSelectedBaseModel}
                >
                  <SelectTrigger id="base-model">
                    <SelectValue placeholder="Select a base model" />
                  </SelectTrigger>
                  <SelectContent>
                    {baseModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} (v{model.metrics[0].version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBaseModel && (
                <Card>
                  <CardHeader>
                    <CardTitle>Base Model Features</CardTitle>
                    <CardDescription>
                      These are the features available in the selected base
                      model. Your uploaded data will need to be mapped to these
                      features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="grid grid-cols-2 gap-2">
                        {modelFeatures.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="justify-start"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <SampleButton
                  onClick={() => setTab("upload")}
                  disabled={!selectedBaseModel}
                >
                  Next: Upload Data
                </SampleButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="upload"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="space-y-4 mt-2">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="dataset">Upload Dataset (CSV or XLSX)</Label>
                <div className="flex items-center gap-2">
                  <SampleInput
                    id="dataset"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <SampleButton
                    size="sm"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    variant="secondary"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                    <Upload className="ml-2 h-4 w-4" />
                  </SampleButton>
                </div>
                {file && !uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileUp className="h-4 w-4" />
                    <span>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                  </div>
                )}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data Split Configuration</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Test Split: {testSplitRatio}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Train: {100 - testSplitRatio - validationSplitRatio}%,
                        Validation: {validationSplitRatio}%, Test:{" "}
                        {testSplitRatio}%
                      </span>
                    </div>
                    <Slider
                      value={[testSplitRatio]}
                      min={5}
                      max={30}
                      step={5}
                      onValueChange={([value]) => setTestSplitRatio(value || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Validation Split: {validationSplitRatio}%
                      </span>
                    </div>
                    <Slider
                      value={[validationSplitRatio]}
                      min={5}
                      max={20}
                      step={5}
                      onValueChange={([value]) =>
                        setValidationSplitRatio(value || 0)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stratified-split"
                      checked={useStratifiedSplit}
                      onCheckedChange={setUseStratifiedSplit}
                    />
                    <Label htmlFor="stratified-split">
                      Use stratified split (recommended for imbalanced datasets)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <SampleButton variant="outline" onClick={() => setTab("base")}>
                  Back
                </SampleButton>
                <SampleButton
                  onClick={() => setTab("map")}
                  disabled={!file || uploading}
                >
                  Next: Map Fields
                </SampleButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="map"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Map Dataset Fields to Model Features</Label>
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(mappedFields).length} of {datasetFields.length}{" "}
                    fields mapped
                  </span>
                </div>
                <ScrollArea className="h-[300px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dataset Field</TableHead>
                        <TableHead>Model Feature</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datasetFields.map((dataField) => (
                        <TableRow key={dataField}>
                          <TableCell>{dataField}</TableCell>
                          <TableCell>
                            <Select
                              value={mappedFields[dataField] || ""}
                              onValueChange={(value) =>
                                handleMapField(dataField, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select feature" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Not mapped</SelectItem>
                                {modelFeatureFields.map((feature) => (
                                  <SelectItem key={feature} value={feature}>
                                    {feature}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {mappedFields[dataField] ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                <Check className="mr-1 h-3 w-3" /> Mapped
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200"
                              >
                                <X className="mr-1 h-3 w-3" /> Unmapped
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              <div className="flex justify-between">
                <SampleButton
                  variant="outline"
                  onClick={() => setTab("upload")}
                >
                  Back
                </SampleButton>
                <SampleButton
                  onClick={() => setTab("train")}
                  disabled={Object.keys(mappedFields).length === 0}
                >
                  Next: Train Model
                </SampleButton>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="train"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xgboost">XGBoost</SelectItem>
                    <SelectItem value="lightgbm">LightGBM</SelectItem>
                    <SelectItem value="randomforest">Random Forest</SelectItem>
                    <SelectItem value="logisticregression">
                      Logistic Regression
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Hyperparameters</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Learning Rate: {hyperParams.learningRate}
                      </span>
                    </div>
                    <Slider
                      value={[hyperParams.learningRate * 100]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={([value]) =>
                        handleUpdateHyperParam("learningRate", value! / 100)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Max Depth: {hyperParams.maxDepth}
                      </span>
                    </div>
                    <Slider
                      value={[hyperParams.maxDepth]}
                      min={1}
                      max={15}
                      step={1}
                      onValueChange={([value]) =>
                        handleUpdateHyperParam("maxDepth", value!)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        Number of Estimators: {hyperParams.numEstimators}
                      </span>
                    </div>
                    <Slider
                      value={[hyperParams.numEstimators]}
                      min={10}
                      max={500}
                      step={10}
                      onValueChange={([value]) =>
                        handleUpdateHyperParam("numEstimators", value!)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        L1 Regularization: {hyperParams.l1Regularization}
                      </span>
                    </div>
                    <Slider
                      value={[hyperParams.l1Regularization * 10]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={([value]) =>
                        handleUpdateHyperParam("l1Regularization", value! / 10)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        L2 Regularization: {hyperParams.l2Regularization}
                      </span>
                    </div>
                    <Slider
                      value={[hyperParams.l2Regularization * 10]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={([value]) =>
                        handleUpdateHyperParam("l2Regularization", value! / 10)
                      }
                    />
                  </div>
                </div>
              </div>

              {trainingStatus !== "idle" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{renderTrainingStatus()}</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} />
                </div>
              )}

              {trainingStatus === "complete" && (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Model training completed successfully. You can now review
                    and deploy the model.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <SampleButton variant="outline" onClick={() => setTab("map")}>
                  Back
                </SampleButton>
                {trainingStatus === "idle" || trainingStatus === "error" ? (
                  <SampleButton onClick={handleStartTraining}>
                    Start Training
                  </SampleButton>
                ) : trainingStatus === "complete" ? (
                  <SampleButton onClick={() => onOpenChange(false)}>
                    Finish
                  </SampleButton>
                ) : (
                  <SampleButton disabled>Training in Progress...</SampleButton>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

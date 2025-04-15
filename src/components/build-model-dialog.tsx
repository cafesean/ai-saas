"use client";

import { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SampleButton } from "@/components/ui/sample-button";
import { SampleInput } from "@/components/ui/sample-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Layers } from "lucide-react";
import {
  BuildModelFormValues,
  buildModelSchema,
} from "@/framework/types/model";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface BuildModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuild: (modelData: BuildModelFormValues) => void;
}

const baseModels = [
  {
    id: "xgboost",
    name: "XGBoost",
    description: "Gradient boosting algorithm",
  },
  {
    id: "random-forest",
    name: "Random Forest",
    description: "Ensemble learning method",
  },
  {
    id: "logistic-regression",
    name: "Logistic Regression",
    description: "Statistical model",
  },
  {
    id: "neural-network",
    name: "Neural Network",
    description: "Deep learning model",
  },
  {
    id: "svm",
    name: "Support Vector Machine",
    description: "Supervised learning",
  },
];

const datasets = [
  { id: "credit-data-2023", name: "Credit Data 2023" },
  { id: "customer-transactions", name: "Customer Transactions" },
  { id: "fraud-detection-dataset", name: "Fraud Detection Dataset" },
  { id: "marketing-campaign", name: "Marketing Campaign" },
];

export function BuildModelDialog({
  open,
  onOpenChange,
  onBuild,
}: BuildModelDialogProps) {
  const [activeTab, setActiveTab] = useState<"select" | "configure" | "review">(
    "select",
  );

  const methods = useForm<BuildModelFormValues>({
    resolver: zodResolver(buildModelSchema),
    defaultValues: {
      name: "",
      version: "1.0.0",
      baseModel: "",
      dataset: "",
      hyperparameters: {
        learningRate: 0.01,
        maxDepth: 6,
        nEstimators: 100,
        minSamplesSplit: 2,
      },
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
    trigger,
  } = methods;

  const watchedBaseModel = watch("baseModel");
  const watchedName = watch("name");
  const watchedDataset = watch("dataset");
  const watchedHyperparameters = watch("hyperparameters");

  const onSubmit = (data: BuildModelFormValues) => {
    onBuild(data);
    reset();
    setActiveTab("select");
    onOpenChange(false);
  };

  const handleContinue = async () => {
    let isValidTab = false;
    if (activeTab === "select") {
      if (watchedBaseModel) {
        setActiveTab("configure");
      }
    } else if (activeTab === "configure") {
      isValidTab = await trigger([
        "name",
        "version",
        "dataset",
        "hyperparameters",
      ]);
      if (isValidTab) {
        setActiveTab("review");
      }
    }
  };

  const handleBack = () => {
    if (activeTab === "configure") {
      setActiveTab("select");
    } else if (activeTab === "review") {
      setActiveTab("configure");
    }
  };

  const getBaseModelById = (id: string) =>
    baseModels.find((model) => model.id === id);
  const getDatasetById = (id: string) => datasets.find((ds) => ds.id === id);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          setActiveTab("select");
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Build Model from Base Models</DialogTitle>
          <DialogDescription>
            Select a base model and configure it to build a new model.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "select" | "configure" | "review")
              }
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="select">Select Base Model</TabsTrigger>
                <TabsTrigger value="configure" disabled={!watchedBaseModel}>
                  Configure Model
                </TabsTrigger>
                <TabsTrigger
                  value="review"
                  disabled={
                    !watchedBaseModel || !watchedName || !watchedDataset
                  }
                >
                  Review & Build
                </TabsTrigger>
              </TabsList>

              <TabsContent value="select" className="space-y-4 py-4">
                <FormField
                  control={control}
                  name="baseModel"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {baseModels.map((model) => (
                        <Card
                          key={model.id}
                          className={`cursor-pointer hover:border-primary transition-colors ${
                            field.value === model.id
                              ? "border-primary ring-2 ring-primary"
                              : ""
                          }`}
                          onClick={() => field.onChange(model.id)}
                        >
                          <CardContent className="p-4 flex items-start gap-3">
                            <div className="bg-muted rounded-md p-2 mt-1">
                              <Layers className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{model.name}</h3>
                                {field.value === model.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {model.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent
                value="configure"
                className="space-y-4 py-4 max-h-[400px] overflow-scroll"
              >
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <SampleInput
                          placeholder="Enter model name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <SampleInput placeholder="e.g., 1.0.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="dataset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Dataset</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dataset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {datasets.map((ds) => (
                            <SelectItem key={ds.id} value={ds.id}>
                              {ds.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-medium">Hyperparameters</h3>
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="hyperparameters.learningRate"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Learning Rate</FormLabel>
                            <span className="text-sm font-medium">
                              {field.value}
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0.001}
                              max={0.1}
                              step={0.001}
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="hyperparameters.maxDepth"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Max Depth</FormLabel>
                            <span className="text-sm font-medium">
                              {field.value}
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={20}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="hyperparameters.nEstimators"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>N Estimators</FormLabel>
                            <span className="text-sm font-medium">
                              {field.value}
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              min={10}
                              max={500}
                              step={10}
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="hyperparameters.minSamplesSplit"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Min Samples Split</FormLabel>
                            <span className="text-sm font-medium">
                              {field.value}
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              min={2}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-4 py-4">
                <div className="border rounded-md p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Model Configuration Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground">
                        Base Model
                      </h4>
                      <p className="font-medium">
                        {watchedBaseModel
                          ? getBaseModelById(watchedBaseModel)?.name
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">
                        Model Name
                      </h4>
                      <p className="font-medium">{watchedName || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">Version</h4>
                      <p className="font-medium">{watch("version") || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">
                        Training Dataset
                      </h4>
                      <p className="font-medium">
                        {watchedDataset
                          ? getDatasetById(watchedDataset)?.name
                          : "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2 mt-2">
                      <h4 className="text-sm text-muted-foreground">
                        Hyperparameters
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 mt-1">
                        {Object.entries(watchedHyperparameters).map(
                          ([key, value]) => (
                            <div key={key}>
                              <span className="text-sm capitalize">
                                {key.replace(/([A-Z])/g, " $1")}:{" "}
                              </span>
                              <span className="text-sm font-medium">
                                {value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-4 mt-6">
                    <h4 className="font-medium">Estimated Training Time</h4>
                    <p className="text-sm mt-1">
                      Based on your configuration, the estimated training time
                      is 15-20 minutes. You'll receive a notification when the
                      model is ready.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex items-center justify-between mt-4">
              {activeTab !== "select" && (
                <SampleButton
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </SampleButton>
              )}
              {activeTab === "select" && <div className="flex-1"></div>}

              <div className="flex gap-2">
                <SampleButton
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </SampleButton>
                {activeTab === "review" ? (
                  <SampleButton type="submit" disabled={!isValid}>
                    Build Model
                  </SampleButton>
                ) : (
                  <SampleButton
                    type="button"
                    onClick={handleContinue}
                    disabled={
                      (activeTab === "select" && !watchedBaseModel) ||
                      (activeTab === "configure" &&
                        (!watchedName ||
                          !watch("version") ||
                          !watchedDataset ||
                          !!errors.name ||
                          !!errors.version ||
                          !!errors.dataset ||
                          !!errors.hyperparameters))
                    }
                  >
                    {activeTab === "select"
                      ? "Continue to Configuration"
                      : "Review Model"}
                  </SampleButton>
                )}
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

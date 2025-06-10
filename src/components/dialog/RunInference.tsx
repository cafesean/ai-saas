"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { SampleButton } from "@/components/ui/sample-button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronDown, ChevronUp, Download, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { mapFeatureType } from "@/lib/model-service";
import { capitalizeFirstLetterLowercase } from "@/utils/func";

const instance = axios.create();

interface Feature {
  name: string;
  type: string;
  description: string;
  required: boolean;
  format?: string;
  range?: string;
  defaultValue?: string;
  options?: string[];
  placeholder?: string;
  allowedValues?: string[];
}

interface RunInferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: any;
}

const formatFeatures = (model: any) => {
  const examplePayload =
    model.metrics[0]?.inference?.inference?.example_payload;
  const features = model.metrics[0]?.inference?.inference?.input_schema?.map(
    (input: any) => ({
      name: input.name,
      type: mapFeatureType(input.type),
      placeholder: `${
        examplePayload && examplePayload[input.name]
          ? ` Example: ${examplePayload[input.name]}`
          : ""
      }`,
      description: input.description,
      required: input.required || false,
      range: "",
      defaultValue: "0",
      allowedValues: input.allowed_values,
    }),
  );
  return features;
};

const validateValueByDataType = (value: string, type: string) => {
  if (value) {
    switch (type) {
      case "number":
        return !isNaN(parseFloat(value)) && isFinite(Number(value));
    }
  }
  return true;
};

export function RunInferenceDialog({
  open,
  onOpenChange,
  model,
}: RunInferenceDialogProps) {
  const [activeTab, setActiveTab] = useState("form");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isResultOpen, setIsResultOpen] = useState(true);
  // Extract features from model or use default credit scoring features
  const features: Feature[] = formatFeatures(model) || [];

  const handleInputChange = (name: string, value: any, type: string) => {
    if (validateValueByDataType(value, type)) {
      switch (type) {
        case "number":
          setFormValues((prev) => ({ ...prev, [name]: value }));
          break;
        default:
          setFormValues((prev) => ({ ...prev, [name]: value }));
          break;
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Based on type of feature to convert str to float
    for (const feature of features) {
      if (feature.type === "number" && formValues[feature.name]) {
        formValues[feature.name] = parseFloat(formValues[feature.name]);
      }
    }
    const option = {
      url: `/api/inference/${model.uuid}`,
      method: "POST",
      data: {
        ...formValues,
      },
    };
    const inferenceResponse = await instance(option);
    if (!inferenceResponse?.data?.data?.error) {
      // Only show the feature contributions if the feature in formValues
      // is in the feature_contributions
      const featureContributions =
        inferenceResponse?.data?.data.feature_contributions[0].values;
      const featureContributionsKeys = Object.keys(featureContributions);
      const formValuesKeys = Object.keys(formValues);
      const featureContributionsToShow = featureContributionsKeys.filter(
        (key) => formValuesKeys.includes(key),
      );
      const featureContributionsToShowValues = featureContributionsToShow.map(
        (key) => ({
          name: key,
          value: parseFloat(featureContributions[key]),
        }),
      );
      setResult({
        prediction: inferenceResponse?.data?.data.prob,
        probability:
          Math.round(inferenceResponse?.data?.data.probability * 100) / 100,
        timestamp: new Date().toISOString(),
        featureContributionsToShowValues,
      });
    } else {
      toast.error(inferenceResponse?.data?.data?.error);
    }

    setActiveTab("result");
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormValues({});
    setResult(null);
    setActiveTab("form");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Run Model Inference</DialogTitle>
          <DialogDescription>
            Test {model?.name || "model"} by providing input values and viewing
            the prediction results
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">Input Form</TabsTrigger>
            <TabsTrigger value="json" disabled={isLoading}>
              JSON
            </TabsTrigger>
            <TabsTrigger value="result" disabled={!result}>
              Result
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4 py-4">
            <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="grid grid-cols-2 items-center gap-4"
                >
                  <Label htmlFor={feature.name} className="text-right">
                    {feature.name}
                    {feature.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  <div className="col-span-1 space-y-1">
                    {renderInputForFeature(
                      feature,
                      formValues,
                      handleInputChange,
                    )}
                    {feature.description && (
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="json" className="py-4">
            <div className="rounded-md border bg-muted p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(formValues, null, 2) ||
                  "// Enter values in the form tab"}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You can also paste JSON directly to populate the form.
            </p>
          </TabsContent>

          <TabsContent value="result" className="py-4">
            {result && (model?.type === "credit-scoring" || !model?.type) ? (
              <CreditScoringResult
                result={result}
                isOpen={isResultOpen}
                onToggle={() => setIsResultOpen(!isResultOpen)}
              />
            ) : result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {model.metrics[0]?.inference?.inference?.output_schema?.map(
                    (output: any, oi: number) => (
                      <div
                        key={`${output.name}-${oi}`}
                        className="bg-muted/30 p-4 rounded-md"
                      >
                        <div className="text-sm text-muted-foreground">
                          {capitalizeFirstLetterLowercase(output.name)}
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {result[output.name]}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium mb-2">
                    Feature Contributions
                  </h4>
                  <div className="space-y-2">
                    {result.featureContributionsToShowValues.map(
                      (feature: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>{feature.name}</span>
                          <span className="font-medium">
                            {Math.round(feature.value * 10000) / 10000}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Run the model to see results</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {activeTab === "result" && (
              <SampleButton variant="outline" size="sm" onClick={resetForm}>
                New Inference
              </SampleButton>
            )}
          </div>
          <div className="flex gap-2">
            <SampleButton variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </SampleButton>
            {activeTab !== "result" && (
              <SampleButton onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Processing..." : "Run Inference"}
              </SampleButton>
            )}
            {activeTab === "result" && result && (
              <SampleButton>
                <Download className="mr-2 h-4 w-4" />
                Export Result
              </SampleButton>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function renderInputForFeature(
  feature: Feature,
  values: Record<string, any>,
  onChange: (name: string, value: any, type: string) => void,
) {
  const value = values[feature.name] || "";

  switch (feature.type) {
    case "number":
      return (
        <Input
          id={feature.name}
          type="text"
          value={value}
          onChange={(e) => onChange(feature.name, e.target.value, feature.type)}
          placeholder={feature.placeholder}
          required={feature.required}
        />
      );
    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={feature.name}
            checked={value === true}
            onCheckedChange={(checked) =>
              onChange(feature.name, checked, feature.type)
            }
          />
          <Label htmlFor={feature.name}>Enabled</Label>
        </div>
      );
    case "select":
      return (
        <Select
          value={value}
          onValueChange={(val) => onChange(feature.name, val, feature.type)}
        >
          <SelectTrigger id={feature.name}>
            <SelectValue placeholder={`Select ${feature.name}`} />
          </SelectTrigger>
          <SelectContent>
            {feature.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "string":
      if (feature.allowedValues) {
        return (
          <Select
            value={value}
            onValueChange={(val) => onChange(feature.name, val, feature.type)}
          >
            <SelectTrigger id={feature.name}>
              <SelectValue placeholder={`Select ${feature.name}`} />
            </SelectTrigger>
            <SelectContent>
              {feature.allowedValues?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      } else {
        return (
          <Input
            id={feature.name}
            type="text"
            value={value}
            onChange={(e) =>
              onChange(feature.name, e.target.value, feature.type)
            }
            placeholder={feature.placeholder}
            required={feature.required}
          />
        );
      }
    case "range":
      const [min, max] = (feature.range || "0,100").split(",").map(Number);
      return (
        <div className="space-y-2">
          <Slider
            id={feature.name}
            min={min}
            max={max}
            step={1}
            value={[Number.parseInt(value) || min || 0]}
            onValueChange={(val) =>
              onChange(feature.name, val[0], feature.type)
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span>{value || min}</span>
            <span>{max}</span>
          </div>
        </div>
      );
    default:
      return (
        <Input
          id={feature.name}
          type="text"
          value={value}
          onChange={(e) => onChange(feature.name, e.target.value, feature.type)}
          placeholder={feature.placeholder}
          required={feature.required}
        />
      );
  }
}

interface CreditScoringResultProps {
  result: any;
  isOpen: boolean;
  onToggle: () => void;
}

function CreditScoringResult({
  result,
  isOpen,
  onToggle,
}: CreditScoringResultProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Credit Score</CardTitle>
            <Badge
              variant={
                result.score >= 720
                  ? "default"
                  : result.score >= 680
                  ? "secondary"
                  : result.score >= 620
                  ? "outline"
                  : "destructive"
              }
            >
              {result.score}
            </Badge>
          </div>
          <CardDescription>
            Decision: <span className="font-medium">{result.decision}</span> •
            Risk Level: <span className="font-medium">{result.riskLevel}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="relative pt-5">
            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
            </div>
            <div
              className="absolute top-0 w-4 h-4 bg-primary rounded-full -mt-0.5 -ml-2 border-2 border-background"
              style={{
                left: `${Math.min(
                  100,
                  Math.max(0, (result.score - 300) / 5.5),
                )}%`,
              }}
            ></div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm">Approval Probability</div>
              <div className="font-medium">
                {(result.probability * 100).toFixed(1)}%
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${result.probability * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between text-sm text-muted-foreground">
          <div>Generated on {new Date(result.timestamp).toLocaleString()}</div>
          <CollapsibleTrigger
            onClick={onToggle}
            className="flex items-center hover:text-foreground"
          >
            {isOpen ? "Hide Details" : "Show Details"}
            {isOpen ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </CardFooter>
      </Card>

      <Collapsible open={isOpen}>
        <CollapsibleContent className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Factors</CardTitle>
              <CardDescription>
                Factors that influenced this credit decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.factors.map((factor: any, index: number) => (
                  <div key={index} className="flex items-start">
                    {factor.impact === "positive" ? (
                      <div className="mr-2 mt-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="mr-2 mt-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full">
                        <X className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">{factor.name}</div>
                        <Badge
                          variant={
                            factor.impact === "positive"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {factor.impact}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {factor.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recommended Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Recommended
                    </div>
                    <div className="font-medium">
                      {result.limits.recommendedLimit}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Maximum</div>
                    <div className="font-medium">{result.limits.maxLimit}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">Minimum</div>
                    <div className="font-medium">{result.limits.minLimit}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Loan Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Recommended Term
                    </div>
                    <div className="font-medium">
                      {result.terms.recommendedTerm}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Interest Rate
                    </div>
                    <div className="font-medium">
                      {result.terms.interestRate}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Monthly Payment
                    </div>
                    <div className="font-medium">
                      {result.terms.monthlyPayment}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

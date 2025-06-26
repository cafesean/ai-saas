"use client";

import { useState } from "react";
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
import { AlertTriangle, Check, ChevronDown, ChevronUp, Download, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { mapFeatureType } from "@/lib/model-service";
import { capitalizeFirstLetterLowercase } from "@/utils/func";

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

  // Generate complete test data scenarios based on actual model features
  const generateCompleteTestData = () => {
    // Base values for different risk profiles
    const baseScenarios = {
      lowRisk: {
        name: "Low Risk Profile",
        description: "High income, stable employment, good credit history",
        values: {
          loan_amnt: 15000,
          term: " 36 months",
          emp_length: "10+ years",
          home_ownership: "MORTGAGE",
          annual_inc: 85000,
          verification_status: "Verified",
          purpose: "debt_consolidation",
          addr_state: "CA",
          dti: 12.5,
          delinq_2yrs: 0,
          earliest_cr_line: "Jan-95",
          inq_last_6mths: 1,
          open_acc: 12,
          pub_rec: 0,
          revol_bal: 8500,
          revol_util: 15.2,
          total_acc: 25,
          acc_now_delinq: 0,
          issue_d: "Dec-23"
        } as Record<string, any>
      },
      mediumRisk: {
        name: "Medium Risk Profile", 
        description: "Moderate income, some credit inquiries, average DTI",
        values: {
          loan_amnt: 18000,
          term: " 60 months", 
          emp_length: "3 years",
          home_ownership: "RENT",
          annual_inc: 55000,
          verification_status: "Source Verified",
          purpose: "credit_card",
          addr_state: "TX",
          dti: 18.7,
          delinq_2yrs: 1,
          earliest_cr_line: "Aug-05",
          inq_last_6mths: 3,
          open_acc: 8,
          pub_rec: 0,
          revol_bal: 12800,
          revol_util: 28.5,
          total_acc: 18,
          acc_now_delinq: 0,
          issue_d: "Nov-23"
        } as Record<string, any>
      },
      highRisk: {
        name: "High Risk Profile",
        description: "Lower income, high DTI, recent credit activity",
        values: {
          loan_amnt: 25000,
          term: " 60 months",
          emp_length: "< 1 year", 
          home_ownership: "RENT",
          annual_inc: 42000,
          verification_status: "Not Verified",
          purpose: "home_improvement",
          addr_state: "FL",
          dti: 27.8,
          delinq_2yrs: 2,
          earliest_cr_line: "Mar-10",
          inq_last_6mths: 6,
          open_acc: 6,
          pub_rec: 1,
          revol_bal: 18500,
          revol_util: 45.8,
          total_acc: 12,
          acc_now_delinq: 1,
          issue_d: "Oct-23"
        } as Record<string, any>
      }
    };

    // Generate complete data for each scenario by filling in ALL model features
    const completeScenarios: Record<string, any> = {};
    
    Object.entries(baseScenarios).forEach(([key, scenario]) => {
      const completeData: Record<string, any> = {};
      
      // Fill in every feature that the model expects
      features.forEach((feature) => {
        if (scenario.values[feature.name] !== undefined) {
          // Use predefined value from scenario
          completeData[feature.name] = scenario.values[feature.name];
        } else {
          // Generate reasonable default based on feature name and type
          completeData[feature.name] = generateDefaultValue(feature, key);
        }
      });
      
      completeScenarios[key] = {
        name: scenario.name,
        description: scenario.description,
        data: completeData
      };
    });
    
    return completeScenarios;
  };

  // Generate reasonable default values for missing features
  const generateDefaultValue = (feature: Feature, scenarioType: string): any => {
    const { name, type, allowedValues } = feature;
    
    // If there are allowed values, pick one based on scenario
    if (allowedValues && allowedValues.length > 0) {
      const riskIndex = scenarioType === 'lowRisk' ? 0 : scenarioType === 'mediumRisk' ? Math.floor(allowedValues.length / 2) : allowedValues.length - 1;
      return allowedValues[Math.min(riskIndex, allowedValues.length - 1)];
    }
    
    // Generate values based on feature name patterns
    if (type === 'number') {
      // Numeric defaults based on common credit risk features
      const numericDefaults: Record<string, Record<string, number>> = {
        lowRisk: {
          income: 80000, balance: 5000, amount: 15000, months: 36,
          years: 8, count: 2, rate: 0.05, score: 750, util: 15
        },
        mediumRisk: {
          income: 50000, balance: 10000, amount: 20000, months: 48,
          years: 4, count: 4, rate: 0.15, score: 650, util: 30
        },
        highRisk: {
          income: 35000, balance: 15000, amount: 25000, months: 60,
          years: 2, count: 8, rate: 0.25, score: 550, util: 50
        }
      };
      
      const defaults = numericDefaults[scenarioType];
      if (!defaults) return 0; // Fallback if scenario type not found
      
      const lowerName = name.toLowerCase();
      
      if (lowerName.includes('income') || lowerName.includes('annual')) return defaults.income;
      if (lowerName.includes('balance') || lowerName.includes('bal')) return defaults.balance;
      if (lowerName.includes('amount') || lowerName.includes('amnt')) return defaults.amount;
      if (lowerName.includes('month') || lowerName.includes('term')) return defaults.months;
      if (lowerName.includes('year') || lowerName.includes('length')) return defaults.years;
      if (lowerName.includes('count') || lowerName.includes('acc') || lowerName.includes('inq')) return defaults.count;
      if (lowerName.includes('rate') || lowerName.includes('dti')) return defaults.rate;
      if (lowerName.includes('score')) return defaults.score;
      if (lowerName.includes('util')) return defaults.util;
      
      return defaults.count; // Generic numeric default
    }
    
    // String defaults based on feature patterns
    const lowerName = name.toLowerCase();
    if (lowerName.includes('state')) return scenarioType === 'lowRisk' ? 'CA' : scenarioType === 'mediumRisk' ? 'TX' : 'FL';
    if (lowerName.includes('purpose')) return scenarioType === 'lowRisk' ? 'debt_consolidation' : scenarioType === 'mediumRisk' ? 'credit_card' : 'home_improvement';
    if (lowerName.includes('home') || lowerName.includes('ownership')) return scenarioType === 'lowRisk' ? 'MORTGAGE' : 'RENT';
    if (lowerName.includes('verification')) return scenarioType === 'lowRisk' ? 'Verified' : scenarioType === 'mediumRisk' ? 'Source Verified' : 'Not Verified';
    if (lowerName.includes('emp')) return scenarioType === 'lowRisk' ? '10+ years' : scenarioType === 'mediumRisk' ? '3 years' : '< 1 year';
    if (lowerName.includes('term')) return scenarioType === 'lowRisk' ? ' 36 months' : ' 60 months';
    if (lowerName.includes('date') || lowerName.includes('issue')) return 'Dec-23';
    if (lowerName.includes('earliest') || lowerName.includes('cr_line')) return scenarioType === 'lowRisk' ? 'Jan-95' : scenarioType === 'mediumRisk' ? 'Aug-05' : 'Mar-10';
    
    return ''; // Default empty string for unknown features
  };

  // Generate complete test data scenarios
  const testDataScenarios = generateCompleteTestData();

  const loadTestData = (scenario: keyof typeof testDataScenarios) => {
    const testData = testDataScenarios[scenario].data;
    setFormValues(testData);
    toast.success(`Loaded ${testDataScenarios[scenario].name} test data (${Object.keys(testData).length} fields)`);
  };

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
    setResult(null); // Clear previous results to prevent UI conflicts
    
    try {
      // Based on type of feature to convert str to float
      for (const feature of features) {
        if (feature.type === "number" && formValues[feature.name]) {
          formValues[feature.name] = parseFloat(formValues[feature.name]);
        }
      }
      
      const response = await fetch(`/api/inference/${model.uuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use the default error message
          console.warn("Could not parse error response as JSON:", parseError);
        }
        
        // Show error message but don't throw - this prevents the error cascade
        console.error("Inference failed:", errorMessage);
        toast.error(errorMessage);
        return; // Exit early instead of throwing
      }

      const inferenceResponse = await response.json();
      
      if (inferenceResponse?.success && !inferenceResponse?.error) {
        // Extract data from the response - handle both nested and direct structures
        const responseData = inferenceResponse.data || inferenceResponse;
        const featureContributions = responseData.feature_contributions?.[0];
        
        // Get scorecard data if available
        const scorecard = featureContributions?.scorecard;
        
        // Quick debug to see scorecard structure
        console.log('Scorecard in response:', featureContributions?.scorecard ? 'EXISTS' : 'MISSING', featureContributions?.scorecard);
        
        // Process feature contributions for display
        let featureContributionsToShowValues: { name: string; value: number }[] = [];
        if (featureContributions?.values) {
          const featureContributionsKeys = Object.keys(featureContributions.values);
          const formValuesKeys = Object.keys(formValues);
          const featureContributionsToShow = featureContributionsKeys.filter(
            (key) => formValuesKeys.includes(key),
          );
          featureContributionsToShowValues = featureContributionsToShow.map(
            (key) => ({
              name: key,
              value: parseFloat(featureContributions.values[key]),
            }),
          );
        }
        
        // Set result with proper probability field
        setResult({
          prediction: responseData.prediction,
          probability: responseData.probability || 0,
          timestamp: new Date().toISOString(),
          featureContributionsToShowValues,
          scorecard: scorecard,
          rawFeatureContributions: featureContributions,
        });
        
        setActiveTab("result");
      } else {
        const errorMsg = inferenceResponse?.data?.error || inferenceResponse?.error || "Inference failed";
        console.error("Inference response error:", errorMsg);
        toast.error(errorMsg);
      }
      
    } catch (error) {
      console.error("Inference request failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to run inference";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormValues({});
    setResult(null);
    setActiveTab("form");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Run Model Inference</DialogTitle>
          <DialogDescription>
            Test {model?.name || "model"} by providing input values and viewing
            the prediction results
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
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
            {/* Test Data Quick Load Buttons */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Quick Test Data</h4>
                <Badge variant="outline" className="text-xs">Load Sample</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {Object.entries(testDataScenarios).map(([key, scenario]) => (
                  <div key={key} className="space-y-1">
                    <SampleButton
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => loadTestData(key as keyof typeof testDataScenarios)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-xs">{scenario.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {scenario.description}
                        </div>
                      </div>
                    </SampleButton>
                  </div>
                ))}
              </div>
            </Card>

            <Separator />

            {/* Existing Form Fields */}
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

          <TabsContent value="result" className="py-4 max-h-[70vh] overflow-y-auto">
            {result ? (
              <CreditScorecardResult
                result={result}
                isOpen={isResultOpen}
                onToggle={() => setIsResultOpen(!isResultOpen)}
              />
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

interface CreditScorecardResultProps {
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

function CreditScorecardResult({
  result,
  isOpen,
  onToggle,
}: CreditScorecardResultProps) {
  const scorecard = result.scorecard;
  
  if (!scorecard) {
    // Show basic result with probability if no scorecard
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Credit Risk Prediction</CardTitle>
            <CardDescription>Basic inference result</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Prediction</div>
                <div className="font-semibold text-lg">{result.prediction}</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Probability</div>
                <div className="font-semibold text-lg">
                  {result.probability ? `${Math.round(result.probability * 100)}%` : 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Feature Contributions */}
            {result.featureContributionsToShowValues?.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Feature Contributions</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.featureContributionsToShowValues.map((feature: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground">{feature.name}</span>
                      <span className="font-mono">{feature.value?.toFixed(4) || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert probability to percentage for display
  const probabilityPercent = Math.round((result.probability || 0) * 100);
  
  return (
    <div className="space-y-4">
      {/* Credit Score Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Credit Risk Assessment</CardTitle>
              <CardDescription className="mt-1">
                Application: {scorecard.application_id} • Generated: {scorecard.date_generated}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{scorecard.ai_model_score}</div>
              <Badge
                variant={
                  scorecard.ai_model_score >= 720
                    ? "default"
                    : scorecard.ai_model_score >= 680
                    ? "secondary"
                    : scorecard.ai_model_score >= 620
                    ? "outline"
                    : "destructive"
                }
                className="mt-1"
              >
                {scorecard.risk_tier}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Decision</div>
              <div className="font-semibold text-lg">{scorecard.decision_recommendation}</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Default Probability</div>
              <div className="font-semibold text-lg">{probabilityPercent}%</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Conditions</div>
              <div className="font-semibold text-sm">{scorecard.conditions}</div>
            </div>
          </div>
          
          {/* Score Scale Visual */}
          <div className="relative pt-5">
            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
              <span>300</span>
              <span>500</span>
              <span>650</span>
              <span>750</span>
              <span>850</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
            </div>
            <div
              className="absolute top-0 w-4 h-4 bg-primary rounded-full -mt-0.5 -ml-2 border-2 border-background"
              style={{
                left: `${Math.min(100, Math.max(0, (scorecard.ai_model_score - 300) / 5.5))}%`,
              }}
            ></div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between text-sm text-muted-foreground">
          <div>Model: {scorecard.model_info?.model_version}</div>
          <button
            onClick={onToggle}
            className="flex items-center hover:text-foreground"
          >
            {isOpen ? "Hide Details" : "Show Details"}
            {isOpen ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </button>
        </CardFooter>
      </Card>

      {/* Collapsible Details */}
      {isOpen && (
        <div className="space-y-4">
          {/* Feature Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Factor Analysis</CardTitle>
              <CardDescription>
                Ranked features and their impact on the credit decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scorecard.feature_breakdown?.slice(0, 8).map((feature: any, index: number) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Badge variant="outline" className="text-xs">
                        #{feature.rank}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{feature.feature_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {feature.feature_category}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {feature.reason_description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">{feature.applicant_value}</div>
                      <Badge
                        variant={feature.risk_direction === "negative" ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {feature.risk_direction === "negative" ? "↓ Lower Risk" : "↑ Higher Risk"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Contributions (Technical) */}
          {result.featureContributionsToShowValues.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Technical Feature Contributions</CardTitle>
                <CardDescription>
                  Raw feature contribution values for technical analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.featureContributionsToShowValues.map(
                    (feature: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm py-1"
                      >
                        <span className="text-muted-foreground">{feature.name}</span>
                        <span className="font-mono">{feature.value.toFixed(4)}</span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

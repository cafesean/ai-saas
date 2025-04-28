"use client";

import { useState } from "react";
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
} from "@/components/ui/select";
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

interface Feature {
  name: string;
  type: string;
  description: string;
  required: boolean;
  format?: string;
  range?: string;
  defaultValue?: string;
  options?: string[];
}

interface RunInferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: any;
}

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
  const features: Feature[] = model?.features || [
    {
      name: "payment_history_score",
      type: "number",
      description: "Credit score based on payment history (300-850)",
      required: true,
      range: "300,850",
      defaultValue: "720",
    },
    {
      name: "credit_utilization",
      type: "number",
      description: "Credit utilization ratio (0.0-1.0)",
      required: true,
      range: "0,1",
      defaultValue: "0.3",
    },
    {
      name: "account_age_years",
      type: "number",
      description: "Age of oldest account in years",
      required: true,
      defaultValue: "5",
    },
    {
      name: "recent_inquiries",
      type: "number",
      description: "Number of credit inquiries in last 12 months",
      required: true,
      defaultValue: "1",
    },
    {
      name: "income_level",
      type: "select",
      description: "Annual income level",
      required: true,
      options: ["low", "medium", "high"],
      defaultValue: "medium",
    },
    {
      name: "employment_status",
      type: "select",
      description: "Current employment status",
      required: true,
      options: ["unemployed", "part_time", "full_time", "self_employed"],
      defaultValue: "full_time",
    },
    {
      name: "debt_to_income",
      type: "number",
      description: "Debt to income ratio (0.0-1.0)",
      required: true,
      range: "0,1",
      defaultValue: "0.28",
    },
    {
      name: "loan_amount",
      type: "number",
      description: "Requested loan amount in dollars",
      required: true,
      defaultValue: "25000",
    },
    {
      name: "loan_term_months",
      type: "select",
      description: "Requested loan term in months",
      required: true,
      options: ["12", "24", "36", "48", "60"],
      defaultValue: "36",
    },
    {
      name: "loan_purpose",
      type: "select",
      description: "Purpose of the loan",
      required: true,
      options: [
        "auto",
        "home",
        "education",
        "medical",
        "debt_consolidation",
        "other",
      ],
      defaultValue: "auto",
    },
  ];

  const handleInputChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Generate a sample result based on the model type
      if (model?.type === "credit-scoring" || !model?.type) {
        setResult({
          score: 682,
          decision: "Approve",
          probability: 0.78,
          riskLevel: "Medium-Low",
          timestamp: new Date().toISOString(),
          factors: [
            {
              name: "Payment History",
              impact: "positive",
              value: formValues.payment_history_score || "Good",
            },
            {
              name: "Credit Utilization",
              impact: "negative",
              value: formValues.credit_utilization || "High",
            },
            {
              name: "Length of Credit History",
              impact: "positive",
              value: formValues.account_age_years || "Long",
            },
            {
              name: "Recent Inquiries",
              impact: "negative",
              value: formValues.recent_inquiries || "Multiple",
            },
          ],
          limits: {
            recommendedLimit: "$5,000",
            maxLimit: "$8,000",
            minLimit: "$2,000",
          },
          terms: {
            recommendedTerm: "36 months",
            interestRate: "12.5%",
            monthlyPayment: "$165.27",
          },
        });
      } else {
        // Generic result for other model types
        setResult({
          prediction: Math.random() > 0.5 ? 1 : 0,
          probability: Math.random().toFixed(2),
          timestamp: new Date().toISOString(),
          features: Object.entries(formValues).map(([key, value]) => ({
            name: key,
            value,
          })),
        });
      }

      setActiveTab("result");
      setIsLoading(false);
    }, 1500);
  };

  const resetForm = () => {
    setFormValues({});
    setResult(null);
    setActiveTab("form");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
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
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor={feature.name} className="text-right">
                    {feature.name}
                    {feature.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  <div className="col-span-3 space-y-1">
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
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">
                      Prediction
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {result.prediction}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="text-sm text-muted-foreground">
                      Probability
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {result.probability}
                    </div>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium mb-2">
                    Feature Contributions
                  </h4>
                  <div className="space-y-2">
                    {result.features.map((feature: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{feature.name}</span>
                        <span className="font-medium">{feature.value}</span>
                      </div>
                    ))}
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
  onChange: (name: string, value: any) => void,
) {
  const value = values[feature.name] || feature.defaultValue || "";

  switch (feature.type) {
    case "number":
      return (
        <Input
          id={feature.name}
          type="number"
          value={value}
          onChange={(e) => onChange(feature.name, e.target.value)}
          placeholder={feature.description}
          required={feature.required}
        />
      );
    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={feature.name}
            checked={value === true}
            onCheckedChange={(checked) => onChange(feature.name, checked)}
          />
          <Label htmlFor={feature.name}>Enabled</Label>
        </div>
      );
    case "select":
      return (
        <Select
          value={value}
          onValueChange={(val) => onChange(feature.name, val)}
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
    case "range":
      const [min, max] = (feature.range || "0,100").split(",").map(Number);
      return (
        <div className="space-y-2">
          <Slider
            id={feature.name}
            min={min}
            max={max}
            step={1}
            value={[Number.parseInt(value) || (min || 0)]}
            onValueChange={(val) => onChange(feature.name, val[0])}
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
          onChange={(e) => onChange(feature.name, e.target.value)}
          placeholder={feature.description}
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

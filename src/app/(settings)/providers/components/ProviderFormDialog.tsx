"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  TestTube,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "@/utils/trpc";
import { toast } from "sonner";
import { 
  type ProviderConfig, 
  ProviderType, 
} from "@/types/provider.types";

// Type for provider list items from the API
type ProviderListItem = {
  id: string;
  type: string;
  name: string;
  description?: string;
  enabled: boolean;
  isInitialized: boolean;
  status: string;
};
import { ProviderConfigurationService } from "@/services/provider-configurations.service";

interface ProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  provider?: ProviderListItem | null;
  mode: "create" | "edit";
}

// Form schema
const providerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  type: z.nativeEnum(ProviderType),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  apiKey: z.string().min(1, "API Key is required"),
  baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  timeout: z.number().min(1000).max(300000).optional(),
  maxRetries: z.number().min(0).max(10).optional(),
});

type ProviderFormData = z.infer<typeof providerFormSchema>;

export function ProviderFormDialog({
  open,
  onOpenChange,
  onSuccess,
  provider,
  mode,
}: ProviderFormDialogProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch full provider details when editing
  const { data: fullProvider, isLoading: isLoadingProvider } = api.provider.get.useQuery(
    { providerId: provider?.id || "" },
    { 
      enabled: mode === "edit" && !!provider?.id,
      refetchOnWindowFocus: false,
    }
  );

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: "",
      type: ProviderType.OPENAI,
      description: "",
      enabled: true,
      apiKey: "",
      baseUrl: "",
      timeout: 30000,
      maxRetries: 3,
    },
  });

  // Watch the provider type to show relevant information
  const selectedProviderType = form.watch("type");
  const providerTemplate = ProviderConfigurationService.getProviderTemplate(selectedProviderType);
  const configHints = ProviderConfigurationService.getConfigurationHints(selectedProviderType);

  // Mutations
  const createMutation = api.provider.register.useMutation({
    onSuccess: () => {
      toast.success("Provider created successfully");
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to create provider: ${error.message}`);
    },
  });

  const updateMutation = api.provider.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Provider updated successfully");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Failed to update provider: ${error.message}`);
    },
  });

  const testConnectionMutation = api.provider.testConnection.useMutation({
    onSuccess: (result) => {
      setTestResult({
        success: result.success,
        message: result.message || "Connection successful",
      });
      setIsTestingConnection(false);
    },
    onError: (error) => {
      setTestResult({
        success: false,
        message: error.message,
      });
      setIsTestingConnection(false);
    },
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (mode === "edit" && fullProvider && !isLoadingProvider) {
      form.reset({
        name: fullProvider.config.name,
        type: fullProvider.type as ProviderType,
        description: fullProvider.config.description || "",
        enabled: fullProvider.config.enabled,
        apiKey: fullProvider.config.apiKey || "",
        baseUrl: fullProvider.config.baseUrl || "",
        timeout: fullProvider.config.timeout || 30000,
        maxRetries: fullProvider.config.maxRetries || 3,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        type: ProviderType.OPENAI,
        description: "",
        enabled: true,
        apiKey: "",
        baseUrl: "",
        timeout: 30000,
        maxRetries: 3,
      });
    }
  }, [mode, fullProvider, isLoadingProvider, form]);

  // Effect to auto-populate defaults when provider type changes
  useEffect(() => {
    if (mode === "create" && selectedProviderType && providerTemplate) {
      const currentValues = form.getValues();
      
      // Only update if the user hasn't filled in these fields yet
      if (!currentValues.name || currentValues.name === "") {
        form.setValue("name", `My ${providerTemplate.name}`);
      }
      if (!currentValues.description || currentValues.description === "") {
        form.setValue("description", providerTemplate.description);
      }
      if (!currentValues.baseUrl || currentValues.baseUrl === "") {
        form.setValue("baseUrl", providerTemplate.baseUrl || "");
      }
      if (!currentValues.timeout || currentValues.timeout === 30000) {
        form.setValue("timeout", providerTemplate.timeout || 30000);
      }
      if (!currentValues.maxRetries || currentValues.maxRetries === 3) {
        form.setValue("maxRetries", providerTemplate.maxRetries || 3);
      }
    }
  }, [mode, selectedProviderType, providerTemplate, form]);

  const onSubmit = (data: ProviderFormData) => {
    if (mode === "create") {
      // Generate a unique provider ID
      const providerId = `${data.type}_${Date.now()}`;
      
      const baseConfig = {
        providerId,
        name: data.name,
        type: data.type,
        description: data.description,
        enabled: data.enabled,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl || undefined,
        timeout: data.timeout,
        maxRetries: data.maxRetries,
      };

      // Add provider-specific fields based on type
      let providerConfig: any = baseConfig;
      
      if (data.type === ProviderType.CUSTOM) {
        providerConfig = {
          ...baseConfig,
          endpoints: {
            inference: data.baseUrl || "https://api.example.com/v1/chat/completions",
          },
          authentication: {
            type: "bearer" as const,
          },
        };
      } else if (data.type === ProviderType.GOOGLE) {
        providerConfig = {
          ...baseConfig,
          projectId: "default-project", // TODO: Add project ID field to form
        };
      }

      createMutation.mutate(providerConfig);
    } else {
      updateMutation.mutate({
        providerId: fullProvider!.id,
        config: {
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          apiKey: data.apiKey,
          baseUrl: data.baseUrl || undefined,
          timeout: data.timeout,
          maxRetries: data.maxRetries,
        } as Record<string, any>,
      });
    }
  };

  const handleTestConnection = () => {
    const formData = form.getValues();
    setIsTestingConnection(true);
    setTestResult(null);
    
    // For testing, we need a temporary provider ID
    const tempProviderId = `test_${formData.type}_${Date.now()}`;
    
    testConnectionMutation.mutate({
      providerId: tempProviderId,
    });
  };

  // Don't render the dialog content until we have full provider data for editing
  if (mode === "edit" && isLoadingProvider) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Provider</DialogTitle>
            <DialogDescription>
              Please wait while we load the provider configuration...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading provider configuration...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Provider" : `Edit ${provider?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Configure a new AI provider for your organization"
              : "Update provider configuration and settings"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="My OpenAI Provider" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Type *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={mode === "edit"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ProviderType.OPENAI}>OpenAI</SelectItem>
                            <SelectItem value={ProviderType.ANTHROPIC}>Anthropic</SelectItem>
                            <SelectItem value={ProviderType.GOOGLE}>Google AI</SelectItem>
                            <SelectItem value={ProviderType.MISTRAL}>Mistral AI</SelectItem>
                            <SelectItem value={ProviderType.COHERE}>Cohere</SelectItem>
                            <SelectItem value={ProviderType.PERPLEXITY}>Perplexity AI</SelectItem>
                            <SelectItem value={ProviderType.TOGETHER}>Together AI</SelectItem>
                            <SelectItem value={ProviderType.HUGGINGFACE}>Hugging Face</SelectItem>
                            <SelectItem value={ProviderType.CUSTOM}>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description of this provider..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Provider
                        </FormLabel>
                        <FormDescription>
                          Allow this provider to be used for inference
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Provider Information */}
            {providerTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Provider Information
                    <Badge variant="outline">{providerTemplate.name}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {providerTemplate.description}
                  </p>
                  
                  {/* Features */}
                  {providerTemplate.features && Object.keys(providerTemplate.features).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(providerTemplate.features).map(([feature, enabled]) => 
                          enabled ? (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Badge>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  {/* Default Model */}
                  {providerTemplate.defaultModel && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Default Model</h4>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {providerTemplate.defaultModel}
                      </code>
                    </div>
                  )}

                  {/* Rate Limits */}
                  {providerTemplate.rateLimiting && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Rate Limits</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Requests: {providerTemplate.rateLimiting.requestsPerMinute}/min</div>
                        {providerTemplate.rateLimiting.tokensPerMinute && (
                          <div>Tokens: {providerTemplate.rateLimiting.tokensPerMinute}/min</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Configuration Hints */}
                  {configHints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Configuration Tips</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {configHints.slice(0, 3).map((hint, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-500 mt-0.5">•</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            placeholder="sk-..."
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your API key for this provider (encrypted when stored)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.openai.com/v1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Custom base URL for API requests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Connection Test */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !form.watch("apiKey")}
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  {testResult && (
                    <Badge
                      variant={testResult.success ? "default" : "destructive"}
                      className={testResult.success ? "bg-green-100 text-green-800" : ""}
                    >
                      {testResult.success ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {testResult.message}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (ms)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1000"
                            max="300000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Request timeout in milliseconds
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxRetries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Retries</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum retry attempts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {mode === "create" ? "Create Provider" : "Update Provider"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
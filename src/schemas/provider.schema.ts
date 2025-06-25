import { z } from "zod";

// Base provider enums
export const ProviderTypeSchema = z.enum([
  "openai",
  "anthropic", 
  "google",
  "huggingface",
  "mistral",
  "cohere",
  "perplexity",
  "together",
  "custom",
  "uploaded"
]);

export const ModelCapabilityTypeSchema = z.enum([
  "text-generation",
  "text-classification", 
  "image-generation",
  "image-classification",
  "embedding",
  "code-generation",
  "translation",
  "summarization",
  "question-answering",
  "sentiment-analysis"
]);

export const ProviderStatusSchema = z.enum([
  "active",
  "inactive",
  "error",
  "rate_limited"
]);

// Rate limiting configuration
export const RateLimitingConfigSchema = z.object({
  requestsPerMinute: z.number().min(1).max(10000),
  requestsPerHour: z.number().min(1).max(100000).optional(),
  tokensPerMinute: z.number().min(1).optional(),
});

// Base provider configuration
export const BaseProviderConfigSchema = z.object({
  providerId: z.string().min(1).max(100),
  type: ProviderTypeSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  enabled: z.boolean().default(true),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  timeout: z.number().min(1000).max(300000).optional(), // 1s to 5min
  maxRetries: z.number().min(0).max(10).optional(),
  rateLimiting: RateLimitingConfigSchema.optional(),
});

// OpenAI-specific configuration
export const OpenAIConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("openai"),
  organization: z.string().optional(),
  project: z.string().optional(),
  defaultModel: z.string().optional(),
});

// Anthropic-specific configuration
export const AnthropicConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("anthropic"),
  version: z.string().optional(),
  defaultModel: z.string().optional(),
});

// Google-specific configuration
export const GoogleConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("google"),
  projectId: z.string().min(1),
  location: z.string().optional(),
  defaultModel: z.string().optional(),
});

// HuggingFace-specific configuration
export const HuggingFaceConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("huggingface"),
  useInferenceApi: z.boolean().optional(),
  defaultModel: z.string().optional(),
});

// Mistral-specific configuration
export const MistralConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("mistral"),
  defaultModel: z.string().optional(),
});

// Cohere-specific configuration
export const CohereConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("cohere"),
  defaultModel: z.string().optional(),
});

// Perplexity-specific configuration
export const PerplexityConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("perplexity"),
  defaultModel: z.string().optional(),
});

// Together-specific configuration
export const TogetherConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("together"),
  defaultModel: z.string().optional(),
});

// Custom provider configuration
export const CustomConfigSchema = BaseProviderConfigSchema.extend({
  type: z.literal("custom"),
  endpoints: z.object({
    inference: z.string().url(),
    models: z.string().url().optional(),
    health: z.string().url().optional(),
  }),
  authentication: z.object({
    type: z.enum(["bearer", "apikey", "basic", "custom"]),
    headerName: z.string().optional(),
    customHeaders: z.record(z.string()).optional(),
  }),
});

// Union type for all provider configurations
export const ProviderConfigSchema = z.discriminatedUnion("type", [
  OpenAIConfigSchema,
  AnthropicConfigSchema,
  GoogleConfigSchema,
  HuggingFaceConfigSchema,
  MistralConfigSchema,
  CohereConfigSchema,
  PerplexityConfigSchema,
  TogetherConfigSchema,
  CustomConfigSchema,
]);

// Provider request/response schemas
export const ProviderRequestSchema = z.object({
  modelId: z.string().min(1),
  input: z.record(z.any()),
  parameters: z.record(z.any()).optional(),
  metadata: z.object({
    sessionId: z.string().optional(),
    userId: z.string().optional(),
    requestId: z.string(),
    timestamp: z.date(),
  }).optional(),
});

export const ProviderResponseMetadataSchema = z.object({
  modelId: z.string(),
  providerId: z.string(),
  latency: z.number(),
  tokensUsed: z.number().optional(),
  cost: z.number().optional(),
  requestId: z.string(),
  timestamp: z.date(),
});

export const ProviderResponseSchema = z.object({
  output: z.record(z.any()),
  metadata: ProviderResponseMetadataSchema,
  rawResponse: z.any().optional(),
});

// Provider model schemas
export const ProviderModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  capabilities: z.array(ModelCapabilityTypeSchema),
  inputTypes: z.array(z.string()),
  outputTypes: z.array(z.string()),
  maxTokens: z.number().optional(),
  costPer1kTokens: z.object({
    input: z.number(),
    output: z.number(),
  }).optional(),
  deprecated: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export const ProviderModelListSchema = z.object({
  models: z.array(ProviderModelSchema),
  totalCount: z.number(),
  nextToken: z.string().optional(),
});

// Provider health and monitoring
export const RateLimitStatusSchema = z.object({
  remaining: z.number(),
  resetTime: z.date(),
});

export const ProviderHealthSchema = z.object({
  providerId: z.string(),
  status: ProviderStatusSchema,
  latency: z.number().optional(),
  lastChecked: z.date(),
  errorCount: z.number(),
  successRate: z.number(),
  rateLimitStatus: RateLimitStatusSchema.optional(),
});

export const RateLimitInfoSchema = z.object({
  requestsRemaining: z.number(),
  requestsReset: z.date(),
  tokensRemaining: z.number().optional(),
  tokensReset: z.date().optional(),
});

// Provider metrics and analytics
export const ProviderMetricsSchema = z.object({
  providerId: z.string(),
  timeRange: z.object({
    start: z.date(),
    end: z.date(),
  }),
  requestCount: z.number(),
  successCount: z.number(),
  errorCount: z.number(),
  averageLatency: z.number(),
  p95Latency: z.number(),
  totalTokensUsed: z.number().optional(),
  totalCost: z.number().optional(),
  rateLimitHits: z.number(),
  errorBreakdown: z.record(z.number()),
});

// API operation schemas
export const RegisterProviderInputSchema = ProviderConfigSchema;

export const UpdateProviderConfigInputSchema = z.object({
  providerId: z.string(),
  config: z.record(z.any()), // Allow partial updates with any fields
});

export const InferenceInputSchema = z.object({
  providerId: z.string(),
  request: ProviderRequestSchema,
});

export const AutoInferenceInputSchema = z.object({
  modelId: z.string(),
  input: z.record(z.any()),
  parameters: z.record(z.any()).optional(),
  metadata: z.object({
    sessionId: z.string().optional(),
    userId: z.string().optional(),
    requestId: z.string(),
    timestamp: z.date(),
  }).optional(),
});

export const ListModelsInputSchema = z.object({
  providerId: z.string(),
  filters: z.record(z.any()).optional(),
});

export const GetModelInputSchema = z.object({
  providerId: z.string(),
  modelId: z.string(),
});

export const ProviderHealthCheckInputSchema = z.object({
  providerId: z.string(),
});

// Configuration validation schemas
export const ProviderConfigValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

export const ValidateProviderConfigInputSchema = z.object({
  config: ProviderConfigSchema,
});

// Registry statistics
export const ProviderRegistryStatsSchema = z.object({
  totalProviders: z.number(),
  activeProviders: z.number(),
  providersByType: z.record(z.number()),
  providerIds: z.array(z.string()),
});

// Provider list response
export const ProviderListResponseSchema = z.array(z.object({
  id: z.string(),
  type: ProviderTypeSchema,
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
  isInitialized: z.boolean(),
  status: ProviderStatusSchema,
}));

// Bulk operations
export const BulkProviderOperationSchema = z.object({
  providerIds: z.array(z.string()),
  operation: z.enum(["health_check", "restart", "disable", "enable"]),
});

export const BulkProviderResultSchema = z.object({
  successful: z.array(z.string()),
  failed: z.array(z.object({
    providerId: z.string(),
    error: z.string(),
  })),
});

// Provider error schemas
export const ProviderErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  providerId: z.string(),
  originalError: z.any().optional(),
  retryable: z.boolean(),
  rateLimited: z.boolean().optional(),
});

// Event schemas for monitoring
export const ProviderEventSchema = z.object({
  type: z.enum(["request", "response", "error", "rate_limit", "health_change"]),
  providerId: z.string(),
  timestamp: z.date(),
  data: z.any(),
});

// Export all types for use in other files
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;
export type AnthropicConfig = z.infer<typeof AnthropicConfigSchema>;
export type GoogleConfig = z.infer<typeof GoogleConfigSchema>;
export type HuggingFaceConfig = z.infer<typeof HuggingFaceConfigSchema>;
export type MistralConfig = z.infer<typeof MistralConfigSchema>;
export type CohereConfig = z.infer<typeof CohereConfigSchema>;
export type PerplexityConfig = z.infer<typeof PerplexityConfigSchema>;
export type TogetherConfig = z.infer<typeof TogetherConfigSchema>;
export type CustomConfig = z.infer<typeof CustomConfigSchema>;
export type ProviderRequest = z.infer<typeof ProviderRequestSchema>;
export type ProviderResponse = z.infer<typeof ProviderResponseSchema>;
export type ProviderModel = z.infer<typeof ProviderModelSchema>;
export type ProviderModelList = z.infer<typeof ProviderModelListSchema>;
export type ProviderHealth = z.infer<typeof ProviderHealthSchema>;
export type ProviderMetrics = z.infer<typeof ProviderMetricsSchema>;
export type ProviderConfigValidationResult = z.infer<typeof ProviderConfigValidationResultSchema>;
export type ProviderRegistryStats = z.infer<typeof ProviderRegistryStatsSchema>;
export type ProviderError = z.infer<typeof ProviderErrorSchema>;
export type ProviderEvent = z.infer<typeof ProviderEventSchema>; 
// Provider Framework Types
export enum ProviderType {
  OPENAI = "openai",
  ANTHROPIC = "anthropic", 
  GOOGLE = "google",
  HUGGINGFACE = "huggingface",
  MISTRAL = "mistral",
  COHERE = "cohere",
  PERPLEXITY = "perplexity",
  TOGETHER = "together",
  CUSTOM = "custom",
  UPLOADED = "uploaded",
}

export enum ModelCapabilityType {
  TEXT_GENERATION = "text-generation",
  TEXT_CLASSIFICATION = "text-classification", 
  IMAGE_GENERATION = "image-generation",
  IMAGE_CLASSIFICATION = "image-classification",
  EMBEDDING = "embedding",
  CODE_GENERATION = "code-generation",
  TRANSLATION = "translation",
  SUMMARIZATION = "summarization",
  QUESTION_ANSWERING = "question-answering",
  SENTIMENT_ANALYSIS = "sentiment-analysis",
}

export enum ProviderStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
  RATE_LIMITED = "rate_limited",
}

// Standardized request/response interfaces
export interface ProviderRequest {
  modelId: string;
  input: Record<string, any>;
  parameters?: Record<string, any>;
  metadata?: {
    sessionId?: string;
    userId?: string;
    requestId: string;
    timestamp: Date;
  };
}

export interface ProviderResponse {
  output: Record<string, any>;
  metadata: {
    modelId: string;
    providerId: string;
    latency: number;
    tokensUsed?: number;
    cost?: number;
    requestId: string;
    timestamp: Date;
  };
  rawResponse?: any; // Original provider response for debugging
}

export interface ProviderError {
  code: string;
  message: string;
  providerId: string;
  originalError?: any;
  retryable: boolean;
  rateLimited?: boolean;
}

// Provider configuration interfaces
export interface BaseProviderConfig {
  providerId: string;
  type: ProviderType;
  name: string;
  description?: string;
  enabled: boolean;
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimiting?: {
    requestsPerMinute: number;
    requestsPerHour?: number;
    tokensPerMinute?: number;
  };
}

export interface OpenAIConfig extends BaseProviderConfig {
  type: ProviderType.OPENAI;
  organization?: string;
  project?: string;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    functionCalling?: boolean;
    vision?: boolean;
    embeddings?: boolean;
    fineTuning?: boolean;
  };
}

export interface AnthropicConfig extends BaseProviderConfig {
  type: ProviderType.ANTHROPIC;
  version?: string;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    vision?: boolean;
    toolUse?: boolean;
    systemPrompts?: boolean;
  };
}

export interface GoogleConfig extends BaseProviderConfig {
  type: ProviderType.GOOGLE;
  projectId: string;
  location?: string;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    functionCalling?: boolean;
    vision?: boolean;
    embeddings?: boolean;
    multimodal?: boolean;
  };
}

export interface HuggingFaceConfig extends BaseProviderConfig {
  type: ProviderType.HUGGINGFACE;
  useInferenceApi?: boolean;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    customModels?: boolean;
    fineTuning?: boolean;
    embeddings?: boolean;
  };
}

export interface MistralConfig extends BaseProviderConfig {
  type: ProviderType.MISTRAL;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    functionCalling?: boolean;
    embeddings?: boolean;
  };
}

export interface CohereConfig extends BaseProviderConfig {
  type: ProviderType.COHERE;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    embeddings?: boolean;
    classification?: boolean;
    rerank?: boolean;
  };
}

export interface PerplexityConfig extends BaseProviderConfig {
  type: ProviderType.PERPLEXITY;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    webSearch?: boolean;
    citations?: boolean;
  };
}

export interface TogetherConfig extends BaseProviderConfig {
  type: ProviderType.TOGETHER;
  defaultModel?: string;
  supportedModels?: string[];
  features?: {
    streaming?: boolean;
    openSourceModels?: boolean;
    fineTuning?: boolean;
  };
}

export interface CustomConfig extends BaseProviderConfig {
  type: ProviderType.CUSTOM;
  endpoints: {
    inference: string;
    models?: string;
    health?: string;
  };
  authentication: {
    type: "bearer" | "apikey" | "basic" | "custom";
    headerName?: string;
    customHeaders?: Record<string, string>;
  };
}

export type ProviderConfig = 
  | OpenAIConfig 
  | AnthropicConfig 
  | GoogleConfig 
  | HuggingFaceConfig 
  | MistralConfig
  | CohereConfig
  | PerplexityConfig
  | TogetherConfig
  | CustomConfig;

// Model discovery and metadata
export interface ProviderModel {
  id: string;
  name: string;
  description?: string;
  capabilities: ModelCapabilityType[];
  inputTypes: string[];
  outputTypes: string[];
  maxTokens?: number;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  deprecated?: boolean;
  metadata?: Record<string, any>;
}

export interface ProviderModelList {
  models: ProviderModel[];
  totalCount: number;
  nextToken?: string;
}

// Health and status monitoring
export interface ProviderHealth {
  providerId: string;
  status: ProviderStatus;
  latency?: number;
  lastChecked: Date;
  errorCount: number;
  successRate: number;
  rateLimitStatus?: {
    remaining: number;
    resetTime: Date;
  };
}

// Rate limiting and quotas
export interface RateLimitInfo {
  requestsRemaining: number;
  requestsReset: Date;
  tokensRemaining?: number;
  tokensReset?: Date;
}

// Provider-specific request transformation
export interface RequestTransformer {
  transform(request: ProviderRequest): any;
  validateInput(input: any): boolean;
}

export interface ResponseTransformer {
  transform(response: any, request: ProviderRequest): ProviderResponse;
  extractError(error: any): ProviderError;
}

// Provider interface contract
export interface IModelProvider {
  readonly config: ProviderConfig;
  readonly type: ProviderType;
  readonly id: string;
  readonly isInitialized: boolean;
  
  // Core functionality
  inference(request: ProviderRequest): Promise<ProviderResponse>;
  
  // Model discovery
  listModels(filters?: Record<string, any>): Promise<ProviderModelList>;
  getModel(modelId: string): Promise<ProviderModel>;
  
  // Health and monitoring
  healthCheck(): Promise<ProviderHealth>;
  getRateLimitInfo(): Promise<RateLimitInfo>;
  
  // Configuration
  updateConfig(config: Partial<ProviderConfig>): Promise<void>;
  validateConfig(): Promise<boolean>;
  
  // Lifecycle
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Provider factory and registry
export interface ProviderFactory {
  createProvider(config: ProviderConfig): IModelProvider;
  getSupportedTypes(): ProviderType[];
  validateConfig(config: ProviderConfig): boolean;
}

export interface ProviderRegistry {
  register(provider: IModelProvider): void;
  unregister(providerId: string): void;
  getProvider(providerId: string): IModelProvider | null;
  getAllProviders(): IModelProvider[];
  getProvidersByType(type: ProviderType): IModelProvider[];
  getActiveProviders(): IModelProvider[];
}

// Metrics and analytics
export interface ProviderMetrics {
  providerId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageLatency: number;
  p95Latency: number;
  totalTokensUsed?: number;
  totalCost?: number;
  rateLimitHits: number;
  errorBreakdown: Record<string, number>;
}

// Webhook and event handling
export interface ProviderEvent {
  type: "request" | "response" | "error" | "rate_limit" | "health_change";
  providerId: string;
  timestamp: Date;
  data: any;
}

export interface ProviderEventHandler {
  onRequest?(event: ProviderEvent): void;
  onResponse?(event: ProviderEvent): void;
  onError?(event: ProviderEvent): void;
  onRateLimit?(event: ProviderEvent): void;
  onHealthChange?(event: ProviderEvent): void;
}

// Configuration validation and security
export interface ProviderConfigValidator {
  validate(config: ProviderConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  sanitize(config: ProviderConfig): ProviderConfig;
}

export interface ProviderSecurityManager {
  encryptApiKey(apiKey: string): string;
  decryptApiKey(encryptedKey: string): string;
  rotateApiKey(providerId: string, newApiKey: string): Promise<void>;
  validateApiKeyFormat(type: ProviderType, apiKey: string): boolean;
} 
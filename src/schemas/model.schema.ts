import { z } from "zod";
import { ModelStatus } from "@/constants/general";

// Enhanced model types for EPIC-4 flexible ingestion
export const ModelProvider = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic", 
  GOOGLE: "google",
  HUGGINGFACE: "huggingface",
  CUSTOM: "custom",
  UPLOADED: "uploaded",
} as const;

export const ModelArchitecture = {
  TRANSFORMER: "transformer",
  CNN: "cnn",
  RNN: "rnn",
  LSTM: "lstm",
  GAN: "gan",
  DIFFUSION: "diffusion",
  ENSEMBLE: "ensemble",
  OTHER: "other",
} as const;

export const ModelCapability = {
  TEXT_GENERATION: "text_generation",
  TEXT_CLASSIFICATION: "text_classification",
  IMAGE_GENERATION: "image_generation",
  IMAGE_CLASSIFICATION: "image_classification",
  EMBEDDING: "embedding",
  CHAT: "chat",
  CODE_GENERATION: "code_generation",
  AUDIO_PROCESSING: "audio_processing",
  MULTIMODAL: "multimodal",
  OTHER: "other",
} as const;

// Base model schema for CRUD operations - Enhanced for EPIC-4
export const modelSchema = z.object({
  uuid: z.string().uuid("Invalid UUID format"),
  name: z.string().min(1, "Model name is required").max(255, "Model name too long"),
  description: z.string().nullable().optional(),
  version: z.string().optional(),
  type: z.enum(["classification", "regression", "clustering", "other"]).optional(),
  status: z.nativeEnum(ModelStatus).optional(),
  // Enhanced fields for flexible model ingestion
  provider: z.nativeEnum(ModelProvider).optional(),
  architecture: z.nativeEnum(ModelArchitecture).optional(),
  capabilities: z.array(z.nativeEnum(ModelCapability)).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Schema for creating a new model
export const createModelSchema = modelSchema.omit({
  uuid: true,
  created_at: true,
  updated_at: true,
});

// Schema for updating an existing model
export const updateModelSchema = modelSchema.partial().extend({
  uuid: z.string().uuid("Invalid UUID format"),
});

// Enhanced provider configuration schemas for EPIC-4
export const providerConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required").optional(),
  endpoint: z.string().url("Invalid endpoint URL").optional(),
  region: z.string().optional(),
  model: z.string().min(1, "Model identifier is required").optional(),
  maxTokens: z.number().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  rateLimits: z.object({
    requestsPerMinute: z.number().positive().optional(),
    tokensPerMinute: z.number().positive().optional(),
  }).optional(),
});

// OpenAI-specific configuration
export const openaiConfigSchema = providerConfigSchema.extend({
  organization: z.string().optional(),
  model: z.enum([
    "gpt-4",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
    "text-embedding-ada-002",
    "text-embedding-3-small",
    "text-embedding-3-large",
    "dall-e-3",
    "dall-e-2",
    "whisper-1",
    "tts-1",
  ]).optional(),
});

// Anthropic-specific configuration
export const anthropicConfigSchema = providerConfigSchema.extend({
  model: z.enum([
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229", 
    "claude-3-haiku-20240307",
    "claude-2.1",
    "claude-2.0",
    "claude-instant-1.2",
  ]).optional(),
});

// Google-specific configuration
export const googleConfigSchema = providerConfigSchema.extend({
  projectId: z.string().optional(),
  model: z.enum([
    "gemini-pro",
    "gemini-pro-vision",
    "text-bison",
    "chat-bison",
    "codechat-bison",
    "textembedding-gecko",
  ]).optional(),
});

// HuggingFace-specific configuration
export const huggingfaceConfigSchema = providerConfigSchema.extend({
  model: z.string().min(1, "HuggingFace model name is required"),
  task: z.enum([
    "text-generation",
    "text-classification",
    "token-classification",
    "question-answering",
    "summarization",
    "translation",
    "text2text-generation",
    "feature-extraction",
    "image-classification",
    "object-detection",
    "image-segmentation",
    "audio-classification",
    "speech-recognition",
  ]).optional(),
});

// Enhanced model metadata schema for comprehensive validation
export const enhancedModelMetadataSchema = z.object({
  // Basic model information
  modelInfo: z.object({
    architecture: z.nativeEnum(ModelArchitecture).optional(),
    parameters: z.number().positive().optional(), // Number of parameters
    size: z.number().positive().optional(), // Model size in MB
    license: z.string().optional(),
    paperUrl: z.string().url().optional(),
    repositoryUrl: z.string().url().optional(),
  }).optional(),
  
  // Training information
  trainingInfo: z.object({
    dataset: z.string().optional(),
    trainingFramework: z.string().optional(),
    trainingDuration: z.string().optional(),
    computeResources: z.string().optional(),
    hyperparameters: z.record(z.any()).optional(),
  }).optional(),
  
  // Performance metrics
  performanceMetrics: z.object({
    accuracy: z.number().min(0).max(1).optional(),
    precision: z.number().min(0).max(1).optional(),
    recall: z.number().min(0).max(1).optional(),
    f1Score: z.number().min(0).max(1).optional(),
    latency: z.number().positive().optional(), // in milliseconds
    throughput: z.number().positive().optional(), // requests per second
    memoryUsage: z.number().positive().optional(), // in MB
  }).optional(),
  
  // Enhanced features schema
  features: z.array(z.object({
    name: z.string(),
    type: z.enum(["numeric", "categorical", "text", "image", "audio", "other"]),
    description: z.string().optional(),
    encoding: z.string().optional(),
    importance: z.number().min(0).max(1).optional(),
    nullable: z.boolean().optional(),
    constraints: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      allowedValues: z.array(z.string()).optional(),
      pattern: z.string().optional(),
    }).optional(),
  })).optional(),
  
  // Enhanced input schema
  inputSchema: z.array(z.object({
    name: z.string(),
    type: z.enum(["string", "number", "boolean", "array", "object", "file"]),
    required: z.boolean().default(false),
    description: z.string().optional(),
    format: z.string().optional(), // e.g., "email", "date", "base64"
    constraints: z.object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      allowedValues: z.array(z.string()).optional(),
      pattern: z.string().optional(),
    }).optional(),
    examples: z.array(z.any()).optional(),
  })).optional(),
  
  // Enhanced output schema
  outputSchema: z.object({
    type: z.enum(["classification", "regression", "generation", "embedding", "other"]),
    format: z.string().optional(),
    scoreType: z.enum(["probability", "logits", "binary", "multiclass", "continuous"]).optional(),
    range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    classes: z.array(z.string()).optional(),
    thresholds: z.record(z.number()).optional(),
    confidenceMetrics: z.object({
      hasConfidence: z.boolean().default(false),
      confidenceRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
    }).optional(),
  }).optional(),
  
  // Feature importance for explainability
  globalImportance: z.array(z.object({
    feature: z.string(),
    importance: z.number(),
    coefficient: z.number().optional(),
    absCoefficient: z.number().optional(),
  })).optional(),
  
  // Provider-specific configuration
  providerConfig: z.union([
    openaiConfigSchema,
    anthropicConfigSchema,
    googleConfigSchema,
    huggingfaceConfigSchema,
    providerConfigSchema, // Generic fallback
  ]).optional(),
});

// AI-powered JSON transformation schemas for EPIC-4
export const aiTransformationRequestSchema = z.object({
  sourceData: z.record(z.any()), // Raw JSON from external source
  sourceType: z.enum(["huggingface", "openai", "custom", "manual"]),
  targetSchema: z.enum(["model", "metadata", "provider_config"]),
  transformationHints: z.object({
    modelType: z.string().optional(),
    expectedFields: z.array(z.string()).optional(),
    customInstructions: z.string().optional(),
  }).optional(),
});

export const aiTransformationResponseSchema = z.object({
  success: z.boolean(),
  transformedData: z.record(z.any()),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional(),
});

// Flexible model import schema supporting multiple sources
export const flexibleModelImportSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  source: z.nativeEnum(ModelProvider),
  
  // For uploaded models
  files: z.object({
    model: z.string().optional(), // File key for uploaded model
    metadata: z.string().optional(), // File key for metadata
    config: z.string().optional(), // File key for config
  }).optional(),
  
  // For external provider models
  providerConfig: z.union([
    openaiConfigSchema,
    anthropicConfigSchema,
    googleConfigSchema,
    huggingfaceConfigSchema,
    providerConfigSchema,
  ]).optional(),
  
  // Enhanced metadata (can be AI-transformed)
  metadata: enhancedModelMetadataSchema.optional(),
  
  // Auto-transform settings
  autoTransform: z.object({
    enabled: z.boolean().default(true),
    sourceFormat: z.enum(["huggingface_card", "openai_spec", "custom_json"]).optional(),
    validation: z.object({
      strict: z.boolean().default(false),
      allowPartial: z.boolean().default(true),
    }).optional(),
  }).optional(),
});

// Schema for model inference requests
export const inferenceRequestSchema = z.object({
  modelUuid: z.string().uuid("Invalid model UUID"),
  input: z.record(z.any()), // Dynamic input based on model requirements
  options: z.object({
    returnProbabilities: z.boolean().optional(),
    returnExplanation: z.boolean().optional(),
    useModelGroup: z.boolean().optional(), // For Champion/Challenger routing
  }).optional(),
});

// Legacy schema for backward compatibility
export const modelMetadataSchema = enhancedModelMetadataSchema;

// Type exports for use throughout the application
export type ModelSchema = z.infer<typeof modelSchema>;
export type CreateModelSchema = z.infer<typeof createModelSchema>;
export type UpdateModelSchema = z.infer<typeof updateModelSchema>;
export type ModelMetadataSchema = z.infer<typeof modelMetadataSchema>;
export type EnhancedModelMetadataSchema = z.infer<typeof enhancedModelMetadataSchema>;
export type InferenceRequestSchema = z.infer<typeof inferenceRequestSchema>;
export type FlexibleModelImportSchema = z.infer<typeof flexibleModelImportSchema>;
export type AITransformationRequestSchema = z.infer<typeof aiTransformationRequestSchema>;
export type AITransformationResponseSchema = z.infer<typeof aiTransformationResponseSchema>;

// Provider-specific type exports
export type ProviderConfigSchema = z.infer<typeof providerConfigSchema>;
export type OpenAIConfigSchema = z.infer<typeof openaiConfigSchema>;
export type AnthropicConfigSchema = z.infer<typeof anthropicConfigSchema>;
export type GoogleConfigSchema = z.infer<typeof googleConfigSchema>;
export type HuggingFaceConfigSchema = z.infer<typeof huggingfaceConfigSchema>; 
import { z } from "zod";

// Base model schema for CRUD operations
export const modelSchema = z.object({
  uuid: z.string().uuid("Invalid UUID format"),
  name: z.string().min(1, "Model name is required").max(255, "Model name too long"),
  description: z.string().nullable().optional(),
  version: z.string().optional(),
  type: z.enum(["classification", "regression", "clustering", "other"]).optional(),
  status: z.enum(["active", "inactive", "training", "deployed"]).optional(),
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

// Schema for model metadata and features
export const modelMetadataSchema = z.object({
  features: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    encoding: z.string().optional(),
  })).optional(),
  inputSchema: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().optional(),
    description: z.string().optional(),
    allowed_values: z.array(z.string()).optional(),
  })).optional(),
  outputSchema: z.object({
    score_type: z.string().optional(),
    range: z.array(z.number()).optional(),
    thresholds: z.record(z.string()).optional(),
  }).optional(),
  globalImportance: z.array(z.object({
    feature: z.string(),
    coefficient: z.number(),
    abs_coefficient: z.number(),
  })).optional(),
});

// Schema for model inference requests
export const inferenceRequestSchema = z.object({
  modelUuid: z.string().uuid("Invalid model UUID"),
  input: z.record(z.any()), // Dynamic input based on model requirements
  options: z.object({
    returnProbabilities: z.boolean().optional(),
    returnExplanation: z.boolean().optional(),
  }).optional(),
});

// Type exports for use throughout the application
export type ModelSchema = z.infer<typeof modelSchema>;
export type CreateModelSchema = z.infer<typeof createModelSchema>;
export type UpdateModelSchema = z.infer<typeof updateModelSchema>;
export type ModelMetadataSchema = z.infer<typeof modelMetadataSchema>;
export type InferenceRequestSchema = z.infer<typeof inferenceRequestSchema>; 
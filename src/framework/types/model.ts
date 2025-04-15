import { z } from "zod";

// Base schemas (if needed later, keep it minimal for now)
// export const featureSchema = z.object({ ... });
// export const inferenceSchema = z.object({ ... });

// Model creation schemas
export const buildModelSchema = z.object({
  name: z.string().min(3, "Model name must be at least 3 characters"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be in format x.y.z"),
  baseModel: z.string().min(1, "Base model is required"),
  dataset: z.string().min(1, "Dataset is required"),
  // Using z.record for flexible key-value pairs, assuming values are numbers
  hyperparameters: z.record(z.number()),
});

export const connectModelSchema = z.object({
  name: z.string().min(3, "Model name must be at least 3 characters"),
  endpoint: z.string().url("Must be a valid URL"),
  authType: z.string().min(1, "Authentication type is required"),
  connectionType: z.enum(["rest", "cloud", "custom"]),
  // Request format is optional, can be any string (e.g., JSON string)
  requestFormat: z.string().optional(),
});

export const importModelSchema = z.object({
  name: z.string().min(3, "Model name must be at least 3 characters"),
  // Version is optional but must match format if provided
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be in format x.y.z")
    .optional(),
  importType: z.enum(["upload", "path"]),
  format: z.string().min(1, "Model format is required").optional(), // Made optional based on dialog logic
  path: z.string().min(1, "Path is required for path import").optional(),
  // Files will be handled by the component logic, not Zod directly
  // file: z.instanceof(File).optional(), // Example if we needed file validation
});

// Inferred types for form values
export type BuildModelFormValues = z.infer<typeof buildModelSchema>;
export type ConnectModelFormValues = z.infer<typeof connectModelSchema>;
export type ImportModelFormValues = z.infer<typeof importModelSchema>;

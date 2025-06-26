import { z } from "zod";
import { ModelGroupRole, ModelGroupStrategy, ModelGroupStatus } from "@/constants/general";

// Base ModelGroup schema
export const modelGroupSchema = z.object({
  uuid: z.string().uuid("Invalid UUID format"),
  name: z.string().min(1, "Model group name is required").max(200, "Name too long"),
  description: z.string().nullable().optional(),
  strategy: z.nativeEnum(ModelGroupStrategy).default(ModelGroupStrategy.CHAMPION_CHALLENGER),
  status: z.nativeEnum(ModelGroupStatus).default(ModelGroupStatus.CONFIGURING),
  orgId: z.number().int().positive("Organization ID required"),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Traffic configuration schema
export const trafficConfigSchema = z.object({
  champion: z.number().min(0).max(100),
  challenger: z.number().min(0).max(100),
  // Additional challengers for multi-challenger strategy
  additionalChallengers: z.array(z.object({
    modelId: z.number().int().positive(),
    percentage: z.number().min(0).max(100),
  })).optional(),
}).refine(
  (data) => {
    const total = data.champion + data.challenger + 
      (data.additionalChallengers?.reduce((sum, ch) => sum + ch.percentage, 0) || 0);
    return total === 100;
  },
  { message: "Traffic percentages must sum to 100" }
);

// Test metadata schema for A/B testing
export const testMetadataSchema = z.object({
  startDate: z.date(),
  endDate: z.date().optional(),
  duration: z.number().positive().optional(), // Duration in days
  successCriteria: z.object({
    metric: z.string(), // e.g., "accuracy", "latency", "cost"
    threshold: z.number(),
    direction: z.enum(["increase", "decrease"]), // Whether higher or lower is better
  }),
  sampleSize: z.number().positive().optional(),
  confidenceLevel: z.number().min(0).max(1).default(0.95),
}).refine(
  (data) => {
    if (data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  { message: "End date must be after start date" }
);

// Promotion rules schema
export const promotionRulesSchema = z.object({
  autoPromote: z.boolean().default(false),
  criteria: z.array(z.object({
    metric: z.string(),
    operator: z.enum(["gt", "lt", "gte", "lte", "eq"]),
    value: z.number(),
    window: z.number().positive(), // Time window in hours
  })),
  cooldownPeriod: z.number().positive().default(24), // Hours before next auto-promotion
});

// ModelGroup creation schema
export const createModelGroupSchema = modelGroupSchema.omit({
  uuid: true,
  created_at: true,
  updated_at: true,
}).extend({
  trafficConfig: trafficConfigSchema.optional(),
  testMetadata: testMetadataSchema.optional(),
  promotionRules: promotionRulesSchema.optional(),
});

// ModelGroup update schema  
export const updateModelGroupSchema = createModelGroupSchema.partial().extend({
  uuid: z.string().uuid(),
});

// ModelGroupMembership schema
export const modelGroupMembershipSchema = z.object({
  uuid: z.string().uuid("Invalid UUID format"),
  modelGroupId: z.number().int().positive("Model group ID required"),
  modelId: z.number().int().positive("Model ID required"),
  role: z.nativeEnum(ModelGroupRole),
  trafficPercentage: z.number().min(0).max(100).default(0),
  assignedAt: z.date(),
  isActive: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Create membership schema
export const createModelGroupMembershipSchema = modelGroupMembershipSchema.omit({
  uuid: true,
  assignedAt: true,
  created_at: true,
  updated_at: true,
});

// Update membership schema
export const updateModelGroupMembershipSchema = createModelGroupMembershipSchema.partial().extend({
  uuid: z.string().uuid(),
});

// Bulk assignment schema for adding multiple models to a group
export const bulkAssignModelsSchema = z.object({
  modelGroupUuid: z.string().uuid(),
  assignments: z.array(z.object({
    modelUuid: z.string().uuid(),
    role: z.nativeEnum(ModelGroupRole),
    trafficPercentage: z.number().min(0).max(100),
  })),
}).refine(
  (data) => {
    const totalTraffic = data.assignments.reduce(
      (sum, assignment) => sum + assignment.trafficPercentage, 0
    );
    return totalTraffic <= 100;
  },
  { message: "Total traffic percentage cannot exceed 100%" }
);

// Champion promotion schema
export const promoteToChampionSchema = z.object({
  modelGroupUuid: z.string().uuid(),
  challengerModelUuid: z.string().uuid(),
  reason: z.string().optional(),
});

// Export types
export type ModelGroup = z.infer<typeof modelGroupSchema>;
export type CreateModelGroup = z.infer<typeof createModelGroupSchema>;
export type UpdateModelGroup = z.infer<typeof updateModelGroupSchema>;
export type ModelGroupMembership = z.infer<typeof modelGroupMembershipSchema>;
export type CreateModelGroupMembership = z.infer<typeof createModelGroupMembershipSchema>;
export type UpdateModelGroupMembership = z.infer<typeof updateModelGroupMembershipSchema>;
export type TrafficConfig = z.infer<typeof trafficConfigSchema>;
export type TestMetadata = z.infer<typeof testMetadataSchema>;
export type PromotionRules = z.infer<typeof promotionRulesSchema>;
export type BulkAssignModels = z.infer<typeof bulkAssignModelsSchema>;
export type PromoteToChampion = z.infer<typeof promoteToChampionSchema>; 
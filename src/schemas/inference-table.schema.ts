import { z } from "zod";

// Enums for inference data
export const ModelRole = {
  CHAMPION: "champion",
  CHALLENGER: "challenger",
} as const;

export const PartitionStrategy = {
  DAILY: "daily",
  WEEKLY: "weekly", 
  MONTHLY: "monthly",
} as const;

// Base schemas for inference record components
export const InferenceMetadataSchema = z.object({
  timestamp: z.date().default(() => new Date()),
  latency: z.number().min(0),
  modelRole: z.enum([ModelRole.CHAMPION, ModelRole.CHALLENGER]),
  trafficPercentage: z.number().min(0).max(100).optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export const XAIDataSchema = z.object({
  featureImportance: z.record(z.string(), z.number()).optional(),
  shapValues: z.record(z.string(), z.number()).optional(),
  explanation: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
}).optional();

export const AuditTrailSchema = z.object({
  requestSource: z.string(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  correlationId: z.string().optional(),
});

// Main inference record schema
export const InferenceRecordSchema = z.object({
  id: z.number().optional(),
  uuid: z.string().uuid().optional(),
  modelGroupId: z.number(),
  modelId: z.number(),
  requestId: z.string(),
  input: z.record(z.string(), z.any()),
  output: z.record(z.string(), z.any()),
  metadata: InferenceMetadataSchema,
  xaiData: XAIDataSchema,
  auditTrail: AuditTrailSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Table configuration schemas
export const InferenceTableConfigSchema = z.object({
  modelGroupId: z.number(),
  modelGroupUuid: z.string().uuid(),
  orgId: z.number(),
  retentionDays: z.number().min(1).max(3650).optional(),
  partitionStrategy: z.enum([
    PartitionStrategy.DAILY,
    PartitionStrategy.WEEKLY,
    PartitionStrategy.MONTHLY
  ]).optional(),
});

// API schemas for table provisioning
export const ProvisionTableInputSchema = z.object({
  modelGroupId: z.number(),
  retentionDays: z.number().min(1).max(3650).default(90),
  partitionStrategy: z.enum([
    PartitionStrategy.DAILY,
    PartitionStrategy.WEEKLY,
    PartitionStrategy.MONTHLY
  ]).default(PartitionStrategy.MONTHLY),
});

export const GetTableStatsInputSchema = z.object({
  modelGroupUuid: z.string().uuid(),
});

export const ListInferenceTablesInputSchema = z.object({
  orgId: z.number().optional(), // Optional if derived from user context
});

// Bulk inference insert schema
export const BulkInsertInferencesInputSchema = z.object({
  modelGroupUuid: z.string().uuid(),
  inferences: z.array(InferenceRecordSchema).min(1).max(1000), // Limit bulk size
});

// Query schemas for inference data
export const QueryInferencesInputSchema = z.object({
  modelGroupUuid: z.string().uuid(),
  filters: z.object({
    modelId: z.number().optional(),
    modelRole: z.enum([ModelRole.CHAMPION, ModelRole.CHALLENGER]).optional(),
    sessionId: z.string().optional(),
    userId: z.string().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    requestSource: z.string().optional(),
  }).optional(),
  pagination: z.object({
    limit: z.number().min(1).max(1000).default(100),
    offset: z.number().min(0).default(0),
  }).optional(),
  orderBy: z.object({
    field: z.enum(["created_at", "latency_ms", "model_role"]).default("created_at"),
    direction: z.enum(["asc", "desc"]).default("desc"),
  }).optional(),
});

// Analytics schemas
export const InferenceAnalyticsInputSchema = z.object({
  modelGroupUuid: z.string().uuid(),
  timeRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  groupBy: z.enum(["model_role", "model_id", "hour", "day", "week"]).default("day"),
  metrics: z.array(z.enum([
    "request_count",
    "average_latency", 
    "error_rate",
    "traffic_split",
    "model_performance"
  ])).default(["request_count", "average_latency"]),
});

// Performance metrics schema
export const PerformanceMetricsSchema = z.object({
  totalRequests: z.number(),
  averageLatency: z.number(),
  p95Latency: z.number(),
  p99Latency: z.number(),
  errorRate: z.number(),
  throughputPerSecond: z.number(),
  championRequests: z.number(),
  challengerRequests: z.number(),
  trafficSplit: z.object({
    champion: z.number(),
    challenger: z.number(),
  }),
});

// Response schemas
export const TableStatsResponseSchema = z.object({
  tableName: z.string(),
  rowCount: z.number(),
  tableSize: z.string(),
  indexSize: z.string(),
  lastUpdated: z.date().optional(),
  performanceMetrics: PerformanceMetricsSchema.optional(),
});

export const InferenceAnalyticsResponseSchema = z.object({
  timeRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  metrics: z.record(z.string(), z.any()),
  trends: z.array(z.object({
    timestamp: z.date(),
    metrics: z.record(z.string(), z.number()),
  })),
  summary: PerformanceMetricsSchema,
});

// Error handling schemas
export const InferenceErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.any()).optional(),
  timestamp: z.date().default(() => new Date()),
});

// Table lifecycle schemas
export const TableLifecycleEventSchema = z.object({
  eventType: z.enum([
    "table_created",
    "table_archived", 
    "retention_cleanup",
    "performance_alert",
    "capacity_warning"
  ]),
  tableName: z.string(),
  metadata: z.record(z.string(), z.any()),
  timestamp: z.date().default(() => new Date()),
});

// Export types
export type InferenceRecord = z.infer<typeof InferenceRecordSchema>;
export type InferenceTableConfig = z.infer<typeof InferenceTableConfigSchema>;
export type ProvisionTableInput = z.infer<typeof ProvisionTableInputSchema>;
export type QueryInferencesInput = z.infer<typeof QueryInferencesInputSchema>;
export type InferenceAnalyticsInput = z.infer<typeof InferenceAnalyticsInputSchema>;
export type TableStatsResponse = z.infer<typeof TableStatsResponseSchema>;
export type InferenceAnalyticsResponse = z.infer<typeof InferenceAnalyticsResponseSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type TableLifecycleEvent = z.infer<typeof TableLifecycleEventSchema>; 
import { z } from "zod";
import { eq, asc, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { models, model_metrics } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { ModelStatus } from "@/constants/general";
import { createTRPCRouter, publicProcedure, protectedProcedure, getUserOrgId } from "../trpc";
import { NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST } from "@/constants/errorCode";
import {
  MODEL_NOT_FOUND_ERROR,
  MODEL_CREATE_ERROR,
  MODEL_UPDATE_ERROR,
} from "@/constants/errorMessage";
import type { ExtendedSession } from "@/db/auth-hydration";

// Import enhanced schemas from SAAS-261
import {
  flexibleModelImportSchema,
  aiTransformationRequestSchema,
  aiTransformationResponseSchema,
  enhancedModelMetadataSchema,
  ModelProvider,
  ModelArchitecture,
  ModelCapability,
  type FlexibleModelImportSchema,
  type AITransformationRequestSchema,
} from "@/schemas/model.schema";

const modelSchema = z.object({
  uuid: z.string().min(36).optional(), // Optional for creates, required for updates
  name: z.string().min(1),
  description: z.string().nullable(),
  fileName: z.string().min(1),
  fileKey: z.string().min(1),
  metadataFileName: z.string().nullable(),
  metadataFileKey: z.string().nullable(),
  defineInputs: z.record(z.any()).nullable(),
  version: z.string().nullable(),
  status: z.string().nullable(),
  type: z.string().nullable().optional(),
  framework: z.string().nullable().optional(),
  metrics: z
    .object({
      ks: z.string().optional(),
      auroc: z.string().optional(),
      gini: z.string().optional(),
      accuracy: z.string().optional(),
      precision: z.string().optional(),
      recall: z.string().optional(),
      f1: z.string().optional(),
      brier_score: z.string().optional(),
      log_loss: z.string().optional(),
      ksChart: z.string().optional(),
      aurocChart: z.string().optional(),
      giniChart: z.string().optional(),
      accuracyChart: z.string().optional(),
      features: z.record(z.any()).optional(),
      outputs: z.record(z.any()).optional(),
      inference: z.record(z.any()).optional(),
      // New SAAS-11 fields for enhanced model metadata
      charts_data: z.array(z.any()).optional(), // For metrics.charts array
      feature_analysis: z.record(z.any()).optional(), // For feature_analysis object
      model_info_details: z.record(z.any()).optional(), // For complete model_info object
    })
    .nullable(),
});

export const modelRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.void())
    .query(async ({ ctx }) => {
      const modelsData = await db.query.models.findMany({
        orderBy: desc(models.updatedAt),
        with: {
          metrics: {
            orderBy: desc(model_metrics.createdAt),
          },
        },
      });
      return modelsData;
    }),

  getByStatus: protectedProcedure
    .input(z.enum([ModelStatus.ACTIVE, ModelStatus.INACTIVE]))
    .query(async ({ input, ctx }) => {
      const modelsData = await db.query.models.findMany({
        where: eq(models.status, input),
        orderBy: desc(models.updatedAt),
      });
      return modelsData;
    }),

  getByUUID: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (!input) {
        throw new TRPCError({
          code: `${NOT_FOUND}` as TRPCError["code"],
          message: MODEL_NOT_FOUND_ERROR,
        });
      }
      const model = await db.query.models.findFirst({
        where: eq(models.uuid, input),
        with: {
          metrics: {
            orderBy: desc(model_metrics.createdAt),
          },
        },
      });

      if (!model) {
        throw new TRPCError({
          code: `${NOT_FOUND}` as TRPCError["code"],
          message: MODEL_NOT_FOUND_ERROR,
        });
      }

      return model;
    }),

  create: protectedProcedure
    .input(modelSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const newModel = await db.transaction(async (tx) => {
          const [model] = await tx
            .insert(models)
            .values({
              name: input.name,
              description: input.description,
              fileName: input.fileName,
              fileKey: input.fileKey,
              metadataFileName: input.metadataFileName ?? null,
              metadataFileKey: input.metadataFileKey ?? null,
              defineInputs: input.defineInputs,
              status: input.status || ModelStatus.INACTIVE,
              type: input.type,
              framework: input.framework,
              orgId: 1, // Temporary: Use default org ID
            })
            .returning();
          if (model && model.id && input.metrics) {
            const [metrics] = await tx
              .insert(model_metrics)
              .values({
                uuid: uuidv4(),
                modelId: model.id,
                version: input.version || "1.0.0",
                ks: input.metrics.ks,
                auroc: input.metrics.auroc,
                gini: input.metrics.gini,
                accuracy: input.metrics.accuracy,
                ksChart: input.metrics.ksChart,
                aurocChart: input.metrics.aurocChart,
                giniChart: input.metrics.giniChart,
                accuracyChart: input.metrics.accuracyChart,
                precision: input.metrics.precision,
                recall: input.metrics.recall,
                f1: input.metrics.f1,
                brier_score: input.metrics.brier_score,
                log_loss: input.metrics.log_loss,
                features: input.metrics.features,
                outputs: input.metrics.outputs,
                inference: input.metrics.inference,
                // New SAAS-11 fields for enhanced model metadata
                charts_data: input.metrics.charts_data,
                feature_analysis: input.metrics.feature_analysis,
                model_info_details: input.metrics.model_info_details,
              })
              .returning();
          }
          return model;
        });
        return newModel;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: MODEL_CREATE_ERROR,
        });
      }
    }),

  update: protectedProcedure
    .input(modelSchema.required({ uuid: true })) // UUID is required for updates
    .mutation(async ({ input, ctx }) => {
      try {
        const editModel = await db.transaction(async (tx) => {
          const [model] = await tx
            .update(models)
            .set({
              name: input.name,
              description: input.description,
              fileName: input.fileName,
              fileKey: input.fileKey,
              metadataFileName: input.metadataFileName ?? null,
              metadataFileKey: input.metadataFileKey ?? null,
              defineInputs: input.defineInputs,
              status: input.status || ModelStatus.INACTIVE,
              type: input.type,
              framework: input.framework,
            })
            .where(eq(models.uuid, input.uuid))
            .returning();
          if (model && model.id) {
            if (input.metrics) {
              const metrics = await tx.query.model_metrics.findFirst({
                where: eq(model_metrics.modelId, model.id),
              });
              if (metrics) {
                const [updatedMetrics] = await tx
                  .update(model_metrics)
                  .set({
                    ks: input.metrics.ks,
                    auroc: input.metrics.auroc,
                    gini: input.metrics.gini,
                    accuracy: input.metrics.accuracy,
                    ksChart: input.metrics.ksChart,
                    aurocChart: input.metrics.aurocChart,
                    giniChart: input.metrics.giniChart,
                    accuracyChart: input.metrics.accuracyChart,
                    precision: input.metrics.precision,
                    recall: input.metrics.recall,
                    f1: input.metrics.f1,
                    brier_score: input.metrics.brier_score,
                    log_loss: input.metrics.log_loss,
                    features: input.metrics.features,
                    outputs: input.metrics.outputs,
                    inference: input.metrics.inference,
                    // New SAAS-11 fields for enhanced model metadata
                    charts_data: input.metrics.charts_data,
                    feature_analysis: input.metrics.feature_analysis,
                    model_info_details: input.metrics.model_info_details,
                  })
                  .returning();
              } else {
                const [newMetrics] = await tx
                  .insert(model_metrics)
                  .values({
                    uuid: uuidv4(),
                    modelId: model.id,
                    version: input.version || "1.0.0",
                    ks: input.metrics.ks,
                    auroc: input.metrics.auroc,
                    gini: input.metrics.gini,
                    accuracy: input.metrics.accuracy,
                    precision: input.metrics.precision,
                    recall: input.metrics.recall,
                    f1: input.metrics.f1,
                    brier_score: input.metrics.brier_score,
                    log_loss: input.metrics.log_loss,
                    ksChart: input.metrics.ksChart,
                    aurocChart: input.metrics.aurocChart,
                    giniChart: input.metrics.giniChart,
                    accuracyChart: input.metrics.accuracyChart,
                    features: input.metrics.features,
                    outputs: input.metrics.outputs,
                    inference: input.metrics.inference,
                    // New SAAS-11 fields for enhanced model metadata
                    charts_data: input.metrics.charts_data,
                    feature_analysis: input.metrics.feature_analysis,
                    model_info_details: input.metrics.model_info_details,
                  })
                  .returning();
              }
            } else {
              const metrics = await tx
                .delete(model_metrics)
                .where(eq(model_metrics.modelId, model.id));
            }
            return model;
          }
        });
        return editModel;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: MODEL_UPDATE_ERROR,
        });
      }
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    const [model] = await db
      .delete(models)
      .where(eq(models.uuid, input))
      .returning();

    if (!model) {
      throw new TRPCError({
        code: `${NOT_FOUND}` as TRPCError["code"],
        message: MODEL_NOT_FOUND_ERROR,
      });
    }

    return model;
  }),

  // EPIC-4 SAAS-262: Enhanced Model Import Operations
  
  // Flexible model import from multiple sources
  importModel: protectedProcedure
    .input(flexibleModelImportSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);

        const newModel = await db.transaction(async (tx) => {
          // Determine file keys based on source
          let fileName = "";
          let fileKey = "";
          let metadataFileName = null;
          let metadataFileKey = null;

          if (input.source === ModelProvider.UPLOADED && input.files) {
            fileName = input.files.model || `${input.name}-model`;
            fileKey = input.files.model || "";
            metadataFileName = input.files.metadata || null;
            metadataFileKey = input.files.metadata || null;
          } else {
            // For external providers, use provider configuration as file reference
            fileName = `${input.source}-${input.name}`;
            fileKey = `provider:${input.source}`;
          }

          const [model] = await tx
            .insert(models)
            .values({
              name: input.name,
              description: input.metadata?.modelInfo?.license || null,
              fileName,
              fileKey,
              metadataFileName,
              metadataFileKey,
              status: ModelStatus.INACTIVE,
              
              // Enhanced EPIC-4 fields
              provider: input.source,
              architecture: input.metadata?.modelInfo?.architecture || null,
              capabilities: input.metadata?.modelInfo ? JSON.stringify([]) : null,
              
              // Enhanced metadata storage
              modelInfo: input.metadata?.modelInfo ? JSON.stringify(input.metadata.modelInfo) : null,
              trainingInfo: input.metadata?.trainingInfo ? JSON.stringify(input.metadata.trainingInfo) : null,
              performanceMetrics: input.metadata?.performanceMetrics ? JSON.stringify(input.metadata.performanceMetrics) : null,
              providerConfig: input.providerConfig ? JSON.stringify(input.providerConfig) : null,
              enhancedInputSchema: input.metadata?.inputSchema ? JSON.stringify(input.metadata.inputSchema) : null,
              enhancedOutputSchema: input.metadata?.outputSchema ? JSON.stringify(input.metadata.outputSchema) : null,
              
              // Multi-tenancy
              orgId,
            })
            .returning();

          return model;
        });

        return {
          success: true,
          model: newModel,
          message: `Model "${input.name}" imported successfully from ${input.source}`,
        };
      } catch (error) {
        console.error("Model import error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `Failed to import model: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  // AI-powered metadata transformation (placeholder for future implementation)
  transformMetadata: protectedProcedure
    .input(aiTransformationRequestSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Implement AI transformation service
        // For now, return a basic transformation
        
        const mockTransformation = {
          success: true,
          transformedData: input.sourceData, // Pass through for now
          confidence: 0.85,
          warnings: input.sourceType === "custom" ? ["Custom format may need manual validation"] : [],
          suggestions: ["Consider adding performance metrics", "Verify input schema constraints"],
        };

        return mockTransformation;
      } catch (error) {
        console.error("Metadata transformation error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `Failed to transform metadata: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  // Batch model import
  batchImport: protectedProcedure
    .input(z.object({
      models: z.array(flexibleModelImportSchema),
      options: z.object({
        skipErrors: z.boolean().default(true),
        autoActivate: z.boolean().default(false),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const session = ctx.session as ExtendedSession;
        const orgId = await getUserOrgId(session.user.id);
        const results = [];
        
        for (const modelInput of input.models) {
          try {
            const newModel = await db.transaction(async (tx) => {
              let fileName = "";
              let fileKey = "";
              
              if (modelInput.source === ModelProvider.UPLOADED && modelInput.files) {
                fileName = modelInput.files.model || `${modelInput.name}-model`;
                fileKey = modelInput.files.model || "";
              } else {
                fileName = `${modelInput.source}-${modelInput.name}`;
                fileKey = `provider:${modelInput.source}`;
              }

              const [model] = await tx
                .insert(models)
                .values({
                  name: modelInput.name,
                  description: modelInput.metadata?.modelInfo?.license || null,
                  fileName,
                  fileKey,
                  status: input.options?.autoActivate ? ModelStatus.ACTIVE : ModelStatus.INACTIVE,
                  provider: modelInput.source,
                  architecture: modelInput.metadata?.modelInfo?.architecture || null,
                  modelInfo: modelInput.metadata?.modelInfo ? JSON.stringify(modelInput.metadata.modelInfo) : null,
                  providerConfig: modelInput.providerConfig ? JSON.stringify(modelInput.providerConfig) : null,
                  orgId,
                })
                .returning();

              return model;
            });

            results.push({
              success: true,
              model: newModel,
              name: modelInput.name,
            });
          } catch (error) {
            if (input.options?.skipErrors) {
              results.push({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                name: modelInput.name,
              });
            } else {
              throw error;
            }
          }
        }

        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;

        return {
          success: errorCount === 0,
          results,
          summary: {
            total: input.models.length,
            successful: successCount,
            failed: errorCount,
          },
          message: `Batch import completed: ${successCount} successful, ${errorCount} failed`,
        };
      } catch (error) {
        console.error("Batch import error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `Batch import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  // Get models by provider
  getByProvider: protectedProcedure
    .input(z.nativeEnum(ModelProvider))
    .query(async ({ input, ctx }) => {
      const session = ctx.session as ExtendedSession;
      const orgId = await getUserOrgId(session.user.id);

      const modelsData = await db.query.models.findMany({
        where: and(
          eq(models.provider, input),
          eq(models.orgId, orgId)
        ),
        orderBy: desc(models.updatedAt),
        with: {
          metrics: {
            orderBy: desc(model_metrics.createdAt),
          },
        },
      });

      return modelsData;
    }),

  // Validate model configuration
  validateConfig: protectedProcedure
    .input(z.object({
      provider: z.nativeEnum(ModelProvider),
      config: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement actual provider validation in SAAS-264
        // For now, return basic validation
        
        const requiredFields: Record<string, string[]> = {
          [ModelProvider.OPENAI]: ["apiKey", "model"],
          [ModelProvider.ANTHROPIC]: ["apiKey", "model"],
          [ModelProvider.GOOGLE]: ["apiKey", "projectId", "model"],
          [ModelProvider.HUGGINGFACE]: ["model"],
          [ModelProvider.CUSTOM]: ["endpoint"],
          [ModelProvider.UPLOADED]: [],
        };

        const required = requiredFields[input.provider] || [];
        const missing = required.filter(field => !input.config[field]);

        return {
          valid: missing.length === 0,
          missing,
          warnings: [],
          suggestions: missing.length > 0 ? [`Missing required fields: ${missing.join(", ")}`] : [],
        };
      } catch (error) {
        console.error("Config validation error:", error);
        throw new TRPCError({
          code: `${BAD_REQUEST}` as TRPCError["code"],
          message: `Configuration validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});

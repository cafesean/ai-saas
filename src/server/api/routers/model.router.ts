import { z } from "zod";
import { eq, asc, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { models, model_metrics } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { ModelStatus } from "@/constants/general";
import { createTRPCRouter, publicProcedure, protectedProcedure, getUserOrgId } from "../trpc";
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from "@/constants/errorCode";
import {
  MODEL_NOT_FOUND_ERROR,
  MODEL_CREATE_ERROR,
  MODEL_UPDATE_ERROR,
} from "@/constants/errorMessage";

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
              orgId: await getUserOrgId(ctx.session.user.id), // 🔒 SECURITY FIX
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
});

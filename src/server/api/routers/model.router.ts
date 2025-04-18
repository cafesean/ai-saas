import { z } from "zod";
import { eq, asc, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db/config";
import { models, model_metrics } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { ModelStatus } from "@/constants/general";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { NOT_FOUND, INTERNAL_SERVER_ERROR } from "@/constants/errorCode";
import {
  MODEL_NOT_FOUND_ERROR,
  MODEL_CREATE_ERROR,
  MODEL_UPDATE_ERROR,
} from "@/constants/errorMessage";

const modelSchema = z.object({
  uuid: z.string().min(36),
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
      ks: z.string().nullable(),
      auroc: z.string().nullable(),
      gini: z.string().nullable(),
      accuracy: z.string().nullable(),
      ksChart: z.string().nullable(),
      aurocChart: z.string().nullable(),
      giniChart: z.string().nullable(),
      accuracyChart: z.string().nullable(),
    })
    .nullable(),
});

export const modelRouter = createTRPCRouter({
  getAll: publicProcedure.input(z.void()).query(async () => {
    const modelsData = await db.query.models.findMany({
      orderBy: desc(models.updatedAt),
      with: {
        metrics: true,
      },
    });
    return modelsData;
  }),

  getByUUID: publicProcedure.input(z.string()).query(async ({ input }) => {
    if (!input) {
      throw new TRPCError({
        code: `${NOT_FOUND}` as TRPCError["code"],
        message: MODEL_NOT_FOUND_ERROR,
      });
    }
    const model = await db.query.models.findFirst({
      where: eq(models.uuid, input),
      with: {
        metrics: true,
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

  create: publicProcedure.input(modelSchema).mutation(async ({ input }) => {
    try {
      const newModel = await db.transaction(async (tx) => {
        const [model] = await tx
          .insert(models)
          .values({
            uuid: input.uuid,
            name: input.name,
            description: input.description,
            version: input.version,
            fileName: input.fileName,
            fileKey: input.fileKey,
            metadataFileName: input.metadataFileName ?? null,
            metadataFileKey: input.metadataFileKey ?? null,
            defineInputs: input.defineInputs,
            status: input.status || ModelStatus.INACTIVE,
            type: input.type,
            framework: input.framework,
          })
          .returning();
        if (model && model.id && input.metrics) {
          const [metrics] = await tx
            .insert(model_metrics)
            .values({
              uuid: uuidv4(),
              modelId: model.id,
              ks: input.metrics.ks,
              auroc: input.metrics.auroc,
              gini: input.metrics.gini,
              accuracy: input.metrics.accuracy,
              ksChart: input.metrics.ksChart,
              aurocChart: input.metrics.aurocChart,
              giniChart: input.metrics.giniChart,
              accuracyChart: input.metrics.accuracyChart,
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

  update: publicProcedure.input(modelSchema).mutation(async ({ input }) => {
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
            version: input.version,
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
                })
                .returning();
            } else {
              const [newMetrics] = await tx
                .insert(model_metrics)
                .values({
                  uuid: uuidv4(),
                  modelId: model.id,
                  ks: input.metrics.ks,
                  auroc: input.metrics.auroc,
                  gini: input.metrics.gini,
                  accuracy: input.metrics.accuracy,
                  ksChart: input.metrics.ksChart,
                  aurocChart: input.metrics.aurocChart,
                  giniChart: input.metrics.giniChart,
                  accuracyChart: input.metrics.accuracyChart,
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

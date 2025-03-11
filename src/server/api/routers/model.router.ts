import { z } from 'zod';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db/config';
import { models } from '@/db/schema';
import { TRPCError } from '@trpc/server';
import { ModelStatus } from "@/constants/general";
import { createTRPCRouter, publicProcedure } from "../trpc";

const modelSchema = z.object({
  uuid: z.string().min(36),
  name: z.string().min(1),
  description: z.string().nullable(),
  fileName: z.string().min(1),
  fileKey: z.string().min(1),
  metadataFileName: z.string().min(1),
  metadataFileKey: z.string().min(1),
  defineInputs: z.record(z.any()).nullable(),
  status: z.string().nullable(),
});

export const modelRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async () => {
      const modelsData = await db.query.models.findMany({
        orderBy: asc(models.name),
      });
      return modelsData;
    }),

  getByUUID: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const model = await db.query.models.findFirst({
        where: eq(models.uuid, input)
      });

      if (!model) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Model not found`
        });
      }

      return model;
    }),

  create: publicProcedure
    .input(modelSchema)
    .mutation(async ({ input }) => {
      const model = await db
      .insert(models)
      .values({
        uuid: input.uuid,
        name: input.name,
        description: input.description,
        fileName: input.fileName,
        fileKey: input.fileKey,
        metadataFileName: input.metadataFileName,
        metadataFileKey: input.metadataFileKey,
        defineInputs: input.defineInputs,
        status: input.status || ModelStatus.INACTIVE,
      })
      .returning();

      return model;
    }),

  update: publicProcedure
    .input(modelSchema)
    .mutation(async ({ input }) => {
      const [model] = await db.update(models)
        .set({
          name: input.name,
          description: input.description,
          fileName: input.fileName,
          fileKey: input.fileKey,
          metadataFileName: input.metadataFileName,
          metadataFileKey: input.metadataFileKey,
          defineInputs: input.defineInputs,
          status: input.status || ModelStatus.INACTIVE,
        })
        .where(eq(models.uuid, input.uuid))
        .returning();

      if (!model) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Model not found`
        });
      }

      return model;
    }),

  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const [model] = await db.delete(models)
        .where(eq(models.uuid, input))
        .returning();

      if (!model) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Model not found`
        });
      }

      return model;
    }),
});
import { eq, and, desc, inArray } from "drizzle-orm";
import { z } from "zod";

import {
  mockVectorDatabases,
  mockEmbeddingModels,
} from "./knowledge-bases/mockData";
import type { EmbeddingModel } from "@/types/knowledge-base";
import { db } from "@/db/config";
import { createTRPCRouter, publicProcedure } from "../trpc";
import schema, { knowledge_bases } from "@/db/schema";
import { KnowledgeBaseEmbeddingModels } from "@/constants/knowledgeBase";

/**
 * Knowledge bases router with procedures for managing knowledge bases
 */
export const knowledgeBasesRouter = createTRPCRouter({
  /**
   * Get all knowledge bases
   */
  getAllKnowledgeBases: publicProcedure
    .input(z.void())
    .query(async ({ ctx }) => {
      const knowledgeBasesData = await ctx.db.query.knowledge_bases.findMany({
        with: {
          documents: {
            columns: {
              id: true,
              uuid: true,
              path: true,
            },
          },
        },
        orderBy: desc(knowledge_bases.updatedAt),
      });

      const result = knowledgeBasesData.map((kb) => ({
        ...kb,
        documentCount: kb.documents.length,
        embeddingDimensions:
          KnowledgeBaseEmbeddingModels.filter(
            (model: EmbeddingModel) => model.name === kb.embeddingModel,
          )[0]?.dimensions || 0,
      }));

      return {
        knowledgeBases: result,
        total: knowledgeBasesData.length,
      };
    }),

  /**
   * Get a single knowledge base by ID
   */
  getKnowledgeBaseById: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
      }),
    )
    .query(async ({ input }: { input: { uuid: string } }) => {
      try {
        const workflowData = await db.query.knowledge_bases.findFirst({
          where: eq(schema.knowledge_bases.uuid, input.uuid),
          with: {
            documents: true,
          },
        });
        return workflowData;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch knowledge base");
      }
    }),

  /**
   * Create a new knowledge base
   */
  createKnowledgeBase: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string(),
        embeddingModel: z.string(),
        vectorDB: z.string(),
      }),
    )
    .mutation(
      async ({
        input,
      }: {
        input: {
          name: string;
          description: string;
          embeddingModel: string;
          vectorDB: string;
        };
      }) => {
        // In a real implementation, this would insert into a database
        const newKnowledgeBase = await db
          .insert(schema.knowledge_bases)
          .values(input)
          .returning();

        // In a real implementation, we would add to the database
        return newKnowledgeBase;
      },
    ),

  /**
   * Update a knowledge base by ID
   */
  updateKnowledgeBase: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        embeddingModel: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updateInfo: any = {};
        if (input.name) {
          updateInfo["name"] = input.name;
        }
        if (input.description) {
          updateInfo["description"] = input.description;
        }
        if (input.embeddingModel) {
          updateInfo["embeddingModel"] = input.embeddingModel;
        }
        const kb = await db.transaction(async (tx) => {
          const [kb] = await tx
            .update(schema.knowledge_bases)
            .set(updateInfo)
            .where(eq(schema.knowledge_bases.uuid, input.uuid))
            .returning();
        });
        return kb;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to update knowledge base");
      }
    }),
  updateKnowledgeBaseStatus: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const [kb] = await db
          .update(schema.knowledge_bases)
          .set({ status: input.status })
          .where(eq(schema.knowledge_bases.uuid, input.uuid))
          .returning();

        return kb;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to change status");
      }
    }),

  deleteKnowledgeBase: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const [kb] = await db
          .delete(schema.knowledge_bases)
          .where(eq(schema.knowledge_bases.uuid, input.uuid))
          .returning();
        return kb;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to delete knowledge base");
      }
    }),

  addKnowledgeBaseDocuments: publicProcedure
    .input(
      z.object({
        kbId: z.string(),
        chunkSize: z.string(),
        chunkOverlap: z.string(),
        documents: z.array(
          z.object({
            uuid: z.string(),
            name: z.string(),
            size: z.number(),
            path: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Map documents to insert into the database
        const documentsToInsert = input.documents.map((doc) => ({
          uuid: doc.uuid,
          kb_id: input.kbId,
          name: doc.name,
          size: doc.size,
          path: doc.path,
          chunkSize: input.chunkSize,
          chunkOverlap: input.chunkOverlap,
        }));
        const kbDocuments = await db
          .insert(schema.knowledge_base_documents)
          .values(documentsToInsert)
          .returning();
        return {
          success: true,
          data: {
            documents: kbDocuments,
          },
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to add documents to knowledge base");
      }
    }),

  deleteKnowledgeBaseDocuments: publicProcedure
    .input(
      z.object({
        kbId: z.string(),
        documents: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const deletedDocuments = await db
          .delete(schema.knowledge_base_documents)
          .where(
            and(
              eq(schema.knowledge_base_documents.kb_id, input.kbId),
              inArray(schema.knowledge_base_documents.uuid, input.documents),
            ),
          )
          .returning();
        return {
          success: true,
          data: {
            documents: deletedDocuments,
          },
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to delete documents from knowledge base");
      }
    }),

  getKnowledgeBaseDocuments: publicProcedure
    .input(
      z.object({
        kbId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const documents = await db.query.knowledge_base_documents.findMany({
          where: eq(schema.knowledge_base_documents.kb_id, input.kbId),
        });
        return {
          success: true,
          data: {
            documents,
          },
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch documents from knowledge base");
      }
    }),

  /**
   * Get all vector databases
   */
  getVectorDatabases: publicProcedure.query(async () => {
    // In a real implementation, this would fetch from a database
    return {
      vectorDatabases: mockVectorDatabases,
      total: mockVectorDatabases.length,
    };
  }),

  /**
   * Get all embedding models
   */
  getEmbeddingModels: publicProcedure.query(async () => {
    // In a real implementation, this would fetch from a database
    return {
      embeddingModels: mockEmbeddingModels,
      total: mockEmbeddingModels.length,
    };
  }),
});

import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import {
  mockKnowledgeBases,
  mockVectorDatabases,
  mockEmbeddingModels,
} from "./knowledge-bases/mockData";
import type {
  KnowledgeBase,
  VectorDatabase,
  EmbeddingModel,
  CreateKnowledgeBaseParams,
} from "@/types/knowledge-base";

/**
 * Knowledge bases router with procedures for managing knowledge bases
 */
export const knowledgeBasesRouter = createTRPCRouter({
  /**
   * Get all knowledge bases
   */
  getAllKnowledgeBases: publicProcedure.query(async () => {
    // In a real implementation, this would fetch from a database
    return {
      knowledgeBases: mockKnowledgeBases,
      total: mockKnowledgeBases.length,
    };
  }),

  /**
   * Get a single knowledge base by ID
   */
  getKnowledgeBaseById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }: { input: { id: string } }) => {
      // In a real implementation, this would fetch from a database
      const knowledgeBase = mockKnowledgeBases.find((kb) => kb.id === input.id);

      if (!knowledgeBase) {
        throw new Error(`Knowledge base with ID ${input.id} not found`);
      }

      return knowledgeBase;
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
        vectorDb: z.string(),
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
          vectorDb: string;
        };
      }) => {
        // In a real implementation, this would insert into a database
        const newKnowledgeBase: KnowledgeBase = {
          id: `kb-${mockKnowledgeBases.length + 1}`,
          name: input.name,
          description: input.description,
          documentCount: 0,
          lastUpdated: "Just now",
          status: "Active",
          embeddingModel: input.embeddingModel,
          embeddingDimensions: 1536, // Default value, would be determined by model
          vectorDb: input.vectorDb,
          creator: "Current User", // Would come from auth context
        };

        // In a real implementation, we would add to the database
        return newKnowledgeBase;
      },
    ),

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

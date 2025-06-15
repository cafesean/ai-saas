import { eq, and, desc, inArray, asc } from "drizzle-orm";
import { z } from "zod";

import {
  mockVectorDatabases,
  mockEmbeddingModels,
} from "./knowledge-bases/mockData";
import type { EmbeddingModel } from "@/types/knowledge-base";
import { db } from "@/db/config";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
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

      const result = knowledgeBasesData.map((kb: any) => ({
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

  getKnowledgeBaseByStatus: publicProcedure
    .input(
      z.object({
        status: z.string(),
      }),
    )
    .query(async ({ input }: { input: { status: string } }) => {
      try {
        const knowledgeBasesData = await db.query.knowledge_bases.findMany({
          where: eq(schema.knowledge_bases.status, input.status),
        });
        return knowledgeBasesData;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch knowledge bases");
      }
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
        const originKnowledgeBase: any =
          await db.query.knowledge_bases.findFirst({
            where: eq(schema.knowledge_bases.uuid, input.uuid),
            with: {
              documents: true,
              conversations: {
                columns: {
                  uuid: true,
                  name: true,
                  updatedAt: true,
                },
                orderBy: desc(schema.conversations.updatedAt),
                with: {
                  messages: {
                    columns: {
                      uuid: true,
                      updatedAt: true,
                    },
                    orderBy: desc(schema.conversation_messages.createdAt),
                  },
                },
              },
            },
          });
        const knowledgeBase = {
          ...originKnowledgeBase,
          conversations: originKnowledgeBase?.conversations.map(
            (conversation: any) => ({
              ...conversation,
              messageCount: conversation.messages.length,
              lastUpdatedAt:
                conversation.messages.length > 0
                  ? conversation.messages[0].updatedAt
                  : conversation.updatedAt,
            }),
          ),
        };
        return knowledgeBase;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch knowledge base");
      }
    }),

  /**
   * Create a new knowledge base
   */
  createKnowledgeBase: protectedProcedure
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
  updateKnowledgeBase: protectedProcedure
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
  updateKnowledgeBaseStatus: protectedProcedure
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

  deleteKnowledgeBase: protectedProcedure
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

  addKnowledgeBaseDocuments: protectedProcedure
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

  deleteKnowledgeBaseDocuments: protectedProcedure
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

  createConversation: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        kbId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const [newConversation] = await db
          .insert(schema.conversations)
          .values({
            name: input.name,
            description: input.description,
            kbId: input.kbId,
          })
          .returning();
        return newConversation;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to add conversation to knowledge base");
      }
    }),

  createConversationMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        role: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const newConversationMessage = await db
          .insert(schema.conversation_messages)
          .values({
            conversationId: input.conversationId,
            role: input.role,
            content: input.content,
          })
          .returning();
        return newConversationMessage;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to add conversation message to knowledge base");
      }
    }),

  getConversationById: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const conversation = await db.query.conversations.findFirst({
          where: eq(schema.conversations.uuid, input.uuid),
          with: {
            messages: {
              orderBy: asc(schema.conversation_messages.createdAt),
            },
          },
        });
        return conversation;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch conversation from knowledge base");
      }
    }),

  updateConversationById: protectedProcedure
    .input(
      z.object({
        uuid: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const conversation = await db
          .update(schema.conversations)
          .set({
            name: input.name,
            description: input.description,
          })
          .where(eq(schema.conversations.uuid, input.uuid))
          .returning();
        return conversation;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to update conversation from knowledge base");
      }
    }),

  updateDocumentStatus: protectedProcedure
    .input(
      z.object({
        documentIds: z.array(z.string()),
        status: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updatedDocuments = await db
          .update(schema.knowledge_base_documents)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(inArray(schema.knowledge_base_documents.uuid, input.documentIds))
          .returning();
        return {
          success: true,
          data: {
            documents: updatedDocuments,
          },
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to update document status");
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

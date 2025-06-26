import { eq, and, desc, inArray, asc, count, like } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

import {
  mockVectorDatabases,
  mockEmbeddingModels,
} from "./knowledge-bases/mockData";
import type { EmbeddingModel } from "@/types/knowledge-base";
import { db } from "@/db";
import { createTRPCRouter, publicProcedure, protectedProcedure, withPermission } from "../trpc";
import { 
  knowledge_bases,
  knowledge_base_documents,
  knowledge_base_chunks,
  conversations,
  conversation_messages
} from "@/db/schema";
import { KnowledgeBaseEmbeddingModels } from "@/constants/knowledgeBase";

/**
 * Knowledge bases router with procedures for managing knowledge bases
 */
export const knowledgeBasesRouter = createTRPCRouter({
  /**
   * Get all knowledge bases
   */
  getAllKnowledgeBases: withPermission('bases:read')
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
          where: eq(knowledge_bases.status, input.status),
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
            where: eq(knowledge_bases.uuid, input.uuid),
            with: {
              documents: true,
              conversations: {
                columns: {
                  uuid: true,
                  name: true,
                  updatedAt: true,
                },
                orderBy: desc(conversations.updatedAt),
                with: {
                  messages: {
                    columns: {
                      uuid: true,
                      updatedAt: true,
                    },
                    orderBy: desc(conversation_messages.createdAt),
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
          .insert(knowledge_bases)
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
            .update(knowledge_bases)
            .set(updateInfo)
            .where(eq(knowledge_bases.uuid, input.uuid))
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
          .update(knowledge_bases)
          .set({ status: input.status })
          .where(eq(knowledge_bases.uuid, input.uuid))
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
          .delete(knowledge_bases)
          .where(eq(knowledge_bases.uuid, input.uuid))
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
          .insert(knowledge_base_documents)
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
          .delete(knowledge_base_documents)
          .where(
            and(
              eq(knowledge_base_documents.kb_id, input.kbId),
              inArray(knowledge_base_documents.uuid, input.documents),
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
          where: eq(knowledge_base_documents.kb_id, input.kbId),
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
          .insert(conversations)
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
          .insert(conversation_messages)
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
          where: eq(conversations.uuid, input.uuid),
          with: {
            messages: {
              orderBy: asc(conversation_messages.createdAt),
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
          .update(conversations)
          .set({
            name: input.name,
            description: input.description,
          })
          .where(eq(conversations.uuid, input.uuid))
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
          .update(knowledge_base_documents)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(inArray(knowledge_base_documents.uuid, input.documentIds))
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

  /**
   * Get chunks for a document with filtering and pagination
   */
  getDocumentChunks: withPermission('bases:read')
    .input(
      z.object({
        documentId: z.string(),
        search: z.string().optional(),
        chunkingStrategy: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      try {
        const whereConditions = [
          eq(knowledge_base_chunks.document_id, input.documentId)
        ];

        if (input.search) {
          // Add search condition for content
          whereConditions.push(
            like(knowledge_base_chunks.content, `%${input.search}%`)
          );
        }

        if (input.chunkingStrategy) {
          whereConditions.push(
            eq(knowledge_base_chunks.chunkingStrategy, input.chunkingStrategy)
          );
        }

        const chunks = await db.query.knowledge_base_chunks.findMany({
          where: and(...whereConditions),
          limit: input.limit,
          offset: input.offset,
          orderBy: asc(knowledge_base_chunks.createdAt),
          with: {
            document: {
              columns: {
                name: true,
                uuid: true,
              },
            },
          },
        });

        const totalResult = await db
          .select({ count: count() })
          .from(knowledge_base_chunks)
          .where(and(...whereConditions));

        return {
          chunks,
          total: totalResult[0]?.count || 0,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch document chunks");
      }
    }),

  /**
   * Create manual chunk
   */
  createChunk: withPermission('bases:create')
    .input(
      z.object({
        documentId: z.string(),
        content: z.string().min(1),
        chunkingStrategy: z.string().default("manual"),
        metadata: z.object({
          chunkIndex: z.number(),
          startChar: z.number(),
          endChar: z.number(),
          chunkingStrategy: z.string(),
          pageNumber: z.number().optional(),
          section: z.string().optional(),
        }).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const [chunk] = await db
          .insert(knowledge_base_chunks)
          .values({
            document_id: input.documentId,
            content: input.content,
            chunkingStrategy: input.chunkingStrategy,
            metadata: input.metadata,
            chunkSize: input.content.length,
            chunkOverlap: 0,
            isManual: true,
            status: "processed",
          })
          .returning();

        return chunk;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create chunk");
      }
    }),

  /**
   * Update chunk content and metadata
   */
  updateChunk: withPermission('bases:update')
    .input(
      z.object({
        chunkId: z.string(),
        content: z.string().optional(),
        metadata: z.object({
          chunkIndex: z.number(),
          startChar: z.number(),
          endChar: z.number(),
          chunkingStrategy: z.string(),
          pageNumber: z.number().optional(),
          section: z.string().optional(),
        }).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updateData: any = { updatedAt: new Date() };
        
        if (input.content !== undefined) {
          updateData.content = input.content;
          updateData.chunkSize = input.content.length;
          // Clear embedding when content changes
          updateData.embedding = null;
          updateData.status = "pending_embedding";
        }
        
        if (input.metadata !== undefined) {
          updateData.metadata = input.metadata;
        }

        const [chunk] = await db
          .update(knowledge_base_chunks)
          .set(updateData)
          .where(eq(knowledge_base_chunks.uuid, input.chunkId))
          .returning();

        return chunk;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to update chunk");
      }
    }),

  /**
   * Delete chunks (single or bulk)
   */
  deleteChunks: withPermission('bases:delete')
    .input(
      z.object({
        chunkIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const deletedChunks = await db
          .delete(knowledge_base_chunks)
          .where(inArray(knowledge_base_chunks.uuid, input.chunkIds))
          .returning();

        return {
          success: true,
          deletedCount: deletedChunks.length,
          deletedChunks,
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to delete chunks");
      }
    }),

  /**
   * Re-embed chunks (trigger re-embedding process)
   */
  reEmbedChunks: withPermission('bases:update')
    .input(
      z.object({
        chunkIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Mark chunks as pending re-embedding
        const updatedChunks = await db
          .update(knowledge_base_chunks)
          .set({
            embedding: null,
            status: "pending_embedding",
            updatedAt: new Date(),
          })
          .where(inArray(knowledge_base_chunks.uuid, input.chunkIds))
          .returning();

        // In production, this would trigger the embedding service
        // For now, we'll return the updated chunks
        return {
          success: true,
          updatedCount: updatedChunks.length,
          updatedChunks,
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to re-embed chunks");
      }
    }),

  /**
   * Get chunk statistics for a document
   */
  getChunkStats: withPermission('bases:read')
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const stats = await db
          .select({
            total: count(),
            strategy: knowledge_base_chunks.chunkingStrategy,
          })
          .from(knowledge_base_chunks)
          .where(eq(knowledge_base_chunks.document_id, input.documentId))
          .groupBy(knowledge_base_chunks.chunkingStrategy);

        const totalChunks = stats.reduce((sum, stat) => sum + (stat.total || 0), 0);
        
        return {
          totalChunks,
          byStrategy: stats,
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch chunk statistics");
      }
    }),

  /**
   * Process document and create chunks locally
   */
  processDocumentChunks: withPermission('bases:create')
    .input(
      z.object({
        documentId: z.string(),
        content: z.string(),
        chunkingStrategy: z.string().default('fixed-length'),
        chunkSize: z.number().min(100).max(10000).default(1000),
        chunkOverlap: z.number().min(0).default(200),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Import chunking service
        const { ChunkingService } = await import('@/lib/chunking/strategies');
        
        // Validate document exists
        const document = await db.query.knowledge_base_documents.findFirst({
          where: eq(knowledge_base_documents.uuid, input.documentId),
        });

        if (!document) {
          throw new Error("Document not found");
        }

        // Create chunking options
        const chunkingOptions = {
          strategy: input.chunkingStrategy,
          chunkSize: input.chunkSize,
          chunkOverlap: input.chunkOverlap,
        };

        // Validate options
        const validationErrors = ChunkingService.validateOptions(chunkingOptions);
        if (validationErrors.length > 0) {
          throw new Error(`Invalid chunking options: ${validationErrors.join(', ')}`);
        }

        // Generate chunks
        const textChunks = await ChunkingService.chunkText(input.content, chunkingOptions);

        // Prepare chunks for database insertion
        const chunksToInsert = textChunks.map((chunk) => ({
          uuid: crypto.randomUUID(),
          document_id: input.documentId,
          content: chunk.content,
          metadata: chunk.metadata,
          chunkingStrategy: input.chunkingStrategy,
          chunkSize: chunk.content.length,
          chunkOverlap: input.chunkOverlap,
          isManual: false,
          status: "processed" as const,
        }));

        // Insert chunks into database
        const insertedChunks = await db
          .insert(knowledge_base_chunks)
          .values(chunksToInsert)
          .returning();

        return {
          success: true,
          chunksCreated: insertedChunks.length,
          chunks: insertedChunks,
        };
      } catch (error) {
        console.error('Error processing document chunks:', error);
        throw new Error(`Failed to process document chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
});

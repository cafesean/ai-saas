/**
 * Types for knowledge base related data structures
 */

/**
 * Represents a knowledge base in the system
 */
export interface KnowledgeBase {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  documentCount: number;
  lastUpdated?: string;
  status: string;
  embeddingModel: string;
  embeddingDimensions: number;
  vectorDB: string;
  creator?: string;
  createdAt?: string; 
  updatedAt?: string;
}

/**
 * Represents a vector database connection
 */
export interface VectorDatabase {
  id: string;
  name: string;
  description: string;
  type?: string;
  status: "Connected" | "Not Connected" | "Error";
  provider: string;
}

/**
 * Represents an embedding model
 */
export interface EmbeddingModel {
  id: string;
  name: string;
  dimensions: number;
  maxTokens?: number;
  description: string;
  provider: string;
  status?: string;
}

/**
 * Parameters for creating a new knowledge base
 */
export interface CreateKnowledgeBaseParams {
  name: string;
  description: string;
  embeddingModel: string;
  vectorDb: string;
}

/**
 * Response for knowledge base list query
 */
export interface KnowledgeBaseListResponse {
  knowledgeBases: KnowledgeBase[];
}

/**
 * Response for vector database list query
 */
export interface VectorDatabaseListResponse {
  vectorDatabases: VectorDatabase[];
}

/**
 * Response for embedding model list query
 */
export interface EmbeddingModelListResponse {
  embeddingModels: EmbeddingModel[];
}

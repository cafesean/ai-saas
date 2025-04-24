import { KnowledgeBase, VectorDatabase, EmbeddingModel } from "@/types/knowledge-base";

/**
 * Mock data for knowledge bases
 */
export const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: "kb-1",
    name: "Product Documentation",
    description: "Knowledge base containing all product documentation and guides",
    documentCount: 157,
    lastUpdated: "2025-04-01T14:30:00Z",
    status: "Active",
    embeddingModel: "em-1",
    embeddingDimensions: 1536,
    vectorDb: "vdb-1",
    creator: "Sarah Johnson"
  },
  {
    id: "kb-2",
    name: "Customer Support FAQs",
    description: "Frequently asked questions from our support team",
    documentCount: 243,
    lastUpdated: "2025-03-28T09:15:00Z",
    status: "Processing",
    embeddingModel: "em-2",
    embeddingDimensions: 768,
    vectorDb: "vdb-2",
    creator: "Michael Chen"
  },
  {
    id: "kb-3",
    name: "Research Papers",
    description: "Collection of academic papers and research findings",
    documentCount: 89,
    lastUpdated: "2025-04-05T16:45:00Z",
    status: "Inactive",
    embeddingModel: "em-3",
    embeddingDimensions: 384,
    vectorDb: "vdb-3",
    creator: "Dr. Emily Rodriguez"
  }
];

/**
 * Mock data for vector databases
 */
export const mockVectorDatabases: VectorDatabase[] = [
  {
    id: "vdb-1",
    name: "Pinecone Production",
    description: "Primary vector database for production workloads",
    status: "Connected"
  },
  {
    id: "vdb-2",
    name: "Weaviate Development",
    description: "Vector database for development and testing",
    status: "Connected"
  },
  {
    id: "vdb-3",
    name: "Qdrant Analytics",
    description: "Specialized vector database for analytics workloads",
    status: "Not Connected"
  },
  {
    id: "vdb-4",
    name: "Chroma Experiments",
    description: "Local vector database for experimentation",
    status: "Error"
  }
];

/**
 * Mock data for embedding models
 */
export const mockEmbeddingModels: EmbeddingModel[] = [
  {
    id: "em-1",
    name: "OpenAI Ada 002",
    provider: "OpenAI",
    dimensions: 1536,
    description: "General purpose embedding model with high accuracy"
  },
  {
    id: "em-2",
    name: "Cohere Embed",
    provider: "Cohere",
    dimensions: 768,
    description: "Balanced embedding model for various use cases"
  },
  {
    id: "em-3",
    name: "MiniLM Sentence Transformers",
    provider: "HuggingFace",
    dimensions: 384,
    description: "Lightweight model optimized for speed"
  },
  {
    id: "em-4",
    name: "Claude 3 Haiku Embeddings",
    provider: "Anthropic",
    dimensions: 2048,
    description: "High-dimensional embeddings for complex semantic matching"
  }
]; 
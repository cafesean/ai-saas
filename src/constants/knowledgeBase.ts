import {
  KnowledgeBase,
  VectorDatabase,
  EmbeddingModel,
} from "@/types/knowledge-base";

export const KnowledgeBaseStatus = {
  draft: "Draft",
  ready: "Ready",
};

export const KnowledgeBaseDocumentStatus = {
  processed: "Processed",
  processing: "Processing",
};

export const KnowledgeBaseVectorDatabase: VectorDatabase[] = [
  {
    id: "vdb-1",
    name: "Pinecone Production",
    description: "Primary vector database for production workloads",
    status: "Not Connected",
    provider: "PostgreSQL pgvector",
  },
  {
    id: "vdb-2",
    name: "Weaviate Development",
    description: "Vector database for development and testing",
    status: "Not Connected",
    provider: "PostgreSQL pgvector",
  },
  {
    id: "vdb-3",
    name: "Qdrant Analytics",
    description: "Specialized vector database for analytics workloads",
    status: "Not Connected",
    provider: "Qdrant",
  },
  {
    id: "vdb-4",
    name: "Chroma Experiments",
    description: "Local vector database for experimentation",
    status: "Error",
    provider: "QdrChromaant",
  },
  {
    id: "vdb-5",
    name: "Supabase Vector",
    description: "Vector database for Supabase",
    status: "Connected",
    provider: "Supabase",
  },
];

export const KnowledgeBaseEmbeddingModels: EmbeddingModel[] = [
  {
    id: "em-1",
    name: "OpenAI Ada 002",
    provider: "OpenAI",
    dimensions: 1536,
    description: "General purpose embedding model with high accuracy",
    status: "Inactive",
  },
  {
    id: "em-2",
    name: "Cohere Embed",
    provider: "Cohere",
    dimensions: 768,
    description: "Balanced embedding model for various use cases",
    status: "Inactive",
  },
  {
    id: "em-3",
    name: "MiniLM Sentence Transformers",
    provider: "HuggingFace",
    dimensions: 384,
    description: "Lightweight model optimized for speed",
    status: "Inactive",
  },
  {
    id: "em-4",
    name: "Claude 3 Haiku Embeddings",
    provider: "Anthropic",
    dimensions: 2048,
    description: "High-dimensional embeddings for complex semantic matching",
    status: "Inactive",
  },
  {
    id: "em-5",
    name: "Google Gemini 2.0 flash",
    provider: "Google",
    dimensions: 378,
    description: "Advanced embedding model for advanced use cases",
    status: "Active",
  },
];

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

export const ChunkingStrategies = {
  FIXED_LENGTH: "fixed-length",
  SEMANTIC: "semantic",
  SENTENCE: "sentence",
  PARAGRAPH: "paragraph",
  MANUAL: "manual",
} as const;

export const ChunkingStrategyOptions = [
  {
    value: ChunkingStrategies.FIXED_LENGTH,
    label: "Fixed Length",
    description: "Split text into chunks of fixed character length with overlap",
    defaultSize: 1000,
    defaultOverlap: 200,
  },
  {
    value: ChunkingStrategies.SEMANTIC,
    label: "Semantic",
    description: "Split text based on semantic similarity and meaning",
    defaultSize: 1500,
    defaultOverlap: 150,
  },
  {
    value: ChunkingStrategies.SENTENCE,
    label: "Sentence",
    description: "Split text at sentence boundaries",
    defaultSize: 800,
    defaultOverlap: 100,
  },
  {
    value: ChunkingStrategies.PARAGRAPH,
    label: "Paragraph",
    description: "Split text at paragraph boundaries",
    defaultSize: 1200,
    defaultOverlap: 100,
  },
  {
    value: ChunkingStrategies.MANUAL,
    label: "Manual",
    description: "Manually define chunk boundaries",
    defaultSize: 0,
    defaultOverlap: 0,
  },
] as const;

export const KnowledgeBaseVectorDatabase: VectorDatabase[] = [
  {
    id: "vdb-1",
    name: "Pinecone Production",
    value: "Pinecone Production DB",
    description: "Primary vector database for production workloads",
    status: "Not Connected",
    provider: "PostgreSQL pgvector",
  },
  {
    id: "vdb-2",
    name: "Weaviate Development",
    value: "Weaviate Development DB",
    description: "Vector database for development and testing",
    status: "Not Connected",
    provider: "PostgreSQL pgvector",
  },
  {
    id: "vdb-3",
    name: "Qdrant Analytics",
    value: "Qdrant Analytics DB",
    description: "Specialized vector database for analytics workloads",
    status: "Not Connected",
    provider: "Qdrant",
  },
  {
    id: "vdb-4",
    name: "Chroma Experiments",
    value: "Chroma Experiments DB",
    description: "Local vector database for experimentation",
    status: "Error",
    provider: "QdrChromaant",
  },
  {
    id: "vdb-5",
    name: "Supabase Vector",
    value: "Supabase Vector Value",
    description: "Vector database for Supabase",
    status: "Connected",
    provider: "Supabase",
  },
];

export const KnowledgeBaseEmbeddingModels: EmbeddingModel[] = [
  {
    id: "em-1",
    name: "OpenAI Ada 002",
    value: "OpenAI Ada 002 Value",
    provider: "OpenAI",
    dimensions: 1536,
    description: "General purpose embedding model with high accuracy",
    status: "Inactive",
  },
  {
    id: "em-2",
    name: "Cohere Embed",
    value: "Cohere Embed Value",
    provider: "Cohere",
    dimensions: 768,
    description: "Balanced embedding model for various use cases",
    status: "Inactive",
  },
  {
    id: "em-3",
    name: "MiniLM Sentence Transformers",
    value: "MiniLM Sentence Transformers Value",
    provider: "HuggingFace",
    dimensions: 384,
    description: "Lightweight model optimized for speed",
    status: "Inactive",
  },
  {
    id: "em-4",
    name: "Claude 3 Haiku Embeddings",
    value: "Claude 3 Haiku Embeddings Value",
    provider: "Anthropic",
    dimensions: 2048,
    description: "High-dimensional embeddings for complex semantic matching",
    status: "Inactive",
  },
  {
    id: "em-5",
    name: "Google Gemini 2.0 flash",
    value: "Google Gemini 2.0 flash Value",
    provider: "Google",
    dimensions: 378,
    description: "Advanced embedding model for advanced use cases",
    status: "Active",
  },
  {
    id: "em-6",
    name: "text-embedding-004",
    value: "models/text-embedding-004",
    provider: "Google",
    dimensions: 378,
    description: "Obtain a distributed representation of a text.",
    status: "Active",
  },
];

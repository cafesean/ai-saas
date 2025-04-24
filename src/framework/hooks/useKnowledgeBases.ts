import { useState } from "react";
import { api } from "@/utils/trpc";

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  vectorDb: string;
  embeddingModel: string;
  sources: string[];
  documentCount: number;
  status: "empty" | "indexing" | "ready" | "error";
  lastUpdated: string;
}

interface CreateKnowledgeBaseInput {
  name: string;
  description: string;
  vectorDb: string;
  embeddingModel: string;
  sources: string[];
  documentCount: number;
  status: "empty" | "indexing" | "ready" | "error";
  lastUpdated: string;
}

export function useKnowledgeBases() {
  const [isCreating, setIsCreating] = useState(false);

  // Mock data - in a real app, you'd fetch this from the API
  const mockKnowledgeBases: KnowledgeBase[] = [
    {
      id: "kb1",
      name: "Product Documentation",
      description: "Knowledge base for all product documentation",
      vectorDb: "PostgreSQL pgvector",
      embeddingModel: "OpenAI Ada-002",
      sources: ["Docs", "FAQs"],
      documentCount: 543,
      status: "ready",
      lastUpdated: "2 days ago",
    },
    {
      id: "kb2",
      name: "Support Articles",
      description: "Knowledge base for customer support articles",
      vectorDb: "Pinecone",
      embeddingModel: "OpenAI Ada-002",
      sources: ["Support Portal"],
      documentCount: 215,
      status: "ready",
      lastUpdated: "1 week ago",
    },
  ];

  const createKnowledgeBase = async (
    input: CreateKnowledgeBaseInput,
  ): Promise<KnowledgeBase> => {
    setIsCreating(true);

    try {
      // Simulate API call - in a real app, you'd use trpc
      // const result = await api.knowledgeBases.create.mutate(input)

      // For now, just return a mock result
      const newKnowledgeBase: KnowledgeBase = {
        id: `kb${Date.now()}`,
        ...input,
      };

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return newKnowledgeBase;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    knowledgeBases: mockKnowledgeBases,
    isCreating,
    createKnowledgeBase,
  };
}

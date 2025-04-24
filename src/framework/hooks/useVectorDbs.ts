import { api } from "@/utils/trpc"

export interface VectorDatabase {
  id: string
  name: string
  connectionString: string
  provider: string
  status: string
  collections: number
  lastIndexed: string
  dimensions: number
}

export function useVectorDbs() {
  // Mock data for vector databases
  const mockVectorDbs: VectorDatabase[] = [
    {
      id: "vdb_1",
      name: "Production Embeddings DB",
      connectionString: "postgresql://user:pass@db.example.com:5432/embeddings",
      provider: "PostgreSQL + pgvector",
      status: "connected",
      collections: 8,
      lastIndexed: "2 hours ago",
      dimensions: 1536
    },
    {
      id: "vdb_2",
      name: "Development Vector Store",
      connectionString: "redis://redis.dev.local:6379",
      provider: "Redis Stack",
      status: "connected",
      collections: 3,
      lastIndexed: "1 day ago",
      dimensions: 768
    },
    {
      id: "vdb_3",
      name: "Customer Support KB",
      connectionString: "https://pinecone-12345.svc.us-west1-gcp.pinecone.io",
      provider: "Pinecone",
      status: "connected",
      collections: 5,
      lastIndexed: "30 minutes ago",
      dimensions: 384
    },
    {
      id: "vdb_4",
      name: "Legacy Document Store",
      connectionString: "weaviate://weaviate.internal:8080",
      provider: "Weaviate",
      status: "disconnected",
      collections: 12,
      lastIndexed: "3 weeks ago",
      dimensions: 1024
    }
  ]

  // Simulate an API request using mock data
  // In a real implementation, this would use TRPC to call the server
  // const { data, isLoading, isError } = api.vectorDbs.list.useQuery()
  
  // For now, just return the mock data
  return {
    vectorDbs: mockVectorDbs,
    isLoading: false,
    isError: false
  }
}

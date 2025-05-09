import * as z from "zod"

export const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  vectorDB: z.string().min(1, "Vector database is required"),
  embeddingModel: z.string().min(1, "Embedding model is required"),
})

export type CreateKnowledgeBaseFormValues = z.infer<typeof createKnowledgeBaseSchema> 
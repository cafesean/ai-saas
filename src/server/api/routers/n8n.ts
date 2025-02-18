import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { db } from '@/db';
import { templates, nodeTypes } from '@/db/schema/n8n';
import { parseWorkflow } from '@/lib/parser/workflow-parser';
import { eq, desc } from 'drizzle-orm';

export const n8nRouter = createTRPCRouter({
  // Template procedures
  createTemplate: publicProcedure
    .input(z.unknown())
    .mutation(async ({ input }) => {
      const parsedTemplate = await parseWorkflow(input);
      return db.insert(templates)
        .values(parsedTemplate)
        .returning();
    }),

  listTemplates: publicProcedure
    .query(async () => {
      return db.select()
        .from(templates)
        .orderBy(desc(templates.created_at));
    }),

  getTemplate: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input: id }) => {
      const [template] = await db.select()
        .from(templates)
        .where(eq(templates.id, id))
        .limit(1);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      return template;
    }),

  // Node type procedures
  listNodeTypes: publicProcedure
    .query(async () => {
      return db.select()
        .from(nodeTypes)
        .orderBy(desc(nodeTypes.created_at));
    }),

  createNodeType: publicProcedure
    .input(z.object({
      type: z.string(),
      category: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.insert(nodeTypes)
        .values(input)
        .returning();
    }),

  updateNodeType: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      type: z.string(),
      category: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input: { id, ...data } }) => {
      const [nodeType] = await db.update(nodeTypes)
        .set(data)
        .where(eq(nodeTypes.id, id))
        .returning();

      if (!nodeType) {
        throw new Error('Node type not found');
      }

      return nodeType;
    }),

  deleteNodeType: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input: id }) => {
      await db.delete(nodeTypes)
        .where(eq(nodeTypes.id, id));
      return { success: true };
    }),
}); 
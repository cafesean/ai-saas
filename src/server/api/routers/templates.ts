import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { db } from '@/db';
import { templates, insertTemplateSchema } from '@/db/schema';
import { parseWorkflow } from '@/lib/parser/workflow-parser';
import { desc } from 'drizzle-orm';

export const templatesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.unknown())
    .mutation(async ({ input }) => {
      const parsedTemplate = await parseWorkflow(input);
      return db.insert(templates)
        .values(parsedTemplate)
        .returning();
    }),

  list: protectedProcedure
    .query(async () => {
      return db.select()
        .from(templates)
        .orderBy(desc(templates.created_at));
    }),

  get: protectedProcedure
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
}); 
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from '@/db/config';
import { roles } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { DbRole } from '@/db/types';
import { v4 as uuidv4 } from 'uuid';

const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  role_code: z.string().min(1),
});

export const roleRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return await db.select()
        .from(roles)
        .orderBy(asc(roles.name));
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const [role] = await db.select()
        .from(roles)
        .where(eq(roles.id, input))
        .limit(1);

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Role with ID ${input} not found`
        });
      }

      return role;
    }),

  create: publicProcedure
    .input(roleSchema)
    .mutation(async ({ ctx, input }) => {
      const [role] = await db.insert(roles)
        .values({
          ...input,
          uuid: uuidv4(),
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return role;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: roleSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [role] = await db.update(roles)
        .set({
          ...input.data,
          updated_at: new Date(),
        })
        .where(eq(roles.id, input.id))
        .returning();

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Role with ID ${input.id} not found`
        });
      }

      return role;
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const [role] = await db.delete(roles)
        .where(eq(roles.id, input))
        .returning();

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Role with ID ${input} not found`
        });
      }

      return role;
    }),

  getByCode: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [role] = await db.select()
        .from(roles)
        .where(eq(roles.role_code, input))
        .limit(1);

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Role with code ${input} not found`
        });
      }

      return role;
    }),
}); 
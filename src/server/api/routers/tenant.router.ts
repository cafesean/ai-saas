import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from '@/db/config';
import { tenants } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const tenantRouter = createTRPCRouter({
  // Get all active tenants
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select()
        .from(tenants)
        .where(eq(tenants.isActive, true))
        .orderBy(asc(tenants.name));
    }),

  // Get tenant by ID
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const [tenant] = await db.select()
        .from(tenants)
        .where(eq(tenants.id, input))
        .limit(1);

      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Tenant with ID ${input} not found`
        });
      }

      return tenant;
    }),

  // Create default tenant if none exists (for development)
  ensureDefaultTenant: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Check if any tenants exist
      const existingTenants = await db.select()
        .from(tenants)
        .limit(1);

      if (existingTenants.length === 0) {
        // Create default tenant
        const [defaultTenant] = await db.insert(tenants)
          .values({
            name: 'Default Organization',
            description: 'Default tenant for initial setup',
            slug: 'default-org',
            isActive: true,
          })
          .returning();

        return defaultTenant;
      }

      return existingTenants[0];
    }),
}); 
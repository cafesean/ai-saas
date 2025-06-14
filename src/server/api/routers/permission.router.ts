import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, withPermission } from "../trpc";
import { db } from '@/db/config';
import { permissions, rolePermissions, roles } from '@/db/schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const permissionRouter = createTRPCRouter({
  // Get all permissions
  getAll: protectedProcedure.use(withPermission('admin:role_management'))
    .query(async ({ ctx }) => {
      return await db.select()
        .from(permissions)
        .where(eq(permissions.isActive, true))
        .orderBy(asc(permissions.category), asc(permissions.name));
    }),

  // Get permissions by category
  getByCategory: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await db.select()
        .from(permissions)
        .where(eq(permissions.category, input))
        .orderBy(asc(permissions.name));
    }),

  // Get all permission categories
  getCategories: protectedProcedure.use(withPermission('admin:role_management'))
    .query(async ({ ctx }) => {
      const result = await db.selectDistinct({
        category: permissions.category
      })
        .from(permissions)
        .where(eq(permissions.isActive, true))
        .orderBy(asc(permissions.category));
      
      return result.map(r => r.category).filter(Boolean);
    }),

  // Get permissions for a specific role
  getByRoleId: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const result = await db.select({
        id: permissions.id,
        slug: permissions.slug,
        name: permissions.name,
        description: permissions.description,
        category: permissions.category,
      })
        .from(permissions)
        .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
        .where(eq(rolePermissions.roleId, input))
        .orderBy(asc(permissions.category), asc(permissions.name));

      return result;
    }),

  // Get permission by slug
  getBySlug: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [permission] = await db.select()
        .from(permissions)
        .where(eq(permissions.slug, input))
        .limit(1);

      if (!permission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Permission with slug ${input} not found`
        });
      }

      return permission;
    }),

  // Create new permission (for system admin use)
  create: protectedProcedure.use(withPermission('admin:full_access'))
    .input(z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable(),
      category: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const [permission] = await db.insert(permissions)
        .values({
          ...input,
          isActive: true,
        })
        .returning();

      return permission;
    }),

  // Update permission
  update: protectedProcedure.use(withPermission('admin:full_access'))
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        category: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const [permission] = await db.update(permissions)
        .set(input.data)
        .where(eq(permissions.id, input.id))
        .returning();

      if (!permission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Permission with ID ${input.id} not found`
        });
      }

      return permission;
    }),

  // Delete permission (soft delete by setting isActive to false)
  delete: protectedProcedure.use(withPermission('admin:full_access'))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const [permission] = await db.update(permissions)
        .set({ isActive: false })
        .where(eq(permissions.id, input))
        .returning();

      if (!permission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Permission with ID ${input} not found`
        });
      }

      return permission;
    }),
}); 
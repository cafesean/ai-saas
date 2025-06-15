import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, withPermission } from "../trpc";
import { db } from '@/db/config';
import { permissions, rolePermissions, roles } from '@/db/schema';
import { eq, asc, inArray, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const permissionRouter = createTRPCRouter({
  // Get all permissions
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select()
        .from(permissions)
        .where(eq(permissions.isActive, true))
        .orderBy(asc(permissions.category), asc(permissions.name));
    }),

  // Get all permissions with role usage statistics
  getAllWithUsage: protectedProcedure
    .query(async ({ ctx }) => {
      // Get all permissions
      const allPermissions = await db.select()
        .from(permissions)
        .where(eq(permissions.isActive, true))
        .orderBy(asc(permissions.category), asc(permissions.name));

      // Get role usage for each permission
      const permissionsWithUsage = await Promise.all(
        allPermissions.map(async (permission) => {
          // Get roles that have this permission
          const rolesWithPermission = await db.select({
            roleId: roles.id,
            roleName: roles.name,
            isSystemRole: roles.isSystemRole,
          })
            .from(roles)
            .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
            .where(eq(rolePermissions.permissionId, permission.id))
            .orderBy(asc(roles.name));

          return {
            ...permission,
            roleCount: rolesWithPermission.length,
            roles: rolesWithPermission,
          };
        })
      );

      return permissionsWithUsage;
    }),

  // Get permissions by category
  getByCategory: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await db.select()
        .from(permissions)
        .where(eq(permissions.category, input))
        .orderBy(asc(permissions.name));
    }),

  // Get all permission categories with counts
  getCategoriesWithCounts: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await db.select({
        category: permissions.category,
        count: count(),
      })
        .from(permissions)
        .where(eq(permissions.isActive, true))
        .groupBy(permissions.category)
        .orderBy(asc(permissions.category));
      
      return result.filter(r => r.category);
    }),

  // Get all permission categories
  getCategories: protectedProcedure
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
  getByRoleId: protectedProcedure
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
  getBySlug: protectedProcedure
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

  // Get permission statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Total permissions
      const totalPermissions = await db.select({ count: count() })
        .from(permissions)
        .where(eq(permissions.isActive, true));

      // Permissions by category
      const permissionsByCategory = await db.select({
        category: permissions.category,
        count: count(),
      })
        .from(permissions)
        .where(eq(permissions.isActive, true))
        .groupBy(permissions.category)
        .orderBy(asc(permissions.category));

      // Most used permissions (by role count)
      const mostUsedPermissions = await db.select({
        permissionId: permissions.id,
        slug: permissions.slug,
        name: permissions.name,
        roleCount: count(),
      })
        .from(permissions)
        .leftJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
        .where(eq(permissions.isActive, true))
        .groupBy(permissions.id, permissions.slug, permissions.name)
        .orderBy(count())
        .limit(10);

      return {
        totalPermissions: totalPermissions[0]?.count || 0,
        categoryCounts: permissionsByCategory.filter(c => c.category),
        mostUsedPermissions,
      };
    }),

  // Create new permission (for system admin use)
  create: protectedProcedure
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
  update: protectedProcedure
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
  delete: protectedProcedure
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
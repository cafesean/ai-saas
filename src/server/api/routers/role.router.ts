import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, withPermission } from "../trpc";
import { db } from '@/db/config';
import { roles, permissions, rolePermissions } from '@/db/schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { DbRole } from '@/db/types';
import { v4 as uuidv4 } from 'uuid';

const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
});

export const roleRouter = createTRPCRouter({
  getAll: protectedProcedure.use(withPermission('admin:role_management'))
    .query(async ({ ctx }) => {
      return await db.select()
        .from(roles)
        .where(eq(roles.isActive, true))
        .orderBy(asc(roles.name));
    }),

  getById: protectedProcedure.use(withPermission('admin:role_management'))
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

  // Get role with its permissions
  getWithPermissions: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      // Get role
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

      // Get role permissions
      const rolePermissionsData = await db.select({
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

      return {
        ...role,
        permissions: rolePermissionsData,
      };
    }),

  create: protectedProcedure.use(withPermission('admin:role_management'))
    .input(roleSchema)
    .mutation(async ({ ctx, input }) => {
      const [role] = await db.insert(roles)
        .values({
          ...input,
          isSystemRole: false,
          isActive: true,
        })
        .returning();

      return role;
    }),

  update: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.object({
      id: z.number(),
      data: roleSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [role] = await db.update(roles)
        .set({
          ...input.data,
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

  delete: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Check if role is a system role
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

      if (role.isSystemRole) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete system roles'
        });
      }

      // Soft delete by setting isActive to false
      const [deletedRole] = await db.update(roles)
        .set({ isActive: false })
        .where(eq(roles.id, input))
        .returning();

      return deletedRole;
    }),

  // Assign permissions to role
  assignPermissions: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.object({
      roleId: z.number(),
      permissionIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roleId, permissionIds } = input;

      // Verify role exists
      const [role] = await db.select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Role with ID ${roleId} not found`
        });
      }

      // Remove existing permissions for this role
      await db.delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      // Add new permissions
      if (permissionIds.length > 0) {
        const permissionData = permissionIds.map(permissionId => ({
          roleId,
          permissionId,
        }));

        await db.insert(rolePermissions)
          .values(permissionData);
      }

      // Return updated role with permissions
      const updatedPermissions = await db.select({
        id: permissions.id,
        slug: permissions.slug,
        name: permissions.name,
        description: permissions.description,
        category: permissions.category,
      })
        .from(permissions)
        .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
        .where(eq(rolePermissions.roleId, roleId))
        .orderBy(asc(permissions.category), asc(permissions.name));

      return {
        ...role,
        permissions: updatedPermissions,
      };
    }),

  // Remove specific permissions from role
  removePermissions: protectedProcedure.use(withPermission('admin:role_management'))
    .input(z.object({
      roleId: z.number(),
      permissionIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { roleId, permissionIds } = input;

      if (permissionIds.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No permission IDs provided'
        });
      }

      // Remove specified permissions
      await db.delete(rolePermissions)
        .where(
          eq(rolePermissions.roleId, roleId)
        );

      return { success: true };
    }),

  // Get all roles with permission counts
  getAllWithStats: protectedProcedure.use(withPermission('admin:role_management'))
    .query(async ({ ctx }) => {
      const rolesData = await db.select()
        .from(roles)
        .where(eq(roles.isActive, true))
        .orderBy(asc(roles.name));

      // Get permission counts for each role
      const roleStats = await Promise.all(
        rolesData.map(async (role) => {
          const permissionCount = await db.select()
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, role.id));

          return {
            ...role,
            permissionCount: permissionCount.length,
          };
        })
      );

      return roleStats;
    }),
}); 
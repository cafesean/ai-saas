import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, withPermission } from "../trpc";
import { db } from '@/db/config';
import { tenants, users, userTenants, userRoles, roles } from '@/db/schema';
import { eq, asc, desc, and, or, like, count, sql, not } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Type for tenant with stats
type TenantWithStats = typeof tenants.$inferSelect & {
  userCount: number;
  activeUserCount: number;
  _count: {
    users: number;
  };
};

// Type for tenant user
type TenantUser = {
  userId: number;
  userUuid: string;
  userName: string | null;
  userEmail: string;
  userIsActive: boolean;
  tenantRole: string;
  relationshipIsActive: boolean;
  joinedAt: Date;
};

// Validation schemas
const tenantSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  businessAddress: z.string().optional(),
  isActive: z.boolean().default(true),
});

const tenantUpdateSchema = tenantSchema.partial().extend({
  id: z.number(),
});

const tenantFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

const tenantUserManagementSchema = z.object({
  tenantId: z.number(),
  userId: z.number(),
  role: z.string().min(1, "Role is required"),
});

export const tenantRouter = createTRPCRouter({
  // Get all tenants with stats (user counts, etc.)
  getAllWithStats: protectedProcedure
    .input(tenantFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { search, isActive, limit, offset } = input;

      // Build where conditions
      const whereConditions = [];
      
      if (search) {
        whereConditions.push(
          or(
            like(tenants.name, `%${search}%`),
            like(tenants.description, `%${search}%`),
            like(tenants.slug, `%${search}%`)
          )
        );
      }
      
      if (typeof isActive === 'boolean') {
        whereConditions.push(eq(tenants.isActive, isActive));
      }

      const whereClause = whereConditions.length > 0 
        ? and(...whereConditions) 
        : undefined;

      // Get tenants with basic info
      const tenantsData = await db.select()
        .from(tenants)
        .where(whereClause)
        .orderBy(desc(tenants.createdAt))
        .limit(limit)
        .offset(offset);

      // Get user counts for each tenant
      const tenantsWithStats: TenantWithStats[] = await Promise.all(
        tenantsData.map(async (tenant: typeof tenants.$inferSelect) => {
          const [userCountResult, activeUserCountResult] = await Promise.all([
            db.select({ count: count() })
              .from(userTenants)
              .where(eq(userTenants.tenantId, tenant.id)),
            db.select({ count: count() })
              .from(userTenants)
              .where(and(
                eq(userTenants.tenantId, tenant.id),
                eq(userTenants.isActive, true)
              ))
          ]);

          return {
            ...tenant,
            userCount: userCountResult[0]?.count || 0,
            activeUserCount: activeUserCountResult[0]?.count || 0,
            _count: {
              users: userCountResult[0]?.count || 0,
            },
          };
        })
      );

      // Get total count for pagination
      const totalCountResult = await db.select({ count: count() })
        .from(tenants)
        .where(whereClause);

      return {
        tenants: tenantsWithStats,
        totalCount: totalCountResult[0]?.count || 0,
        hasMore: offset + limit < (totalCountResult[0]?.count || 0),
      };
    }),

  // Get all active tenants (legacy method for compatibility)
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select()
        .from(tenants)
        .where(eq(tenants.isActive, true))
        .orderBy(asc(tenants.name));
    }),

  // Get tenant by ID with detailed information
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

      // Get tenant users with their roles
      const tenantUsers: TenantUser[] = await db.select({
        userId: users.id,
        userUuid: users.uuid,
        userName: users.name,
        userEmail: users.email,
        userIsActive: users.isActive,
        tenantRole: userTenants.role,
        relationshipIsActive: userTenants.isActive,
        joinedAt: userTenants.createdAt,
      })
      .from(userTenants)
      .innerJoin(users, eq(userTenants.userId, users.id))
      .where(eq(userTenants.tenantId, input))
      .orderBy(desc(userTenants.createdAt));

      return {
        ...tenant,
        users: tenantUsers,
        userCount: tenantUsers.length,
        activeUserCount: tenantUsers.filter((u: TenantUser) => u.relationshipIsActive && u.userIsActive).length,
      };
    }),

  // Create new tenant
  create: protectedProcedure
    .input(tenantSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if name already exists
      const existingTenant = await db.select()
        .from(tenants)
        .where(eq(tenants.name, input.name))
        .limit(1);

      if (existingTenant[0]) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A tenant with this name already exists'
        });
      }

      // Check if slug already exists (if provided)
      if (input.slug) {
        const existingSlug = await db.select()
          .from(tenants)
          .where(eq(tenants.slug, input.slug))
          .limit(1);

        if (existingSlug[0]) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A tenant with this slug already exists'
          });
        }
      }

      try {
        const [newTenant] = await db.insert(tenants).values({
          ...input,
          // Auto-generate slug from name if not provided
          slug: input.slug || input.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
        }).returning();

        return newTenant;
      } catch (error) {
        console.error("Error creating tenant:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tenant',
          cause: error,
        });
      }
    }),

  // Update tenant
  update: protectedProcedure
    .input(tenantUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if tenant exists
      const existingTenant = await db.select()
        .from(tenants)
        .where(eq(tenants.id, id))
        .limit(1);

      if (!existingTenant[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Check name uniqueness if name is being updated
      if (updateData.name && updateData.name !== existingTenant[0].name) {
        const nameExists = await db.select()
          .from(tenants)
          .where(and(
            eq(tenants.name, updateData.name),
            not(eq(tenants.id, id))
          ))
          .limit(1);

        if (nameExists[0]) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A tenant with this name already exists'
          });
        }
      }

      // Check slug uniqueness if slug is being updated
      if (updateData.slug && updateData.slug !== existingTenant[0].slug) {
        const slugExists = await db.select()
          .from(tenants)
          .where(and(
            eq(tenants.slug, updateData.slug),
            not(eq(tenants.id, id))
          ))
          .limit(1);

        if (slugExists[0]) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A tenant with this slug already exists'
          });
        }
      }

      try {
        const [updatedTenant] = await db.update(tenants)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, id))
          .returning();

        return updatedTenant;
      } catch (error) {
        console.error("Error updating tenant:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tenant',
          cause: error,
        });
      }
    }),

  // Delete tenant (soft delete by setting isActive = false)
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Check if tenant exists
      const existingTenant = await db.select()
        .from(tenants)
        .where(eq(tenants.id, input))
        .limit(1);

      if (!existingTenant[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Prevent deletion of system default tenant
      if (existingTenant[0].slug === 'default-org' || existingTenant[0].name === 'Default Organization') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete the system default tenant'
        });
      }

      try {
        // Soft delete by setting isActive = false
        const [deletedTenant] = await db.update(tenants)
          .set({ 
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, input))
          .returning();

        return deletedTenant;
      } catch (error) {
        console.error("Error deleting tenant:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete tenant',
          cause: error,
        });
      }
    }),

  // Add user to tenant
  addUser: protectedProcedure
    .input(tenantUserManagementSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId, userId, role } = input;

      // Check if tenant exists
      const tenant = await db.select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Check if user exists
      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      // Check if relationship already exists
      const existingRelationship = await db.select()
        .from(userTenants)
        .where(and(
          eq(userTenants.userId, userId),
          eq(userTenants.tenantId, tenantId)
        ))
        .limit(1);

      if (existingRelationship[0]) {
        // If exists but inactive, reactivate it
        if (!existingRelationship[0].isActive) {
          await db.update(userTenants)
            .set({ 
              isActive: true,
              role: role,
              updatedAt: new Date(),
            })
            .where(and(
              eq(userTenants.userId, userId),
              eq(userTenants.tenantId, tenantId)
            ));
          
          return { success: true, action: 'reactivated' };
        } else {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User is already a member of this tenant'
          });
        }
      }

      try {
        await db.insert(userTenants).values({
          userId,
          tenantId,
          role,
          isActive: true,
        });

        return { success: true, action: 'added' };
      } catch (error) {
        console.error("Error adding user to tenant:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add user to tenant',
          cause: error,
        });
      }
    }),

  // Remove user from tenant
  removeUser: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId, userId } = input;

      try {
        const deletedRelationship = await db.delete(userTenants)
          .where(and(
            eq(userTenants.userId, userId),
            eq(userTenants.tenantId, tenantId)
          ))
          .returning();

        if (deletedRelationship.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User-tenant relationship not found'
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Error removing user from tenant:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove user from tenant',
          cause: error,
        });
      }
    }),

  // Update user role in tenant
  updateUserRole: protectedProcedure
    .input(tenantUserManagementSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId, userId, role } = input;

      // Check if relationship exists
      const existingRelationship = await db.select()
        .from(userTenants)
        .where(and(
          eq(userTenants.userId, userId),
          eq(userTenants.tenantId, tenantId)
        ))
        .limit(1);

      if (!existingRelationship[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User-tenant relationship not found'
        });
      }

      try {
        const [updatedRelationship] = await db.update(userTenants)
          .set({ 
            role,
            updatedAt: new Date(),
          })
          .where(and(
            eq(userTenants.userId, userId),
            eq(userTenants.tenantId, tenantId)
          ))
          .returning();

        return updatedRelationship;
      } catch (error) {
        console.error("Error updating user role:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role',
          cause: error,
        });
      }
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
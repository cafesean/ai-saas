import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, withPermission } from "../trpc";
import { db } from '@/db';
import { orgs, users, userOrgs, userRoles, roles } from '@/db/schema';
import { eq, asc, desc, and, or, like, count, sql, not } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Type for org with stats
type OrgWithStats = typeof orgs.$inferSelect & {
  userCount: number;
  activeUserCount: number;
  _count: {
    users: number;
  };
};

// Type for org user
type OrgUser = {
  userId: number;
  userUuid: string;
  userName: string | null;
  userEmail: string;
  userIsActive: boolean;
  orgRole: string;
  relationshipIsActive: boolean;
  joinedAt: Date;
};

// Validation schemas
const orgSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  businessAddress: z.string().optional(),
  isActive: z.boolean().default(true),
});

const orgUpdateSchema = orgSchema.partial().extend({
  id: z.number(),
});

const orgFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

const orgUserManagementSchema = z.object({
  orgId: z.number(),
  userId: z.number(),
  role: z.string().min(1, "Role is required"),
});

export const orgRouter = createTRPCRouter({
  // Get all orgs with stats (user counts, etc.)
  getAllWithStats: protectedProcedure
    .input(orgFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { search, isActive, limit, offset } = input;

      // Build where conditions
      const whereConditions = [];
      
      if (search) {
        whereConditions.push(
          or(
            like(orgs.name, `%${search}%`),
            like(orgs.description, `%${search}%`),
            like(orgs.slug, `%${search}%`)
          )
        );
      }
      
      if (typeof isActive === 'boolean') {
        whereConditions.push(eq(orgs.isActive, isActive));
      }

      const whereClause = whereConditions.length > 0 
        ? and(...whereConditions) 
        : undefined;

      // Get orgs with basic info
      const orgsData = await db.select()
        .from(orgs)
        .where(whereClause)
        .orderBy(desc(orgs.createdAt))
        .limit(limit)
        .offset(offset);

      // Get user counts for each org
      const orgsWithStats: OrgWithStats[] = await Promise.all(
        orgsData.map(async (org: typeof orgs.$inferSelect) => {
          const [userCountResult, activeUserCountResult] = await Promise.all([
            db.select({ count: count() })
              .from(userOrgs)
              .where(eq(userOrgs.orgId, orgs.id)),
            db.select({ count: count() })
              .from(userOrgs)
              .where(and(
                eq(userOrgs.orgId, orgs.id),
                eq(userOrgs.isActive, true)
              ))
          ]);

          return {
            ...org,
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
        .from(orgs)
        .where(whereClause);

      return {
        orgs: orgsWithStats,
        totalCount: totalCountResult[0]?.count || 0,
        hasMore: offset + limit < (totalCountResult[0]?.count || 0),
      };
    }),

  // Get all active orgs (legacy method for compatibility)
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select()
        .from(orgs)
        .where(eq(orgs.isActive, true))
        .orderBy(asc(orgs.name));
    }),

  // Get org by ID with detailed information
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const [org] = await db.select()
        .from(orgs)
        .where(eq(orgs.id, input))
        .limit(1);

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Org with ID ${input} not found`
        });
      }

      // Get org users with their roles
      const orgUsers: OrgUser[] = await db.select({
        userId: users.id,
        userUuid: users.uuid,
        userName: users.name,
        userEmail: users.email,
        userIsActive: users.isActive,
        orgRole: userOrgs.role,
        relationshipIsActive: userOrgs.isActive,
        joinedAt: userOrgs.createdAt,
      })
      .from(userOrgs)
      .innerJoin(users, eq(userOrgs.userId, users.id))
      .where(eq(userOrgs.orgId, input))
      .orderBy(desc(userOrgs.createdAt));

      return {
        ...org,
        users: orgUsers,
        userCount: orgUsers.length,
        activeUserCount: orgUsers.filter((u: OrgUser) => u.relationshipIsActive && u.userIsActive).length,
      };
    }),

  // Create new org
  create: protectedProcedure
    .input(orgSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if name already exists
      const existingOrg = await db.select()
        .from(orgs)
        .where(eq(orgs.name, input.name))
        .limit(1);

      if (existingOrg[0]) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An org with this name already exists'
        });
      }

      // Check if slug already exists (if provided)
      if (input.slug) {
        const existingSlug = await db.select()
          .from(orgs)
          .where(eq(orgs.slug, input.slug))
          .limit(1);

        if (existingSlug[0]) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An org with this slug already exists'
          });
        }
      }

      try {
        const [newOrg] = await db.insert(orgs).values({
          ...input,
          // Auto-generate slug from name if not provided
          slug: input.slug || input.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
        }).returning();

        return newOrg;
      } catch (error) {
        console.error("Error creating org:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create org',
          cause: error,
        });
      }
    }),

  // Update org
  update: protectedProcedure
    .input(orgUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if org exists
      const existingOrg = await db.select()
        .from(orgs)
        .where(eq(orgs.id, id))
        .limit(1);

      if (!existingOrg[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Org not found'
        });
      }

      // Check name uniqueness if name is being updated
      if (updateData.name && updateData.name !== existingOrg[0].name) {
        const nameExists = await db.select()
          .from(orgs)
          .where(and(
            eq(orgs.name, updateData.name),
            not(eq(orgs.id, id))
          ))
          .limit(1);

        if (nameExists[0]) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An org with this name already exists'
          });
        }
      }

      // Check slug uniqueness if slug is being updated
      if (updateData.slug && updateData.slug !== existingOrg[0].slug) {
        const slugExists = await db.select()
          .from(orgs)
          .where(and(
            eq(orgs.slug, updateData.slug),
            not(eq(orgs.id, id))
          ))
          .limit(1);

        if (slugExists[0]) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An org with this slug already exists'
          });
        }
      }

      try {
        const [updatedOrg] = await db.update(orgs)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(orgs.id, id))
          .returning();

        return updatedOrg;
      } catch (error) {
        console.error("Error updating org:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update org',
          cause: error,
        });
      }
    }),

  // Delete org (soft delete by setting isActive = false)
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Check if org exists
      const existingOrg = await db.select()
        .from(orgs)
        .where(eq(orgs.id, input))
        .limit(1);

      if (!existingOrg[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Org not found'
        });
      }

      // Prevent deletion of system default org
      if (existingOrg[0].slug === 'default-org' || existingOrg[0].name === 'Default Organization') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete the system default org'
        });
      }

      try {
        // Soft delete by setting isActive = false
        const [deletedOrg] = await db.update(orgs)
          .set({ 
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(orgs.id, input))
          .returning();

        return deletedOrg;
      } catch (error) {
        console.error("Error deleting org:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete org',
          cause: error,
        });
      }
    }),

  // Add user to org
  addUser: protectedProcedure
    .input(orgUserManagementSchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId, role } = input;

      // Check if org exists
      const org = await db.select()
        .from(orgs)
        .where(eq(orgs.id, orgId))
        .limit(1);

      if (!org[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Org not found'
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
        .from(userOrgs)
        .where(and(
          eq(userOrgs.userId, userId),
          eq(userOrgs.orgId, orgId)
        ))
        .limit(1);

      if (existingRelationship[0]) {
        // If exists but inactive, reactivate it
        if (!existingRelationship[0].isActive) {
          await db.update(userOrgs)
            .set({ 
              isActive: true,
              role: role,
              updatedAt: new Date(),
            })
            .where(and(
              eq(userOrgs.userId, userId),
              eq(userOrgs.orgId, orgId)
            ));
          
          return { success: true, action: 'reactivated' };
        } else {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User is already a member of this org'
          });
        }
      }

      try {
        await db.insert(userOrgs).values({
          userId,
          orgId,
          role,
          isActive: true,
        });

        return { success: true, action: 'added' };
      } catch (error) {
        console.error("Error adding user to org:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add user to org',
          cause: error,
        });
      }
    }),

  // Remove user from org
  removeUser: protectedProcedure
    .input(z.object({
      orgId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = input;

      try {
        const deletedRelationship = await db.delete(userOrgs)
          .where(and(
            eq(userOrgs.userId, userId),
            eq(userOrgs.orgId, orgId)
          ))
          .returning();

        if (deletedRelationship.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User-org relationship not found'
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Error removing user from org:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove user from org',
          cause: error,
        });
      }
    }),

  // Update user role in org
  updateUserRole: protectedProcedure
    .input(orgUserManagementSchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId, role } = input;

      // Check if relationship exists
      const existingRelationship = await db.select()
        .from(userOrgs)
        .where(and(
          eq(userOrgs.userId, userId),
          eq(userOrgs.orgId, orgId)
        ))
        .limit(1);

      if (!existingRelationship[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User-org relationship not found'
        });
      }

      try {
        const [updatedRelationship] = await db.update(userOrgs)
          .set({ 
            role,
            updatedAt: new Date(),
          })
          .where(and(
            eq(userOrgs.userId, userId),
            eq(userOrgs.orgId, orgId)
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

  // Create default org if none exists (for development)
  ensureDefaultOrg: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Check if any orgs exist
      const existingOrgs = await db.select()
        .from(orgs)
        .limit(1);

      if (existingOrgs.length === 0) {
        // Create default org
        const [defaultOrg] = await db.insert(orgs)
          .values({
            name: 'Default Organization',
            description: 'Default org for initial setup',
            slug: 'default-org',
            isActive: true,
          })
          .returning();

        return defaultOrg;
      }

      return existingOrgs[0];
    }),
}); 
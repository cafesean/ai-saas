import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, withPermission } from "../trpc";
import { db } from '@/db';
import { orgs, users, userRoles, roles } from '@/db/schema';
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

      // Get user counts for each org using JSONB orgData structure
      const orgsWithStats: OrgWithStats[] = await Promise.all(
        orgsData.map(async (org: typeof orgs.$inferSelect) => {
          // Query users by JSONB orgData for this org
          const [userCountResult, activeUserCountResult] = await Promise.all([
            db.select({ count: count() })
              .from(users)
              .where(sql`${users.orgData}::jsonb @> ${'{"orgs": [{"orgId": ' + org.id + '}]}'}`),
            db.select({ count: count() })
              .from(users)
              .where(and(
                sql`${users.orgData}::jsonb @> ${'{"orgs": [{"orgId": ' + org.id + ', "isActive": true}]}'}`,
                eq(users.isActive, true)
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

      // Get org users with their roles from JSONB orgData
      const allUsers = await db.select({
        userId: users.id,
        userUuid: users.uuid,
        userName: users.name,
        userEmail: users.email,
        userIsActive: users.isActive,
        orgData: users.orgData,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(sql`${users.orgData}::jsonb @> ${'{"orgs": [{"orgId": ' + input + '}]}'}`);

      // Extract org-specific data from JSONB
      const orgUsers: OrgUser[] = allUsers.map(user => {
        const orgData = user.orgData as any;
        const userOrg = orgData?.orgs?.find((org: any) => org.orgId === input);
        
        return {
          userId: user.userId,
          userUuid: user.userUuid,
          userName: user.userName,
          userEmail: user.userEmail,
          userIsActive: user.userIsActive,
          orgRole: userOrg?.role || 'member',
          relationshipIsActive: userOrg?.isActive || false,
          joinedAt: userOrg?.joinedAt ? new Date(userOrg.joinedAt) : user.createdAt,
        };
      }).sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());

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

  // Add user to org (JSONB-based implementation)
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

      // Get user's current orgData
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

      const currentOrgData = user[0].orgData as any || { currentOrgId: null, orgs: [] };
      
      // Check if user is already in this org
      const existingOrgIndex = currentOrgData.orgs?.findIndex((org: any) => org.orgId === orgId);
      
      if (existingOrgIndex !== -1) {
        // Update existing relationship
        currentOrgData.orgs[existingOrgIndex] = {
          ...currentOrgData.orgs[existingOrgIndex],
          role,
          isActive: true,
          joinedAt: currentOrgData.orgs[existingOrgIndex].joinedAt || new Date().toISOString()
        };
      } else {
        // Add new org relationship
        currentOrgData.orgs.push({
          orgId,
          role,
          isActive: true,
          joinedAt: new Date().toISOString()
        });
      }

      // Set as current org if user has no current org
      if (!currentOrgData.currentOrgId) {
        currentOrgData.currentOrgId = orgId;
      }

      try {
        await db.update(users)
          .set({
            orgData: currentOrgData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        return { success: true, action: existingOrgIndex !== -1 ? 'updated' : 'added' };
      } catch (error) {
        console.error("Error adding user to org:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add user to org',
          cause: error,
        });
      }
    }),

  // Remove user from org (JSONB-based implementation)
  removeUser: protectedProcedure
    .input(z.object({
      orgId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = input;

      // Get user's current orgData
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

      const currentOrgData = user[0].orgData as any || { currentOrgId: null, orgs: [] };
      
      // Remove org from user's orgs array
      const filteredOrgs = currentOrgData.orgs?.filter((org: any) => org.orgId !== orgId) || [];
      
      if (filteredOrgs.length === currentOrgData.orgs?.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User-org relationship not found'
        });
      }

      // Update current org if removing the current org
      if (currentOrgData.currentOrgId === orgId) {
        currentOrgData.currentOrgId = filteredOrgs.length > 0 ? filteredOrgs[0].orgId : null;
      }

      currentOrgData.orgs = filteredOrgs;

      try {
        await db.update(users)
          .set({
            orgData: currentOrgData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

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

  // Update user role in org (JSONB-based implementation)
  updateUserRole: protectedProcedure
    .input(orgUserManagementSchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId, role } = input;

      // Get user's current orgData
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

      const currentOrgData = user[0].orgData as any || { currentOrgId: null, orgs: [] };
      
      // Find and update the org
      const orgIndex = currentOrgData.orgs?.findIndex((org: any) => org.orgId === orgId);
      
      if (orgIndex === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User-org relationship not found'
        });
      }

      currentOrgData.orgs[orgIndex].role = role;

      try {
        await db.update(users)
          .set({
            orgData: currentOrgData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        return { success: true, role };
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
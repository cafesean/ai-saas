import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, withPermission } from "../trpc";
import { db } from '@/db';
import { users, userRoles, roles, orgs } from '@/db/schema';
import { eq, asc, desc, and, or, like, count, sql, not } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const userSchema = z.object({
  name: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  username: z.string().optional(),
  isActive: z.boolean().default(true),
  password: z.string().optional(),
});

const userUpdateSchema = userSchema.partial().extend({
  id: z.number(),
});

const userFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  roleId: z.number().optional(),
  orgId: z.number().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

export const userRouter = createTRPCRouter({
  // Get all users with stats and role information
  getAll: withPermission('users:read')
    .input(userFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { search, isActive, roleId, orgId, limit, offset } = input;

      // Build where conditions
      const whereConditions = [];
      
      if (search) {
        whereConditions.push(
          or(
            like(users.name, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`)
          )
        );
      }
      
      if (typeof isActive === 'boolean') {
        whereConditions.push(eq(users.isActive, isActive));
      }

      const whereClause = whereConditions.length > 0 
        ? and(...whereConditions) 
        : undefined;

      // Get users with basic info including org data
      const usersData = await db.select({
        id: users.id,
        uuid: users.uuid,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        username: users.username,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        orgData: users.orgData,
      })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      // Get role and org counts for each user
      const usersWithStats = await Promise.all(
        usersData.map(async (user) => {
          const roleCountResult = await db.select({ count: count() })
            .from(userRoles)
            .where(and(
              eq(userRoles.userId, user.id),
              eq(userRoles.isActive, true)
            ));

          // Get org count from JSONB data
          const orgCount = user.orgData ? 
            (user.orgData as any)?.orgs?.filter((org: any) => org.isActive)?.length || 0 : 0;

          // Get user roles with org info
          const userRoleData = await db.select({
            roleId: roles.id,
            roleName: roles.name,
            orgId: orgs.id,
            orgName: orgs.name,
            isActive: userRoles.isActive,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .innerJoin(orgs, eq(userRoles.orgId, orgs.id))
          .where(eq(userRoles.userId, user.id));

          return {
            ...user,
            roleCount: roleCountResult[0]?.count || 0,
            orgCount: orgCount,
            lastLoginAt: null, // TODO: Implement last login tracking
            roles: userRoleData.map(role => ({
              id: role.roleId,
              name: role.roleName,
              orgId: role.orgId,
              orgName: role.orgName,
              isActive: role.isActive,
            })),
          };
        })
      );

      // Get total count for pagination
      const totalCountResult = await db.select({ count: count() })
        .from(users)
        .where(whereClause);

      return {
        users: usersWithStats,
        totalCount: totalCountResult[0]?.count || 0,
        hasMore: offset + limit < (totalCountResult[0]?.count || 0),
      };
    }),

  // Get user by ID with full details
  getById: withPermission('users:read')
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const user = await db.select()
        .from(users)
        .where(eq(users.id, input))
        .limit(1);

      if (!user[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with ID ${input} not found`
        });
      }

      // Get user roles with org and role details
      const userRoleData = await db.select({
        roleId: roles.id,
        roleName: roles.name,
        roleDescription: roles.description,
        orgId: orgs.id,
        orgName: orgs.name,
        isActive: userRoles.isActive,
        assignedAt: userRoles.assignedAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(orgs, eq(userRoles.orgId, orgs.id))
      .where(eq(userRoles.userId, input));

      return {
        ...user[0],
        roles: userRoleData,
      };
    }),

  // Create new user
  create: withPermission('users:create')
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      const { password, ...userData } = input;

      // Check if email already exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser[0]) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists'
        });
      }

      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      try {
        const [newUser] = await db.insert(users).values({
          ...userData,
          password: hashedPassword,
          uuid: uuidv4(),
        }).returning();

        return newUser;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
          cause: error,
        });
      }
    }),

  // Update user
  update: withPermission('users:update')
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, password, ...updateData } = input;

      // Check if user exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!existingUser[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingUser[0].email) {
        const emailExists = await db.select()
          .from(users)
          .where(and(
            eq(users.email, updateData.email),
            not(eq(users.id, id))
          ))
          .limit(1);

        if (emailExists[0]) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A user with this email already exists'
          });
        }
      }

      // Hash password if provided
      let hashedPassword = undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      try {
        const [updatedUser] = await db.update(users)
          .set({
            ...updateData,
            ...(hashedPassword && { password: hashedPassword }),
            updatedAt: new Date(),
          })
          .where(eq(users.id, id))
          .returning();

        return updatedUser;
      } catch (error) {
        console.error("Error updating user:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
          cause: error,
        });
      }
    }),

  // Delete user
  delete: withPermission('users:delete')
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Check if user exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.id, input))
        .limit(1);

      if (!existingUser[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      try {
        // Delete user (cascade will handle related records)
        const [deletedUser] = await db.delete(users)
          .where(eq(users.id, input))
          .returning();

        return deletedUser;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
          cause: error,
        });
      }
    }),

  // Bulk operations
  bulkUpdate: withPermission('users:update')
    .input(z.object({
      userIds: z.array(z.number()),
      action: z.enum(['activate', 'deactivate']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userIds, action } = input;

      if (userIds.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No user IDs provided'
        });
      }

      const isActive = action === 'activate';

      try {
        const updatedUsers = await db.update(users)
          .set({ 
            isActive,
            updatedAt: new Date(),
          })
          .where(sql`${users.id} = ANY(${userIds})`)
          .returning();

        return {
          success: true,
          updatedCount: updatedUsers.length,
          users: updatedUsers,
        };
      } catch (error) {
        console.error("Error in bulk update:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update users',
          cause: error,
        });
      }
    }),

  // Bulk delete
  bulkDelete: withPermission('users:delete')
    .input(z.object({
      userIds: z.array(z.number()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userIds } = input;

      if (userIds.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No user IDs provided'
        });
      }

      try {
        const deletedUsers = await db.delete(users)
          .where(sql`${users.id} = ANY(${userIds})`)
          .returning();

        return {
          success: true,
          deletedCount: deletedUsers.length,
          users: deletedUsers,
        };
      } catch (error) {
        console.error("Error in bulk delete:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete users',
          cause: error,
        });
      }
    }),

  // Assign role to user
  assignRole: withPermission('users:assign_roles')
    .input(z.object({
      userId: z.number(),
      orgId: z.number(),
      roleId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId, roleId } = input;

      // Check if assignment already exists
      const existingAssignment = await db.select()
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.orgId, orgId),
          eq(userRoles.roleId, roleId)
        ))
        .limit(1);

      if (existingAssignment[0]) {
        // If exists but inactive, reactivate it
        if (!existingAssignment[0].isActive) {
          await db.update(userRoles)
            .set({ 
              isActive: true,
              updatedAt: new Date(),
            })
            .where(and(
              eq(userRoles.userId, userId),
              eq(userRoles.orgId, orgId),
              eq(userRoles.roleId, roleId)
            ));
          
          return { success: true, action: 'reactivated' };
        } else {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already has this role in this org'
          });
        }
      }

      try {
        await db.insert(userRoles).values({
          userId,
          orgId,
          roleId,
          isActive: true,
          assignedBy: ctx.session.user.id,
        });

        return { success: true, action: 'assigned' };
      } catch (error) {
        console.error("Error assigning role:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign role',
          cause: error,
        });
      }
    }),

  // Remove role from user
  removeRole: withPermission('users:assign_roles')
    .input(z.object({
      userId: z.number(),
      orgId: z.number(),
      roleId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId, roleId } = input;

      try {
        const deletedAssignment = await db.delete(userRoles)
          .where(and(
            eq(userRoles.userId, userId),
            eq(userRoles.orgId, orgId),
            eq(userRoles.roleId, roleId)
          ))
          .returning();

        if (deletedAssignment.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Role assignment not found'
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Error removing role:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove role',
          cause: error,
        });
      }
    }),
}); 
import { registerSchema } from '@/schemas/auth.schema';
import { users } from '@/db/schema';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { userRoles } from '@/db/schema';
import { and } from 'drizzle-orm';
import type { ExtendedSession } from '@/db/auth-hydration';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if public registration is enabled
      if (process.env.DISABLE_PUBLIC_REGISTRATION === 'true') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Public registration is disabled. Please contact an administrator for access.',
        });
      }

      const { email, password, name } = input;

      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        // If user exists and already has a password, throw conflict
        if (existingUser.password) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An account with this email already exists.',
          });
        }
        // If user exists but doesn't have a password (magic link user), we can proceed to set one
      }

      const hashedPassword = await bcrypt.hash(password, 12); // Salt rounds = 12

      try {
        if (existingUser && !existingUser.password) {
          // Update existing magic-link user with password
          await ctx.db.update(users)
            .set({ 
              password: hashedPassword,
              name: name || existingUser.name,
            })
            .where(eq(users.id, existingUser.id));
          
          console.log(`Password set for existing user: ${email}`);
        } else {
          // Create new user
          await ctx.db.insert(users).values({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0], // Use email prefix as default name
          });
          
          console.log(`New user registered: ${email}`);
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error during registration/password setup:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user.',
          cause: error,
        });
      }
    }),

  switchOrg: protectedProcedure
    .input(z.object({
      orgId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session as ExtendedSession;
      const userId = session.user.id;
      const { orgId } = input;

      try {
        // Verify user has access to this org
        const userRole = await ctx.db.query.userRoles.findFirst({
          where: and(
            eq(userRoles.userId, userId),
            eq(userRoles.orgId, orgId),
            eq(userRoles.isActive, true)
          ),
          with: {
            org: true,
            role: true
          }
        });

        if (!userRole) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this org'
          });
        }

        // Store the selected org in the session or user preferences
        // For now, we'll return the org info and let the client handle it
        // In a production system, you might want to store this in a user preferences table

        return {
          success: true,
          org: {
            id: userRole.org.id,
            name: userRole.org.name
          },
          role: {
            id: userRole.role.id,
            name: userRole.role.name
          }
        };
      } catch (error) {
        console.error('Error switching org:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to switch org'
        });
      }
    }),

  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const session = ctx.session as ExtendedSession;
      const userId = session.user.id;
      
      try {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, userId),
          with: {
            userOrgs: {
              with: {
                org: true
              }
            }
          }
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          });
        }

        // Transform data for client
        const availableOrgs = user.userOrgs?.map(uo => ({
          id: uo.org.id,
          name: uo.org.name,
          roles: ['user'], // Default role, should be fetched from userRoles table
          isActive: true
        })) || [];

        const currentOrg = availableOrgs[0] || null;

        // Get permissions from session if available, otherwise return empty array
        const allPermissions = session.user.roles?.flatMap(role =>
          role.policies?.map(policy => policy.name) || []
        ) || [];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          currentOrg,
          availableOrgs,
          permissions: [...new Set(allPermissions)] // Remove duplicates
        };
      } catch (error) {
        console.error('Error getting current user:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user data'
        });
      }
    })
}); 
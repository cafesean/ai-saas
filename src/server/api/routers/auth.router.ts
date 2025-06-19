import { registerSchema } from '@/schemas/auth.schema';
import { users } from '@/db/schema';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { userRoles, tenants } from '@/db/schema';
import { and } from 'drizzle-orm';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
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

  switchTenant: protectedProcedure
    .input(z.object({
      tenantId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { tenantId } = input;

      try {
        // Verify user has access to this tenant
        const userRole = await ctx.db.query.userRoles.findFirst({
          where: and(
            eq(userRoles.userId, userId),
            eq(userRoles.tenantId, tenantId),
            eq(userRoles.isActive, true)
          ),
          with: {
            tenant: true,
            role: true
          }
        });

        if (!userRole) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this tenant'
          });
        }

        // Store the selected tenant in the session or user preferences
        // For now, we'll return the tenant info and let the client handle it
        // In a production system, you might want to store this in a user preferences table

        return {
          success: true,
          tenant: {
            id: userRole.tenant.id,
            name: userRole.tenant.name
          },
          role: {
            id: userRole.role.id,
            name: userRole.role.name
          }
        };
      } catch (error) {
        console.error('Error switching tenant:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to switch tenant'
        });
      }
    }),

  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        const user = await ctx.db.query.users.findFirst({
          where: eq(userRoles.userId, userId),
          with: {
            userRoles: {
              where: eq(userRoles.isActive, true),
              with: {
                tenant: true,
                role: {
                  with: {
                    rolePermissions: {
                      with: {
                        permission: true
                      }
                    }
                  }
                }
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
        const availableTenants = user.userRoles.map(ur => ({
          id: ur.tenant.id,
          name: ur.tenant.name,
          roles: [ur.role.name],
          isActive: ur.isActive
        }));

        const currentTenant = availableTenants[0] || null;

        const allPermissions = user.userRoles.flatMap(ur =>
          ur.role.rolePermissions.map(rp => rp.permission.name)
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          currentTenant,
          availableTenants,
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
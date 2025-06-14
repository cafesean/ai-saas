/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * This is where all the tRPC server stuff is created and plugged in.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 */
import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { db } from '@/db/config';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { eq, and, count } from 'drizzle-orm';
import schema, { userTenants, userRoles, rolePermissions, permissions } from '@/db/schema';

/**
 * Enhanced context with user authentication and tenant information
 */
interface CreateContextOptions {
  session: any | null;
  user: any | null;
  tenantId: number | null;
}

type Context = {
  db: PostgresJsDatabase<typeof schema>;
  session: any | null;
  user: any | null;
  tenantId: number | null;
};

/**
 * This helper generates the "internals" for a tRPC context.
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    db,
    session: opts.session,
    user: opts.user,
    tenantId: opts.tenantId,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to
 * process every request that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;
  
  let session = null;
  let user = null;
  let tenantId = null;
  
  // For development, use configurable mock authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockUserId = process.env.NEXT_PUBLIC_MOCK_USER_ID;
  const enableMockAuth = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';
  
  if (isDevelopment && enableMockAuth && mockUserId) {
    console.log('Development mode: Using mock user ID:', mockUserId);
    
    try {
      // Get mock user from database
      const mockUser = await db.query.users.findFirst({
        where: eq(schema.users.id, parseInt(mockUserId)),
      });
      
      if (mockUser) {
        // Get user's tenant
        const userTenant = await db.query.userTenants.findFirst({
          where: eq(userTenants.userId, mockUser.id),
          with: {
            tenant: true,
          },
        });
        
        user = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        };
        tenantId = userTenant?.tenantId || null;
        
        // Create a mock session
        session = {
          user,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        };
        
        console.log('Mock user loaded successfully:', { userId: user.id, tenantId });
      } else {
        console.error('Mock user not found in database:', mockUserId);
      }
    } catch (error) {
      console.error('Error loading mock user:', error);
    }
  } else if (isDevelopment && !enableMockAuth) {
    // Development mode with real authentication - require login
    try {
      session = await getServerSession(authOptions);
      
      if (session?.user) {
        user = session.user;
        
        // Get user's primary tenant (first tenant if multiple)
        if (session.user.id) {
          const userTenant = await db.query.userTenants.findFirst({
            where: eq(userTenants.userId, session.user.id),
            with: {
              tenant: true,
            },
          });
          tenantId = userTenant?.tenantId || null;
        }
      }
    } catch (error) {
      console.error('NextAuth session failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  } else {
    // Production: Use NextAuth
    try {
      session = await getServerSession(authOptions);
      
      if (session?.user) {
        user = session.user;
        
        // Get user's primary tenant (first tenant if multiple)
        if (session.user.id) {
          const userTenant = await db.query.userTenants.findFirst({
            where: eq(userTenants.userId, session.user.id),
            with: {
              tenant: true,
            },
          });
          tenantId = userTenant?.tenantId || null;
        }
      }
    } catch (error) {
      console.error('NextAuth session failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  return createInnerTRPCContext({
    session,
    user,
    tenantId,
  });
};

/**
 * Pages Router context creator
 */
export const createPagesRouterContext = () => {
  return createInnerTRPCContext({
    session: null,
    user: null,
    tenantId: null,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API.
 */
export const publicProcedure = t.procedure;

/**
 * Authentication middleware - ensures user is logged in
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "Authentication required. Please log in to access this resource."
    });
  }
  return next({
    ctx: {
      ...ctx,
      // Infers the session and user as non-nullable
      session: ctx.session,
      user: ctx.user,
      tenantId: ctx.tenantId,
    },
  });
});

/**
 * Permission checking middleware with caching
 */
const createPermissionMiddleware = (requiredPermission: string) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.user) {
      throw new TRPCError({ 
        code: "UNAUTHORIZED",
        message: "Authentication required for this operation."
      });
    }

    if (!ctx.tenantId) {
      throw new TRPCError({
        code: "FORBIDDEN", 
        message: "User must be associated with a tenant to perform this action."
      });
    }

    // Check if user has the required permission
    const hasPermission = await checkUserPermission(
      ctx.user.id, 
      ctx.tenantId, 
      requiredPermission
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission denied. Required permission: ${requiredPermission}`
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.user,
        tenantId: ctx.tenantId,
      },
    });
  });
};

/**
 * Helper function to check user permissions
 */
async function checkUserPermission(
  userId: number, 
  tenantId: number, 
  permissionSlug: string
): Promise<boolean> {
  try {
    // Query to check if user has the permission through their roles
    const result = await db
      .select({ count: count() })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.tenantId, tenantId),
          eq(permissions.slug, permissionSlug),
          eq(permissions.isActive, true)
        )
      );

    return (result[0]?.count ?? 0) > 0;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Admin middleware - requires admin role
 */
const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.tenantId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required for admin access."
    });
  }

  // Check if user has admin role
  const isAdmin = await checkUserPermission(ctx.user.id, ctx.tenantId, 'admin:full_access');

  if (!isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Administrator privileges required for this operation."
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
      tenantId: ctx.tenantId,
    },
  });
});

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

/**
 * Admin procedure - requires admin privileges  
 */
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);

/**
 * Permission-based procedure factory
 * Usage: requiresPermission('model:create')
 */
export const requiresPermission = (permission: string) => {
  return t.procedure.use(createPermissionMiddleware(permission));
};

// Export type definitions for use in other files
export type { Context };
export { checkUserPermission };

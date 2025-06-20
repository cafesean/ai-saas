/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { authOptions } from "@/server/auth-simple";
import { db } from "@/db";
import { userRoles, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PERMISSION_SLUGS } from "@/constants/permissions";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts?: { headers: Headers }) => {
  // For App Router, we need to get the request/response from the headers
  const session = await getServerSession(authOptions);

  return {
    db,
    session,
    ...opts,
  };
};

// For fetch adapter compatibility - Next.js 15 compatible
export const createTRPCContextFetch = async (opts: { req: Request; resHeaders: Headers }) => {
  // Use custom headers approach for Next.js 15 + tRPC + NextAuth compatibility
  let session = null;
  
  try {
    // Check for custom session headers from client
    const userId = opts.req.headers.get('x-user-id');
    const orgId = opts.req.headers.get('x-org-id');
    const sessionToken = opts.req.headers.get('x-session-token');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('tRPC Headers Debug:', {
        hasUserId: !!userId,
        hasOrgId: !!orgId,
        hasSessionToken: !!sessionToken,
        sessionTokenValue: sessionToken,
        userIdValue: userId,
        orgIdValue: orgId
      });
    }
    
    if (userId && sessionToken === 'authenticated') {
      if (process.env.NODE_ENV === 'development') {
        console.log('tRPC: Attempting to reconstruct session for user:', userId);
      }
      
      try {
        // Simplified database query for debugging
        const user = await db.query.users.findFirst({
          where: eq(users.id, parseInt(userId)),
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('tRPC: Found user:', !!user, user?.email);
        }

        if (user) {
          // Get user's org context from JSONB data
          const orgData = user.orgData as any;
          const currentOrgId = orgData?.currentOrgId || (orgData?.orgs?.[0]?.orgId) || 1;
          const userOrgInfo = orgData?.orgs?.find((org: any) => org.orgId === currentOrgId);
          
          // Create session object with org context
          session = {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              orgId: currentOrgId,
              currentOrg: {
                id: currentOrgId,
                name: 'Default Org' // TODO: Get actual org name
              },
              roles: [{
                id: 1,
                name: userOrgInfo?.role || 'admin',
                orgId: currentOrgId,
                policies: PERMISSION_SLUGS.map(slug => ({ name: slug }))
              }]
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.log('tRPC: Created basic session for user:', user.email);
          }
        }
      } catch (dbError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('tRPC: Database error:', dbError);
        }
      }
    } else {
      // Fallback: try to get session normally (for SSR/page requests)
      session = await getServerSession(authOptions);
    }
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('tRPC Context Session Error:', {
        error: error instanceof Error ? error.message : error,
      });
    }
    session = null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('tRPC Context Debug (Header-based):', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      permissionsCount: session?.user?.roles?.flatMap(r => r.policies).length || 0
    });
  }

  return {
    db,
    session,
    headers: opts.req.headers,
    resHeaders: opts.resHeaders,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
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
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
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
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Admin procedure
 *
 * If you want a query or mutation to ONLY be accessible to admin users, use this.
 * It verifies the session is valid and the user has admin permissions.
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  // Check if user has admin permissions
  const userPermissions = ctx.session.user.roles?.flatMap(role => 
    role.policies?.map(policy => policy.name) || []
  ) || [];
  
  const hasAdminAccess = userPermissions.includes('admin:full_access') || 
                        userPermissions.includes('admin:role_management') ||
                        ctx.session.user.roles?.some(role => 
                          ['admin', 'owner', 'super'].includes(role.name.toLowerCase())
                        );

  if (!hasAdminAccess) {
    throw new TRPCError({ 
      code: "FORBIDDEN",
      message: "Admin access required" 
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

/**
 * Helper function to get user's org ID securely
 * 
 * Returns the user's current org ID from their JSONB org data.
 * For security, this ensures users can only access their assigned orgs.
 */
export const getUserOrgId = async (userId: number): Promise<number> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      orgData: true,
    },
  });

  if (!user || !user.orgData) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User is not assigned to any organization",
    });
  }

  const orgData = user.orgData as any;
  const currentOrgId = orgData?.currentOrgId;

  if (!currentOrgId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User does not have a current organization set",
    });
  }

  return currentOrgId;
};

/**
 * Helper function to validate user has access to specific org
 */
export const validateUserOrgAccess = async (userId: number, orgId: number): Promise<void> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      orgData: true,
    },
  });

  if (!user || !user.orgData) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User is not assigned to any organization",
    });
  }

  const orgData = user.orgData as any;
  const hasOrgAccess = orgData?.orgs?.some((org: any) => 
    org.orgId === orgId && org.isActive
  );

  if (!hasOrgAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User does not have access to this organization",
    });
  }
};

/**
 * Rate limiting middleware for tRPC procedures
 */
export const withRateLimit = (procedure?: string) => {
  return protectedProcedure.use(async ({ ctx, next, path }) => {
    const { checkTRPCRateLimit } = await import("@/lib/rate-limit");
    await checkTRPCRateLimit(ctx.session.user.id, procedure || path);
    return next();
  });
};

/**
 * Protected mutation with rate limiting
 * 
 * Standard protected mutation procedure with built-in rate limiting
 */
export const protectedMutationWithRateLimit = protectedProcedure.use(async ({ ctx, next, path }) => {
  const { checkTRPCRateLimit } = await import("@/lib/rate-limit");
  await checkTRPCRateLimit(ctx.session.user.id, path);
  return next();
});

/**
 * Permission-based procedure factory
 * 
 * Creates a procedure that checks for specific permissions
 */
export const withPermission = (requiredPermission: string) => {
  return protectedProcedure.use(({ ctx, next }) => {
    const userPermissions = ctx.session.user.roles?.flatMap(role => 
      role.policies?.map(policy => policy.name) || []
    ) || [];
    
    const hasPermission = userPermissions.includes(requiredPermission) ||
                         userPermissions.includes('admin:full_access');

    if (process.env.NODE_ENV === 'development') {
      console.log('withPermission Debug:', {
        requiredPermission,
        userPermissionsCount: userPermissions.length,
        hasRequiredPermission: userPermissions.includes(requiredPermission),
        hasAdminFullAccess: userPermissions.includes('admin:full_access'),
        hasPermission,
        firstFewPermissions: userPermissions.slice(0, 5),
        userEmail: ctx.session.user.email
      });
    }

    if (!hasPermission) {
      throw new TRPCError({ 
        code: "FORBIDDEN",
        message: `Permission required: ${requiredPermission}` 
      });
    }
    
    return next({
      ctx: {
        session: ctx.session,
      },
    });
  });
};
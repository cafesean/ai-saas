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
  const session = await getServerSession(authOptions);

  return {
    db,
    session,
    ...opts,
  };
};

// For fetch adapter compatibility
export const createTRPCContextFetch = async (opts: { req: Request; resHeaders: Headers }) => {
  const session = await getServerSession(authOptions);

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
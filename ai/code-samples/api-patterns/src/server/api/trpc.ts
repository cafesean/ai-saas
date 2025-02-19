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
import type * as schema from '@/db/schema';

type Context = {
  db: PostgresJsDatabase<typeof schema>;
};

/**
 * This helper generates the "internals" for a tRPC context.
 */
const createInnerTRPCContext = () => {
  return {
    db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to
 * process every request that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  return createInnerTRPCContext();
};

/**
 * Pages Router context creator
 */
export const createPagesRouterContext = () => {
  return createInnerTRPCContext();
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<Context>().create({
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

// const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
//   if (!ctx.session || !ctx.session.user) {
//     throw new TRPCError({ code: "UNAUTHORIZED" });
//   }
//   return next({
//     ctx: {
//       // infers the `session` as non-nullable
//       session: { ...ctx.session, user: ctx.session.user },
//     },
//   });
// });

// const enforceUserIsAdmin = t.middleware(({meta, ctx, next}) => {
//   if (!ctx.session || !ctx.session.user) {
//     throw new TRPCError({code: "UNAUTHORIZED"});
//   }

//   if (!checkUseHasRole(ctx.session, Role.Admin)) {
//     throw new TRPCError({code: "FORBIDDEN"});
//   }

//   if (meta?.access) {
//     if (!checkUserHasAccess(ctx.session, meta.access.policy, meta.access.access)) {
//       throw new TRPCError({code: "FORBIDDEN"});
//     }
//   }

//   return next({
//     ctx: {
//       // infers the `session` as non-nullable
//       session: {...ctx.session, user: ctx.session.user},
//     },
//   });
// });

// Export reusable router and procedure helpers
// export const router = t.router;
// export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
// export const adminProcedure = t.procedure.use(enforceUserIsAdmin);

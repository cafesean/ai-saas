import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth-simple';
import { checkUserPermission } from '@/lib/trpc-permissions';
import { logPermissionDenied, logUnauthorizedAccess } from '@/lib/audit';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { userOrgs } from '@/db/schema';
import type { ExtendedSession } from '@/db/auth-hydration';

export interface ServerActionContext {
  user: {
    id: number;
    email: string;
    name: string;
  };
  orgId: number;
  session: ExtendedSession;
}

export interface ServerActionOptions {
  requiredPermission?: string;
  requireAuth?: boolean;
  requireOrg?: boolean;
}

/**
 * Secure wrapper for Server Actions with authentication and permission checks
 * 
 * @param action - The server action function to wrap
 * @param options - Security options for the action
 * @returns Wrapped server action with security checks
 * 
 * @example
 * ```typescript
 * "use server";
 * 
 * import { withServerActionAuth } from '@/lib/server-actions';
 * 
 * export const createWorkflow = withServerActionAuth(
 *   async (ctx, data: { name: string; description?: string }) => {
 *     // Your action logic here - ctx contains authenticated user and org
 *     return await db.insert(workflows).values({
 *       ...data,
 *       orgId: ctx.orgId,
 *     });
 *   },
 *   { requiredPermission: 'workflow:create' }
 * );
 * ```
 */
export function withServerActionAuth<T extends any[], R>(
  action: (ctx: ServerActionContext, ...args: T) => Promise<R>,
  options: ServerActionOptions = {}
) {
  const {
    requiredPermission,
    requireAuth = true,
    requireOrg = true,
  } = options;

  return async (...args: T): Promise<R> => {
    try {
      // Get session and cast to our extended type
      const session = await getServerSession(authOptions) as ExtendedSession | null;

      // Check authentication if required
      if (requireAuth && (!session || !session.user)) {
        await logUnauthorizedAccess(
          'SERVER_ACTION',
          undefined,
          undefined,
          { action: action.name, timestamp: new Date().toISOString() }
        );
        throw new Error('Authentication required for this action');
      }

      let orgId: number | null = null;

      // Get user's org if required
      if (requireOrg && session?.user?.id) {
        // Try to get orgId from session first (from JSONB approach)
        orgId = session.user.orgId || null;
        
        // Fallback to database query if not in session
        if (!orgId) {
          const userOrg = await db.query.userOrgs.findFirst({
            where: eq(userOrgs.userId, session.user.id),
            with: {
              org: true,
            },
          });
          orgId = userOrg?.orgId || null;
        }

        if (!orgId) {
          await logUnauthorizedAccess(
            'SERVER_ACTION',
            undefined,
            undefined,
            { 
              action: action.name, 
              userId: session.user.id,
              error: 'No org association',
              timestamp: new Date().toISOString() 
            }
          );
          throw new Error('User must be associated with an org to perform this action');
        }
      }

      // Check permission if required
      if (requiredPermission && session?.user?.id && orgId) {
        const hasPermission = await checkUserPermission(
          session.user.id,
          orgId,
          requiredPermission
        );

        if (!hasPermission) {
          await logPermissionDenied(
            session.user.id,
            orgId,
            `SERVER_ACTION:${action.name}`,
            requiredPermission
          );
          throw new Error(`Permission denied. Required permission: ${requiredPermission}`);
        }
      }

      // Create context
      const ctx: ServerActionContext = {
        user: {
          id: session!.user!.id,
          email: session!.user!.email!,
          name: session!.user!.name!,
        },
        orgId: orgId!,
        session: session!,
      };

      // Execute the action
      return await action(ctx, ...args);

    } catch (error) {
      // Log the error for debugging
      console.error('Server Action Error:', {
        action: action.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Wrapper for public Server Actions that don't require authentication
 * Still provides basic security logging and error handling
 */
export function withPublicServerAction<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await action(...args);
    } catch (error) {
      // Log the error for debugging
      console.error('Public Server Action Error:', {
        action: action.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Type-safe helper for creating Server Actions with proper TypeScript support
 */
export type SecureServerAction<T extends any[], R> = (...args: T) => Promise<R>;

/**
 * Utility to validate Server Action input using Zod schemas
 */
export function validateServerActionInput<T>(
  schema: any, // Zod schema
  input: unknown
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid input: ${result.error.message}`);
  }
  return result.data;
} 
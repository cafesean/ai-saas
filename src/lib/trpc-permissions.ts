import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { eq, and } from 'drizzle-orm';
import { userRoles, rolePermissions, permissions } from '@/db/schema';
import { logTrpcAccessDenied } from '@/lib/audit';

/**
 * Get all permissions for a user in a specific org with caching
 */
export async function getUserPermissions(
  userId: number,
  orgId: number
): Promise<string[]> {
  try {
    // Query database for user permissions
    const result = await db
      .select({
        slug: permissions.slug,
      })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.orgId, orgId),
          eq(userRoles.isActive, true),
          eq(permissions.isActive, true)
        )
      );

    const userPermissions = result.map(row => row.slug);
    return userPermissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

/**
 * Check if user has a specific permission with caching
 */
export async function checkUserPermission(
  userId: number,
  orgId: number,
  requiredPermission: string
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId, orgId);
  return userPermissions.includes(requiredPermission);
}

/**
 * Enhanced hasPermission middleware factory for tRPC
 */
export function hasPermission(requiredPermission: string) {
  return async function permissionMiddleware(opts: {
    ctx: {
      session: any | null;
      user: any | null;
      orgId: number | null;
    };
    next: () => any;
    path?: string;
  }) {
    const { ctx, next, path } = opts;

    // Check authentication
    if (!ctx.session || !ctx.user) {
      await logTrpcAccessDenied(
        undefined,
        undefined,
        path || 'unknown',
        requiredPermission
      );
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required for this operation."
      });
    }

    // Check org association
    if (!ctx.orgId) {
      await logTrpcAccessDenied(
        ctx.user.id,
        undefined,
        path || 'unknown',
        requiredPermission
      );
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User must be associated with a org to perform this action."
      });
    }

    // Check permission
    const hasRequiredPermission = await checkUserPermission(
      ctx.user.id,
      ctx.orgId,
      requiredPermission
    );

    if (!hasRequiredPermission) {
      // Log the permission denial
      await logTrpcAccessDenied(
        ctx.user.id,
        ctx.orgId,
        path || 'unknown',
        requiredPermission
      );

      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission denied. Required permission: ${requiredPermission}`
      });
    }

    // Permission granted, proceed
    return next();
  };
} 
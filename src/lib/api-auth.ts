import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth-simple';
import { db } from '@/db';
import { eq, and, count } from 'drizzle-orm';
import { users, userRoles, rolePermissions, permissions } from '@/db/schema';
import type { ExtendedSession } from '@/db/auth-hydration';

/**
 * API Authentication and Authorization Middleware for Next.js App Router
 * Integrates with existing RBAC system from tRPC implementation
 */

export interface AuthenticatedUser {
  id: number;
  email: string;
  name?: string;
  orgId: number;
}

export interface ApiAuthOptions {
  requireAuth?: boolean;
  requiredPermission?: string;
  requireAdmin?: boolean;
}

/**
 * Authentication result for API routes
 */
export type ApiAuthResult = {
  success: true;
  user: AuthenticatedUser;
} | {
  success: false;
  error: string;
  status: number;
};

/**
 * Main authentication function for API routes
 */
export async function authenticateApiRequest(
  request: NextRequest,
  options: ApiAuthOptions = {}
): Promise<ApiAuthResult> {
  const { requireAuth = true, requiredPermission, requireAdmin = false } = options;

  // 🚨 SECURITY: Protect against CVE-2025-29927 Next.js Middleware Bypass
  // Block requests with x-middleware-subrequest header to prevent auth bypass
  const middlewareHeader = request.headers.get('x-middleware-subrequest');
  if (middlewareHeader) {
    console.warn('🚨 SECURITY ALERT: Blocked request with x-middleware-subrequest header (CVE-2025-29927):', {
      header: middlewareHeader,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });
    return { 
      success: false, 
      error: 'Invalid request headers detected', 
      status: 400 
    };
  }

  // Skip auth if not required
  if (!requireAuth) {
    // For public endpoints, still try to get user info if available
    const user = await getCurrentUser();
    if (user) {
      return { success: true, user };
    }
    // Return a mock user for public endpoints (in development)
    const mockUser = await getMockUserForPublicEndpoint();
    if (mockUser) {
      return { success: true, user: mockUser };
    }
    return { success: false, error: 'Authentication required', status: 401 };
  }

  // Get current user from session
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Authentication required. Please log in.', status: 401 };
  }

  // Check admin permission if required
  if (requireAdmin) {
    const isAdmin = await checkUserPermission(user.id, user.orgId, 'admin:full_access');
    if (!isAdmin) {
      return { 
        success: false, 
        error: 'Administrator privileges required for this operation.', 
        status: 403 
      };
    }
  }

  // Check specific permission if required
  if (requiredPermission) {
    const hasPermission = await checkUserPermission(user.id, user.orgId, requiredPermission);
    if (!hasPermission) {
      return { 
        success: false, 
        error: `Permission denied. Required permission: ${requiredPermission}`, 
        status: 403 
      };
    }
  }

  return { success: true, user };
}

/**
 * Get current authenticated user with org information
 */
async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  // For development, use mock user system (same as tRPC)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockUserId = process.env.NEXT_PUBLIC_MOCK_USER_ID;

  if (isDevelopment && mockUserId) {
    try {
      // Get mock user from database
      const mockUser = await db.query.users.findFirst({
        where: eq(users.id, parseInt(mockUserId)),
      });

      if (mockUser) {
        // Extract org data from JSONB field
        const orgData = mockUser.orgData as { currentOrgId?: number; orgs?: Array<{ orgId: number; role: string; isActive: boolean }> } | null;
        
        if (orgData?.currentOrgId) {
          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name || undefined,
            orgId: orgData.currentOrgId,
          };
        }
      }
    } catch (error) {
      console.error('Error loading mock user:', error);
    }
  } else {
    // Production: Use NextAuth with ExtendedSession
    try {
      const session = await getServerSession(authOptions) as ExtendedSession | null;
      
      if (session?.user?.id) {
        const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
        
        // Try to get orgId from session first (from JSONB approach)
        let orgId = session.user.orgId || null;
        
        // Fallback to database query if not in session
        if (!orgId) {
          const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
          });
          
          if (user?.orgData) {
            const orgData = user.orgData as { currentOrgId?: number; orgs?: Array<{ orgId: number; role: string; isActive: boolean }> } | null;
            orgId = orgData?.currentOrgId || null;
          }
        }

        if (orgId) {
          return {
            id: userId,
            email: session.user.email!,
            name: session.user.name || undefined,
            orgId: orgId,
          };
        }
      }
    } catch (error) {
      console.error('NextAuth session failed:', error);
    }
  }

  return null;
}

/**
 * Get mock user for public endpoints (development only)
 */
async function getMockUserForPublicEndpoint(): Promise<AuthenticatedUser | null> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockUserId = process.env.NEXT_PUBLIC_MOCK_USER_ID;

  if (isDevelopment && mockUserId) {
    return getCurrentUser();
  }

  return null;
}

/**
 * Check if user has specific permission (same logic as tRPC)
 */
async function checkUserPermission(
  userId: number,
  orgId: number,
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
          eq(userRoles.orgId, orgId),
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
 * Middleware wrapper for API routes
 */
export function withApiAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
  options: ApiAuthOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateApiRequest(request, options);

    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error 
        },
        { status: authResult.status }
      );
    }

    try {
      return await handler(request, authResult.user);
    } catch (error) {
      console.error('API handler error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error' 
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to create standardized error responses
 */
export function createApiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Helper function to create standardized success responses
 */
export function createApiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Org isolation helper - adds org filtering to database queries
 */
export function addOrgFilter<T extends { orgId?: number }>(
  baseQuery: T,
  orgId: number
): T & { orgId: number } {
  return { ...baseQuery, orgId };
} 
import { db } from '@/db';
import { auditLogs } from '@/db/schema/audit';

export type AuditAction = 
  | 'PERMISSION_DENIED'
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'ROLE_CHANGED'
  | 'TENANT_SWITCHED'
  | 'SESSION_REVOKED'
  | 'UNAUTHORIZED_ACCESS'
  | 'API_ACCESS_DENIED'
  | 'TRPC_ACCESS_DENIED'
  | 'RATE_LIMIT_EXCEEDED';

export type AuditSeverity = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface AuditLogData {
  action: AuditAction;
  resource?: string;
  userId?: number;
  tenantId?: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity?: AuditSeverity;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      action: data.action,
      resource: data.resource,
      userId: data.userId,
      tenantId: data.tenantId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      details: data.details,
      severity: data.severity || 'INFO',
    });
  } catch (error) {
    // Don't throw errors for audit logging failures to avoid breaking the main flow
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Create a permission denied audit log
 */
export async function logPermissionDenied(
  userId: number | undefined,
  tenantId: number | undefined,
  resource: string,
  requiredPermission: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'PERMISSION_DENIED',
    resource,
    userId,
    tenantId,
    ipAddress,
    userAgent,
    details: {
      requiredPermission,
      timestamp: new Date().toISOString(),
    },
    severity: 'WARN',
  });
}

/**
 * Create a tRPC access denied audit log
 */
export async function logTrpcAccessDenied(
  userId: number | undefined,
  tenantId: number | undefined,
  procedure: string,
  requiredPermission: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'TRPC_ACCESS_DENIED',
    resource: `tRPC:${procedure}`,
    userId,
    tenantId,
    ipAddress,
    userAgent,
    details: {
      procedure,
      requiredPermission,
      timestamp: new Date().toISOString(),
    },
    severity: 'WARN',
  });
}

/**
 * Create an unauthorized access audit log
 */
export async function logUnauthorizedAccess(
  resource: string,
  ipAddress?: string,
  userAgent?: string,
  details?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    action: 'UNAUTHORIZED_ACCESS',
    resource,
    ipAddress,
    userAgent,
    details: {
      ...details,
      timestamp: new Date().toISOString(),
    },
    severity: 'ERROR',
  });
} 
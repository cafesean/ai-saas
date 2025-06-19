/**
 * Comprehensive TypeScript types for authentication system
 * 
 * This file provides type safety for all authentication-related operations,
 * error handling, and state management.
 */

// Core auth types
export interface OrgUser {
  org_id: number;
  user_id: number;
  role: string;
}

export interface SessionRole {
  id: number;
  name: string;
  tenantId: number;
  policies: SessionPermission[];
}

export interface SessionPermission {
  name: string;
  description: string;
}

export interface Permission {
  id: number;
  name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface TenantInfo {
  id: number;
  name: string;
  roles: string[];
  isActive: boolean;
}

// Auth result types
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: AuthError;
  sessionToken?: string;
}

export interface AuthUser {
  id: number;
  uuid: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  roles: SessionRole[];
  orgUser: OrgUser[];
  // Multi-tenant support
  tenantId: number | null;
  currentTenant: { id: number; name: string } | null;
  availableTenants: TenantInfo[];
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  RATE_LIMITED = 'RATE_LIMITED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

// Auth state management types
export interface AuthState {
  authenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  error: AuthError | null;
  sessionToken: string | null;
}

// API response types
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

// Credential types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

// Permission check types
export interface PermissionCheck {
  permission?: string;
  permissions?: string[];
  anyPermissions?: string[];
  role?: string | string[];
  customCheck?: (user: AuthUser, permissions: string[]) => boolean;
}

// Rate limiting types
export interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: number;
  retryAfter?: number;
}

// Session management types
export interface SessionInfo {
  id: string;
  userId: number;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Audit types for authentication events
export interface AuthAuditEvent {
  event: AuthEventType;
  userId?: number;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: AuthError;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum AuthEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  RATE_LIMITED = 'RATE_LIMITED',
}

// Configuration types
export interface AuthConfig {
  sessionMaxAge: number;
  sessionUpdateAge: number;
  rateLimitMaxAttempts: number;
  rateLimitWindowMs: number;
  requireSecureCookies: boolean;
  enableDebugLogging: boolean;
  passwordMinLength: number;
  sessionTimeoutWarningMs: number;
}

// Utility types
export type AuthHookReturn<T = any> = {
  data?: T;
  loading: boolean;
  error?: AuthError;
  refetch?: () => void;
};

export type WithAuthProps = {
  authenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
};

// Form validation types
export interface AuthFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
}

export interface AuthFormState {
  values: Partial<LoginCredentials | RegisterCredentials>;
  errors: AuthFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
} 
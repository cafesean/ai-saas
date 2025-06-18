import { AuthError, AuthErrorCode, AuthResponse } from '@/types/auth';

/**
 * Standardized authentication error handling utilities
 */

/**
 * Create a standardized auth error response
 */
export function createAuthError(
  code: AuthErrorCode,
  message: string,
  details?: Record<string, any>
): AuthError {
  return {
    code,
    message,
    details,
  };
}

/**
 * Create a standardized API response for auth operations
 */
export function createAuthResponse<T = any>(
  success: boolean,
  data?: T,
  error?: AuthError
): AuthResponse<T> {
  return {
    success,
    data,
    error: error ? {
      code: error.code,
      message: error.message,
      details: error.details,
    } : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Common auth error creators
 */
export const AuthErrors = {
  invalidCredentials: (email?: string) => createAuthError(
    AuthErrorCode.INVALID_CREDENTIALS,
    'Invalid email or password',
    { email }
  ),

  userNotFound: (email?: string) => createAuthError(
    AuthErrorCode.USER_NOT_FOUND,
    'User account not found',
    { email }
  ),

  accountDisabled: (email?: string) => createAuthError(
    AuthErrorCode.ACCOUNT_DISABLED,
    'Account has been disabled',
    { email }
  ),

  rateLimited: (retryAfter?: number) => createAuthError(
    AuthErrorCode.RATE_LIMITED,
    `Too many attempts. Try again in ${retryAfter || 'a few'} seconds`,
    { retryAfter }
  ),

  weakPassword: (requirements?: string[]) => createAuthError(
    AuthErrorCode.WEAK_PASSWORD,
    'Password does not meet security requirements',
    { requirements }
  ),

  databaseError: (operation?: string) => createAuthError(
    AuthErrorCode.DATABASE_ERROR,
    'Database operation failed',
    { operation }
  ),

  sessionExpired: () => createAuthError(
    AuthErrorCode.SESSION_EXPIRED,
    'Your session has expired. Please log in again'
  ),

  insufficientPermissions: (required?: string[]) => createAuthError(
    AuthErrorCode.INSUFFICIENT_PERMISSIONS,
    'You do not have permission to perform this action',
    { required }
  ),

  invalidToken: (type?: string) => createAuthError(
    AuthErrorCode.INVALID_TOKEN,
    'Invalid or expired token',
    { type }
  ),

  networkError: (details?: string) => createAuthError(
    AuthErrorCode.NETWORK_ERROR,
    'Network connection failed',
    { details }
  ),
};

/**
 * Error message mappings for user-friendly display
 */
export const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AuthErrorCode.USER_NOT_FOUND]: 'User account not found',
  [AuthErrorCode.ACCOUNT_DISABLED]: 'Account has been disabled',
  [AuthErrorCode.RATE_LIMITED]: 'Too many attempts. Please try again later',
  [AuthErrorCode.WEAK_PASSWORD]: 'Password does not meet security requirements',
  [AuthErrorCode.DATABASE_ERROR]: 'A system error occurred. Please try again',
  [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action',
  [AuthErrorCode.INVALID_TOKEN]: 'Invalid or expired token',
  [AuthErrorCode.NETWORK_ERROR]: 'Network connection failed. Please check your connection',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AuthError): string {
  return error.message || ERROR_MESSAGES[error.code] || 'An unexpected error occurred';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AuthError): boolean {
  const retryableCodes = [
    AuthErrorCode.NETWORK_ERROR,
    AuthErrorCode.DATABASE_ERROR,
    AuthErrorCode.RATE_LIMITED,
  ];
  
  return retryableCodes.includes(error.code);
}

/**
 * Get retry delay in seconds for retryable errors
 */
export function getRetryDelay(error: AuthError): number {
  switch (error.code) {
    case AuthErrorCode.RATE_LIMITED:
      return error.details?.retryAfter || 60;
    case AuthErrorCode.NETWORK_ERROR:
      return 5;
    case AuthErrorCode.DATABASE_ERROR:
      return 10;
    default:
      return 0;
  }
}

/**
 * Format error for logging (removes sensitive information)
 */
export function formatErrorForLogging(error: AuthError, context?: Record<string, any>): {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
} {
  return {
    code: error.code,
    message: error.message,
    context: context ? {
      ...context,
      // Remove sensitive fields
      password: undefined,
      token: undefined,
      sessionToken: undefined,
    } : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate auth response structure
 */
export function isValidAuthResponse<T>(response: any): response is AuthResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.success === 'boolean' &&
    typeof response.timestamp === 'string' &&
    (response.error === undefined || (
      typeof response.error === 'object' &&
      typeof response.error.code === 'string' &&
      typeof response.error.message === 'string'
    ))
  );
} 
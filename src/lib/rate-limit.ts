import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';
import { createAuditLog } from '@/lib/audit';

// Initialize Redis client for rate limiting
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Create rate limiters with proper typing
export const authRateLimit = new Ratelimit({
  redis: redis as any || new Map() as any,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const passwordResetRateLimit = new Ratelimit({
  redis: redis as any || new Map() as any,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 attempts per hour
  analytics: true,
  prefix: 'ratelimit:password-reset',
});

export const fileUploadRateLimit = new Ratelimit({
  redis: redis as any || new Map() as any,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 uploads per minute
  analytics: true,
  prefix: 'ratelimit:file-upload',
});

export const aiRateLimit = new Ratelimit({
  redis: redis as any || new Map() as any,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
  analytics: true,
  prefix: 'ratelimit:ai',
});

export const adminRateLimit = new Ratelimit({
  redis: redis as any || new Map() as any,
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 operations per minute
  analytics: true,
  prefix: 'ratelimit:admin',
});

export const apiRateLimit = new Ratelimit({
  redis: redis as any || new Map() as any,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
});

export const trpcRateLimit = new Ratelimit({
  redis: redis as any || new Map() as any,
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
  analytics: true,
  prefix: 'ratelimit:trpc',
});

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest, userId?: number): string {
  // Use user ID if authenticated, otherwise fall back to IP
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

// Rate limit check for authentication endpoints
export async function checkAuthRateLimit(
  identifier: string
): Promise<{ success: boolean; retryAfter?: number }> {
  try {
    const result = await authRateLimit.limit(identifier);

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      return { success: false, retryAfter };
    }

    return { success: true };
  } catch (error) {
    console.error(`Auth rate limit check failed for ${identifier}:`, error);
    return { success: true }; // Allow on error
  }
}

// Rate limit middleware for API routes
export async function withAuthRateLimit(
  request: NextRequest,
  userId?: number
): Promise<Response | null> {
  const identifier = getClientIdentifier(request, userId);
  const result = await checkAuthRateLimit(identifier);

  if (!result.success) {
    // Log rate limit violation
    await createAuditLog({
      action: 'RATE_LIMIT_EXCEEDED',
      userId: userId,
      details: {
        type: 'auth',
        identifier,
        userAgent: request.headers.get('user-agent'),
        path: request.nextUrl.pathname,
      },
      severity: 'WARN',
    });

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many authentication attempts. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.retryAfter?.toString() || '900', // 15 minutes default
        },
      }
    );
  }

  return null; // No rate limit violation
}

// tRPC rate limiting helper
export async function checkTRPCRateLimit(
  userId?: number,
  procedure?: string
): Promise<void> {
  // TEMPORARILY DISABLED: Rate limiting disabled due to missing Redis setup
  // TODO: Enable rate limiting once Redis is properly configured
  console.log(`Rate limiting disabled for tRPC procedure: ${procedure}, user: ${userId}`);
  return;
  
  /*
  const identifier = userId ? `user:${userId}` : 'anonymous';
  
  try {
    const result = await trpcRateLimit.limit(identifier);

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      
      // Log rate limit violation
      await createAuditLog({
        action: 'RATE_LIMIT_EXCEEDED',
        userId: userId,
        details: {
          type: 'trpc',
          identifier,
          procedure,
        },
        severity: 'WARN',
      });

      throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      throw error; // Re-throw rate limit errors
    }
    console.error(`tRPC rate limit check failed for ${identifier}:`, error);
    // Allow on other errors
  }
  */
}

// Generic rate limit check function
export async function checkGenericRateLimit(
  rateLimit: Ratelimit,
  identifier: string,
  type: string
): Promise<{ success: boolean; retryAfter?: number }> {
  // TEMPORARILY DISABLED: Rate limiting disabled due to missing Redis setup
  // TODO: Enable rate limiting once Redis is properly configured
  console.log(`Rate limiting disabled for ${type}:${identifier}`);
  return { success: true };
  
  /* 
  try {
    const result = await rateLimit.limit(identifier);

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      
      // Log rate limit violation
      await createAuditLog({
        action: 'RATE_LIMIT_EXCEEDED',
        details: {
          type,
          identifier,
        },
        severity: 'WARN',
      });

      return { success: false, retryAfter };
    }

    return { success: true };
  } catch (error) {
    console.error(`Rate limit check failed for ${type}:${identifier}:`, error);
    return { success: true }; // Allow on error
  }
  */
} 
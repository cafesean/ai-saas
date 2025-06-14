import Redis from 'ioredis';

// Redis client for permission caching
let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
    // In development without Redis, return null to disable caching
    console.warn('Redis not configured - permission caching disabled');
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      redis.on('error', (error: Error) => {
        console.error('Redis connection error:', error);
      });

      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }

  return redis;
}

// Permission cache key generator
export function getPermissionCacheKey(userId: number, tenantId: number): string {
  return `permissions:${userId}:${tenantId}`;
}

// Cache TTL (Time To Live) in seconds - 1 hour
export const PERMISSION_CACHE_TTL = 3600;

// Cache user permissions
export async function cacheUserPermissions(
  userId: number, 
  tenantId: number, 
  permissions: string[]
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const key = getPermissionCacheKey(userId, tenantId);
    await client.setex(key, PERMISSION_CACHE_TTL, JSON.stringify(permissions));
  } catch (error) {
    console.error('Failed to cache user permissions:', error);
  }
}

// Get cached user permissions
export async function getCachedUserPermissions(
  userId: number, 
  tenantId: number
): Promise<string[] | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const key = getPermissionCacheKey(userId, tenantId);
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached user permissions:', error);
    return null;
  }
}

// Invalidate user permission cache
export async function invalidateUserPermissionCache(
  userId: number, 
  tenantId: number
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const key = getPermissionCacheKey(userId, tenantId);
    await client.del(key);
  } catch (error) {
    console.error('Failed to invalidate user permission cache:', error);
  }
}

// Invalidate all permission caches for a user (across all tenants)
export async function invalidateAllUserPermissionCaches(userId: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const pattern = `permissions:${userId}:*`;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('Failed to invalidate all user permission caches:', error);
  }
} 
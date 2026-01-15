// Redis Cache Service for SpaceScope (Server-Side Only)
import Redis from 'ioredis';

// Redis connection - uses localhost by default
// Set REDIS_URL environment variable for production
let redis: Redis | null = null;
let isConnected = false;

function getRedisClient(): Redis | null {
    if (redis) return redis;

    try {
        redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => {
                if (times > 1) return null;
                return 100;
            },
            lazyConnect: true,
            connectTimeout: 2000,
        });

        redis.on('connect', () => {
            isConnected = true;
            console.log('✓ Redis connected');
        });

        redis.on('error', () => {
            isConnected = false;
        });

        redis.connect().catch(() => {
            console.warn('Redis not available, using in-memory cache');
        });

        return redis;
    } catch {
        return null;
    }
}

// In-memory fallback cache
const memoryCache: Map<string, { data: string; expires: number }> = new Map();

/**
 * Get cached data from Redis (or memory fallback)
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const client = getRedisClient();
        if (client && isConnected) {
            const data = await client.get(key);
            if (data) {
                return JSON.parse(data) as T;
            }
        } else {
            // Memory fallback
            const entry = memoryCache.get(key);
            if (entry && Date.now() < entry.expires) {
                return JSON.parse(entry.data) as T;
            }
        }
    } catch (error) {
        console.warn('Cache get error:', error);
    }
    return null;
}

/**
 * Set cached data in Redis (or memory fallback)
 * @param ttlSeconds - Time to live in seconds (default: 10 minutes)
 */
export async function setCache<T>(key: string, data: T, ttlSeconds = 600): Promise<void> {
    try {
        const serialized = JSON.stringify(data);
        const client = getRedisClient();

        if (client && isConnected) {
            await client.setex(key, ttlSeconds, serialized);
        } else {
            // Memory fallback
            memoryCache.set(key, {
                data: serialized,
                expires: Date.now() + (ttlSeconds * 1000)
            });
        }
    } catch (error) {
        console.warn('Cache set error:', error);
    }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
    return isConnected;
}

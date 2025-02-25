import { redis } from "lib/redis";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number | null;
}

export class RedisCache {
  public static async set<T>(
    key: string,
    data: T,
    expiresIn: number | null = null,
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    try {
      await redis.set(key, JSON.stringify(entry));

      // If expiration is set, use Redis TTL
      if (expiresIn) {
        await redis.expire(key, expiresIn);
      }
    } catch (error) {
      console.error("Failed to write to Redis cache: ", error);
    }
  }

  public static async get<T>(key: string): Promise<T | null> {
    try {
      const content = await redis.get(key);
      if (!content) return null;

      const entry: CacheEntry<T> = JSON.parse(content) as CacheEntry<T>;

      if (
        entry.expiresIn != null &&
        Date.now() - entry.timestamp > entry.expiresIn * 1000 - 1000
      ) {
        await redis.del(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

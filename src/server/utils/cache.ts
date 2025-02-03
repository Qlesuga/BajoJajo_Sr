import fs from "fs/promises";
import path from "path";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiersIn: number | null;
}

export class DiskCache {
  private static cacheDir: string = path.join(process.cwd(), ".cache");

  public static async initializeCache(): Promise<void> {
    try {
      await fs.mkdir(DiskCache.cacheDir, { recursive: true });
    } catch (error) {
      console.error("Failed to initialize cache directory: ", error);
    }
  }

  private static getCacheFilePath(key: string): string {
    return path.join(DiskCache.cacheDir, `${key}.json`);
  }

  public static async set<T>(
    key: string,
    data: T,
    expiersIn: number | null = null,
  ): Promise<void> {
    await DiskCache.initializeCache();
    const filePath = DiskCache.getCacheFilePath(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiersIn: expiersIn,
    };

    try {
      await fs.writeFile(filePath, JSON.stringify(entry));
    } catch (error) {
      console.error("Failed to write to cache: ", error);
    }
  }

  public static async get<T>(key: string): Promise<T | null> {
    const filePath = DiskCache.getCacheFilePath(key);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      // eslint-disable-next-line
      const entry: CacheEntry<T> = JSON.parse(content);

      if (
        entry.expiersIn != null &&
        Date.now() - entry.timestamp > entry.expiersIn * 1000
      ) {
        return null;
      }

      return entry.data;
    } catch (error) {
      return null;
    }
  }
}

DiskCache.initializeCache().catch((err) => {
  console.log(err);
});

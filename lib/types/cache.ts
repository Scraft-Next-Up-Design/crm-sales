/**
 * Type definitions for cache-related functionality
 */

export type CacheStorageType = "memory" | "session" | "local";
export type CacheDurationType = "short" | "medium" | "long" | "day";

export interface CacheOptions {
  /** Time in seconds before the cache expires */
  expiresIn?: number;
  /** Storage type to use */
  storage?: CacheStorageType;
  /** Cache duration preset */
  duration?: CacheDurationType;
}

export interface CachedItem<T> {
  value: T;
  expiry: number;
  timestamp: number;
}

export interface CacheMetaInfo {
  fromCache: boolean;
  request: Request;
  cacheKey: string;
  timestamp: number;
}

export interface CacheStorageConfig {
  maxAge: number;
  default?: boolean;
  volatileKeys?: string[];
  persistentKeys?: string[];
}

export interface CacheInvalidationPattern {
  pattern: RegExp;
  storage?: CacheStorageType;
  test: (value: string) => boolean;
}

export interface CacheInvalidationConfig {
  workspace: (RegExp | CacheInvalidationPattern)[];
  auth: (RegExp | CacheInvalidationPattern)[];
  leads: (RegExp | CacheInvalidationPattern)[];
  members: (RegExp | CacheInvalidationPattern)[];
  tags: (RegExp | CacheInvalidationPattern)[];
}

export type CacheKeyPrefix =
  | "auth"
  | "workspace"
  | "leads"
  | "members"
  | "tags"
  | "analytics";

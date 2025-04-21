import { CacheInvalidationConfig, CacheStorageConfig } from "../types/cache";

/**
 * Centralized cache configuration for the application
 */
export const CACHE_CONFIG = {
  // Default cache durations (in seconds)
  durations: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400, // 24 hours
  },

  // Cache storage strategies with data volatility and access pattern considerations
  // Added compression configuration
  compression: {
    enabled: true,
    threshold: 1024 * 10, // Compress objects larger than 10KB
    algorithm: 'gzip',
    excludePatterns: [
      /^analytics:raw/,  // Raw analytics data
      /^workspace:.*:binary/  // Binary files
    ]
  },

  storage: {
    // Volatile memory cache for frequently changing and accessed data
    memory: {
      default: true,
      maxAge: 300, // 5 minutes
      volatileKeys: ["leads:", "analytics:", "workspace:.*:activities"], // Keys that change frequently
      persistentKeys: ["workspace:.*:settings"], // Frequently accessed settings
      compressionEnabled: true,  // Enable compression for memory cache
    } as CacheStorageConfig,
    // Session storage for user-specific data with medium volatility
    session: {
      maxAge: 3600, // 1 hour
      volatileKeys: ["workspace:.*:members"], // Team member updates
      persistentKeys: ["auth:", "workspace:"], // User session data
    } as CacheStorageConfig,
    // Local storage for stable, infrequently changing data
    local: {
      maxAge: 86400, // 24 hours
      volatileKeys: ["members:.*:activities"], // Member activity logs
      persistentKeys: ["tags:", "members:.*:profile"], // Static reference data
    } as CacheStorageConfig,
  },

  // Cache keys prefixes with data type context
  keyPrefixes: {
    auth: "auth:",
    workspace: "workspace:",
    leads: "leads:",
    members: "members:",
    tags: "tags:",
    analytics: "analytics:",
  },

  // Granular cache invalidation patterns with related data dependencies
  invalidationPatterns: {
    workspace: [
      /^workspace:/,
      /^workspace:.*:members$/,
      /^workspace:.*:settings$/,
      /^workspace:.*:activities$/,
      { pattern: /^leads:/, storage: "memory" },
      { pattern: /^members:/, storage: "session" },
    ],
    auth: [
      /^auth:/,
      /^auth:.*:session$/,
      /^auth:.*:permissions$/,
      { pattern: /^workspace:.*:members$/, storage: "session" },
    ],
    leads: [
      /^leads:/,
      /^leads:.*:details$/,
      /^leads:.*:activities$/,
      { pattern: /^analytics:leads/, storage: "memory" },
      { pattern: /^workspace:.*:activities$/, storage: "memory" },
    ],
    members: [
      /^members:/,
      /^members:.*:profile$/,
      /^members:.*:activities$/,
      { pattern: /^analytics:members/, storage: "memory" },
      { pattern: /^workspace:.*:members$/, storage: "session" },
    ],
    tags: [
      /^tags:/,
      /^tags:.*:metadata$/,
      { pattern: /^workspace:.*:settings$/, storage: "memory" },
    ],
    // Added analytics configuration
    analytics: {
      enabled: true,
      metrics: {
        hitRate: true,
        missRate: true,
        evictionRate: true,
        compressionRatio: true
      },
      sampling: {
        enabled: true,
        rate: 0.1 
      },
      retention: {
        duration: 86400 * 7,  
        aggregation: 300  
      }
    },
  } as CacheInvalidationConfig,
};

/**
 * Generate a cache key with the appropriate prefix
 */
export function generateCacheKey(
  type: keyof typeof CACHE_CONFIG.keyPrefixes,
  identifier: string
): string {
  return `${CACHE_CONFIG.keyPrefixes[type]}${identifier}`;
}

/**
 * Get the appropriate cache duration based on the data type
 */
export function getCacheDuration(
  type: "short" | "medium" | "long" | "day"
): number {
  return CACHE_CONFIG.durations[type];
}

/**
 * Get the appropriate storage type based on the data characteristics
 */
export function getCacheStorage(
  type: "memory" | "session" | "local"
): CacheStorageConfig {
  return CACHE_CONFIG.storage[type];
}

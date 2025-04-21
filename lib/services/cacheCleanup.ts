import { CacheStorageType, CachedItem } from "../types/cache";
import { cacheMonitoring } from "../utils/cacheUtils";

interface LRUNode<T> {
  key: string;
  value: CachedItem<T>;
  prev: LRUNode<T> | null;
  next: LRUNode<T> | null;
}

class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, LRUNode<T>>;
  private head: LRUNode<T> | null;
  private tail: LRUNode<T> | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key: string): CachedItem<T> | undefined {
    const node = this.cache.get(key);
    if (node) {
      this.moveToFront(node);
      return node.value;
    }
    return undefined;
  }

  put(key: string, value: CachedItem<T>): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      existingNode.value = value;
      this.moveToFront(existingNode);
    } else {
      const newNode: LRUNode<T> = {
        key,
        value,
        prev: null,
        next: null,
      };

      if (this.cache.size >= this.capacity) {
        this.evictLRU();
      }

      this.cache.set(key, newNode);
      this.addToFront(newNode);
    }
  }

  private moveToFront(node: LRUNode<T>): void {
    if (node === this.head) return;

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;

    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
  }

  private addToFront(node: LRUNode<T>): void {
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
  }

  private evictLRU(): void {
    if (!this.tail) return;

    const key = this.tail.key;
    this.cache.delete(key);

    if (this.tail.prev) {
      this.tail.prev.next = null;
      this.tail = this.tail.prev;
    } else {
      this.head = null;
      this.tail = null;
    }
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  size(): number {
    return this.cache.size;
  }
}

class CacheCleanupService {
  private static instance: CacheCleanupService;
  private memoryCacheLRU: LRUCache<unknown>;
  private readonly MEMORY_CACHE_LIMIT = 1000; // Maximum items in memory cache
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.memoryCacheLRU = new LRUCache<unknown>(this.MEMORY_CACHE_LIMIT);
    this.startPeriodicCleanup();
  }

  public static getInstance(): CacheCleanupService {
    if (!CacheCleanupService.instance) {
      CacheCleanupService.instance = new CacheCleanupService();
    }
    return CacheCleanupService.instance;
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredItems();
    }, this.CLEANUP_INTERVAL);
  }

  public cleanupExpiredItems(): void {
    const now = Date.now();

    // Clean memory cache
    this.cleanStorage("memory", now);

    // Clean session storage
    this.cleanStorage("session", now);

    // Clean local storage
    this.cleanStorage("local", now);
  }

  private cleanStorage(storage: CacheStorageType, now: number): void {
    try {
      if (storage === "memory") {
        // Memory cache cleanup using LRU
        // Implementation handled by LRUCache class
        return;
      }

      const storageObj = storage === "local" ? localStorage : sessionStorage;
      let evictionCount = 0;

      for (let i = storageObj.length - 1; i >= 0; i--) {
        const key = storageObj.key(i);
        if (!key) continue;

        try {
          const item = JSON.parse(storageObj.getItem(key) || "");
          if (item.expiry && item.expiry < now) {
            storageObj.removeItem(key);
            evictionCount++;
          }
        } catch (error) {
          console.error(`Error parsing cache item: ${key}`, error);
          storageObj.removeItem(key);
          evictionCount++;
        }
      }

      if (evictionCount > 0) {
        cacheMonitoring.recordEviction(storage);
      }
    } catch (error) {
      console.error(`Error cleaning ${storage} storage:`, error);
    }
  }

  public addToMemoryCache<T>(key: string, value: CachedItem<T>): void {
    this.memoryCacheLRU.put(key, value);
    cacheMonitoring.updateSize("memory", this.memoryCacheLRU.size());
  }

  public getFromMemoryCache<T>(key: string): CachedItem<T> | undefined {
    return this.memoryCacheLRU.get(key) as CachedItem<T> | undefined;
  }

  public clearMemoryCache(): void {
    this.memoryCacheLRU.clear();
    cacheMonitoring.updateSize("memory", 0);
  }
}

export const cacheCleanup = CacheCleanupService.getInstance();

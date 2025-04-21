import { CacheStorageType } from "../types/cache";

class CacheMonitoringService {
  private static instance: CacheMonitoringService;
  private metrics: {
    hits: Map<CacheStorageType, number>;
    misses: Map<CacheStorageType, number>;
    latency: Map<CacheStorageType, number[]>;
    evictions: Map<CacheStorageType, number>;
    size: Map<CacheStorageType, number>;
  };

  private constructor() {
    this.metrics = {
      hits: new Map(),
      misses: new Map(),
      latency: new Map(),
      evictions: new Map(),
      size: new Map(),
    };
  }

  public static getInstance(): CacheMonitoringService {
    if (!CacheMonitoringService.instance) {
      CacheMonitoringService.instance = new CacheMonitoringService();
    }
    return CacheMonitoringService.instance;
  }

  public recordHit(storage: CacheStorageType, latency: number): void {
    const currentHits = this.metrics.hits.get(storage) || 0;
    this.metrics.hits.set(storage, currentHits + 1);

    const latencies = this.metrics.latency.get(storage) || [];
    latencies.push(latency);
    this.metrics.latency.set(storage, latencies);
  }

  public recordMiss(storage: CacheStorageType): void {
    const currentMisses = this.metrics.misses.get(storage) || 0;
    this.metrics.misses.set(storage, currentMisses + 1);
  }

  public recordEviction(storage: CacheStorageType): void {
    const currentEvictions = this.metrics.evictions.get(storage) || 0;
    this.metrics.evictions.set(storage, currentEvictions + 1);
  }

  public updateSize(storage: CacheStorageType, size: number): void {
    this.metrics.size.set(storage, size);
  }

  public getMetrics(storage: CacheStorageType) {
    return {
      hits: this.metrics.hits.get(storage) || 0,
      misses: this.metrics.misses.get(storage) || 0,
      evictions: this.metrics.evictions.get(storage) || 0,
      size: this.metrics.size.get(storage) || 0,
      latency: {
        average: this.calculateAverageLatency(storage),
        p95: this.calculateP95Latency(storage),
      },
    };
  }

  private calculateAverageLatency(storage: CacheStorageType): number {
    const latencies = this.metrics.latency.get(storage) || [];
    if (latencies.length === 0) return 0;
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  private calculateP95Latency(storage: CacheStorageType): number {
    const latencies = this.metrics.latency.get(storage) || [];
    if (latencies.length === 0) return 0;
    const sorted = [...latencies].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[index];
  }

  public resetMetrics(): void {
    this.metrics = {
      hits: new Map(),
      misses: new Map(),
      latency: new Map(),
      evictions: new Map(),
      size: new Map(),
    };
  }
}

export const cacheMonitoring = CacheMonitoringService.getInstance();

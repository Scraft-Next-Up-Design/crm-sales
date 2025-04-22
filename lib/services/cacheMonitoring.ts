import { CacheStorageType } from "../types/cache";

class CacheMonitoringService {
  private static instance: CacheMonitoringService;
  private metrics: {
    hits: Map<CacheStorageType, number>;
    misses: Map<CacheStorageType, number>;
    latency: Map<CacheStorageType, number[]>;
    evictions: Map<CacheStorageType, number>;
    size: Map<CacheStorageType, number>;
    networkChanges: Array<{
      timestamp: number;
      metrics: {
        rtt: number;
        downlink: number;
        effectiveType: string;
        saveData: boolean;
      };
    }>;
    networkQuality: {
      degradationCount: number;
      lastDegradationTime: number | null;
      previousRTT: number | null;
    };
  };

  private constructor() {
    this.metrics = {
      hits: new Map(),
      misses: new Map(),
      latency: new Map(),
      evictions: new Map(),
      size: new Map(),
      networkChanges: [],
      networkQuality: {
        degradationCount: 0,
        lastDegradationTime: null,
        previousRTT: null,
      },
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
      networkChanges: [],
      networkQuality: {
        degradationCount: 0,
        lastDegradationTime: null,
        previousRTT: null,
      },
    };
  }

  public recordNetworkChange(metrics: {
    rtt: number;
    downlink: number;
    effectiveType: string;
    saveData: boolean;
  }): void {
    const timestamp = Date.now();
    this.metrics.networkChanges.push({
      timestamp,
      metrics,
    });

    this.detectNetworkDegradation(metrics.rtt, timestamp);
  }

  private detectNetworkDegradation(
    currentRTT: number,
    timestamp: number
  ): void {
    const { previousRTT, lastDegradationTime } = this.metrics.networkQuality;
    const recentChanges = this.getRecentNetworkChanges(1200000); 

    if (previousRTT !== null && recentChanges.length >= 3) {
      const rtts = recentChanges.map((change) => change.metrics.rtt);
      const avgRTT = rtts.reduce((a, b) => a + b, 0) / rtts.length;
      const stdDev = Math.sqrt(
        rtts.reduce((acc, rtt) => acc + Math.pow(rtt - avgRTT, 2), 0) /
          rtts.length
      );

      const recentTrend = this.calculateRTTTrend(recentChanges);
      const varianceCoefficient = Math.max(0.6, Math.min(2.5, stdDev / avgRTT));
      const trendAdjustment = recentTrend > 0 ? 0.2 : 0; 
      const RTT_DEGRADATION_THRESHOLD =
        1.4 + varianceCoefficient + trendAdjustment;

      const MIN_DEGRADATION_INTERVAL = 420000; 
      const SEVERE_DEGRADATION_MULTIPLIER = 2.5;

      const degradationSeverity = currentRTT / previousRTT;
      const isSevereDegradation =
        degradationSeverity > SEVERE_DEGRADATION_MULTIPLIER;

      if (
        currentRTT > previousRTT * RTT_DEGRADATION_THRESHOLD ||
        isSevereDegradation
      ) {
        const canRecordDegradation =
          !lastDegradationTime ||
          timestamp - lastDegradationTime >=
            (isSevereDegradation
              ? MIN_DEGRADATION_INTERVAL / 2
              : MIN_DEGRADATION_INTERVAL);

        if (canRecordDegradation) {
          this.metrics.networkQuality.degradationCount++;
          this.metrics.networkQuality.lastDegradationTime = timestamp;
        }
      }
    }

    this.metrics.networkQuality.previousRTT = currentRTT;
  }

  private calculateRTTTrend(
    changes: Array<{
      timestamp: number;
      metrics: { rtt: number };
    }>
  ): number {
    if (changes.length < 2) return 0;

    const sortedChanges = [...changes].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    let trendSum = 0;

    for (let i = 1; i < sortedChanges.length; i++) {
      const rttDiff =
        sortedChanges[i].metrics.rtt - sortedChanges[i - 1].metrics.rtt;
      const timeDiff =
        sortedChanges[i].timestamp - sortedChanges[i - 1].timestamp;
      trendSum += rttDiff / timeDiff;
    }

    return trendSum / (sortedChanges.length - 1);
  }

  public getNetworkQualityMetrics() {
    const recentChanges = this.getRecentNetworkChanges();
    return {
      degradationCount: this.metrics.networkQuality.degradationCount,
      lastDegradationTime: this.metrics.networkQuality.lastDegradationTime,
      averageRTT: this.calculateAverageRTTFromChanges(recentChanges),
      stabilityScore: this.calculateNetworkStability(recentChanges),
    };
  }

  private getRecentNetworkChanges(timeWindow: number = 3600000): Array<{
    timestamp: number;
    metrics: {
      rtt: number;
      downlink: number;
      effectiveType: string;
      saveData: boolean;
    };
  }> {
    const now = Date.now();
    return this.metrics.networkChanges.filter(
      (change) => now - change.timestamp <= timeWindow
    );
  }

  private calculateAverageRTTFromChanges(
    changes: Array<{
      timestamp: number;
      metrics: { rtt: number };
    }>
  ): number {
    if (changes.length === 0) return 0;
    const sum = changes.reduce((acc, change) => acc + change.metrics.rtt, 0);
    return sum / changes.length;
  }

  private calculateNetworkStability(
    changes: Array<{
      timestamp: number;
      metrics: { rtt: number; effectiveType: string };
    }>
  ): number {
    if (changes.length < 2) return 1;

    let stabilityScore = 1;
    const RTT_VARIANCE_WEIGHT = 0.6;
    const CONNECTION_TYPE_CHANGES_WEIGHT = 0.4;

    // Calculate RTT variance
    const rtts = changes.map((change) => change.metrics.rtt);
    const avgRTT = rtts.reduce((a, b) => a + b, 0) / rtts.length;
    const variance =
      rtts.reduce((acc, rtt) => acc + Math.pow(rtt - avgRTT, 2), 0) /
      rtts.length;
    const normalizedVariance = Math.min(variance / 10000, 1); // Normalize to 0-1 range

    // Calculate connection type changes
    let typeChanges = 0;
    for (let i = 1; i < changes.length; i++) {
      if (
        changes[i].metrics.effectiveType !==
        changes[i - 1].metrics.effectiveType
      ) {
        typeChanges++;
      }
    }
    const normalizedTypeChanges = Math.min(
      typeChanges / (changes.length - 1),
      1
    );

    stabilityScore =
      1 -
      (normalizedVariance * RTT_VARIANCE_WEIGHT +
        normalizedTypeChanges * CONNECTION_TYPE_CHANGES_WEIGHT);

    return Math.max(0, Math.min(1, stabilityScore));
  }
}

export const cacheMonitoring = CacheMonitoringService.getInstance();

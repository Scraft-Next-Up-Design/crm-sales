import { cacheMonitoring } from "./cacheMonitoring";

interface NetworkSpeedMetrics {
  rtt: number;
  downlink: number;
  effectiveType: string;
  saveData: boolean;
}

interface NetworkConditionThresholds {
  slow: { maxDownlink: number; maxRTT: number };
  medium: { maxDownlink: number; maxRTT: number };
}

class NetworkSpeedService {
  private static instance: NetworkSpeedService;
  private metrics: NetworkSpeedMetrics = {
    rtt: 0,
    downlink: 0,
    effectiveType: "4g",
    saveData: false,
  };

  private readonly thresholds: NetworkConditionThresholds = {
    slow: { maxDownlink: 1.5, maxRTT: 2000 }, // Optimized for better user experience
    medium: { maxDownlink: 4, maxRTT: 1000 }, // Adjusted for modern networks
  };

  private rttHistory: Array<{ rtt: number; timestamp: number }> = [];
  private readonly RTT_HISTORY_WINDOW = 300000; // 5 minutes for more responsive adaptation
  private readonly RTT_WEIGHT_DECAY = 0.95; // Increased for better responsiveness
  private readonly MIN_RTT_SAMPLES = 2; // Reduced for faster initial metrics
  private readonly PERFORMANCE_MONITOR_INTERVAL = 30000; // Monitor every 30 seconds

  private constructor() {
    this.initializeMetrics();
    this.setupEventListeners();
  }

  public static getInstance(): NetworkSpeedService {
    if (!NetworkSpeedService.instance) {
      NetworkSpeedService.instance = new NetworkSpeedService();
    }
    return NetworkSpeedService.instance;
  }

  private initializeMetrics(): void {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      this.updateMetrics({
        rtt: connection.rtt,
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        saveData: connection.saveData,
      });
    }
  }

  private setupEventListeners(): void {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener("change", () => {
        this.updateMetrics({
          rtt: connection.rtt,
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          saveData: connection.saveData,
        });
        cacheMonitoring.recordNetworkChange(this.metrics);
      });
    }
  }

  private updateMetrics(newMetrics: NetworkSpeedMetrics): void {
    this.metrics = newMetrics;
    this.updateRTTHistory(newMetrics.rtt);
  }

  private updateRTTHistory(rtt: number): void {
    const now = Date.now();
    // Remove entries older than window
    this.rttHistory = this.rttHistory.filter(
      (entry) => now - entry.timestamp <= this.RTT_HISTORY_WINDOW
    );
    this.rttHistory.push({ rtt, timestamp: now });
  }

  private getMovingAverageRTT(): number {
    if (this.rttHistory.length < this.MIN_RTT_SAMPLES) return this.metrics.rtt;

    const now = Date.now();
    let weightedSum = 0;
    let weightSum = 0;

    // Sort by timestamp to prioritize recent measurements
    const sortedHistory = [...this.rttHistory].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    sortedHistory.forEach((entry) => {
      const age = (now - entry.timestamp) / this.RTT_HISTORY_WINDOW;
      const weight = Math.pow(this.RTT_WEIGHT_DECAY, age);
      // Apply additional weight based on network type reliability
      const typeWeight = this.getNetworkTypeWeight(this.metrics.effectiveType);
      const finalWeight = weight * typeWeight;

      weightedSum += entry.rtt * finalWeight;
      weightSum += finalWeight;
    });

    return weightedSum / weightSum;
  }

  private getNetworkTypeWeight(effectiveType: string): number {
    // Assign weights based on connection reliability
    switch (effectiveType) {
      case "4g":
        return 1.0;
      case "3g":
        return 0.8;
      case "2g":
        return 0.6;
      case "slow-2g":
        return 0.4;
      default:
        return 0.7; // Unknown connection types
    }
  }

  public getNetworkCondition(): "slow" | "medium" | "fast" {
    const { effectiveType, downlink } = this.metrics;
    const avgRTT = this.getMovingAverageRTT();

    if (
      effectiveType === "slow-2g" ||
      effectiveType === "2g" ||
      downlink <= this.thresholds.slow.maxDownlink ||
      avgRTT >= this.thresholds.slow.maxRTT
    ) {
      return "slow";
    } else if (
      effectiveType === "3g" ||
      downlink <= this.thresholds.medium.maxDownlink ||
      avgRTT >= this.thresholds.medium.maxRTT
    ) {
      return "medium";
    } else {
      return "fast";
    }
  }

  public getOptimalCacheTime(): number {
    const condition = this.getNetworkCondition();
    switch (condition) {
      case "slow":
        return 300; // 5 minutes for slow connections
      case "medium":
        return 180; // 3 minutes for medium connections
      case "fast":
        return 60; // 1 minute for fast connections
    }
  }

  public getOptimalTimeout(): number {
    const avgRTT = this.getMovingAverageRTT();
    const networkCondition = this.getNetworkCondition();
    const baseMultiplier =
      networkCondition === "slow" ? 5 : networkCondition === "medium" ? 4 : 3;

    // Base timeout on moving average RTT with dynamic multiplier
    return Math.min(Math.max(avgRTT * baseMultiplier, 5000), 30000);
  }

  public shouldUsePersistentCache(): boolean {
    return this.metrics.saveData || this.getNetworkCondition() === "slow";
  }

  public getMetrics(): NetworkSpeedMetrics {
    return { ...this.metrics };
  }
}

export const networkSpeed = NetworkSpeedService.getInstance();

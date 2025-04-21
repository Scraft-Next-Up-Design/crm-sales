import { CacheStorageType } from "../types/cache";

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
}

enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

class CircuitBreaker {
  private state: CircuitState;
  private failureCount: number;
  private lastFailureTime: number;
  private readonly config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.config = config;
  }

  public async execute<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    if (this.shouldAllowRequest()) {
      try {
        const result = await operation();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        return fallback();
      }
    }
    return fallback();
  }

  private shouldAllowRequest(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      const timeoutExpired =
        Date.now() - this.lastFailureTime >= this.config.resetTimeout;
      if (timeoutExpired) {
        this.state = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }

    return true; // HALF_OPEN state allows limited requests
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  public getState(): CircuitState {
    return this.state;
  }
}

class CacheErrorRecoveryService {
  private static instance: CacheErrorRecoveryService;
  private circuitBreakers: Map<CacheStorageType, CircuitBreaker>;
  private retryDelays: number[];
  private readonly MAX_RETRIES = 3;

  private constructor() {
    this.circuitBreakers = new Map();
    this.retryDelays = [1000, 2000, 4000]; // Exponential backoff

    // Initialize circuit breakers for each storage type
    const storageTypes: CacheStorageType[] = [
      "memory",
      "session",
      "local",
    ] as const;
    storageTypes.forEach((storage) => {
      this.circuitBreakers.set(
        storage,
        new CircuitBreaker({
          failureThreshold: 5,
          resetTimeout: 30000, // 30 seconds
        })
      );
    });
  }

  public static getInstance(): CacheErrorRecoveryService {
    if (!CacheErrorRecoveryService.instance) {
      CacheErrorRecoveryService.instance = new CacheErrorRecoveryService();
    }
    return CacheErrorRecoveryService.instance;
  }

  public async executeWithRecovery<T>(
    storage: CacheStorageType,
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakers.get(storage);
    if (!circuitBreaker) {
      throw new Error(`No circuit breaker found for storage: ${storage}`);
    }

    return circuitBreaker.execute<T>(
      () => this.executeWithRetry(operation),
      fallback
    );
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.MAX_RETRIES) {
        throw error;
      }

      await this.delay(this.retryDelays[retryCount]);
      return this.executeWithRetry(operation, retryCount + 1);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getCircuitBreakerState(storage: CacheStorageType): CircuitState {
    return this.circuitBreakers.get(storage)?.getState() || CircuitState.CLOSED;
  }
}

export const cacheErrorRecovery = CacheErrorRecoveryService.getInstance();

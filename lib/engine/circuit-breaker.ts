import type { CircuitBreakerConfig, CircuitState, Request, Response, NextFn } from './types';

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 30000,
  halfOpenMaxAttempts: 3,
  monitoringPeriod: 60000,
};

export class TighCircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;
  private totalTrips = 0;
  private stateChangeCallbacks: Array<(state: CircuitState) => void> = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getState(): CircuitState {
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.config.recoveryTimeout) {
        this.transitionTo('half-open');
      }
    }
    return this.state;
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === 'closed') {
      this.failures = 0;
      this.successes = 0;
      this.halfOpenAttempts = 0;
    } else if (newState === 'open') {
      this.totalTrips++;
      this.lastFailureTime = Date.now();
    } else if (newState === 'half-open') {
      this.halfOpenAttempts = 0;
    }

    if (oldState !== newState) {
      for (const cb of this.stateChangeCallbacks) {
        cb(newState);
      }
    }
  }

  recordSuccess(): void {
    this.successes++;

    if (this.state === 'half-open') {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        this.transitionTo('closed');
      }
    } else if (this.state === 'closed') {
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      this.transitionTo('open');
    } else if (this.state === 'closed') {
      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo('open');
      }
    }
  }

  canExecute(): boolean {
    const currentState = this.getState();
    if (currentState === 'closed') return true;
    if (currentState === 'half-open') return this.halfOpenAttempts < this.config.halfOpenMaxAttempts;
    return false;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new CircuitOpenError(
        `Circuit breaker is open. Retry after ${this.getRetryAfter()}ms`,
        this.getRetryAfter()
      );
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  getRetryAfter(): number {
    if (this.state !== 'open') return 0;
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.config.recoveryTimeout - elapsed);
  }

  onStateChange(callback: (state: CircuitState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      const idx = this.stateChangeCallbacks.indexOf(callback);
      if (idx > -1) this.stateChangeCallbacks.splice(idx, 1);
    };
  }

  getStats() {
    return {
      state: this.getState(),
      failures: this.failures,
      successes: this.successes,
      totalTrips: this.totalTrips,
    };
  }

  reset(): void {
    this.transitionTo('closed');
  }
}

export class CircuitOpenError extends Error {
  retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'CircuitOpenError';
    this.retryAfter = retryAfter;
  }
}

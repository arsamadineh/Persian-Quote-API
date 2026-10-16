import type { CircuitBreakerConfig, CircuitBreakerStats, CircuitState } from '../types';

/**
 * CircuitOpenError thrown when the circuit is OPEN and a call is rejected.
 */
export class CircuitOpenError extends Error {
  readonly retryAfter: number;
  constructor(retryAfter: number) {
    super('Circuit breaker is open');
    this.name = 'CircuitOpenError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Circuit breaker with closed / open / half-open states. On OPEN, calls are
 * rejected immediately until recoveryTimeout elapses, then the circuit moves
 * to HALF-OPEN and allows up to halfOpenMaxAttempts trial calls. Any failure
 * trips it back to OPEN; full success closes it.
 */
export class TighCircuitBreaker {
  private readonly config: CircuitBreakerConfig;
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private totalTrips = 0;
  private halfOpenAttempts = 0;
  private lastFailureTime = 0;
  private stateEnteredAt = Date.now();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      halfOpenMaxAttempts: 3,
      monitoringPeriod: 60000,
      ...config,
    };
  }

  private now(): number {
    return Date.now();
  }

  private transition(state: CircuitState): void {
    this.state = state;
    this.stateEnteredAt = this.now();
    this.halfOpenAttempts = 0;
    if (state === 'closed') {
      this.failures = 0;
      this.successes = 0;
    }
  }

  canExecute(): boolean {
    const now = this.now();
    if (this.state === 'closed') return true;
    if (this.state === 'open') {
      if (now - this.stateEnteredAt >= this.config.recoveryTimeout!) {
        this.transition('half-open');
        return true;
      }
      return false;
    }
    // half-open: allow limited trial attempts.
    return this.halfOpenAttempts < this.config.halfOpenMaxAttempts!;
  }

  async execute<T>(fn: () => Promise<T> | T): Promise<T> {
    if (!this.canExecute()) {
      const retryAfter = Math.max(
        1,
        Math.ceil((this.stateEnteredAt + this.config.recoveryTimeout! - this.now()) / 1000)
      );
      throw new CircuitOpenError(retryAfter);
    }

    if (this.state === 'half-open') this.halfOpenAttempts++;

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordSuccess(): void {
    this.successes++;
    if (this.state === 'half-open') {
      // Enough successes in half-open closes the circuit.
      if (this.successes >= this.config.halfOpenMaxAttempts!) {
        this.transition('closed');
      }
    }
    // In closed state, successes gradually erode the failure count.
    if (this.state === 'closed' && this.failures > 0) {
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = this.now();
    if (this.state === 'half-open') {
      this.totalTrips++;
      this.transition('open');
      return;
    }
    if (this.state === 'closed' && this.failures >= this.config.failureThreshold!) {
      this.totalTrips++;
      this.transition('open');
    }
  }

  getRetryAfter(): number | null {
    if (this.state !== 'open') return null;
    const retryAfter = Math.ceil(
      (this.stateEnteredAt + this.config.recoveryTimeout! - this.now()) / 1000
    );
    return Math.max(1, retryAfter);
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalTrips: this.totalTrips,
    };
  }

  reset(): void {
    this.transition('closed');
    this.totalTrips = 0;
  }
}

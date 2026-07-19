import { Tigh } from './engine';
import { registerRoutes } from './routes';

export const engine = new Tigh({
  enableMetrics: true,
  enableCache: true,
  enableRateLimit: true,
  enableCircuitBreaker: true,
  cache: {
    maxSize: 5000,
    defaultTTL: 30000,
    checkInterval: 15000,
  },
  rateLimit: {
    windowMs: 60000,
    maxRequests: 120,
    strategy: 'token-bucket',
  },
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    halfOpenMaxAttempts: 3,
    monitoringPeriod: 60000,
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Api-Key'],
    maxAge: 86400,
  },
});

// ثبت یک‌باره تمام اندپوینت‌ها روی موتور (هنگام بارگذاری ماژول)
registerRoutes();

export { createNextHandler } from './adapter-next';
export default engine;

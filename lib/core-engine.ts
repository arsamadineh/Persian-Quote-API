import { createAppEngine } from '@persian-quote/core';

/**
 * Singleton application engine with all /v1 and legacy /api routes registered.
 * Shared across Next.js route handlers.
 */
export const engine = createAppEngine();

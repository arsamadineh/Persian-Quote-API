import { createNextHandler } from '@persian-quote/core/adapters/next';
import { engine } from '../../../lib/core-engine';
export const GET = createNextHandler(engine);
export const HEAD = createNextHandler(engine);
export const OPTIONS = createNextHandler(engine);

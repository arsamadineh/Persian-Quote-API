import { createAppEngine } from '../packages/core/src/app.ts';
import { createBunHandler } from '../packages/core/src/adapters/bun.ts';

const engine = createAppEngine();
const port = Number(process.env.PORT || 8787);

console.log(`Persian Quote API listening on http://localhost:${port}`);

Bun.serve({
  port,
  fetch: createBunHandler(engine),
});

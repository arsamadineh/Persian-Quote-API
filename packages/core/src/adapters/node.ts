import http from 'node:http';
import { TighEngine } from '../index';

/**
 * Node.js HTTP adapter.
 *   http.createServer(createNodeHandler(engine)).listen(3000);
 */
export function createNodeHandler(engine: TighEngine) {
  return (req: http.IncomingMessage, res: http.ServerResponse): void => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const bodyChunks: Buffer[] = [];
    req.on('data', (c) => bodyChunks.push(c));
    req.on('end', async () => {
      const init: RequestInit = {
        method: req.method as any,
        headers: req.headers as Record<string, string>,
        body: bodyChunks.length ? Buffer.concat(bodyChunks) : undefined,
      };
      const response = await engine.fetch(new Request(url.toString(), init));
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      const body = await response.arrayBuffer();
      res.end(Buffer.from(body));
    });
  };
}

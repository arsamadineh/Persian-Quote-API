import type { MiddlewareFn, Request, Response, NextFn } from './types';

export class TighMiddleware {
  private middlewares: MiddlewareFn[] = [];

  use(middleware: MiddlewareFn): void {
    this.middlewares.push(middleware);
  }

  add(middleware: MiddlewareFn): void {
    this.middlewares.push(middleware);
  }

  remove(middleware: MiddlewareFn): void {
    const idx = this.middlewares.indexOf(middleware);
    if (idx > -1) {
      this.middlewares.splice(idx, 1);
    }
  }

  async execute(req: Request, finalHandler: NextFn): Promise<Response> {
    let index = 0;
    const middlewares = this.middlewares;

    const next: NextFn = async (): Promise<Response> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        return middleware(req, next);
      }
      return finalHandler();
    };

    return next();
  }

  get length(): number {
    return this.middlewares.length;
  }

  clear(): void {
    this.middlewares = [];
  }
}

export function corsMiddleware(config: {
  origin: string | string[];
  methods: string[];
  headers: string[];
  maxAge: number;
}): MiddlewareFn {
  return async (req: Request, next: NextFn) => {
    if (req.method === 'OPTIONS') {
      const origin = Array.isArray(config.origin) ? config.origin[0] : config.origin;
      const corsHeaders: Record<string, string> = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': config.methods.join(', '),
        'Access-Control-Allow-Headers': config.headers.join(', '),
        'Access-Control-Max-Age': String(config.maxAge),
      };
      return {
        status: 204,
        headers: corsHeaders,
        body: null,
      };
    }

    const response = await next();
    const origin = Array.isArray(config.origin) ? config.origin[0] : config.origin;

    return {
      ...response,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': config.methods.join(', '),
        'Access-Control-Allow-Headers': config.headers.join(', '),
      },
    };
  };
}

export function timingMiddleware(): MiddlewareFn {
  return async (req: Request, next: NextFn) => {
    const start = performance.now();
    const response = await next();
    const duration = performance.now() - start;

    return {
      ...response,
      headers: {
        ...response.headers,
        'X-Response-Time': `${duration.toFixed(2)}ms`,
        'X-Request-Id': req.headers['x-request-id'] || crypto.randomUUID(),
      },
    };
  };
}

export function compressMiddleware(): MiddlewareFn {
  return async (req: Request, next: NextFn) => {
    const response = await next();
    const acceptEncoding = req.headers['accept-encoding'] || '';

    if (typeof response.body === 'string' && response.body.length > 1024) {
      if (acceptEncoding.includes('gzip')) {
        const compressed = await compressGzip(response.body);
        return {
          ...response,
          headers: {
            ...response.headers,
            'Content-Encoding': 'gzip',
            'Content-Length': String(compressed.byteLength),
          },
          body: compressed,
        };
      }
    }

    return response;
  };
}

async function compressGzip(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CS = (globalThis as any).CompressionStream;
  if (typeof CS !== 'undefined') {
    const cs = new CS('gzip');
    const writer = cs.writable.getWriter();
    writer.write(buffer);
    writer.close();

    const reader = cs.readable.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  return buffer;
}

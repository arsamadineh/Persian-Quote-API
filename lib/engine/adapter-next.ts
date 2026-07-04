import type { Tigh } from './engine';
import type { HttpMethod, Request as TighRequest } from './types';

export function createNextHandler(engine: Tigh) {
  return async function handleRequest(
    request: Request,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method as HttpMethod;

    let params: Record<string, string> = {};
    if (context?.params) {
      params = await context.params;
    }

    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let body: unknown = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const contentType = headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          body = await request.json();
        } else if (contentType.includes('form-data') || contentType.includes('x-www-form-urlencoded')) {
          body = await request.formData();
        } else {
          body = await request.text();
        }
      } catch {
        body = undefined;
      }
    }

    const tighReq: TighRequest = {
      method,
      path: url.pathname,
      headers,
      query,
      params,
      body,
      ip: headers['x-forwarded-for'] || headers['x-real-ip'] || '127.0.0.1',
      timestamp: Date.now(),
    };

    const tighRes = await engine.handle(method, url.pathname, tighReq);

    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(tighRes.headers)) {
      if (value !== undefined && value !== null) {
        responseHeaders.set(key, String(value));
      }
    }

    if (!responseHeaders.has('Content-Type')) {
      responseHeaders.set('Content-Type', 'application/json');
    }

    let responseBody: string | null = null;
    if (tighRes.body !== null && tighRes.body !== undefined) {
      if (typeof tighRes.body === 'string') {
        responseBody = tighRes.body;
      } else if (tighRes.body instanceof Uint8Array) {
        return new Response(tighRes.body, { status: tighRes.status, headers: responseHeaders });
      } else {
        responseBody = JSON.stringify(tighRes.body);
      }
    }

    return new Response(responseBody, {
      status: tighRes.status,
      headers: responseHeaders,
    });
  };
}

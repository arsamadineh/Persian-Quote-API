import type { HttpMethod, Route, RouteHandler, MiddlewareFn, Request, Response, RouteParams } from './types';

interface TrieNode {
  children: Map<string, TrieNode>;
  paramChild: TrieNode | null;
  paramName: string | null;
  wildcardChild: TrieNode | null;
  route: Route | null;
}

function createNode(): TrieNode {
  return {
    children: new Map(),
    paramChild: null,
    paramName: null,
    wildcardChild: null,
    route: null,
  };
}

export class TighRouter {
  private roots: Map<HttpMethod, TrieNode> = new Map();
  private notFoundHandler: RouteHandler = () => ({
    status: 404,
    headers: { 'Content-Type': 'application/json' },
    body: { error: 'Not Found', message: 'Route not found' },
  });

  constructor() {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as HttpMethod[]) {
      this.roots.set(method, createNode());
    }
  }

  addRoute(method: HttpMethod, path: string, handler: RouteHandler, middlewares: MiddlewareFn[] = []): void {
    const root = this.roots.get(method)!;
    const segments = path.split('/').filter(Boolean);
    let current = root;

    for (const segment of segments) {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1);
        if (!current.paramChild) {
          current.paramChild = createNode();
        }
        current.paramChild.paramName = paramName;
        current = current.paramChild;
      } else if (segment === '*') {
        if (!current.wildcardChild) {
          current.wildcardChild = createNode();
        }
        current = current.wildcardChild;
      } else {
        if (!current.children.has(segment)) {
          current.children.set(segment, createNode());
        }
        current = current.children.get(segment)!;
      }
    }

    current.route = { method, path, handler, middlewares };
  }

  match(method: HttpMethod, path: string): { route: Route; params: RouteParams } | null {
    const root = this.roots.get(method);
    if (!root) return null;

    const segments = path.split('/').filter(Boolean);
    const params: RouteParams = {};

    const result = this.matchNode(root, segments, 0, params);
    return result;
  }

  private matchNode(
    node: TrieNode,
    segments: string[],
    depth: number,
    params: RouteParams
  ): { route: Route; params: RouteParams } | null {
    if (depth === segments.length) {
      if (node.route) {
        return { route: node.route, params: { ...params } };
      }
      if (node.wildcardChild?.route) {
        return { route: node.wildcardChild.route, params: { ...params } };
      }
      return null;
    }

    const segment = segments[depth];

    const exactChild = node.children.get(segment);
    if (exactChild) {
      const result = this.matchNode(exactChild, segments, depth + 1, params);
      if (result) return result;
    }

    if (node.paramChild) {
      params[node.paramChild.paramName!] = segment;
      const result = this.matchNode(node.paramChild, segments, depth + 1, params);
      if (result) return result;
      delete params[node.paramChild.paramName!];
    }

    if (node.wildcardChild) {
      const remaining = segments.slice(depth).join('/');
      params['*'] = remaining;
      if (node.wildcardChild.route) {
        return { route: node.wildcardChild.route, params: { ...params } };
      }
    }

    return null;
  }

  setNotFound(handler: RouteHandler): void {
    this.notFoundHandler = handler;
  }

  getNotFoundHandler(): RouteHandler {
    return this.notFoundHandler;
  }

  getRoutes(): Route[] {
    const routes: Route[] = [];
    for (const root of this.roots.values()) {
      this.collectRoutes(root, routes);
    }
    return routes;
  }

  private collectRoutes(node: TrieNode, routes: Route[]): void {
    if (node.route) {
      routes.push(node.route);
    }
    for (const child of node.children.values()) {
      this.collectRoutes(child, routes);
    }
    if (node.paramChild) {
      this.collectRoutes(node.paramChild, routes);
    }
    if (node.wildcardChild) {
      this.collectRoutes(node.wildcardChild, routes);
    }
  }
}

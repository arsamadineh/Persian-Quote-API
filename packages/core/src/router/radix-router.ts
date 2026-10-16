import type { HttpMethod, Route, RouteHandler, MiddlewareFn, RouteParams } from '../types';

interface RadixNode {
  path: string;
  route: Route | null;
  children: Map<string, RadixNode>;
  paramChild: RadixNode | null;
  paramName: string | null;
  wildcardChild: RadixNode | null;
}

function createNode(): RadixNode {
  return {
    path: '',
    route: null,
    children: new Map(),
    paramChild: null,
    paramName: null,
    wildcardChild: null,
  };
}

/**
 * Length of the common prefix between two strings.
 */
function commonPrefixLen(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a.charCodeAt(i) === b.charCodeAt(i)) i++;
  return i;
}

export class TighRadixRouter {
  private roots: Map<HttpMethod, RadixNode> = new Map();
  private notFoundHandler: RouteHandler = () => ({
    status: 404,
    headers: { 'content-type': 'application/problem+json; charset=utf-8' },
    body: new TextEncoder().encode(
      JSON.stringify({ type: 'https://pq.arsamadineh.ir/problems/not-found', title: 'Not Found', status: 404, detail: 'Route not found' })
    ),
  });

  constructor() {
    for (const method of [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'HEAD',
      'OPTIONS',
    ] as HttpMethod[]) {
      this.roots.set(method, createNode());
    }
  }

  addRoute(
    method: HttpMethod,
    path: string,
    handler: RouteHandler,
    middlewares: MiddlewareFn[] = []
  ): void {
    const root = this.roots.get(method)!;
    const segments = path.split('/').filter(Boolean);
    insertSegments(root, segments, 0, { method, path, handler, middlewares });
  }

  match(method: HttpMethod, path: string): { route: Route; params: RouteParams } | null {
    const root = this.roots.get(method);
    if (!root) return null;

    const params: RouteParams = {};
    // Normalize: strip trailing slash for matching, but keep root handling.
    const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    const result = matchNode(root, normalized, 0, params);
    return result;
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
      collectRoutes(root, routes);
    }
    return routes;
  }
}

/* ------------------------------------------------------------------ */
/* Insertion                                                          */
/* ------------------------------------------------------------------ */

interface RouteDef {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middlewares: MiddlewareFn[];
}

function insertSegments(
  node: RadixNode,
  segments: string[],
  index: number,
  def: RouteDef
): void {
  if (index === segments.length) {
    node.route = def;
    return;
  }

  const seg = segments[index]!;

  // Parameter segment: [name]
  if (seg.length >= 3 && seg[0] === '[' && seg[seg.length - 1] === ']') {
    const paramName = seg.slice(1, -1);
    if (!node.paramChild) {
      node.paramChild = createNode();
      node.paramName = paramName;
    } else {
      // Reuse existing param child; keep first-seen name.
    }
    insertSegments(node.paramChild!, segments, index + 1, def);
    return;
  }

  // Wildcard segment: *
  if (seg === '*') {
    if (!node.wildcardChild) {
      node.wildcardChild = createNode();
    }
    insertSegments(node.wildcardChild!, segments, index + 1, def);
    return;
  }

  // Static segment: radix-insert compressed edge.
  insertStaticEdge(node, seg, segments, index + 1, def);
}

function insertStaticEdge(
  node: RadixNode,
  seg: string,
  segments: string[],
  nextIndex: number,
  def: RouteDef
): void {
  const first = seg[0];
  const child = node.children.get(first);

  if (!child) {
    const created = createNode();
    created.path = seg;
    node.children.set(first, created);
    insertSegments(created, segments, nextIndex, def);
    return;
  }

  const common = commonPrefixLen(seg, child.path);

  if (common === child.path.length) {
    // Existing edge is fully contained in seg.
    if (common === seg.length) {
      // seg === child.path: descend into child with remaining segments.
      insertSegments(child, segments, nextIndex, def);
    } else {
      // seg extends child.path: seg = child.path + rest.
      // Create a new node for the leftover of seg under child.
      const rest = seg.slice(common);
      const mid = createNode();
      mid.path = rest;
      child.children.set(rest[0], mid);
      insertSegments(mid, segments, nextIndex, def);
    }
    return;
  }

  if (common === seg.length) {
    // seg fully contained in child.path: split child.
    // child.path = seg + childRest
    const childRest = child.path.slice(common);
    const mid = createNode();
    mid.path = seg;
    // Repoint this edge to mid.
    node.children.set(first, mid);
    // Move child under mid with edge childRest.
    const newChild = createNode();
    newChild.path = childRest;
    newChild.route = child.route;
    newChild.children = child.children;
    newChild.paramChild = child.paramChild;
    newChild.paramName = child.paramName;
    newChild.wildcardChild = child.wildcardChild;
    mid.children.set(childRest[0], newChild);
    // Continue inserting remaining segments under mid.
    insertSegments(mid, segments, nextIndex, def);
    return;
  }

  // Partial overlap: split both.
  const mid = createNode();
  mid.path = seg.slice(0, common);
  node.children.set(first, mid);

  // Existing child continues under mid.
  const existingRest = child.path.slice(common);
  const existingNode = createNode();
  existingNode.path = existingRest;
  existingNode.route = child.route;
  existingNode.children = child.children;
  existingNode.paramChild = child.paramChild;
  existingNode.paramName = child.paramName;
  existingNode.wildcardChild = child.wildcardChild;
  mid.children.set(existingRest[0], existingNode);

  // New seg continues under mid.
  const newRest = seg.slice(common);
  const newNode = createNode();
  newNode.path = newRest;
  mid.children.set(newRest[0], newNode);

  insertSegments(newNode, segments, nextIndex, def);
}

/* ------------------------------------------------------------------ */
/* Matching                                                           */
/* ------------------------------------------------------------------ */

function matchNode(
  node: RadixNode,
  path: string,
  pos: number,
  params: RouteParams
): { route: Route; params: RouteParams } | null {
  // Match node.path against path starting at pos.
  const edge = node.path;
  let j = 0;
  const max = Math.min(edge.length, path.length - pos);
  while (j < max && edge.charCodeAt(j) === path.charCodeAt(pos + j)) j++;
  if (j < edge.length) return null; // edge mismatch

  pos += j;

  if (pos === path.length) {
    return node.route ? { route: node.route, params: { ...params } } : null;
  }

  // Remaining path starts at pos.
  if (path.charCodeAt(pos) === 0x2f) {
    // Segment boundary: skip '/' and descend to children with next segment.
    pos++;
    if (pos === path.length) {
      // Trailing slash: boundary at this node.
      return node.route ? { route: node.route, params: { ...params } } : null;
    }

    // Extract current segment [pos .. next '/' or end].
    let segEnd = pos;
    while (segEnd < path.length && path.charCodeAt(segEnd) !== 0x2f) segEnd++;
    const segment = path.slice(pos, segEnd);

    // 1) Exact static child: keyed by first char of segment.
    const exact = node.children.get(path[pos]);
    if (exact) {
      const result = matchNode(exact, path, pos, params);
      if (result) return result;
    }

    // 2) Parameter child.
    if (node.paramChild) {
      params[node.paramName!] = segment;
      const nextPos = segEnd === path.length ? segEnd : segEnd + 1;
      const result = matchNode(node.paramChild, path, nextPos, params);
      if (result) return result;
      delete params[node.paramName!];
    }

    // 3) Wildcard child consumes the rest.
    if (node.wildcardChild) {
      params['*'] = path.slice(pos);
      if (node.wildcardChild.route) {
        return { route: node.wildcardChild.route, params: { ...params } };
      }
      const result = matchNode(node.wildcardChild, path, segEnd, params);
      if (result) return result;
    }

    return null;
  }

  // Mid-segment continuation (e.g. edge `met` matched, remaining `a`).
  // Descend into the static child whose edge is a prefix of path[pos:].
  const child = node.children.get(path[pos]);
  if (child && path.startsWith(child.path, pos)) {
    return matchNode(child, path, pos, params);
  }

  return null;
}

function collectRoutes(node: RadixNode, routes: Route[]): void {
  if (node.route) routes.push(node.route);
  for (const child of node.children.values()) collectRoutes(child, routes);
  if (node.paramChild) collectRoutes(node.paramChild, routes);
  if (node.wildcardChild) collectRoutes(node.wildcardChild, routes);
}

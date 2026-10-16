import { describe, test, expect } from 'bun:test';
import { handleJsonRpc } from '../src/index';

describe('packages/mcp: MCP server', () => {
  test('initialize returns capabilities', async () => {
    const res = JSON.parse(await handleJsonRpc(JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize', params: {},
    })));
    expect(res.jsonrpc).toBe('2.0');
    expect(res.id).toBe(1);
    expect(res.result.capabilities.tools).toBeDefined();
    expect(res.result.serverInfo.name).toBe('persian-quote-mcp');
  });

  test('tools/list returns tool definitions', async () => {
    const res = JSON.parse(await handleJsonRpc(JSON.stringify({
      jsonrpc: '2.0', id: 2, method: 'tools/list', params: {},
    })));
    const tools = res.result.tools;
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
    const names = tools.map((t: any) => t.name);
    expect(names).toContain('search_poems');
    expect(names).toContain('get_poem');
    expect(names).toContain('fal_hafez');
    expect(names).toContain('cite_poem');
  });

  test('method not found returns error', async () => {
    const res = JSON.parse(await handleJsonRpc(JSON.stringify({
      jsonrpc: '2.0', id: 3, method: 'unknown.method', params: {},
    })));
    expect(res.error.code).toBe(-32601);
  });

  test('parse error for invalid JSON', async () => {
    const res = await handleJsonRpc('not json');
    const parsed = JSON.parse(res);
    expect(parsed.error.code).toBe(-32700);
  });
});

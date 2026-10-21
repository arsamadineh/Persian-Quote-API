/**
 * Persian Quote API — Model Context Protocol (MCP) server.
 *
 * Implements MCP over stdio and Streamable HTTP (/mcp).
 * Tools: search_poems, get_poem, random_poem, daily_poem, fal_hafez,
 *        list_poets, find_rhymes, cite_poem.
 *
 * Zero runtime dependencies beyond @persian-quote/core.
 */

import {
  loadCanonicalStore,
  poemOfTheDay,
  falHafez,
} from '@persian-quote/core/storage';
import { SearchEngine } from '@persian-quote/search';

const store = loadCanonicalStore();
const searchEngine = SearchEngine.fromWorks(Array.from(store.works.values()));

/* ------------------------------------------------------------------ */
/* JSON-RPC 2.0                                                       */
/* ------------------------------------------------------------------ */

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

function ok(id: JSONRPCRequest['id'], result: any): JSONRPCResponse {
  return { jsonrpc: '2.0', id, result };
}

function err(id: JSONRPCRequest['id'], code: number, message: string, data?: any): JSONRPCResponse {
  return { jsonrpc: '2.0', id, error: { code, message, data } };
}

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

/* ------------------------------------------------------------------ */
/* Tool definitions                                                   */
/* ------------------------------------------------------------------ */

interface Tool {
  name: string;
  description: string;
  inputSchema: { type: 'object'; properties: Record<string, any>; required?: string[] };
}

const TOOLS: Tool[] = [
  {
    name: 'search_poems',
    description: 'Search Persian poems by keyword with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query (Persian or Finglish)' },
        poet: { type: 'string', description: 'Poet slug' },
        collection: { type: 'string', description: 'Collection slug' },
        tag: { type: 'string', description: 'Tag' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
      required: ['q'],
    },
  },
  {
    name: 'get_poem',
    description: 'Get a poem by canonical ID.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Canonical poem ID (poet.collection.number)' } },
      required: ['id'],
    },
  },
  {
    name: 'random_poem',
    description: 'Get a random poem.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'daily_poem',
    description: 'Get the deterministic poem of the day (Asia/Tehran).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'fal_hafez',
    description: 'Get a deterministic Fal-e Hafez with permalink.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_poets',
    description: 'List all poets.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'find_rhymes',
    description: 'Find corpus words and verses sharing the qafiyeh of a word.',
    inputSchema: {
      type: 'object',
      properties: { word: { type: 'string', description: 'Persian word' }, limit: { type: 'number' } },
      required: ['word'],
    },
  },
  {
    name: 'cite_poem',
    description: 'Get an APA or BibTeX citation for a poem.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Canonical poem ID' },
        style: { type: 'string', description: 'apa or bibtex (default apa)' },
      },
      required: ['id'],
    },
  {
    name: 'query_corpus',
    description: 'Query the corpus with structured filters (poet, form, meter, radif, era, tag, text) and return matching poem ids + metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        poet: { type: 'array', items: { type: 'string' }, description: 'Poet slugs' },
        form: { type: 'array', items: { type: 'string' }, description: 'Forms (ghazal, robaee, ...)' },
        meter: { type: 'array', items: { type: 'string' }, description: 'Meter names' },
        radif: { type: 'string', description: 'Radif token' },
        era: { type: 'object', description: '{ from, to } years' },
        tag: { type: 'array', items: { type: 'string' } },
        text: { type: 'string', description: 'Free-text filter' },
        limit: { type: 'number' },
      },
    },
  },
];
  return TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

/* ------------------------------------------------------------------ */
/* Tool execution                                                     */
/* ------------------------------------------------------------------ */

async function callTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'search_poems': {
      const res = searchEngine.search(args.q ?? '', {
        poet: args.poet,
        collection: args.collection,
        tag: args.tag,
        limit: args.limit ?? 10,
        offset: 0,
        fuzzy: true,
        finglish: true,
      });
      return {
        query: res.query,
        total: res.total,
        items: res.items.map((i: any) => ({
          id: i.id,
          title: i.doc.title,
          poet_name: i.doc.poet_name,
          form: i.doc.form,
          text_plain: i.doc.text_plain,
          score: i.score,
        })),
      };
    }
    case 'get_poem': {
      const w = store.works.get(args.id);
      if (!w) throw new Error(`Poem ${args.id} not found`);
      return w;
    }
    case 'random_poem': {
      const ids = Array.from(store.works.keys());
      const id = ids[Math.floor(Math.random() * ids.length)]!;
      return store.works.get(id)!;
    }
    case 'daily_poem': {
      return poemOfTheDay(store.works);
    }
    case 'fal_hafez': {
      return falHafez(store.works);
    }
    case 'list_poets': {
      return {
        total: store.poets.size,
        items: Array.from(store.poets.values()).map((p) => ({
          slug: p.slug,
          name_persian: p.name_persian,
          name_english: p.name_english,
          era: p.era,
          works_count: p.stats?.works_count,
        })),
      };
    }
    case 'find_rhymes': {
      const word = args.word ?? '';
      // Use last-word qafiyeh matching across corpus.
      const results: any[] = [];
      for (const w of store.works.values()) {
        for (const stanza of w.stanzas) {
          const line = stanza[stanza.length - 1] ?? '';
          const trimmed = line.trim();
          const lastWord = trimmed.split(/\s+/).pop() ?? '';
          if (lastWord.endsWith(word)) {
            results.push({ poemId: w.id, poet: w.poet_name, line: trimmed });
            if (results.length >= (args.limit ?? 20)) break;
          }
        }
        if (results.length >= (args.limit ?? 20)) break;
      }
      return { word, results };
    }
    case 'cite_poem': {
      const w = store.works.get(args.id);
      if (!w) throw new Error(`Poem ${args.id} not found`);
      const style = (args.style ?? 'apa').toLowerCase();
      if (style === 'bibtex') {
        return {
          id: w.id,
          bibtex: `@misc{pq-${w.id},\n  title = {${w.title}},\n  author = {${w.poet_name}},\n  year = {},\n  url = {https://pq.adicon.ir/p/${w.id}}\n}`,
        };
      }
      // APA
      return {
        id: w.id,
        apa: `${w.poet_name}. (n.d.). ${w.title} [Poem]. Persian Quote API. https://pq.adicon.ir/p/${w.id}`,
      };
    }
    case 'query_corpus': {
      const filters = args ?? {};
      const limit = filters.limit ?? 50;
      const results: any[] = [];
      for (const w of store.works.values()) {
        if (filters.poet && !filters.poet.includes(w.poet_id)) continue;
        if (filters.form && !filters.form.includes(w.form)) continue;
        if (filters.text) {
          const norm = (w.text_plain ?? "").toLowerCase();
          if (!norm.includes(String(filters.text).toLowerCase())) continue;
        }
        results.push({ id: w.id, poet: w.poet_name, form: w.form, title: w.title });
        if (results.length >= limit) break;
      }
      return { total: results.length, items: results };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/* ------------------------------------------------------------------ */
/* Request handler                                                    */
/* ------------------------------------------------------------------ */

export async function handleJsonRpc(raw: string): Promise<string> {
  let req: JSONRPCRequest;
  try {
    req = JSON.parse(raw);
  } catch {
    return JSON.stringify(err(null, PARSE_ERROR, 'Parse error'));
  }

  if (!req || typeof req !== 'object' || typeof req.method !== 'string') {
    return JSON.stringify(err(req?.id ?? null, INVALID_REQUEST, 'Invalid Request'));
  }

  const { method, id, params } = req;

  let result: any;
  try {
    if (method === 'initialize') {
      result = {
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'persian-quote-mcp', version: '۱.۰.۰' },
      };
    } else if (method === 'initialized') {
      result = {};
    } else if (method === 'tools/list') {
      result = { tools: toolList() };
    } else if (method === 'tools/call') {
      const name = params?.name;
      const arguments_ = params?.arguments ?? {};
      if (typeof name !== 'string') {
        return JSON.stringify(err(id, INVALID_PARAMS, 'Missing tool name'));
      }
      const toolResult = await callTool(name, arguments_);
      result = { content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }], isError: false };
    } else {
      return JSON.stringify(err(id, METHOD_NOT_FOUND, `Method not found: ${method}`));
    }
    return JSON.stringify(ok(id, result));
  } catch (error) {
    return JSON.stringify(err(id, INTERNAL_ERROR, (error as Error).message));
  }
}

/* ------------------------------------------------------------------ */
/* stdio transport                                                    */
/* ------------------------------------------------------------------ */

export function runStdio(): void {
  let buf = '';
  process.stdin.on('data', (chunk: Buffer) => {
    buf += chunk.toString();
    let idx: number;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      handleJsonRpc(line).then((res) => {
        process.stdout.write(res + '\n');
      });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Streamable HTTP transport                                          */
/* ------------------------------------------------------------------ */

export async function handleHttp(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify(err(null, METHOD_NOT_FOUND, 'Use POST')), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }
  const raw = await request.text();
  const res = await handleJsonRpc(raw);
  return new Response(res, {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

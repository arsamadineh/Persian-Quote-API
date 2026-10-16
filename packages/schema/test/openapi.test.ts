import { describe, it, expect } from 'bun:test';
import {
  generateOpenApiComponents,
  generateOpenApiDocument,
  zodToJsonSchema,
  PoemSchema,
  ProblemDetailsSchema,
} from '../src';

describe('packages/schema: OpenAPI & JSON Schema Generator', () => {
  it('generates standard JSON Schema objects from Zod models', () => {
    const jsonSchema = zodToJsonSchema(ProblemDetailsSchema);
    expect(jsonSchema.type).toBe('object');
    expect(jsonSchema.properties).toBeDefined();

    const props = jsonSchema.properties as Record<string, any>;
    expect(props.title?.type).toBe('string');
    expect(props.status?.type).toBe('integer');
    expect(props.type?.type).toBe('string');
  });

  it('generates full OpenAPI 3.1 components schema object', () => {
    const components = generateOpenApiComponents();
    expect(components.schemas).toBeDefined();

    const schemaKeys = Object.keys(components.schemas);
    expect(schemaKeys).toContain('Poem');
    expect(schemaKeys).toContain('Poet');
    expect(schemaKeys).toContain('Collection');
    expect(schemaKeys).toContain('ProblemDetails');
    expect(schemaKeys).toContain('LegacyQuote');
    expect(schemaKeys).toContain('LegacyListResponse');
    expect(schemaKeys).toContain('LegacyPoetItem');
    expect(schemaKeys).toContain('LegacyPoetsResponse');
    expect(schemaKeys).toContain('LegacyCategoryItem');
    expect(schemaKeys).toContain('LegacyCategoriesResponse');
    expect(schemaKeys).toContain('LegacyStatsResponse');
    expect(schemaKeys).toContain('LegacyHealthResponse');

    // Inspect Poem component
    const poemComponent = components.schemas.Poem;
    expect(poemComponent?.type).toBe('object');
    expect(poemComponent?.properties).toBeDefined();
  });

  it('generates complete OpenAPI 3.1 root document', () => {
    const doc = generateOpenApiDocument();
    expect(doc.openapi).toBe('3.1.0');
    expect(doc.info.title).toBe('Persian Quote API');
    expect(doc.components.schemas.Poem).toBeDefined();
  });
});

import { zodToJsonSchema } from './json-schema';
import { PoemSchema } from '../models/poem';
import { PoetSchema } from '../models/poet';
import { CollectionSchema } from '../models/collection';
import { ProblemDetailsSchema } from '../api/problem-details';
import {
  LegacyQuoteSchema,
  LegacyListResponseSchema,
  LegacyPoetItemSchema,
  LegacyPoetsResponseSchema,
  LegacyCategoryItemSchema,
  LegacyCategoriesResponseSchema,
  LegacyStatsResponseSchema,
  LegacyHealthResponseSchema,
} from '../api/legacy';

export interface OpenApiComponents {
  schemas: Record<string, Record<string, unknown>>;
}

export function generateOpenApiComponents(): OpenApiComponents {
  return {
    schemas: {
      Poem: zodToJsonSchema(PoemSchema),
      Poet: zodToJsonSchema(PoetSchema),
      Collection: zodToJsonSchema(CollectionSchema),
      ProblemDetails: zodToJsonSchema(ProblemDetailsSchema),
      LegacyQuote: zodToJsonSchema(LegacyQuoteSchema),
      LegacyListResponse: zodToJsonSchema(LegacyListResponseSchema),
      LegacyPoetItem: zodToJsonSchema(LegacyPoetItemSchema),
      LegacyPoetsResponse: zodToJsonSchema(LegacyPoetsResponseSchema),
      LegacyCategoryItem: zodToJsonSchema(LegacyCategoryItemSchema),
      LegacyCategoriesResponse: zodToJsonSchema(LegacyCategoriesResponseSchema),
      LegacyStatsResponse: zodToJsonSchema(LegacyStatsResponseSchema),
      LegacyHealthResponse: zodToJsonSchema(LegacyHealthResponseSchema),
    },
  };
}

export interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, unknown>;
  components: OpenApiComponents;
}

export function generateOpenApiDocument(): OpenApiDocument {
  return {
    openapi: "3.1.0",
    info: {
      title: "Persian Quote API",
      version: "1.0.0",
      description: "University-grade, open Persian literature platform OpenAPI 3.1 specification.",
    },
    paths: {},
    components: generateOpenApiComponents(),
  };
}

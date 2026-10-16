import { Poem, PoemSchema } from '../models/poem';
import { Poet, PoetSchema } from '../models/poet';
import { Collection, CollectionSchema } from '../models/collection';
import { ProblemDetails, ProblemDetailsSchema } from '../api/problem-details';

export function validatePoem(data: unknown) {
  return PoemSchema.safeParse(data);
}

export function assertPoem(data: unknown): Poem {
  return PoemSchema.parse(data);
}

export function validatePoet(data: unknown) {
  return PoetSchema.safeParse(data);
}

export function assertPoet(data: unknown): Poet {
  return PoetSchema.parse(data);
}

export function validateCollection(data: unknown) {
  return CollectionSchema.safeParse(data);
}

export function assertCollection(data: unknown): Collection {
  return CollectionSchema.parse(data);
}

export function validateProblemDetails(data: unknown) {
  return ProblemDetailsSchema.safeParse(data);
}

export function assertProblemDetails(data: unknown): ProblemDetails {
  return ProblemDetailsSchema.parse(data);
}

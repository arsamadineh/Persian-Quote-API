import { z } from 'zod';

export const STABLE_ID_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)+\.[1-9][0-9]*$/;

export const StableIdSchema = z
  .string()
  .regex(STABLE_ID_REGEX, "Stable ID must follow format: poet-slug.collection-slug.number (e.g. hafez.ghazaliat.1)");

export type StableId = z.infer<typeof StableIdSchema>;

export interface ParsedStableId {
  poetSlug: string;
  collectionSlug: string;
  number: number;
}

export function parseStableId(id: string): ParsedStableId {
  if (!STABLE_ID_REGEX.test(id)) {
    throw new Error(`Invalid stable ID: ${id}`);
  }
  const parts = id.split('.');
  const numberStr = parts[parts.length - 1];
  const collectionSlug = parts[parts.length - 2];
  if (!numberStr || !collectionSlug) {
    throw new Error(`Invalid stable ID format: ${id}`);
  }
  const number = Number(numberStr);
  const poetSlug = parts.slice(0, parts.length - 2).join('.');
  return { poetSlug, collectionSlug, number };
}

export function formatStableId(poetSlug: string, collectionSlug: string, number: number): string {
  if (number < 1 || !Number.isInteger(number)) {
    throw new RangeError(`Poem number must be a positive integer, received: ${number}`);
  }
  const id = `${poetSlug}.${collectionSlug}.${number}`;
  if (!STABLE_ID_REGEX.test(id)) {
    throw new Error(`Constructed stable ID does not match regex: ${id}`);
  }
  return id;
}

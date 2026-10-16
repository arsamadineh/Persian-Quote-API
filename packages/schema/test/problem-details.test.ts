import { describe, it, expect } from 'bun:test';
import {
  ProblemDetailsSchema,
  createProblemDetails,
  assertProblemDetails,
  validateProblemDetails,
} from '../src';

describe('packages/schema: RFC 9457 Problem Details', () => {
  it('creates RFC 9457 compliant error objects with defaults', () => {
    const error = createProblemDetails({
      status: 404,
      title: "Not Found",
      detail: "The requested work 'hafez.ghazaliat.999' was not found.",
      instance: "/v1/works/hafez.ghazaliat.999",
      code: "WORK_NOT_FOUND",
    });

    expect(error.type).toBe("about:blank");
    expect(error.status).toBe(404);
    expect(error.title).toBe("Not Found");
    expect(error.detail).toContain("hafez.ghazaliat.999");
    expect(error.instance).toBe("/v1/works/hafez.ghazaliat.999");
    expect(error.code).toBe("WORK_NOT_FOUND");
    expect(typeof error.timestamp).toBe("string");

    const validated = assertProblemDetails(error);
    expect(validated.status).toBe(404);
  });

  it('supports invalid_params validation error details', () => {
    const error = createProblemDetails({
      status: 400,
      title: "Validation Error",
      detail: "One or more request parameters failed validation.",
      invalidParams: [
        { name: "limit", reason: "Must be a positive integer <= 100", value: -5 },
        { name: "lines", reason: "Must be one of: auto, separators, raw", value: "unknown" },
      ],
    });

    expect(error.invalid_params?.length).toBe(2);
    expect(error.invalid_params?.[0]?.name).toBe("limit");

    const validated = assertProblemDetails(error);
    expect(validated.invalid_params?.length).toBe(2);
  });

  it('rejects invalid problem details objects', () => {
    const invalid = {
      status: 999, // out of range 100-599
      title: "",
    };

    const res = validateProblemDetails(invalid);
    expect(res.success).toBe(false);
  });
});

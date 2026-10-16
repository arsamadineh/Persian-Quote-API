import { z } from 'zod';

export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const def = schema._def as any;
  const typeName = def.typeName;

  switch (typeName) {
    case "ZodString": {
      const res: Record<string, unknown> = { type: "string" };
      for (const check of def.checks || []) {
        if (check.kind === "min") res.minLength = check.value;
        if (check.kind === "max") res.maxLength = check.value;
        if (check.kind === "regex") res.pattern = check.regex.source;
      }
      return res;
    }
    case "ZodNumber": {
      const res: Record<string, unknown> = { type: "number" };
      for (const check of def.checks || []) {
        if (check.kind === "int") res.type = "integer";
        if (check.kind === "min") res.minimum = check.value;
        if (check.kind === "max") res.maximum = check.value;
      }
      return res;
    }
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodEnum":
      return { type: "string", enum: def.values };
    case "ZodLiteral":
      return { const: def.value };
    case "ZodArray": {
      const res: Record<string, unknown> = {
        type: "array",
        items: zodToJsonSchema(def.type),
      };
      if (def.minLength) res.minItems = def.minLength.value;
      if (def.maxLength) res.maxItems = def.maxLength.value;
      return res;
    }
    case "ZodObject": {
      const shape = typeof def.shape === "function" ? def.shape() : def.shape;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, propSchema] of Object.entries(shape as Record<string, z.ZodTypeAny>)) {
        properties[key] = zodToJsonSchema(propSchema);
        const innerType = propSchema._def.typeName;
        if (innerType !== "ZodOptional" && innerType !== "ZodDefault") {
          required.push(key);
        }
      }
      const res: Record<string, unknown> = { type: "object", properties };
      if (required.length > 0) res.required = required;
      return res;
    }
    case "ZodOptional":
      return zodToJsonSchema(def.innerType);
    case "ZodNullable":
      return { anyOf: [zodToJsonSchema(def.innerType), { type: "null" }] };
    case "ZodUnion":
      return { anyOf: def.options.map((opt: z.ZodTypeAny) => zodToJsonSchema(opt)) };
    case "ZodRecord":
      return { type: "object", additionalProperties: zodToJsonSchema(def.valueType) };
    case "ZodDefault":
      return { ...zodToJsonSchema(def.innerType), default: def.defaultValue() };
    case "ZodEffects":
      return zodToJsonSchema(def.schema);
    default:
      return { type: "string" };
  }
}

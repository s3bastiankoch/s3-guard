import { z } from "zod";

const ruleSchema = z.object({
  name: z.string(),
  description: z.string(),
  policy: z.object({
    file: z.string(),
    entrypoint: z.string(),
  }),
  match: z.object({
    paths: z.array(z.string()).optional(),
    metadata: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
  }),
});

export type Rule = z.TypeOf<typeof ruleSchema>;

export const configSchema = z.object({
  rules: z.array(ruleSchema),
});

export type Config = z.TypeOf<typeof configSchema>;

import { z } from "zod";

const envSchema = z.object({
  S3_URL: z.string().url().optional(),
  S3_FORCE_PATH_SYTLE: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  DATABASE_URL: z.string().url().optional(),
  OPA_SERVER_ENDPOINT: z.string().url(),
});

export type Bindigs = z.TypeOf<typeof envSchema>;

export function createEnv(env: Bindigs) {
  return envSchema.parse(env);
}

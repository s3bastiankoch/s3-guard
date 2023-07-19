import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    S3_URL: z.string().url().optional(),
    S3_FORCE_PATH_SYTLE: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_BUCKET_NAME: z.string(),
    OPA_SERVER_ENDPOINT: z.string().url(),
  },
  runtimeEnv: process.env,
});

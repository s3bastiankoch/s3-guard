import { createAwsFetch } from "./aws-fetch";
import { readConfig } from "./config";
import { Bindigs, createEnv } from "./env";
import { createLogger } from "./log/logger";
import { createS3Client } from "./s3-client";

export async function setup(bindigs: Bindigs) {
  const env = createEnv(bindigs);

  const s3 = createS3Client({
    region: "weur",
    endpoint: env.S3_URL,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: env.S3_FORCE_PATH_SYTLE,
  });

  const config = await readConfig({
    configPath: "config.json",
    Bucket: env.S3_BUCKET_NAME,
    s3,
  });

  const awsFetch = createAwsFetch({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  });

  return {
    env,
    logger: env.DATABASE_URL
      ? createLogger(env.DATABASE_URL)
      : { async log(_message: string, _metadata?: unknown) {} },
    s3,
    config,
    awsFetch,
  };
}

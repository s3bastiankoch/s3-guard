import { S3Client } from "@aws-sdk/client-s3";
import { configSchema } from "./schema";
import { readS3FileAsString } from "./read-s3-file";

export type ReadConfigOptions = {
  configPath: string;
  Bucket: string;
  s3: S3Client;
};

export async function readConfig({
  Bucket,
  configPath,
  s3,
}: ReadConfigOptions) {
  const rawConfig = (await readS3FileAsString({
    Key: configPath,
    Bucket,
    s3,
  })) as string;

  const validatedConfig = configSchema.parse(JSON.parse(rawConfig));
  return validatedConfig;
}

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3-client";
import { Config } from "./schema";

export type UploadPolicyOptions = {
  endpoint: string;
  name: string;
  policy: string;
};

export async function uploadPolicy({
  endpoint,
  name,
  policy,
}: UploadPolicyOptions) {
  try {
    await fetch(`${endpoint}/v1/policies/${name}`, {
      method: "PUT",
      body: policy,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

    return true;
  } catch (error) {
    console.error(`Could not upload policy`, error);
  }

  return false;
}

export type UploadConfigOptions = {
  fileName: string;
  bucketName: string;
  config: Config;
};

export async function uploadConfig({
  bucketName,
  config,
  fileName,
}: UploadConfigOptions) {
  await s3.send(
    new PutObjectCommand({
      Key: fileName,
      Bucket: bucketName,
      Body: JSON.stringify(config, null, 2),
    })
  );
}

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type ReadFileOptions = {
  s3: S3Client;
  Bucket: string;
  Key: string;
};

export async function readS3FileAsByteArray({
  s3,
  ...options
}: ReadFileOptions) {
  const { Body } = await s3.send(new GetObjectCommand(options));

  return (await Body?.transformToByteArray()) as Uint8Array;
}

export async function readS3FileAsString({ s3, ...options }: ReadFileOptions) {
  const { Body } = await s3.send(new GetObjectCommand(options));

  return (await Body?.transformToString("utf-8")) as string;
}

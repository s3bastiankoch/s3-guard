// @ts-ignore
import { AwsClient } from "aws4fetch";
import fetchRetry from "fetch-retry";

// TODO: Circuit Breaker
export function createAwsFetch({
  accessKeyId,
  secretAccessKey,
}: {
  accessKeyId: string;
  secretAccessKey: string;
}) {
  const aws = new AwsClient({
    accessKeyId,
    secretAccessKey,
  });

  const awsFetch: typeof fetch = async (input, init) => {
    const signedRequest = (await aws.sign(input, {
      ...init,
      aws: {
        accessKeyId,
        secretAccessKey,
      },
    })) as Request;

    signedRequest.headers.delete("connection");

    return fetch(signedRequest);
  };

  return fetchRetry(awsFetch, {
    retries: 2,
    // Expotential backoff
    retryDelay(attempt) {
      return Math.pow(2, attempt);
    },
  });
}

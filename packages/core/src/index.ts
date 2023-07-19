import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { Stream } from "stream";

type WrappedS3Client = S3Client & {
  setContext: (c: Record<string, string | number | boolean>) => S3Client;
};

function wrapS3Client(client: S3Client): WrappedS3Client {
  let context: Record<string, string | number | boolean> = {};

  const requestHandler: S3ClientConfig["requestHandler"] = {
    async handle(request) {
      const { port, method, protocol, hostname, headers } = request;

      const body =
        method === "GET" || method === "HEAD" ? undefined : request.body;

      let path = request.path;
      // Prefix all keys in context with p_
      const pContext = Object.keys(context).reduce((acc, key) => {
        acc[`p_${key}`] = context[key] as string | number | boolean;
        return acc;
      }, {} as Record<string, string | number | boolean>);

      const queryString = new URLSearchParams({
        ...(request.query || {}),
        ...pContext,
      });
      if (queryString) {
        path += `?${queryString.toString()}`;
      }
      if (request.fragment) {
        path += `#${request.fragment}`;
      }

      const response = await fetch(
        `${protocol}//${hostname}${port ? `:${port}` : ""}${path}`,
        {
          method,
          headers: new Headers(headers),
          body,
          cache: "no-cache",
        }
      );

      // Reset context
      context = {};

      const hasReadableStream =
        response.body && typeof response.body.getReader === "function";

      // Return the response with buffered body
      if (!hasReadableStream) {
        const body = response.body ? await response.blob() : undefined;

        return {
          response: {
            headers: Object.fromEntries(response.headers.entries()),
            statusCode: response.status,
            body,
            reason: response.statusText,
          },
        };
      }

      // Turn web stream into Node.js stream
      const reader = response.body!.getReader();
      const stream = new Stream.Readable({
        read: async () => {
          const { done, value } = await reader.read();
          if (done) {
            stream.push(null);
          } else {
            stream.push(value);
          }
        },
      });

      // Return the response with streaming body
      return {
        response: {
          headers: Object.fromEntries(response.headers.entries()),
          statusCode: response.status,
          body: stream,
          reason: response.statusText,
        },
      };
    },
  };

  // Set client.config.requestHandler
  client.config.requestHandler = requestHandler;

  return {
    setContext: (c: Record<string, string | number | boolean>) => {
      context = c;

      return client;
    },
    ...client,
  } as WrappedS3Client;
}

export { wrapS3Client };

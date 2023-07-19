import { Hono } from "hono";
import {
  findRelevantRules,
  evaluatePolicy,
  extractEvaluationInput,
  Dict,
} from "./policies";
import { Bindigs } from "./env";
import { setup } from "./setup";
import { fromCSV, DataFrame } from "data-forge";

export function createApp() {
  console.log("Starting app..");
  const app = new Hono<{ Bindings: Bindigs }>();

  app.all("*", async (c) => {
    const { logger, env, config, awsFetch } = await setup(c.env || process.env);

    const { pathname, search, searchParams } = new URL(c.req.url);

    const serverUrl = `${env.S3_URL}${pathname}${search}`;

    const requestBody = c.req.body ? ((await c.req.json()) as Dict) : undefined;

    const [input, newBody] = extractEvaluationInput({
      body: requestBody,
      urlParams: searchParams,
    });

    const s3Response = await awsFetch(serverUrl, {
      headers: new Headers(c.req.headers),
      method: c.req.method,
      body: newBody,
    });

    // ==== Evaluate access rules ====

    // const responseBody = s3Response.body ? await s3Response.json() : {};

    const responseBody = {
      Key: pathname.split("/").pop(),
      Metadata: undefined,
    };
    let data: unknown = null;

    switch (s3Response.headers.get("content-type")) {
      case "text/csv":
        data = fromCSV(await s3Response.text());
        break;
    }

    // Gets Key from url in case body doesn't provide infos
    const { Key, Metadata } = responseBody;

    // Get relevant rules from config
    const relevantRules = findRelevantRules(config.rules, {
      key: Key,
      meta: Metadata,
    });

    if (relevantRules.length === 0) {
      await logger.log("Access denied");
      return c.text("Forbidden", 403);
    }

    // Check if every policy evaluates to true
    for (const { policy } of relevantRules) {
      const { result, responseData } = await evaluatePolicy(policy, {
        input,
        data: { key: Key },
        endpioint: env.OPA_SERVER_ENDPOINT,
        responseData: data,
      });

      // In case a policy evaluation fails
      if (!result) {
        await logger.log("Access denied");
        return c.text("Forbidden", 403);
      }

      data = responseData;
    }

    await logger.log("Access allowed");

    if (data) {
      const csv = (data as DataFrame).toCSV();

      // Create a new response with the modified body
      const newHeaders = new Headers(s3Response.headers);
      newHeaders.set("content-length", csv.length.toString());
      newHeaders.set("content-type", "text/csv");
      return new Response(csv, {
        status: s3Response.status,
        statusText: s3Response.statusText,
        headers: newHeaders,
      });
    }

    return s3Response;
  });

  return app;
}

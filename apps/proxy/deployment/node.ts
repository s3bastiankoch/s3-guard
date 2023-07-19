import "dotenv/config";
import { serve } from "@hono/node-server";
import { createApp } from "../src";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const { fetch } = createApp();

serve({
  fetch,
  port: 4000,
});

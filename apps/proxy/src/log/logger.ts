import { DB } from "./types";
import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

export function createLogger(url: string) {
  const db = new Kysely<DB>({
    dialect: new PlanetScaleDialect({
      url,
      fetch: (url: string, init?: RequestInit) => {
        delete (init as any)["cache"]; // Remove cache header
        return fetch(url, init);
      },
    }),
  });

  return {
    log: async (message: string, metadata?: unknown) => {
      await db
        .insertInto("Logs")
        .values({
          message,
          input: JSON.stringify(metadata || {}),
        })
        .execute();
    },
  };
}

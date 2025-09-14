// tests/helpers/harness.ts
import { App } from "fresh";
import type { State } from "../../utils.ts";
import { createDb } from "../../db/factory.ts";
import { createAuth } from "../../utils/auth-factory.ts";

export const ORIGIN = "http://local.test";

export type Harness = {
  db: any;
  schema: any;
  auth: ReturnType<typeof createAuth>;
  handler: (req: Request) => Promise<Response>;
  close: () => Promise<void>;
};

export async function withHarness(
  _t: Deno.TestContext,
  fn: (h: Harness) => Promise<void>,
) {
  const { db, schema, close } = createDb();
  const auth = createAuth(db);

  const app = new App<State>();
  // cover both GET/POST without repeating routes in tests
  app.get("/api/auth/*", (ctx) => auth.handler(ctx.req));
  app.post("/api/auth/*", (ctx) => auth.handler(ctx.req));
  const handler = app.handler();

  try {
    await fn({ db, schema, auth, handler, close });
  } finally {
    await close();
  }
}

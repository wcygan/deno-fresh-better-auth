// tests/auth_signup_test.ts
import { expect } from "@std/expect";
import { App } from "fresh";
import type { State } from "../utils.ts";
import { createDb } from "../db/factory.ts";
import { createAuth } from "../utils/auth-factory.ts";
import { eq, inArray, like } from "drizzle-orm";

function uniqueEmail(prefix = "signup"): string {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return `${prefix}.${rand}@example.com`;
}

async function deleteUsersByEmailPattern(db: any, schema: any, pattern: string) {
  const users = await db
    .select({ id: schema.user.id, email: schema.user.email })
    .from(schema.user)
    .where(like(schema.user.email, pattern));

  if (users.length === 0) return;

  const userIds = users.map((u: { id: string }) => u.id);

  await db.delete(schema.session).where(inArray(schema.session.userId, userIds));
  await db.delete(schema.account).where(inArray(schema.account.userId, userIds));
  await db
    .delete(schema.verification)
    .where(like(schema.verification.identifier, pattern));
  await db.delete(schema.user).where(inArray(schema.user.id, userIds));
}

Deno.test("POST /api/auth/sign-up/email creates a user and account", async () => {
  // Per-test DB + Auth + App
  const { db, schema, close } = createDb();
  const auth = createAuth(db);

  const app = new App<State>();
  app.get("/api/auth/*", (ctx) => auth.handler(ctx.req));
  app.post("/api/auth/*", (ctx) => auth.handler(ctx.req));
  const handler = app.handler();

  // Unique test data
  const email = uniqueEmail();
  const password = "Bot12345_Bot12345";
  const name = "Will Test";

  // Ensure a clean slate for this email
  await deleteUsersByEmailPattern(db, schema, email);

  try {
    // Step 1: sign up
    {
      const req = new Request("http://local.test/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "origin": "http://local.test", // must match trustedOrigins
          "accept": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const res = await handler(req);
      expect([200, 201]).toContain(res.status);

      const json = await res.json();
      expect(typeof json?.user?.id).toEqual("string");
    }

    // Step 2: DB side-effects
    {
      const u = await db.query.user.findFirst({
        where: eq(schema.user.email, email),
      });
      expect(Boolean(u)).toEqual(true);

      const a = await db.query.account.findFirst({
        where: eq(schema.account.userId, u!.id),
      });
      expect(Boolean(a)).toEqual(true);
    }
  } finally {
    // Cleanup rows for this email AND close the pool so sanitizers pass
    await deleteUsersByEmailPattern(db, schema, email);
    await close();
  }
});

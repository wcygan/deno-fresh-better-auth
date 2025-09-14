// tests/auth_signup_test.ts
// Uses Setup/Teardown APIs from https://deno.com/blog/v2.5#setup-and-teardown-apis-to-denotest
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

    // Step 3: duplicate sign up fails
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
      expect([422]).toContain(res.status);

      const json = await res.json();
      expect(json?.code).toEqual("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL");
    }
  } finally {
    // Cleanup rows for this email AND close the pool so sanitizers pass
    await deleteUsersByEmailPattern(db, schema, email);
    await close();
  }
});

function extractCookies(res: Response): string[] {
  const setCookie = res.headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}
function cookieHeader(cookies: string[]): string {
  // take cookie pairs only (strip attributes)
  const pairs = cookies.map((c) => c.split(";")[0]).join("; ");
  return pairs;
}

Deno.test("sign-in success sets cookies; wrong password 401", async () => {
  const { db, schema, close } = createDb();
  const auth = createAuth(db);
  const app = new App<State>();
  app.post("/api/auth/*", (ctx) => auth.handler(ctx.req));
  app.get("/api/auth/*", (ctx) => auth.handler(ctx.req));
  const handler = app.handler();

  const pwd = "Bot12345_Bot12345";
  const mail = uniqueEmail();

  try {
    // Seed: sign-up
    const signUp = await handler(new Request("http://local.test/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://local.test" },
      body: JSON.stringify({ email: mail, password: pwd, name: "Will" }),
    }));
    expect([200, 201]).toContain(signUp.status);

    // Sign-in success
    const signIn = await handler(new Request("http://local.test/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://local.test" },
      body: JSON.stringify({ email: mail, password: pwd }),
    }));
    expect([200, 201]).toContain(signIn.status);
    const cookies = extractCookies(signIn);
    expect(cookies.length > 0).toEqual(true);

    // Ask Better Auth directly on the server for the session
    const sessionResult = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieHeader(cookies),
        origin: "http://local.test",
      }),
    });
    expect(Boolean(sessionResult?.session?.id)).toEqual(true);
    expect(sessionResult?.user?.email).toEqual(mail);

    // Wrong password
    const wrong = await handler(new Request("http://local.test/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://local.test" },
      body: JSON.stringify({ email: mail, password: "NOT_THE_PASSWORD" }),
    }));
    expect([401, 400]).toContain(wrong.status);
  } finally {
    // cleanup
    const u = await db.query.user.findFirst({ where: eq(schema.user.email, mail) });
    if (u) {
      await db.delete(schema.session).where(eq(schema.session.userId, u.id));
      await db.delete(schema.account).where(eq(schema.account.userId, u.id));
      await db.delete(schema.verification).where(eq(schema.verification.identifier, mail));
      await db.delete(schema.user).where(eq(schema.user.id, u.id));
    }
    await close();
  }
});

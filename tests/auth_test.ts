// tests/auth_signup_test.ts
import { expect } from "@std/expect";
import { App } from "fresh";
import type { State } from "../utils.ts";
import { auth } from "../utils/auth.ts";
import { db, schema, closeDb } from "../db/db.ts";
import { eq, like, inArray } from "drizzle-orm";

// ---- WHY: Reuse a single app+handler across all tests to reduce overhead.
let handler: (req: Request) => Promise<Response>;

// Track emails created during tests so afterEach can clean them up.
const createdEmails = new Set<string>();

function uniqueEmail(prefix = "signup"): string {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return `${prefix}.${rand}@example.com`;
}

// Helper: delete all rows for the user(s) matching an email or pattern.
async function deleteUsersByEmailPattern(pattern: string) {
  // Fetch user ids that match the pattern
  const users = await db
    .select({ id: schema.user.id, email: schema.user.email })
    .from(schema.user)
    .where(like(schema.user.email, pattern));

  if (users.length === 0) return;

  const userIds = users.map((u) => u.id);

  // Delete children first (FK constraints)
  await db.delete(schema.session).where(inArray(schema.session.userId, userIds));
  await db.delete(schema.account).where(inArray(schema.account.userId, userIds));
  // verification rows use email in "identifier"
  await db
    .delete(schema.verification)
    .where(like(schema.verification.identifier, pattern));

  // Finally delete users
  await db.delete(schema.user).where(inArray(schema.user.id, userIds));
}

// ---- Hooks ----

// Run once before all tests
Deno.test.beforeAll(async () => {
  // Guard: env must be loaded (you run with --env --env-file=.env)
  const url = Deno.env.get("DATABASE_URL");
  if (!url) {
    throw new Error(
      'DATABASE_URL not set. Run with "--env --env-file=.env" or export it.',
    );
  }

  // Build a minimal Fresh app that proxies Better Auth routes.
  const app = new App<State>();
  app.get("/api/auth/*", (ctx) => auth.handler(ctx.req));
  app.post("/api/auth/*", (ctx) => auth.handler(ctx.req));
  handler = app.handler();

  // Optional quick connectivity probe
  await db.execute("select 1;");
});

// Clean up any data created by each individual test
Deno.test.afterEach(async () => {
  if (createdEmails.size === 0) return;
  // Delete exact emails we tracked
  for (const email of createdEmails) {
    await deleteUsersByEmailPattern(email); // exact match works with LIKE
  }
  createdEmails.clear();
  // Safety net: remove any stragglers we created by pattern
  await deleteUsersByEmailPattern("signup.%@example.com");
});

// Close db/timers/sockets once after all tests
Deno.test.afterAll(async () => {
  await closeDb(); // calls pool.end()
});

// ---- Tests ----

Deno.test("POST /api/auth/sign-up/email creates a user and account", async (t) => {
  const email = uniqueEmail();
  const password = "Bot12345_Bot12345";
  const name = "Will Test";
  createdEmails.add(email);

  await t.step("sign up responds 200/201", async () => {
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
  });

  await t.step("user and account exist in the DB", async () => {
    const u = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });
    expect(Boolean(u)).toEqual(true);

    const a = await db.query.account.findFirst({
      where: eq(schema.account.userId, u!.id),
    });
    expect(Boolean(a)).toEqual(true);
  });
});

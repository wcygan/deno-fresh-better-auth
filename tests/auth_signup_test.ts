// tests/auth_signup_test.ts
import { expect } from "@std/expect";
import { eq } from "drizzle-orm";
import { withHarness } from "./helpers/harness.ts";
import { uniqueEmail } from "./helpers/data.ts";
import { cleanupUsersByPattern } from "./helpers/db.ts";
import { signUp } from "./helpers/auth-flows.ts";

Deno.test("POST /api/auth/sign-up/email creates a user+account; duplicate fails", async (t) => {
  await withHarness(t, async ({ db, schema, handler }) => {
    const email = uniqueEmail();
    const password = "Bot12345_Bot12345";
    const name = "Will Test";

    // ensure clean slate for this specific email
    await cleanupUsersByPattern(db, schema, email);

    try {
      // Step 1: sign up (success)
      {
        const res = await signUp(handler, { email, password, name });
        expect([200, 201]).toContain(res.status);
        const json = await res.json();
        expect(typeof json?.user?.id).toEqual("string");
      }

      // Step 2: DB side-effects (user + account exist)
      {
        const u = await db.query.user.findFirst({ where: eq(schema.user.email, email) });
        expect(Boolean(u)).toEqual(true);

        const a = await db.query.account.findFirst({ where: eq(schema.account.userId, u!.id) });
        expect(Boolean(a)).toEqual(true);
      }

      // Step 3: duplicate sign-up fails
      {
        const res = await signUp(handler, { email, password, name });
        expect([422]).toContain(res.status);
        const json = await res.json();
        expect(json?.code).toEqual("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL");
      }
    } finally {
      await cleanupUsersByPattern(db, schema, email);
    }
  });
});

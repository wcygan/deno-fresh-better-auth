// tests/auth_signin_test.ts
import { expect } from "@std/expect";
import { eq } from "drizzle-orm";
import { withHarness } from "./helpers/harness.ts";
import { uniqueEmail } from "./helpers/data.ts";
import { cleanupUserByEmail } from "./helpers/db.ts";
import { signIn, signUp } from "./helpers/auth-flows.ts";
import { extractCookies, cookieHeader } from "./helpers/cookies.ts";

Deno.test("sign-in success sets cookies; wrong password => 401/400", async (t) => {
  await withHarness(t, async ({ db, schema, auth, handler }) => {
    const pwd = "Bot12345_Bot12345";
    const mail = uniqueEmail();

    try {
      // Seed user
      const signUpRes = await signUp(handler, { email: mail, password: pwd, name: "Will" });
      expect([200, 201]).toContain(signUpRes.status);

      // Sign-in success
      const signInRes = await signIn(handler, { email: mail, password: pwd });
      expect([200, 201]).toContain(signInRes.status);

      const cookies = extractCookies(signInRes);
      expect(cookies.length > 0).toEqual(true);

      // Verify session via server API
      const sessionResult = await auth.api.getSession({
        headers: new Headers({
          cookie: cookieHeader(cookies),
          origin: "http://local.test",
        }),
      });
      expect(Boolean(sessionResult?.session?.id)).toEqual(true);
      expect(sessionResult?.user?.email).toEqual(mail);

      // Wrong password path
      const wrong = await signIn(handler, { email: mail, password: "NOT_THE_PASSWORD" });
      expect([401, 400]).toContain(wrong.status);
    } finally {
      await cleanupUserByEmail(db, schema, mail);
    }
  });
});

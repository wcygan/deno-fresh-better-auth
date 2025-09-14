// utils/auth-factory.ts
// WHY: Build an auth instance bound to the db created for THIS test.

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/auth-schema.ts";

export function createAuth(db: unknown) {
  return betterAuth({
    database: drizzleAdapter(db as any, { provider: "pg", schema }),
    basePath: "/api/auth",
    trustedOrigins: [
      "http://local.test",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
  });
}

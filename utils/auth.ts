import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db.ts";
import * as schema from "../db/auth-schema.ts";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  rateLimit: {
    enabled: true, // enable it in dev
    window: 10, // time window in seconds
    max: 100, // max requests in the window
  },
  trustedOrigins: [
    "http://local.test",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
});

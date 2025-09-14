// db/factory.ts
// WHY: Create a brand-new pg Pool + Drizzle instance per test, so timers/sockets
// start and stop within the test's lifetime (keeps Deno sanitizers happy).

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./auth-schema.ts";

const { Pool } = pg;

export function createDb() {
  const url = Deno.env.get("DATABASE_URL");
  if (!url) {
    throw new Error('DATABASE_URL not set. Run with "--env --env-file=.env".');
  }

  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { schema });

  // Close the pg Pool (stops timers and TCP sockets).
  async function close() {
    await pool.end();
  }

  return { db, schema, close };
}

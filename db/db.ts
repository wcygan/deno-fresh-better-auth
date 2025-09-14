// db/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./auth-schema.ts";

const { Pool } = pg;

const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL"),
});

// Attach schema here so db.query.* is strongly typed
export const db = drizzle(pool, { schema });

export { schema };
export type DB = typeof db;

/** Gracefully close DB resources (used by tests). */
export async function closeDb(): Promise<void> {
  // WHY: pg Pool starts timers + keeps TCP sockets open; end() shuts those down.
  await pool.end();
}

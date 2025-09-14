// tests/helpers/db.ts
import { eq, inArray, like } from "drizzle-orm";

export async function cleanupUserByEmail(db: any, schema: any, email: string) {
  const u = await db.query.user.findFirst({ where: eq(schema.user.email, email) });
  if (!u) return;
  await db.delete(schema.session).where(eq(schema.session.userId, u.id));
  await db.delete(schema.account).where(eq(schema.account.userId, u.id));
  await db.delete(schema.verification).where(eq(schema.verification.identifier, email));
  await db.delete(schema.user).where(eq(schema.user.id, u.id));
}

export async function cleanupUsersByPattern(
  db: any,
  schema: any,
  pattern: string,
) {
  const users = await db
    .select({ id: schema.user.id, email: schema.user.email })
    .from(schema.user)
    .where(like(schema.user.email, pattern));
  if (users.length === 0) return;

  const userIds = users.map((u: { id: string }) => u.id);
  await db.delete(schema.session).where(inArray(schema.session.userId, userIds));
  await db.delete(schema.account).where(inArray(schema.account.userId, userIds));
  await db.delete(schema.verification).where(like(schema.verification.identifier, pattern));
  await db.delete(schema.user).where(inArray(schema.user.id, userIds));
}

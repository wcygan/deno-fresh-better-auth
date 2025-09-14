// tests/helpers/data.ts
export function uniqueEmail(prefix = "signup"): string {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return `${prefix}.${rand}@example.com`;
}

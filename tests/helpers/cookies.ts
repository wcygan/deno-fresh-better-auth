// tests/helpers/cookies.ts
export function extractCookies(res: Response): string[] {
  const setCookie = res.headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}

export function cookieHeader(cookies: string[]): string {
  // set-cookie values -> "name=value" pairs only
  return cookies.map((c) => c.split(";")[0]).join("; ");
}

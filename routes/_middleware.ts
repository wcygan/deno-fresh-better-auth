// routes/_middleware.ts
import { define } from "../utils.ts";
import { auth } from "../utils/auth.ts";

/** Anything here is allowed without being logged in */
const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth",   // Better Auth endpoints must be public
  "/_fresh",     // Fresh runtime assets
  "/assets",     // your static assets (CSS, etc.)
  "/favicon.ico",
  "/logo.svg",
];

export default define.middleware(async (ctx) => {
  // 1) Load Better Auth session from incoming cookies/headers
  const sessionRes = await auth.api.getSession({ headers: ctx.req.headers });
  ctx.state.session = sessionRes?.session ?? null;

  const path = ctx.url.pathname;
  const isPublic = PUBLIC_PREFIXES.some((p) =>
    path === p || path.startsWith(p + "/")
  );

  // 2) If not authenticated and not public, send to /login
  if (!ctx.state.session && !isPublic) {
    // If it's an API/fetch request, return 401 JSON instead of redirecting
    const isApi = path.startsWith("/api/");
    const acceptsHtml = ctx.req.headers.get("accept")?.includes("text/html");
    if (isApi && !acceptsHtml) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const next = encodeURIComponent(ctx.url.pathname + ctx.url.search);
    return ctx.redirect(`/login?next=${next}`);
  }

  // 3) Continue to the next middleware/route
  return ctx.next();
});

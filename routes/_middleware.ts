// routes/_middleware.ts
import { define } from "../utils.ts";
import { auth } from "../utils/auth.ts";

export const handler = define.middleware(async (ctx) => {
  const sessionResult = await auth.api.getSession({ headers: ctx.req.headers });
  ctx.state.session = sessionResult?.session ?? null;
  console.log("Got " + ctx.state.session);
  return ctx.next();
});

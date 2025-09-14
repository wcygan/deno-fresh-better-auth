import { auth } from "../../../utils/auth.ts";
import { define } from "../../../utils.ts";

// Better Auth exposes a handler with the right type
const betterAuthHandler = auth.handler;

export const handler = define.handlers((ctx) => {
  console.log("Handling Request " + ctx.url);
  return betterAuthHandler(ctx.req);
});

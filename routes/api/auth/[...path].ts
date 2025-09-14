import { auth } from "../../../utils/auth.ts";
import { define } from "../../../utils.ts";

export const handler = define.handlers((ctx) => {
  return auth.handler(ctx.req);
});

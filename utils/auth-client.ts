import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  // baseURL is optional when your app and API share the same origin.
});

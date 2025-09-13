import { createAuthClient } from "better-auth/client";

// Don't pass baseURL — it will resolve automatically to `${window.location.origin}/api/auth`
export const authClient = createAuthClient();

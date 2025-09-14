// tests/helpers/auth-flows.ts
import { api, json } from "./http.ts";

export async function signUp(
  handler: (r: Request) => Promise<Response>,
  { email, password, name }: { email: string; password: string; name: string },
) {
  return handler(api("/api/auth/sign-up/email", {
    method: "POST",
    body: json({ email, password, name }),
  }));
}

export async function signIn(
  handler: (r: Request) => Promise<Response>,
  { email, password }: { email: string; password: string },
) {
  return handler(api("/api/auth/sign-in/email", {
    method: "POST",
    body: json({ email, password }),
  }));
}

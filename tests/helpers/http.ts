// tests/helpers/http.ts
import { ORIGIN } from "./harness.ts";

export function json(body: unknown) {
  return JSON.stringify(body);
}

export function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "content-type": "application/json",
    "accept": "application/json",
    "origin": ORIGIN,
    ...extra,
  };
}

export function api(path: string, init: RequestInit): Request {
  return new Request(`${ORIGIN}${path}`, {
    // Most tests want JSON + proper origin; can be overridden per-call
    headers: jsonHeaders(init.headers),
    ...init,
  });
}

import { expect } from "@std/expect";
import { App } from "fresh";

// Import your route handlers
// import { handler as authHandler } from "../routes/api/auth/[...path].ts";

Deno.test("Test", async () => {
  expect("Welcome").toContain("Welcome");
});

# Repository Guidelines

## Project Structure & Modules
- Source: `routes/` (pages, `_app.tsx`, `_middleware.ts`), `islands/` (interactive components), `components/` (UI), `utils/` (auth, helpers), `db/` (Drizzle schema and client), `assets/` and `static/`.
- Auth: `utils/auth.ts` (Better Auth config) and routes `GET/POST /api/auth/*` wired in `main.ts`.
- Tests: `tests/` with helpers in `tests/helpers/` and files named `*_test.ts`.

## Build, Test, and Development
- `deno task dev`: Start Vite + Fresh dev server at `http://127.0.0.1:5173/`.
- `deno task open`: Open the dev URL in a browser.
- `deno task build`: Build production assets and server bundle to `./_fresh/`.
- `deno task start`: Run the built server (`_fresh/server.js`).
- `deno task test`: Run tests (requires `.env` and Postgres).
- `deno task db`: Start Postgres via Docker Compose.
- Migrations: `deno run -A --env-file --node-modules-dir npm:drizzle-kit generate --name=init` then `... migrate`.

## Coding Style & Conventions
- Language: TypeScript/TSX with Preact/Signals; 2-space indentation.
- Formatting/Lint: `deno fmt` and `deno lint` (or `deno task check`).
- Naming: routes `kebab-case.tsx` (`login.tsx`), special files `_app.tsx`, `_middleware.ts`; components/islands `PascalCase.tsx` (`NavBar.tsx`, `LoginForm.tsx`); utilities `kebab-case.ts`.

## Testing Guidelines
- Framework: `deno test` with `@std/expect`.
- Setup: Ensure `.env` has `DATABASE_URL`; run `deno task db` to start Postgres; tests auto-create and close a pool per test.
- Naming: Place under `tests/` as `*_test.ts`. Example: `tests/auth_signup_test.ts`.
- Run: `deno task test`.

## Commit & Pull Requests
- Commits: Imperative, concise, scoped (e.g., "auth: fix session cookie"; current history is informal—prefer clearer subjects going forward).
- PRs: Include summary, rationale, screenshots for UI changes, test plan/commands, linked issues, migration notes if schema changes.
- Quality gate: `deno task check` and `deno task test` must pass; avoid committing `.env`.

## Security & Configuration
- Required env: `DATABASE_URL`, optional social providers (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`). Keep secrets out of VCS; use `.env.example` as reference.
- CORS/Origins: Trusted origins set in `utils/auth.ts`; update as needed for new hosts.

# Deno Fresh + Better Auth

```bash
# Install the dependencies
deno install

# Generate the types from the database schema
deno run -A npm:@better-auth/cli@latest generate --output db/auth-schema.ts --yes

# TBD: Generate the migrations
deno --env -A --node-modules-dir npm:drizzle-kit generate --name=init

# TBD: Run the migrations
deno --env -A --node-modules-dir npm:drizzle-kit migrate

# TBD: Run the Dev server
deno task dev
```

## References

1. <https://deno.com/blog/build-database-app-drizzle>
2. <https://deno.com/blog/setup-auth-with-fresh>
3. <https://www.better-auth.com/docs/installation>
4. <https://www.better-auth.com/docs/basic-usage>
5. <https://www.better-auth.com/docs/adapters/postgresql>

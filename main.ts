import { App, staticFiles } from "fresh";
import { type State } from "./utils.ts";
import { auth } from "./utils/auth.ts";

export const app = new App<State>();

app.get("/api/auth/*", (ctx) => {
    return auth.handler(ctx.req);
});

app.post("/api/auth/*", (ctx) => {
    return auth.handler(ctx.req);
});

app.use(staticFiles());

// Include file-system based routes here
app.fsRoutes();

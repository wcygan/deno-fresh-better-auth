import { define } from "../utils.ts";
import NavBar from "../islands/NavBar.tsx";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>deno-fresh-better-auth</title>
      </head>
      <body>
        <NavBar />
        <Component />
      </body>
    </html>
  );
});

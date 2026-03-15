import { Elysia } from "elysia";

const PORT = process.env.PORT ?? "3000";

const app = new Elysia()
  .get("/", () => "Proxydeck")
  .listen(PORT);

console.log(`Server at http://localhost:${PORT}`);

export type App = typeof app;

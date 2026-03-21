import { join } from "path";
import { runMigrationsOrExit } from "./db/runMigrations";
import { createApp } from "./routes/createApp";

const PORT = process.env.PORT ?? "3000";
const FRONTEND_DIR = join(process.cwd(), "frontend", "dist");

await runMigrationsOrExit();

const app = createApp(FRONTEND_DIR).listen(PORT);

console.log(`Server at http://localhost:${PORT}`);

export type App = typeof app;

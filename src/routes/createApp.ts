import { Elysia } from "elysia";
import { auth } from "../auth";
import { apiAuthGuard } from "../middleware/apiAuthGuard";
import { domainRoutes } from "../controllers/domain.controller";
import { configApiRoutes } from "../controllers/configApi.controller";
import { systemRoutes } from "../controllers/system.controller";
import { createSpaStaticHandler } from "../static/spaStatic";

/**
 * Composes HTTP middleware, API route plugins, auth catch-all, and SPA static fallback.
 */
export function createApp(frontendDistDir: string) {
  const serveStatic = createSpaStaticHandler(frontendDistDir);

  return (
    new Elysia()
      .onBeforeHandle(apiAuthGuard)
      .use(domainRoutes)
      .use(configApiRoutes)
      .use(systemRoutes)
      .all("/api/auth/*", async ({ request }) => auth.handler(request))
      .get("/*", ({ request }) => {
        const pathname = new URL(request.url).pathname;
        if (pathname.startsWith("/api")) return;
        const res = serveStatic(pathname);
        if (res) return res;
        const indexRes = serveStatic("/index.html");
        return indexRes ?? new Response("Not Found", { status: 404 });
      })
  );
}

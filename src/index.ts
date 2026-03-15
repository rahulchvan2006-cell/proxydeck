import { Elysia } from "elysia";
import { auth } from "./auth/config";
import { getSession, isProtectedPath } from "./auth/middleware";
import { allowSignup } from "./auth/allow-signup";

const PORT = process.env.PORT ?? "3000";

async function authGuard({ request }: { request: Request }) {
  const pathname = new URL(request.url).pathname;
  if (!isProtectedPath(pathname)) return;
  const session = await getSession(request.headers);
  if (session) return;
  const allow = await allowSignup();
  return new Response(null, {
    status: 302,
    headers: { Location: allow ? "/signup" : "/login" },
  });
}

const loginHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Login</title></head>
<body>
  <h1>Login</h1>
  <form action="/api/auth/sign-in/username" method="POST">
    <label>Username <input name="username" required></label>
    <label>Password <input name="password" type="password" required></label>
    <button type="submit">Sign in</button>
  </form>
</body></html>
`;

const signupHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Sign up</title></head>
<body>
  <h1>Sign up</h1>
  <form action="/api/auth/sign-up/email" method="POST">
    <label>Name <input name="name" required></label>
    <label>Email <input name="email" type="email" required></label>
    <label>Username <input name="username" required></label>
    <label>Password <input name="password" type="password" required></label>
    <button type="submit">Create account</button>
  </form>
</body></html>
`;

const app = new Elysia()
  .onBeforeHandle(authGuard)
  .get("/api/allow-signup", async () => ({ allowSignup: await allowSignup() }))
  .all("/api/auth/*", async ({ request }) => auth.handler(request))
  .get("/login", () => new Response(loginHtml, { headers: { "Content-Type": "text/html" } }))
  .get("/signup", () => new Response(signupHtml, { headers: { "Content-Type": "text/html" } }))
  .get("/", () => "Proxydeck")
  .listen(PORT);

console.log(`Server at http://localhost:${PORT}`);

export type App = typeof app;

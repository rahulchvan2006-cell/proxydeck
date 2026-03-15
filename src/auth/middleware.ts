import { auth } from "./config";

const PUBLIC_PATHS = ["/login", "/signup", "/api/auth", "/api/allow-signup"];
const STATIC_PREFIX = "/assets";

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith(STATIC_PREFIX)) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function getSession(requestOrHeaders: Request | Headers) {
  const headers = requestOrHeaders instanceof Request ? requestOrHeaders.headers : requestOrHeaders;
  const res = await auth.api.getSession({ headers });
  return res?.data ?? null;
}

export function isProtectedPath(pathname: string): boolean {
  return !isPublicPath(pathname);
}

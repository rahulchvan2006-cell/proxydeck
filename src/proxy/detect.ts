const CADDY_ADMIN = process.env.CADDY_ADMIN ?? "http://localhost:2019";
const TRAEFIK_API = process.env.TRAEFIK_API_URL ?? "http://localhost:8080";

export type ProxyProvider = "caddy" | "traefik" | null;

export async function detectProxy(): Promise<{ provider: ProxyProvider }> {
  try {
    const res = await fetch(`${CADDY_ADMIN}/config/`, { method: "GET" });
    if (res.ok) return { provider: "caddy" };
  } catch {
    // ignore
  }
  try {
    const res = await fetch(`${TRAEFIK_API}/api/overview`, { method: "GET" });
    if (res.ok) return { provider: "traefik" };
  } catch {
    // ignore
  }
  return { provider: null };
}

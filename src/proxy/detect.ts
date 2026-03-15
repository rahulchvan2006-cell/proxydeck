function normalizeUrl(raw: string | undefined, defaultVal: string): string {
  const s = (raw ?? defaultVal).trim().replace(/\/+$/, "");
  return s || defaultVal;
}

export type ProxyProvider = "caddy" | "traefik" | null;

export type DetectResult = {
  provider: ProxyProvider;
  message?: string;
};

export async function detectProxy(): Promise<DetectResult> {
  const caddyAdmin = normalizeUrl(process.env.CADDY_ADMIN, "http://localhost:2019");
  const traefikApi = normalizeUrl(process.env.TRAEFIK_API_URL, "http://localhost:8080");

  let caddyError: string | undefined;
  try {
    const res = await fetch(`${caddyAdmin}/config/`, { method: "GET" });
    if (res.ok) return { provider: "caddy" };
    caddyError = `HTTP ${res.status}`;
  } catch (e) {
    caddyError = e instanceof Error ? e.message : "Connection failed";
  }

  let traefikError: string | undefined;
  try {
    const res = await fetch(`${traefikApi}/api/overview`, { method: "GET" });
    if (res.ok) return { provider: "traefik" };
    traefikError = `HTTP ${res.status}`;
  } catch (e) {
    traefikError = e instanceof Error ? e.message : "Connection failed";
  }

  const message =
    process.env.CADDY_ADMIN != null
      ? `Caddy at ${caddyAdmin}: ${caddyError}. Is Caddy running with the admin API enabled?`
      : process.env.TRAEFIK_API_URL != null
        ? `Traefik at ${traefikApi}: ${traefikError}. Is Traefik running?`
        : "Set CADDY_ADMIN or TRAEFIK_API_URL in your environment.";
  return { provider: null, message };
}

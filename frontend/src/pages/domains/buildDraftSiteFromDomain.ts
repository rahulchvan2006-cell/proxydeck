import type { Domain } from "../../types/domain";
import type { Site } from "../../types/proxy";
import { resolvedHostsForDisplay } from "./domainDetailUtils";

const DEFAULT_UPSTREAM = "localhost:8080";

export type PdDraftSiteNavPayload = {
  site: Site;
  domainId: string;
  meta?: { hostname: string };
};

/** Pass to `navigate(path, { state })` from domain detail. */
export type PdDraftSiteLocationState = {
  pdDraftSite: PdDraftSiteNavPayload;
};

function normalizeApex(hostname: string): string {
  return hostname.replace(/^https?:\/\//i, "").split("/")[0]?.trim() ?? "";
}

function isUnderZone(hostname: string, apex: string): boolean {
  const h = hostname.trim().toLowerCase();
  const a = apex.trim().toLowerCase();
  if (!h || !a) return false;
  return h === a || h.endsWith(`.${a}`);
}

function collectHostnames(domain: Domain): string[] {
  const apex = normalizeApex(domain.hostname);
  if (!apex) return [];

  const seen = new Set<string>();
  const out: string[] = [];

  const push = (raw: string) => {
    const h = raw.trim();
    if (!h) return;
    const k = h.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(h);
  };

  push(apex);

  if (!apex.toLowerCase().startsWith("www.")) {
    push(`www.${apex}`);
  }

  const enrichment = domain.enrichment ?? null;
  for (const row of resolvedHostsForDisplay(domain, enrichment)) {
    if (isUnderZone(row.hostname, apex)) {
      push(row.hostname.trim());
    }
  }

  return out;
}

export type BuildDraftSiteOptions = {
  defaultUpstream?: string;
};

/** Builds a proxy Site draft from portfolio domain + enrichment (immutable). */
export function buildDraftSiteFromDomain(domain: Domain, options?: BuildDraftSiteOptions): Site {
  const hostnames = collectHostnames(domain);
  const address = options?.defaultUpstream?.trim() || DEFAULT_UPSTREAM;

  return {
    hostnames: hostnames.length ? hostnames : [normalizeApex(domain.hostname) || ""],
    routes: [{ match: "/", matchType: "path", upstreams: [{ address }] }],
  };
}

/** Payload for React Router `location.state` when opening Sites with a draft row. */
export function buildPdDraftSiteNavPayload(domain: Domain, options?: BuildDraftSiteOptions): PdDraftSiteNavPayload {
  const site = buildDraftSiteFromDomain(domain, options);
  const apex = normalizeApex(domain.hostname);
  return {
    site,
    domainId: domain.id,
    meta: apex ? { hostname: apex } : undefined,
  };
}

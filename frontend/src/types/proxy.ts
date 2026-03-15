export interface Upstream {
  address: string;
  healthy?: boolean;
}

export interface Route {
  id?: string;
  match: string;
  matchType: "path" | "host";
  upstreams: Upstream[];
}

export interface TLS {
  provider?: "acme" | "custom";
  email?: string;
  certFile?: string;
  keyFile?: string;
}

export interface Site {
  id?: string;
  hostnames: string[];
  tls?: TLS;
  routes: Route[];
}

export interface ProxyConfig {
  sites: Site[];
}

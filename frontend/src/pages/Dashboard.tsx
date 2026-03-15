import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ProxyStatus {
  provider: "caddy" | "traefik" | null;
  message?: string;
}

export function Dashboard() {
  const [status, setStatus] = useState<ProxyStatus | null>(null);

  useEffect(() => {
    fetch("/api/proxy/status", { credentials: "include" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ provider: null, message: "Could not reach server." }));
  }, []);

  const hasProxy = status?.provider != null;
  const providerLabel = status?.provider ?? "None detected";

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-desc">Overview of your reverse proxy and quick actions.</p>
      </header>

      <section className="card" aria-labelledby="proxy-status-heading">
        <h2 id="proxy-status-heading" className="section-title">Proxy status</h2>
        <p className="row gap-2" style={{ alignItems: "center" }}>
          <span className={hasProxy ? "status-ok" : "status-muted"}>
            {hasProxy ? "Connected" : "Not connected"}
          </span>
          <span className="badge">{providerLabel}</span>
        </p>
        {!hasProxy && (
          <p className="status-muted" style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)" }}>
            {status?.message ?? "Set CADDY_ADMIN or TRAEFIK_API_URL in your environment to manage a proxy."}
          </p>
        )}
      </section>

      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="section-title">Quick actions</h2>
        <div className="card-grid">
          <Link to="/sites" className="quick-card">
            <h3>Sites</h3>
            <p>Add and edit hostnames, routes, and upstreams.</p>
          </Link>
          <Link to="/config" className="quick-card">
            <h3>Config</h3>
            <p>Preview, validate, and apply proxy configuration.</p>
          </Link>
          <Link to="/logs" className="quick-card">
            <h3>Logs</h3>
            <p>View proxy log output.</p>
          </Link>
          <Link to="/certificates" className="quick-card">
            <h3>Certificates</h3>
            <p>Manage TLS certificates.</p>
          </Link>
        </div>
      </section>
    </>
  );
}

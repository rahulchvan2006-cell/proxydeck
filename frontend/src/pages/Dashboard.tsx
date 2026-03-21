import { Link } from "react-router-dom";
import { useDashboard } from "./hooks/useDashboard";

export function Dashboard() {
  const { status } = useDashboard();

  const hasProxy = status?.provider != null;
  const providerLabel = status?.provider ?? "None detected";

  return (
    <>
      <header className="pd-page-header">
        <h1>Proxy dashboard</h1>
        <p className="text-light">Reverse proxy (Caddy / Traefik) status and quick actions. Domain portfolio lives under Domains.</p>
      </header>

      <section className="card pd-section-stack" aria-labelledby="proxy-status-heading">
        <h2 id="proxy-status-heading" className="mb-4" style={{ fontSize: "var(--text-4)" }}>
          Proxy status
        </h2>
        <p className="hstack gap-2">
          <span className={hasProxy ? "pd-status-connected" : "pd-status-idle"}>
            {hasProxy ? "Connected" : "Not connected"}
          </span>
          <span className={hasProxy ? "badge pd-signal-active" : "badge secondary"}>{providerLabel}</span>
        </p>
        {!hasProxy && (
          <p className="text-light mt-2" style={{ fontSize: "var(--text-7)", marginBlockEnd: 0 }}>
            {status?.message ?? "Set CADDY_ADMIN or TRAEFIK_API_URL in your environment to manage a proxy."}
          </p>
        )}
      </section>

      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-4" style={{ fontSize: "var(--text-4)" }}>
          Quick actions
        </h2>
        <div className="row" style={{ gap: "var(--space-4)", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))" }}>
          <Link to="/proxy/sites" className="card p-4 pd-action-card unstyled" style={{ display: "block", color: "inherit" }}>
            <h3 style={{ marginBlockEnd: "var(--space-2)" }}>Sites</h3>
            <p className="text-light" style={{ marginBlockEnd: 0 }}>
              Add and edit hostnames, routes, and upstreams.
            </p>
          </Link>
          <Link to="/proxy/config" className="card p-4 pd-action-card unstyled" style={{ display: "block", color: "inherit" }}>
            <h3 style={{ marginBlockEnd: "var(--space-2)" }}>Config</h3>
            <p className="text-light" style={{ marginBlockEnd: 0 }}>
              Preview, validate, and apply proxy configuration.
            </p>
          </Link>
          <Link to="/proxy/logs" className="card p-4 pd-action-card unstyled" style={{ display: "block", color: "inherit" }}>
            <h3 style={{ marginBlockEnd: "var(--space-2)" }}>Logs</h3>
            <p className="text-light" style={{ marginBlockEnd: 0 }}>
              View proxy log output.
            </p>
          </Link>
          <Link to="/proxy/certificates" className="card p-4 pd-action-card unstyled" style={{ display: "block", color: "inherit" }}>
            <h3 style={{ marginBlockEnd: "var(--space-2)" }}>Certificates</h3>
            <p className="text-light" style={{ marginBlockEnd: 0 }}>
              Manage TLS certificates.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}

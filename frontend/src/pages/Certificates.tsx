import { useEffect, useState } from "react";

interface CertInfo {
  domain: string;
  issuer?: string;
  expiry?: string;
}

export function Certificates() {
  const [certs, setCerts] = useState<CertInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setCerts(Array.isArray(data) ? data : []))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <header className="page-header">
          <h1 className="page-title">Certificates</h1>
          <p className="page-desc">TLS certificates managed by your proxy.</p>
        </header>
        <div className="card">
          <p className="empty-state">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Certificates</h1>
        <p className="page-desc">TLS certificates (read-only). ACME certs are managed when you add sites with TLS.</p>
      </header>
      <article className="card">
        {certs.length === 0 ? (
          <p className="empty-state">No certificate data. Enable TLS on a site to request ACME certs.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ textAlign: "left", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600 }}>Domain</th>
                <th style={{ textAlign: "left", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600 }}>Issuer</th>
                <th style={{ textAlign: "left", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600 }}>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "var(--space-3)" }}>{c.domain}</td>
                  <td style={{ padding: "var(--space-3)", color: "var(--color-text-muted)" }}>{c.issuer ?? "—"}</td>
                  <td style={{ padding: "var(--space-3)", color: "var(--color-text-muted)" }}>{c.expiry ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </>
  );
}

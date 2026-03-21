import { useCertificates } from "./hooks/useCertificates";

export function Certificates() {
  const { certs, loading } = useCertificates();

  if (loading) {
    return (
      <>
        <header className="pd-page-header">
          <h1>Certificates</h1>
          <p className="text-light">Proxy : TLS certificates managed by Caddy or Traefik.</p>
        </header>
        <div className="card p-4">
          <p className="text-light align-center p-4">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="pd-page-header">
        <h1>Certificates</h1>
        <p className="text-light">Proxy : TLS certificates (read-only). ACME certs are managed when you add sites with TLS.</p>
      </header>
      <article className="card">
        {certs.length === 0 ? (
          <p className="text-light align-center p-4">No certificate data. Enable TLS on a site to request ACME certs.</p>
        ) : (
          <div className="table pd-table-gridless">
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Issuer</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c, i) => (
                  <tr key={i}>
                    <td>{c.domain}</td>
                    <td className="text-light">{c.issuer ?? ":"}</td>
                    <td className="text-light">{c.expiry ?? ":"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </>
  );
}

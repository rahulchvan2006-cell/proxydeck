import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Preview {
  provider: string | null;
  raw: string;
}

interface HistoryEntry {
  id: string;
  createdAt: string;
  provider: string;
  comment: string | null;
}

export function Config() {
  const [preview, setPreview] = useState<Preview>({ provider: null, raw: "" });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackResult, setRollbackResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/config/preview", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/config/history", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([p, h]) => {
        setPreview(p);
        setHistory(Array.isArray(h) ? h : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const rollback = (id: string) => {
    setRollbackResult(null);
    fetch("/api/config/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((r) => {
        setRollbackResult(r);
        if (r.ok) load();
      })
      .catch((e) => setRollbackResult({ ok: false, error: e.message }));
  };

  if (loading) {
    return (
      <>
        <header className="page-header">
          <h1 className="page-title">Config</h1>
          <p className="page-desc">Preview generated config and rollback history.</p>
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
        <h1 className="page-title">Config</h1>
        <p className="page-desc">
          Preview of the config that will be applied. Edit and apply from <Link to="/sites">Sites</Link>.
        </p>
        <p className="row gap-2" style={{ marginTop: "var(--space-2)", alignItems: "center" }}>
          <Link to="/sites" className="btn btn-outline btn-sm">
            Edit & apply on Sites
          </Link>
        </p>
      </header>
      <article className="card">
        {preview.provider ? (
          <>
            <p className="row gap-2" style={{ alignItems: "center", marginBottom: "var(--space-3)" }}>
              <span className="section-title" style={{ marginBottom: 0 }}>Preview</span>
              <span className="badge">{preview.provider}</span>
            </p>
            <pre className="pre-wrap" style={{ background: "var(--color-bg)", padding: "var(--space-4)", borderRadius: "var(--radius)", overflow: "auto", margin: 0 }}>
              <code>{preview.raw || "(empty)"}</code>
            </pre>
          </>
        ) : (
          <p className="status-muted">No proxy detected. Config preview unavailable.</p>
        )}
        {rollbackResult && (
          <div className={rollbackResult.ok ? "alert alert-success" : "alert alert-error"} role="status" style={{ marginTop: "var(--space-4)" }}>
            {rollbackResult.ok ? "Rolled back successfully." : rollbackResult.error}
          </div>
        )}
      </article>
      {history.length > 0 && (
        <section className="card" style={{ marginTop: "var(--space-6)" }} aria-labelledby="config-history-heading">
          <h2 id="config-history-heading" className="section-title">History</h2>
          <p className="page-desc" style={{ marginBottom: "var(--space-4)" }}>Roll back to a previous configuration.</p>
          <ul className="unstyled-list stack">
            {history.map((entry) => (
              <li key={entry.id} className="row gap-2" style={{ alignItems: "center", padding: "var(--space-3)", background: "var(--color-bg)", borderRadius: "var(--radius)" }}>
                <span style={{ fontSize: "var(--text-sm)" }}>{new Date(entry.createdAt).toLocaleString()}</span>
                <span className="badge">{entry.provider}</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => rollback(entry.id)}>
                  Rollback
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

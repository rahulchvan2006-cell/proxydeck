import { useEffect, useState } from "react";
import type { ProxyConfig } from "../types/proxy";

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
  const [config, setConfig] = useState<ProxyConfig | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [validateResult, setValidateResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [applyResult, setApplyResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/config/preview", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/config/current", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/config/history", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([p, c, h]) => {
        setPreview(p);
        setConfig(c?.sites ? c : { sites: [] });
        setHistory(Array.isArray(h) ? h : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const validate = () => {
    if (!config) return;
    setValidateResult(null);
    fetch("/api/config/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(config),
    })
      .then((r) => r.json())
      .then(setValidateResult)
      .catch((e) => setValidateResult({ valid: false, error: e.message }));
  };

  const apply = () => {
    if (!config) return;
    setApplyResult(null);
    fetch("/api/config/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(config),
    })
      .then((r) => r.json())
      .then((r) => {
        setApplyResult(r);
        if (r.ok) load();
      })
      .catch((e) => setApplyResult({ ok: false, error: e.message }));
  };

  const rollback = (id: string) => {
    setApplyResult(null);
    fetch("/api/config/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((r) => {
        setApplyResult(r);
        if (r.ok) load();
      })
      .catch((e) => setApplyResult({ ok: false, error: e.message }));
  };

  if (loading) {
    return (
      <>
        <header className="page-header">
          <h1 className="page-title">Config</h1>
          <p className="page-desc">Preview, validate, and apply proxy configuration.</p>
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
        <p className="page-desc">Preview, validate, and apply proxy configuration.</p>
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
        {validateResult && (
          <div className={validateResult.valid ? "alert alert-success" : "alert alert-error"} role="status" style={{ marginTop: "var(--space-4)" }}>
            {validateResult.valid ? "Config is valid." : validateResult.error}
          </div>
        )}
        {applyResult && (
          <div className={applyResult.ok ? "alert alert-success" : "alert alert-error"} role="status">
            {applyResult.ok ? "Config applied successfully." : applyResult.error}
          </div>
        )}
        <footer className="row gap-2" style={{ marginTop: "var(--space-6)" }}>
          <button type="button" className="btn btn-outline" onClick={validate} disabled={!config?.sites?.length}>
            Validate
          </button>
          <button type="button" className="btn btn-primary" onClick={apply} disabled={!config?.sites?.length}>
            Apply config
          </button>
        </footer>
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

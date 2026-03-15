import { useEffect, useState } from "react";

export function Logs() {
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setLines(Array.isArray(data.lines) ? data.lines : []))
      .catch(() => setLines([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <header className="page-header">
          <h1 className="page-title">Logs</h1>
          <p className="page-desc">Proxy log output.</p>
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
        <h1 className="page-title">Logs</h1>
        <p className="page-desc">Proxy log output. Set PROXY_LOG_FILE in the environment to tail a log file.</p>
      </header>
      <article className="card">
        {lines.length === 0 ? (
          <p className="empty-state">No log lines. Set PROXY_LOG_FILE to a log file path.</p>
        ) : (
          <pre className="pre-wrap" style={{ maxHeight: "60vh", overflow: "auto", margin: 0, padding: "var(--space-4)", background: "var(--color-bg)", borderRadius: "var(--radius)" }}>
            <code>{lines.join("\n")}</code>
          </pre>
        )}
      </article>
    </>
  );
}

import { useLogs } from "./hooks/useLogs";

export function Logs() {
  const { lines, loading } = useLogs();

  if (loading) {
    return (
      <>
        <header className="pd-page-header">
          <h1>Logs</h1>
          <p className="text-light">Proxy : log output from your configured log file.</p>
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
        <h1>Logs</h1>
        <p className="text-light">Proxy : tail output when PROXY_LOG_FILE is set in the environment.</p>
      </header>
      <article className="card">
        {lines.length === 0 ? (
          <p className="text-light align-center p-4">No log lines. Set PROXY_LOG_FILE to a log file path.</p>
        ) : (
          <pre className="pd-code-block pd-code-block-scroll">
            <code>{lines.join("\n")}</code>
          </pre>
        )}
      </article>
    </>
  );
}

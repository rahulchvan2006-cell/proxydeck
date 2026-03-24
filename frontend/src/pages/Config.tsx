import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog, type ConfirmDialogHandle } from "../components/ConfirmDialog";
import { useConfig } from "./hooks/useConfig";

export function Config() {
  const { preview, history, loading, rollbackResult, rollback } = useConfig();
  const rollbackDialogRef = useRef<ConfirmDialogHandle>(null);
  const pendingRollbackIdRef = useRef<string | null>(null);

  const requestRollback = useCallback((id: string) => {
    pendingRollbackIdRef.current = id;
    rollbackDialogRef.current?.showModal();
  }, []);

  const confirmRollback = useCallback(() => {
    const id = pendingRollbackIdRef.current;
    pendingRollbackIdRef.current = null;
    if (id) rollback(id);
  }, [rollback]);

  if (loading) {
    return (
      <>
        <header className="pd-page-header">
          <h1>Config</h1>
          <p className="text-light">Proxy : preview generated config and rollback history.</p>
        </header>
        <div className="card p-4">
          <p className="text-light align-center p-4">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog
        ref={rollbackDialogRef}
        title="Rollback configuration?"
        message="Restore this saved configuration on the proxy?"
        confirmLabel="Rollback"
        onConfirm={confirmRollback}
      />
      <header className="pd-page-header">
        <h1>Config</h1>
        <p className="text-light">
          Proxy : preview of the config that will be applied. Edit and apply from <Link to="/proxy/sites">Sites</Link>.
        </p>
        <p className="hstack gap-2 mt-2">
          <Link to="/proxy/sites" className="button outline small unstyled">
            Edit & apply on Sites
          </Link>
        </p>
      </header>
      <article className="card">
        {preview.provider ? (
          <>
            <p className="hstack gap-2 mb-4">
              <span style={{ fontWeight: 600, marginBlockEnd: 0 }}>Preview</span>
              <span className="badge secondary">{preview.provider}</span>
            </p>
            <pre className="pd-code-block pd-code-block-scroll">
              <code>{preview.raw || "(empty)"}</code>
            </pre>
          </>
        ) : (
          <p className="text-light">No proxy detected. Config preview unavailable.</p>
        )}
        {rollbackResult && (
          <div role="alert" data-variant={rollbackResult.ok ? "success" : "danger"} className="mt-4">
            {rollbackResult.ok ? "Rolled back successfully." : rollbackResult.error}
          </div>
        )}
      </article>
      {history.length > 0 && (
        <section className="card mt-6" aria-labelledby="config-history-heading">
          <h2 id="config-history-heading" className="mb-4" style={{ fontSize: "var(--text-4)" }}>
            History
          </h2>
          <p className="text-light mb-4">Roll back to a previous configuration.</p>
          <ul className="unstyled vstack gap-2" style={{ padding: 0, margin: 0 }}>
            {history.map((entry) => (
              <li key={entry.id} className="hstack gap-2 pd-history-row">
                <span style={{ fontSize: "var(--text-7)" }}>{new Date(entry.createdAt).toLocaleString()}</span>
                <span className="badge secondary">{entry.provider}</span>
                <button type="button" className="outline small" onClick={() => requestRollback(entry.id)}>
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

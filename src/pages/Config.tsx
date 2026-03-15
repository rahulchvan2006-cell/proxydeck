import { useEffect, useState } from "react";
import type { ProxyConfig } from "../proxy/types";

interface Preview {
  provider: string | null;
  raw: string;
}

export function Config() {
  const [preview, setPreview] = useState<Preview>({ provider: null, raw: "" });
  const [config, setConfig] = useState<ProxyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [validateResult, setValidateResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [applyResult, setApplyResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/config/preview").then((r) => r.json()),
      fetch("/api/config/current").then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setPreview(p);
        setConfig(c?.sites ? c : { sites: [] });
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
      body: JSON.stringify(config),
    })
      .then((r) => r.json())
      .then((r) => {
        setApplyResult(r);
        if (r.ok) load();
      })
      .catch((e) => setApplyResult({ ok: false, error: e.message }));
  };

  if (loading) return <p>Loading…</p>;

  return (
    <article className="card">
      <header>
        <h2>Config</h2>
        <p>Preview generated config and validate or apply.</p>
      </header>
      {preview.provider && (
        <>
          <p>Provider: <strong>{preview.provider}</strong></p>
          <pre><code>{preview.raw || "(empty)"}</code></pre>
        </>
      )}
      {!preview.provider && <p>No proxy detected. Config preview unavailable.</p>}
      {validateResult && (
        <div role="alert" data-variant={validateResult.valid ? "success" : "error"}>
          {validateResult.valid ? "Config is valid." : validateResult.error}
        </div>
      )}
      {applyResult && (
        <div role="alert" data-variant={applyResult.ok ? "success" : "error"}>
          {applyResult.ok ? "Config applied." : applyResult.error}
        </div>
      )}
      <footer className="hstack" style={{ gap: "0.5rem" }}>
        <button type="button" className="outline" onClick={validate} disabled={!config?.sites?.length}>
          Validate
        </button>
        <button type="button" onClick={apply} disabled={!config?.sites?.length}>
          Apply
        </button>
      </footer>
    </article>
  );
}

import { useEffect, useState } from "react";
import { SquaresFour, Table } from "@phosphor-icons/react";
import type { ProxyConfig, Site, Route, Upstream } from "../types/proxy";

const emptyConfig: ProxyConfig = { sites: [] };

type ViewMode = "cards" | "table";

export function Sites() {
  const [config, setConfig] = useState<ProxyConfig>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [validateResult, setValidateResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [applyResult, setApplyResult] = useState<{ ok: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/config/current", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setConfig(data?.sites ? data : emptyConfig))
      .catch(() => setConfig(emptyConfig))
      .finally(() => setLoading(false));
  }, []);

  const addSite = () => {
    const newSite: Site = {
      hostnames: [""],
      routes: [{ match: "/", matchType: "path", upstreams: [{ address: "localhost:8080" }] }],
    };
    setConfig({ sites: [...config.sites, newSite] });
  };

  const removeSite = (index: number) => {
    setConfig({ sites: config.sites.filter((_, i) => i !== index) });
  };

  const updateSite = (index: number, site: Site) => {
    const next = [...config.sites];
    next[index] = site;
    setConfig({ sites: next });
  };

  const validate = () => {
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
    setApplyResult(null);
    setValidateResult(null);
    fetch("/api/config/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(config),
    })
      .then((r) => r.json())
      .then(setApplyResult)
      .catch((e) => setApplyResult({ ok: false, error: e.message }));
  };

  if (loading) {
    return (
      <>
        <header className="page-header">
          <h1 className="page-title">Sites</h1>
          <p className="page-desc">Configure hostnames and reverse proxy routes.</p>
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
        <h1 className="page-title">Sites</h1>
        <p className="page-desc">Configure hostnames and reverse proxy routes.</p>
        <div className="row gap-2" style={{ marginTop: "var(--space-3)", alignItems: "center" }}>
          <span className="section-title" style={{ marginBottom: 0, fontSize: "var(--text-sm)" }}>View:</span>
          <button
            type="button"
            className={viewMode === "cards" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => setViewMode("cards")}
            title="Cards"
            aria-label="Cards view"
          >
            <SquaresFour size={20} weight="duotone" />
          </button>
          <button
            type="button"
            className={viewMode === "table" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => setViewMode("table")}
            title="Table"
            aria-label="Table view"
          >
            <Table size={20} weight="duotone" />
          </button>
        </div>
      </header>
      <article className="card">
        {validateResult && (
          <div className={validateResult.valid ? "alert alert-success" : "alert alert-error"} role="status">
            {validateResult.valid ? "Config is valid." : validateResult.error}
          </div>
        )}
        {applyResult && (
          <div className={applyResult.ok ? "alert alert-success" : "alert alert-error"} role="status">
            {applyResult.ok ? "Config applied successfully." : applyResult.error}
          </div>
        )}
        {config.sites.length === 0 ? (
          <div className="empty-state">
            <p>No sites yet. Add your first site to get started.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={addSite}>
              Add site
            </button>
          </div>
        ) : viewMode === "table" ? (
          <SitesTable
            sites={config.sites}
            onSwitchToCards={() => setViewMode("cards")}
            onRemove={removeSite}
          />
        ) : (
          <ul className="unstyled-list stack">
            {config.sites.map((site, i) => (
              <li key={i}>
                <SiteEditor site={site} onChange={(s) => updateSite(i, s)} onRemove={() => removeSite(i)} />
              </li>
            ))}
          </ul>
        )}
        <footer className="row gap-2" style={{ marginTop: "var(--space-6)" }}>
          <button type="button" className="btn btn-outline" onClick={addSite}>Add site</button>
          <button type="button" className="btn btn-outline" onClick={validate} disabled={!config.sites.length}>Validate</button>
          <button type="button" className="btn btn-primary" onClick={apply} disabled={!config.sites.length}>Apply config</button>
        </footer>
      </article>
    </>
  );
}

function SitesTable({
  sites,
  onSwitchToCards,
  onRemove,
}: {
  sites: Site[];
  onSwitchToCards: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            <th style={{ textAlign: "left", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600 }}>Hostnames</th>
            <th style={{ textAlign: "left", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600 }}>Routes</th>
            <th style={{ textAlign: "left", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600 }}>Upstreams</th>
            <th style={{ textAlign: "right", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 600 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", verticalAlign: "top" }}>
                {site.hostnames.filter(Boolean).join(", ") || "—"}
              </td>
              <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", verticalAlign: "top" }}>
                {site.routes.map((r) => r.match).filter(Boolean).join(", ") || "—"}
              </td>
              <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", verticalAlign: "top" }}>
                {site.routes.map((r) => r.upstreams.map((u) => u.address).join(", ")).filter(Boolean).join(" | ") || "—"}
              </td>
              <td style={{ padding: "var(--space-3)", textAlign: "right", verticalAlign: "top" }}>
                <span className="row gap-2" style={{ justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={onSwitchToCards}>Edit</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onRemove(i)}>Remove</button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiteEditor({
  site,
  onChange,
  onRemove,
}: {
  site: Site;
  onChange: (s: Site) => void;
  onRemove: () => void;
}) {
  const setHostnames = (hostnames: string[]) => onChange({ ...site, hostnames });
  const setRoutes = (routes: Route[]) => onChange({ ...site, routes });

  return (
    <article className="card">
      <header className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div className="field" style={{ marginBottom: 0, flex: "1 1 12rem" }}>
          <label>Hostnames (comma-separated)</label>
          <input
            type="text"
            value={site.hostnames.join(", ")}
            placeholder="example.com, www.example.com"
            onChange={(e) => {
              const v = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
              setHostnames(v.length ? v : [""]);
            }}
          />
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>Remove site</button>
      </header>
      <div className="stack" style={{ marginTop: "var(--space-4)" }}>
        <h3 className="section-title">Routes</h3>
        {site.routes.map((route, ri) => (
          <div key={ri} className="stack" style={{ padding: "var(--space-4)", background: "var(--color-bg)", borderRadius: "var(--radius)" }}>
            <div className="field">
              <label>Match path</label>
              <input
                type="text"
                value={route.match}
                placeholder="/ or /api/*"
                onChange={(e) =>
                  setRoutes(
                    site.routes.map((r, i) => (i === ri ? { ...r, match: e.target.value } : r))
                  )
                }
              />
            </div>
            <div className="field">
              <label>Upstreams (one per line: host:port)</label>
              <textarea
                value={route.upstreams.map((u) => u.address).join("\n")}
                placeholder="localhost:8080"
                onChange={(e) =>
                  setRoutes(
                    site.routes.map((r, i) =>
                      i === ri
                        ? {
                            ...r,
                            upstreams: e.target.value
                              .split("\n")
                              .map((a) => a.trim())
                              .filter(Boolean)
                              .map((address): Upstream => ({ address })),
                          }
                        : r
                    )
                  )
                }
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

import { useCallback, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BreadcrumbSetterContext } from "./BreadcrumbContext";
import { buildBreadcrumbs } from "./buildBreadcrumbs";

export function BreadcrumbsController({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [domainLabel, setDomainLabel] = useState<string | null>(null);

  const setDomainBreadcrumbLabel = useCallback((v: string | null) => {
    setDomainLabel(v);
  }, []);

  const items = buildBreadcrumbs(location.pathname, domainLabel);

  return (
    <BreadcrumbSetterContext.Provider value={setDomainBreadcrumbLabel}>
      {items.length > 0 ? (
        <nav aria-label="Breadcrumb" className="pd-breadcrumbs">
          <ol className="pd-breadcrumbs__list">
            {items.map((item, i) => (
              <li key={`${item.to}-${item.label}-${i}`} className="pd-breadcrumbs__item">
                {i < items.length - 1 ? (
                  <Link to={item.to} className="pd-breadcrumbs__link unstyled">
                    {item.label}
                  </Link>
                ) : (
                  <span className="pd-breadcrumbs__current" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      {children}
    </BreadcrumbSetterContext.Provider>
  );
}

export { useDomainBreadcrumbLabel } from "./BreadcrumbContext";

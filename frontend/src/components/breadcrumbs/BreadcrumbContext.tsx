import { createContext, useContext, useEffect } from "react";

export type SetDomainBreadcrumbLabel = (label: string | null) => void;

export const BreadcrumbSetterContext = createContext<SetDomainBreadcrumbLabel | null>(null);

export function useDomainBreadcrumbLabel(label: string | null | undefined) {
  const setDomainLabel = useContext(BreadcrumbSetterContext);
  useEffect(() => {
    if (!setDomainLabel) return;
    const v = label?.trim() || null;
    if (!v) return;
    setDomainLabel(v);
    return () => setDomainLabel(null);
  }, [label, setDomainLabel]);
}

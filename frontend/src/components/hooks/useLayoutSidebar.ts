import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Collapses mobile sidebar state on route change (Oat sidebar layout).
 */
export function useLayoutSidebar() {
  const location = useLocation();
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    layoutRef.current?.removeAttribute("data-sidebar-open");
  }, [location.pathname]);

  return { layoutRef };
}

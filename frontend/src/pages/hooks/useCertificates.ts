import { useEffect, useState } from "react";

export interface CertInfo {
  domain: string;
  issuer?: string;
  expiry?: string;
}

export function useCertificates() {
  const [certs, setCerts] = useState<CertInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setCerts(Array.isArray(data) ? data : []))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false));
  }, []);

  return { certs, loading };
}

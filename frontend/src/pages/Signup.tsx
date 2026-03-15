import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "pd_session";

function readStoredSession(): unknown {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d?.user ?? d?.data ?? d ?? null;
  } catch {
    return null;
  }
}

export function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowSignup, setAllowSignup] = useState<boolean | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (readStoredSession()) {
      navigate("/", { replace: true });
      return;
    }
    fetch("/api/auth/get-session", { credentials: "include" })
      .then((r) => r.text())
      .then((text) => {
        const d = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;
        const session = d?.data ?? d?.session ?? d ?? null;
        if (session) navigate("/", { replace: true });
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [navigate]);

  useEffect(() => {
    if (checkingSession) return;
    fetch("/api/allow-signup", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAllowSignup(d?.allowSignup === true))
      .catch(() => setAllowSignup(false));
  }, [checkingSession]);

  useEffect(() => {
    if (allowSignup === false) navigate("/login", { replace: true });
  }, [allowSignup, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const res = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: (form.elements.namedItem("name") as HTMLInputElement).value,
        email: (form.elements.namedItem("email") as HTMLInputElement).value,
        username: (form.elements.namedItem("username") as HTMLInputElement).value,
        password: (form.elements.namedItem("password") as HTMLInputElement).value,
        callbackURL: "/",
      }),
      credentials: "include",
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const session = data?.user ?? data?.data ?? data;
      if (session) {
        try {
          sessionStorage.setItem("pd_session", JSON.stringify({ user: session }));
        } catch (_) {}
      }
      window.location.href = "/";
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data?.error?.message || "Sign up failed");
  }

  if (checkingSession || allowSignup === null) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <article className="card">
            <p>Loading…</p>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <article className="card">
          <header>
            <h1>Create account</h1>
            <p>One-time setup. Only one user is allowed.</p>
          </header>
          <form onSubmit={handleSubmit} className="stack">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required autoComplete="name" placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" type="text" required autoComplete="username" placeholder="Login username" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required autoComplete="new-password" placeholder="Choose a password" />
            </div>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </article>
      </div>
    </div>
  );
}

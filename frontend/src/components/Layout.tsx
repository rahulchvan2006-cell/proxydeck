import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", end: true, label: "Dashboard" },
  { to: "/sites", end: false, label: "Sites" },
  { to: "/config", end: false, label: "Config" },
  { to: "/certificates", end: false, label: "Certificates" },
  { to: "/logs", end: false, label: "Logs" },
];

async function handleLogout(e: React.FormEvent) {
  e.preventDefault();
  await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
  try {
    sessionStorage.removeItem("pd_session");
  } catch (_) {}
  window.location.href = "/login";
}

export function Layout() {
  return (
    <>
      <nav className="app-nav" aria-label="Main">
        <div className="app-nav-brand">
          <NavLink to="/" className="app-nav-brand-link">
            <img src="/logo.svg" alt="Proxydeck" className="app-nav-logo" />
          </NavLink>
        </div>
        <ul className="app-nav-list">
          {navItems.map(({ to, end, label }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => isActive ? "app-nav-link is-active" : "app-nav-link"}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <form onSubmit={handleLogout} className="app-nav-actions">
          <button type="submit" className="btn btn-outline btn-sm">
            Log out
          </button>
        </form>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}

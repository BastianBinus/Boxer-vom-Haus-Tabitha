import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const NAV = [
  { to: '/hunde', icon: '🐕', label: 'Hunde' },
  { to: '/wuerfe', icon: '🐾', label: 'Würfe' },
  { to: '/kaeufer', icon: '👤', label: 'Käufer' },
  { to: '/papierkorb', icon: '🗑', label: 'Papierkorb' },
]

export function Layout() {
  const { logout } = useAuth()

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <span>Zuchtdaten</span>
          Boxer vom Hause Tabitha
        </div>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            style={{ width: '100%' }}
          >
            Abmelden
          </button>
        </div>
      </nav>

      <main className="main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="bottom-nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

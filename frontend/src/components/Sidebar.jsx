import { NavLink, useNavigate } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/audit-logs', label: 'Audit Logs' },
  { to: '/alerts', label: 'Security Alerts' },
  { to: '/chat', label: 'Real-Time Chat' },
  { to: '/admin', label: 'Admin Console', adminOnly: true },
  { to: '/users', label: 'Users & Roles' },
  { to: '/database', label: 'Database Activity' },
  { to: '/backups', label: 'Backups & Recovery' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const { alerts } = useAlerts();
  const { user, role, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan pulse-dot" />
        <span className="font-mono font-semibold text-sm">
          CYBERAUDIT<span className="text-cyan">360</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
        {NAV.map(({ to, label, adminOnly }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                isActive
                  ? 'bg-cyan/10 text-cyan font-medium'
                  : 'text-dim hover:bg-surface2 hover:text-text'
              }`
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                label === 'Security Alerts'
                  ? 'bg-red'
                  : label === 'Real-Time Chat'
                  ? 'bg-cyan pulse-dot'
                  : adminOnly
                  ? isAdmin
                    ? 'bg-cyan'
                    : 'bg-amber'
                  : 'bg-current'
              }`}
            />
            {label}
            {label === 'Real-Time Chat' && (
              <span className="ml-auto font-mono text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-cyan/15 text-cyan border border-cyan/30">
                WS
              </span>
            )}
            {adminOnly && (
              <span
                className={`ml-auto font-mono text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                  isAdmin
                    ? 'bg-cyan/20 text-cyan border border-cyan/30'
                    : 'bg-surface2 text-dim border border-border'
                }`}
              >
                {isAdmin ? 'ADMIN' : 'RBAC'}
              </span>
            )}
            {label === 'Security Alerts' && alerts.length > 0 && (
              <span className="ml-auto font-mono text-[10px] bg-red/15 text-red px-1.5 py-0.5 rounded">
                {alerts.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Authenticated User & Role Profile Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
              isAdmin ? 'bg-cyan/20 text-cyan' : 'bg-surface2 text-text border border-border'
            }`}
          >
            {initials}
          </div>
          <div className="text-xs min-w-0">
            <p className="font-medium truncate">{user?.name || 'Logged User'}</p>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono text-[9px] uppercase font-bold px-1 py-0.2 rounded ${
                  isAdmin ? 'text-cyan bg-cyan/10' : 'text-amber bg-amber/10'
                }`}
              >
                {role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="text-xs text-dim hover:text-red transition px-2 py-1 rounded hover:bg-surface2 border border-transparent hover:border-border shrink-0"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

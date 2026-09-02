import { NavLink } from 'react-router-dom';
import { useAlerts } from '../hooks/useAlerts';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/audit-logs', label: 'Audit Logs' },
  { to: '/alerts', label: 'Security Alerts' },
  { to: '/users', label: 'Users & Roles' },
  { to: '/database', label: 'Database Activity' },
  { to: '/backups', label: 'Backups & Recovery' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const { alerts } = useAlerts(); // reused hook drives the live badge count
  const { user, role, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan" />
        <span className="font-mono font-semibold text-sm">
          CYBERAUDIT<span className="text-cyan">360</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                isActive ? 'bg-cyan/10 text-cyan font-medium' : 'text-dim hover:bg-surface2 hover:text-text'
              }`
            }
          >
            <span className={`w-1.5 h-1.5 rounded-full ${label === 'Security Alerts' ? 'bg-red' : 'bg-current'}`} />
            {label}
            {label === 'Security Alerts' && alerts.length > 0 && (
              <span className="ml-auto font-mono text-[10px] bg-red/15 text-red px-1.5 py-0.5 rounded">
                {alerts.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan/20 text-cyan flex items-center justify-center text-xs font-semibold">
          AD
        </div>
        <div className="text-xs">
          <p className="font-medium">{user?.name}</p>
          <p className="text-dim">{role}</p>
          <button onClick={logout} className="mt-1 text-cyan hover:underline">Log out</button>
        </div>
      </div>
    </aside>
  );
}

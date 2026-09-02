import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useAlerts } from '../hooks/useAlerts';
import { useBackups } from '../hooks/useBackups';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, role } = useAuth();
  const { allLogs, loading: logsLoading } = useAuditLogs();
  const { alerts, highRiskCount } = useAlerts();
  const { backups } = useBackups();

  const failedLogins = allLogs.filter((l) => l.status === 'Failed').length;
  const lastBackup = backups[0];

  return (
    <Layout title="Security Overview" statusText={highRiskCount ? `${highRiskCount} high-risk alert` : 'All systems healthy'} statusColor={highRiskCount ? 'red' : 'green'}>
      <div>
        <p className="text-dim text-sm">Welcome, {user?.name} · Role: {role}</p>
        <h2 className="text-2xl font-bold mt-1">Here's what's happening across your organization.</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value={logsLoading ? '…' : allLogs.length} hint="Live" hintClass="text-green" />
        <StatCard label="Suspicious Activities" value={alerts.length} valueClass="text-amber" />
        <StatCard label="Failed Logins" value={failedLogins} valueClass="text-red" hint={failedLogins ? '1 flagged brute-force' : undefined} hintClass="text-red" />
        <StatCard label="Last Backup" value={lastBackup ? lastBackup.time : '—'} valueClass="text-cyan" hint="✓ Healthy" hintClass="text-green" />
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-semibold text-sm mb-4">Recent Security Events</h3>
        <ul className="space-y-4 text-sm">
          {alerts.slice(0, 4).map((a) => (
            <li key={a.id} className="flex gap-3">
              <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${a.risk === 'high' ? 'bg-red' : 'bg-amber'}`} />
              <div>
                <p className="leading-snug">{a.title}</p>
                <p className="text-xs text-dim font-mono">{a.meta}</p>
              </div>
            </li>
          ))}
          {alerts.length === 0 && <p className="text-dim text-sm">No active alerts — nice.</p>}
        </ul>
      </div>
    </Layout>
  );
}

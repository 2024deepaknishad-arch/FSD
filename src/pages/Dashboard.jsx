import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useSecurity } from '../context/SecurityContext';

export default function Dashboard() {
  const { allLogs, loading: logsLoading } = useAuditLogs();
  const { alerts, highRiskCount, securityScore, addAlert } = useSecurity();

  const failedLogins = allLogs.filter((l) => l.status === 'Failed').length;

  function simulateAttack() {
    addAlert({
      risk: 'high',
      title: 'Simulated brute-force attack',
      detail: '5 failed login attempts detected just now — triggered manually for demo.',
    });
  }

  return (
    <Layout title="Security Overview" statusText={highRiskCount ? `${highRiskCount} high-risk alert` : 'All systems healthy'} statusColor={highRiskCount ? 'red' : 'green'}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-dim text-sm">Good evening, Admin</p>
          <h2 className="text-2xl font-bold mt-1">Here's what's happening across your organization.</h2>
        </div>
        <button
          onClick={simulateAttack}
          className="text-xs border border-red/30 text-red bg-red/5 rounded-md px-3 py-2 hover:bg-red/10 transition"
        >
          Simulate suspicious activity
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value={logsLoading ? '…' : allLogs.length} hint="Live" hintClass="text-green" />
        <StatCard label="Suspicious Activities" value={alerts.length} valueClass="text-amber" />
        <StatCard label="Failed Logins" value={failedLogins} valueClass="text-red" hint={failedLogins ? '1 flagged brute-force' : undefined} hintClass="text-red" />
        <StatCard label="Security Score" value={securityScore} valueClass="text-cyan" />
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

import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useAlerts } from '../hooks/useAlerts';

export default function Dashboard() {
  const { allLogs, loading: logsLoading } = useAuditLogs();
  const { alerts, highRiskCount, securityScore, socketConnected, latestAlert, dismissLatestAlert } = useAlerts();

  const failedLogins = allLogs.filter((l) => l.status === 'Failed').length;

  return (
    <Layout
      title="Security Overview"
      statusText={
        highRiskCount
          ? `${highRiskCount} high-risk alert`
          : socketConnected
          ? 'WebSocket: Live & Connected'
          : 'All systems healthy'
      }
      statusColor={highRiskCount ? 'red' : 'green'}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-dim text-sm">Good evening, Admin</p>
          <h2 className="text-2xl font-bold mt-1">Here's what's happening across your organization.</h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              socketConnected ? 'bg-green pulse-dot' : 'bg-red'
            }`}
          />
          <span className={socketConnected ? 'text-green' : 'text-red'}>
            Real-Time Feed: {socketConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Live Security Alert Banner (Section 10 Requirement) */}
      {latestAlert && (
        <div className="bg-red/10 border border-red/40 rounded-lg p-4 flex items-start justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 mt-1 rounded-full bg-red shrink-0 pulse-dot" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs uppercase bg-red/20 text-red px-2 py-0.5 rounded font-bold">
                  LIVE SECURITY ALERT
                </span>
                <span className="font-mono text-xs text-amber font-semibold">
                  Severity: {(latestAlert.severity || latestAlert.risk || 'HIGH').toUpperCase()}
                </span>
                <span className="font-mono text-xs text-dim">
                  Time: {latestAlert.timestamp || latestAlert.meta}
                </span>
              </div>
              <p className="font-semibold text-sm mt-1 text-text">
                Type: {latestAlert.type || 'Suspicious Activity'}
              </p>
              <p className="text-xs text-dim mt-0.5">
                Message: {latestAlert.message || latestAlert.detail}
              </p>
            </div>
          </div>
          <button
            onClick={dismissLatestAlert}
            className="text-xs text-dim hover:text-text px-2.5 py-1 rounded bg-surface border border-border shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value={logsLoading ? '…' : allLogs.length} hint="Live Atlas" hintClass="text-green" />
        <StatCard label="Suspicious Activities" value={alerts.length} valueClass="text-amber" hint="Real-Time Socket.IO" hintClass="text-cyan" />
        <StatCard label="Failed Logins" value={failedLogins} valueClass="text-red" hint={failedLogins ? '1 flagged brute-force' : undefined} hintClass="text-red" />
        <StatCard label="Security Score" value={securityScore} valueClass="text-cyan" />
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Recent Security Events (Live Feed)</h3>
          <span className="font-mono text-xs text-dim">{alerts.length} Active Alerts</span>
        </div>
        <ul className="space-y-4 text-sm">
          {alerts.slice(0, 6).map((a) => (
            <li key={a.id} className="flex gap-3 items-start border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
              <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${a.risk === 'high' || a.severity === 'high' ? 'bg-red' : 'bg-amber'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="leading-snug font-medium">{a.title}</p>
                  <span className="text-[11px] text-dim font-mono">{a.meta || a.timestamp}</span>
                </div>
                <p className="text-xs text-dim mt-0.5">{a.detail || a.message}</p>
              </div>
            </li>
          ))}
          {alerts.length === 0 && <p className="text-dim text-sm">No active alerts — nice.</p>}
        </ul>
      </div>
    </Layout>
  );
}
